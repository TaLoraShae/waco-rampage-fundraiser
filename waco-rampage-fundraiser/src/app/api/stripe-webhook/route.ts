import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAnonServerClient } from "@/lib/supabase/anon";
import { estimateFeeCents, estimateNetCents } from "@/lib/fees";

// =====================================================================
// LIVE STRIPE WEBHOOK
// Route: /api/stripe-webhook
// ---------------------------------------------------------------------
// This is the exact endpoint your Stripe webhook destination points
// to. It runs regardless of PAYMENT_MODE — if Stripe sends a real,
// signature-verified event here, it gets recorded. PAYMENT_MODE only
// controls whether NEW Stripe Checkout Sessions get created (see
// /api/checkout/session); it does not gate this listener, since
// rejecting a legitimately-signed event would just cause Stripe to
// retry and eventually mark the endpoint unhealthy.
//
// Must run on the Node.js runtime (not Edge) — the Stripe SDK's
// signature verification here uses Node's crypto module.
// =====================================================================

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured." }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY is not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  // Read the exact raw request body — signature verification fails if
  // this has been parsed/re-serialized in any way.
  const rawBody = await req.text();

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge anything we don't act on so Stripe doesn't retry it.
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, skipped: "not paid" });
  }

  const metadata = session.metadata || {};
  const playerId = metadata.player_id;
  const fundraiserId = metadata.fundraiser_id;

  if (!playerId || !fundraiserId) {
    console.error("Stripe webhook: checkout.session.completed missing player_id/fundraiser_id metadata", session.id);
    // Acknowledge so Stripe stops retrying — this session was never
    // created by our own /api/checkout/session route (bad metadata
    // means we have nothing reliable to attribute the donation to).
    return NextResponse.json({ received: true, skipped: "missing metadata" });
  }

  const grossCents = session.amount_total ?? 0;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || "";
  const anonymous = metadata.anonymous === "true";
  const donorName = anonymous ? "Anonymous" : metadata.donor_name || "Anonymous";
  const donorEmail = session.customer_details?.email || "";
  const donorMessage = metadata.donor_message || "";

  const supabase = createAnonServerClient();

  // Confirm the player/fundraiser referenced in metadata are real,
  // current rows before writing anything — metadata is set by our own
  // server route at Checkout Session creation time, but we still
  // don't blindly trust it belongs to a live player.
  const { data: player } = await supabase
    .from("players")
    .select("id, fundraiser_id")
    .eq("id", playerId)
    .eq("fundraiser_id", fundraiserId)
    .maybeSingle();

  if (!player) {
    console.error("Stripe webhook: player/fundraiser in metadata not found", playerId, fundraiserId);
    return NextResponse.json({ received: true, skipped: "player not found" });
  }

  const { error: insertError } = await supabase.from("donations").insert({
    player_id: playerId,
    fundraiser_id: fundraiserId,
    gross_cents: grossCents,
    fee_cents: estimateFeeCents(grossCents),
    net_cents: estimateNetCents(grossCents),
    donor_name: donorName,
    donor_email: donorEmail,
    donor_message: donorMessage,
    anonymous,
    status: "succeeded",
    payment_method: "card",
    source: "stripe",
    checkout_session_id: session.id,
    payment_intent_id: paymentIntentId,
  });

  if (insertError) {
    // Unique violation on checkout_session_id = we've already recorded
    // this donation (Stripe retried the webhook, or it raced with
    // another delivery). Treat as success — this is exactly the
    // duplicate-payment protection required.
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Stripe webhook: failed to insert donation", insertError);
    // Return a 500 so Stripe retries — this was a real, paid,
    // verified event and we want another chance to record it.
    return NextResponse.json({ error: "Failed to record donation." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

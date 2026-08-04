import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/db";
import { estimateFeeCents, estimateNetCents } from "@/lib/fees";
import { getPaymentMode } from "@/lib/payment-mode";

// =====================================================================
// FUTURE: verifies and handles real Stripe webhook events.
// Disabled while PAYMENT_MODE=mock. Once live, point your Stripe
// webhook endpoint at:  https://YOUR_DOMAIN/api/webhooks/stripe
// Listen for: checkout.session.completed
// See docs/STRIPE_SETUP.md for the exact dashboard steps.
// =====================================================================

export async function POST(req: NextRequest) {
  if (getPaymentMode() !== "stripe") {
    return NextResponse.json({ error: "Stripe mode is not enabled." }, { status: 400 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 500 });
  }

  const { getStripeClient } = await import("@/lib/stripe");
  const stripe = getStripeClient();

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig || "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      payment_intent: string;
      amount_total: number | null;
      customer_details?: { email?: string | null };
      metadata?: Record<string, string>;
    };

    // Duplicate payment protection: skip if this Checkout Session was already recorded.
    const alreadyRecorded = db.getDonations().some((d) => d.checkoutSessionId === session.id);
    if (alreadyRecorded) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const playerId = session.metadata?.playerId;
    const player = playerId ? db.getPlayerById(playerId) : undefined;
    if (player && session.amount_total) {
      db.addDonation({
        playerId: player.id,
        fundraiserId: "fundraiser-2026-spring",
        grossCents: session.amount_total,
        feeCents: estimateFeeCents(session.amount_total),
        netCents: estimateNetCents(session.amount_total),
        donorName: session.metadata?.anonymous === "true" ? "Anonymous" : session.metadata?.donorName || "Anonymous",
        donorEmail: session.customer_details?.email || "",
        donorMessage: session.metadata?.donorMessage || "",
        anonymous: session.metadata?.anonymous === "true",
        status: "succeeded",
        paymentMethod: "card",
        source: "stripe",
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent,
        refunded: false,
        adminNotes: "",
      });
    }
  }

  return NextResponse.json({ received: true });
}

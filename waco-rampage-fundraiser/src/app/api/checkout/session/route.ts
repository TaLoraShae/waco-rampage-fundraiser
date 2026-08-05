import { NextRequest, NextResponse } from "next/server";
import { getPaymentMode, isStripeConfigured } from "@/lib/payment-mode";
import { getStripeClient } from "@/lib/stripe";
import { createAnonServerClient } from "@/lib/supabase/anon";

// =====================================================================
// Creates a real Stripe Checkout Session for the Donate buttons.
// Route: /api/checkout/session
// ---------------------------------------------------------------------
// Only active while PAYMENT_MODE=stripe. While PAYMENT_MODE=mock, the
// public donate form never calls this route at all — it keeps using
// the existing simulated /checkout/[slug] flow untouched.
//
// SECURITY: the browser only ever sends a player slug, a requested
// amount, and optional donor info. The player, its fundraiser, and
// the donation limits are all re-looked-up and re-validated here on
// the server against Supabase before a Stripe session is created —
// nothing about who gets paid or how much is trusted from the client.
// =====================================================================

export async function POST(req: NextRequest) {
  if (getPaymentMode() !== "stripe") {
    return NextResponse.json(
      {
        error:
          "Stripe mode is not enabled. This site is currently running in mock mode — set PAYMENT_MODE=stripe to activate real payments.",
      },
      { status: 400 }
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe keys are missing. Add STRIPE_SECRET_KEY, the publishable key, and STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  let body: {
    slug?: string;
    amountCents?: number;
    donorName?: string;
    donorEmail?: string;
    anonymous?: boolean;
    donorMessage?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = String(body.slug || "").trim();
  const requestedAmountCents = Math.round(Number(body.amountCents || 0));
  const donorName = String(body.donorName || "").trim().slice(0, 200);
  const donorEmail = String(body.donorEmail || "").trim().slice(0, 320);
  const anonymous = Boolean(body.anonymous);
  const donorMessage = String(body.donorMessage || "").trim().slice(0, 1000);

  if (!slug || !requestedAmountCents) {
    return NextResponse.json({ error: "Missing player or amount." }, { status: 400 });
  }

  const supabase = createAnonServerClient();

  // Look up the player server-side — never trust a player ID or name
  // sent from the browser.
  const { data: player } = await supabase
    .from("players")
    .select("id, slug, display_name, active, fundraiser_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!player || !player.active) {
    return NextResponse.json({ error: "This player is not available for donations." }, { status: 404 });
  }

  const { data: fundraiser } = await supabase
    .from("fundraisers")
    .select("id, min_donation_cents, max_donation_cents, active")
    .eq("id", player.fundraiser_id)
    .maybeSingle();

  if (!fundraiser || !fundraiser.active) {
    return NextResponse.json({ error: "This fundraiser is not currently active." }, { status: 404 });
  }

  // Re-validate the amount against the fundraiser's real limits — the
  // browser's own min/max checks are just a UX convenience.
  if (requestedAmountCents < fundraiser.min_donation_cents || requestedAmountCents > fundraiser.max_donation_cents) {
    return NextResponse.json({ error: "Donation amount is outside the allowed range." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Donation to ${player.display_name}` },
          unit_amount: requestedAmountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: donorEmail || undefined,
    success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/support/${player.slug}?canceled=1`,
    metadata: {
      player_id: player.id,
      player_slug: player.slug,
      fundraiser_id: player.fundraiser_id,
      donor_name: anonymous ? "" : donorName,
      anonymous: String(anonymous),
      donor_message: donorMessage,
    },
    payment_intent_data: {
      metadata: {
        player_id: player.id,
        player_slug: player.slug,
        fundraiser_id: player.fundraiser_id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}

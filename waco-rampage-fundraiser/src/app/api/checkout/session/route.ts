import { NextRequest, NextResponse } from "next/server";
import * as db from "@/lib/db";
import { getPaymentMode, isStripeConfigured } from "@/lib/payment-mode";
import { getSiteUrl } from "@/lib/qrcode";

// =====================================================================
// FUTURE: creates a real Stripe Checkout Session.
// Disabled while PAYMENT_MODE=mock — the mock donation flow uses the
// /checkout/[slug] page and the finalizeDonation server action instead.
// =====================================================================

export async function POST(req: NextRequest) {
  if (getPaymentMode() !== "stripe") {
    return NextResponse.json(
      {
        error:
          "Stripe mode is not enabled. This prototype is running in mock mode — see docs/STRIPE_SETUP.md to activate real payments.",
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

  const { getStripeClient } = await import("@/lib/stripe");
  const stripe = getStripeClient();

  const body = await req.json();
  const { slug, amountCents, donorName, donorEmail, anonymous, donorMessage } = body as {
    slug: string;
    amountCents: number;
    donorName?: string;
    donorEmail?: string;
    anonymous?: boolean;
    donorMessage?: string;
  };

  const player = db.getPlayerBySlug(slug);
  if (!player) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Donation to ${player.displayName} — Waco Rampage 14U` },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: donorEmail || undefined,
    success_url: `${getSiteUrl()}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getSiteUrl()}/support/${slug}?canceled=1`,
    metadata: {
      playerId: player.id,
      playerSlug: player.slug,
      donorName: anonymous ? "Anonymous" : donorName || "",
      anonymous: String(Boolean(anonymous)),
      donorMessage: donorMessage || "",
    },
    payment_intent_data: {
      metadata: {
        playerId: player.id,
        playerSlug: player.slug,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}

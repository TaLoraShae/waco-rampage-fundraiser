import { NextRequest, NextResponse } from "next/server";
import { getPaymentMode, isStripeConfigured } from "@/lib/payment-mode";
import { getSiteUrl } from "@/lib/qrcode";

// =====================================================================
// FUTURE: creates a real Stripe Checkout Session.
// Disabled while PAYMENT_MODE=mock — the mock donation flow uses the
// /checkout/[slug] page and the client-side data store instead.
//
// NOTE ON DATA: this prototype's donation/player data lives in the
// browser (see src/lib/store.tsx), not in a server database. A real
// Stripe integration needs a real server-side database so the webhook
// below can durably record the donation — see docs/SUPABASE_SCHEMA.md.
// This route accepts the player's slug/name directly from the request
// body (sent by the already-loaded client) rather than looking it up
// in a server database that doesn't exist yet in the prototype.
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
  const { slug, playerId, playerDisplayName, amountCents, donorName, donorEmail, anonymous, donorMessage } =
    body as {
      slug: string;
      playerId: string;
      playerDisplayName: string;
      amountCents: number;
      donorName?: string;
      donorEmail?: string;
      anonymous?: boolean;
      donorMessage?: string;
    };

  if (!slug || !playerId || !amountCents) {
    return NextResponse.json({ error: "Missing player or amount." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Donation to ${playerDisplayName} — Waco Rampage 14U` },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: donorEmail || undefined,
    success_url: `${getSiteUrl()}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getSiteUrl()}/support/${slug}?canceled=1`,
    metadata: {
      playerId,
      playerSlug: slug,
      donorName: anonymous ? "Anonymous" : donorName || "",
      anonymous: String(Boolean(anonymous)),
      donorMessage: donorMessage || "",
    },
    payment_intent_data: {
      metadata: { playerId, playerSlug: slug },
    },
  });

  return NextResponse.json({ url: session.url });
}

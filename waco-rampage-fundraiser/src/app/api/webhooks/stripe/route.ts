import { NextRequest, NextResponse } from "next/server";
import { getPaymentMode } from "@/lib/payment-mode";

// =====================================================================
// FUTURE: verifies real Stripe webhook events.
// Disabled while PAYMENT_MODE=mock. Once live, point your Stripe
// webhook endpoint at:  https://YOUR_DOMAIN/api/webhooks/stripe
// Listen for: checkout.session.completed
// See docs/STRIPE_SETUP.md for the exact dashboard steps.
//
// NOTE ON DATA: this prototype stores donations in the browser (see
// src/lib/store.tsx), which a server-side webhook cannot write to.
// Before going live, connect a real database (docs/SUPABASE_SCHEMA.md)
// and insert the donation record here — the shape to insert matches
// the `donations` table in that schema exactly.
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
    // TODO once a real database is connected: insert a donation row here
    // using event.data.object (Checkout Session), matching the
    // `donations` table in docs/SUPABASE_SCHEMA.md. Use the Checkout
    // Session ID as a unique constraint for duplicate-webhook protection.
  }

  return NextResponse.json({ received: true });
}

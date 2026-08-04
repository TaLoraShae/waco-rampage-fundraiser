import Stripe from "stripe";

// =====================================================================
// FUTURE STRIPE INTEGRATION
// ---------------------------------------------------------------------
// This file is created now so the Stripe integration is ready to
// activate later, but it stays completely inert while
// PAYMENT_MODE=mock. Nothing here runs unless a route explicitly
// calls getStripeClient() AND PAYMENT_MODE=stripe.
//
// To go live: see docs/STRIPE_SETUP.md.
// =====================================================================

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe keys to .env.local and set PAYMENT_MODE=stripe before using real payments. See docs/STRIPE_SETUP.md."
    );
  }
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return cachedClient;
}

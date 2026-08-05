import Stripe from "stripe";

// =====================================================================
// STRIPE CLIENT
// ---------------------------------------------------------------------
// Used by two routes:
//   - /api/checkout/session — only called while PAYMENT_MODE=stripe
//   - /api/stripe-webhook   — verifies and processes real Stripe
//     webhook deliveries whenever they arrive, independent of
//     PAYMENT_MODE (see that route for why)
// Both require STRIPE_SECRET_KEY to be set; see docs/STRIPE_SETUP.md.
// =====================================================================

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your Stripe keys in Vercel's Environment Variables. See docs/STRIPE_SETUP.md."
    );
  }
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return cachedClient;
}


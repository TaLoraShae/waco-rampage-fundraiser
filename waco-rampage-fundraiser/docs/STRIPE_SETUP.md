# Connecting Stripe (for the account owner or treasurer)

This project contains the live Stripe integration code:
(`src/lib/stripe.ts`, `src/app/api/checkout/session/route.ts` for
creating Checkout Sessions, and `src/app/api/stripe-webhook/route.ts`
for recording confirmed payments). The webhook route verifies and
processes real Stripe events as soon as they arrive — it does not wait
for `PAYMENT_MODE=stripe`. What `PAYMENT_MODE` controls is whether the
Donate buttons create a **real** Checkout Session (`stripe`) or use
the simulated in-app flow (`mock`). Complete the steps below, then set
`PAYMENT_MODE=stripe` to switch the Donate buttons over to real Stripe
Checkout.

## 1. Create the Stripe account

1. Go to https://dashboard.stripe.com/register and create an account
   for the booster club (use the organization's legal name and an
   authorized officer's email).
2. Complete Stripe's business verification (EIN or SSN, bank account
   for payouts, business address).

## 2. Get your API keys

1. In the Stripe Dashboard, go to **Developers → API keys**.
2. Copy the **Publishable key** and the **Secret key**.
   - Use the **test** keys first to try real Stripe Checkout without
     real money, then switch to **live** keys when you're ready.

## 3. Add the keys to your environment

In `.env.local` (for local testing) and in your Vercel project's
Environment Variables (for production):

```env
STRIPE_SECRET_KEY=sk_live_...            # or sk_test_... while testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   # or pk_test_...
```

## 4. Create the webhook

1. In the Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR_DOMAIN/api/stripe-webhook`
3. Select the event: `checkout.session.completed`
4. After creating it, copy the **Signing secret** (starts with `whsec_`)
   and add it as `STRIPE_WEBHOOK_SECRET` in your environment.

## 5. Switch the site to Stripe mode

In your environment variables, change:

```env
PAYMENT_MODE=stripe
```

The prototype banner disappears automatically, and the donation flow
now uses `/api/checkout/session` to create a real Stripe Checkout
Session instead of the mock checkout page.

## 6. Redeploy

Push the change (or update the environment variable in Vercel) and
redeploy. Do one small real test donation yourself before announcing
the fundraiser publicly — confirm:

- The payment appears in the Stripe Dashboard
- The donation appears in the admin dashboard (`/admin/donations`)
- The player's total and the team total both update correctly
- Your bank payout schedule is set the way you expect (Stripe →
  Settings → Payouts)

## Notes on duplicate protection

`checkout_session_id` has a unique constraint in the database. If the
webhook receives the same event twice (Stripe's automatic retries, or
a race between deliveries), the second insert fails with a unique
violation, which the handler treats as "already recorded" and
acknowledges — no duplicate donation is ever created.

## Notes on fees

Stripe deducts its processing fee automatically before payout — the
"fee" and "net" figures calculated by this app (2.9% + $0.30) are an
**estimate** for planning purposes. Once live, prefer the exact figures
from the Stripe Dashboard or the balance transaction API for accounting.

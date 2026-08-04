// Estimated Stripe processing fee: 2.9% + $0.30 per transaction.
// Labeled as an ESTIMATE throughout the UI while PAYMENT_MODE=mock.
// When Stripe is connected, real fees come from the Stripe balance
// transaction instead of this estimate.

export const STRIPE_PERCENT_FEE = 0.029;
export const STRIPE_FLAT_FEE_CENTS = 30;

export function estimateFeeCents(grossCents: number): number {
  return Math.round(grossCents * STRIPE_PERCENT_FEE + STRIPE_FLAT_FEE_CENTS);
}

export function estimateNetCents(grossCents: number): number {
  return grossCents - estimateFeeCents(grossCents);
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

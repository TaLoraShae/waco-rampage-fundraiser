export type PaymentMode = "mock" | "stripe";

export function getPaymentMode(): PaymentMode {
  const mode = process.env.PAYMENT_MODE;
  return mode === "stripe" ? "stripe" : "mock";
}

export function isMockMode(): boolean {
  return getPaymentMode() === "mock";
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET
  );
}

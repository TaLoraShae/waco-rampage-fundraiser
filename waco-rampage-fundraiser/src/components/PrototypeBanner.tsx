import { isMockMode } from "@/lib/payment-mode";

// Visible on every public page while PAYMENT_MODE=mock.
// Disappears automatically once PAYMENT_MODE is switched to "stripe".
export default function PrototypeBanner() {
  if (!isMockMode()) return null;

  return (
    <div className="w-full bg-rampage-gold text-rampage-deep-900 text-center py-2 px-4 text-sm font-semibold tracking-wide"
      style={{ backgroundColor: "#D9C25C", color: "#2A1240" }}
    >
      Prototype Mode — No Real Payments Are Being Collected
    </div>
  );
}

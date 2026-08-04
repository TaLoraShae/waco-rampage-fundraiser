import { isMockMode } from "@/lib/payment-mode";
import { LightningBolt } from "./Lightning";

// Visible on every public page while PAYMENT_MODE=mock.
// Disappears automatically once PAYMENT_MODE is switched to "stripe".
export default function PrototypeBanner() {
  if (!isMockMode()) return null;

  return (
    <div className="w-full bg-gradient-to-r from-rampage-black via-rampage-purple-dark to-rampage-black text-white text-center py-2 px-4 text-xs sm:text-sm font-semibold tracking-wide border-b border-rampage-purple-light/30">
      <span className="inline-flex items-center gap-2 justify-center">
        <LightningBolt className="h-3.5 w-3.5 text-rampage-purple-light" />
        PROTOTYPE MODE — NO REAL PAYMENTS ARE BEING COLLECTED
        <LightningBolt className="h-3.5 w-3.5 text-rampage-purple-light" />
      </span>
    </div>
  );
}

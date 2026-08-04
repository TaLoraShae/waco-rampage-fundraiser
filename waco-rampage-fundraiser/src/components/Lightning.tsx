export function LightningBolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M13 2 3 14h6l-2 8 10-13h-6l2-7z" />
    </svg>
  );
}

// Decorative streaks of purple "electric energy" behind hero content.
export function LightningField() {
  return (
    <div className="lightning-field" aria-hidden="true">
      <svg width="260" height="420" style={{ top: "-40px", left: "-60px" }} viewBox="0 0 260 420">
        <path
          d="M120 0 L40 190 L110 190 L20 420 L200 150 L120 150 Z"
          fill="none"
          stroke="#8A4FC4"
          strokeWidth="2"
        />
      </svg>
      <svg width="180" height="320" style={{ bottom: "-30px", right: "8%" }} viewBox="0 0 180 320">
        <path
          d="M100 0 L30 150 L90 150 L10 320 L160 120 L95 120 Z"
          fill="none"
          stroke="#6B2FA0"
          strokeWidth="2"
        />
      </svg>
      <svg width="140" height="240" style={{ top: "30%", left: "38%" }} viewBox="0 0 140 240">
        <path d="M80 0 L20 110 L70 110 L0 240 L130 90 L75 90 Z" fill="none" stroke="#8A4FC4" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

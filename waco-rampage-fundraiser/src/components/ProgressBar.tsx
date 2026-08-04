export default function ProgressBar({
  raisedCents,
  goalCents,
  size = "md",
  onLight = false,
}: {
  raisedCents: number;
  goalCents: number;
  size?: "sm" | "md" | "lg";
  onLight?: boolean;
}) {
  const pct = goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;
  const height = size === "lg" ? "h-4" : size === "sm" ? "h-2" : "h-3";

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct}% of goal raised`}
      className={`progress-track ${onLight ? "on-light" : ""} w-full ${height}`}
    >
      <div className={`progress-fill ${height}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function progressPercent(raisedCents: number, goalCents: number) {
  return goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;
}

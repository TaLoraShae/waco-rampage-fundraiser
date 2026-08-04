"use client";

import { useEffect, useState } from "react";

function getParts(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: false };
}

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [parts, setParts] = useState(() => getParts(endDate));

  useEffect(() => {
    const t = setInterval(() => setParts(getParts(endDate)), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  if (parts.done) {
    return <p className="text-white/90 font-semibold">This fundraiser has ended. Thank you for your support!</p>;
  }

  const units: { label: string; value: number }[] = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4" aria-label="Time remaining in fundraiser">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center justify-center bg-white/10 border border-white/15 rounded-xl w-16 sm:w-20 py-2 sm:py-3"
        >
          <span className="font-display text-2xl sm:text-3xl text-white tabular-nums">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wide text-white/60">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

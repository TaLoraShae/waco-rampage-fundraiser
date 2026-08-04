"use client";

import { useState } from "react";
import { formatCents } from "@/lib/fees";

export default function DonateForm({
  slug,
  suggestedAmountsCents,
  minDonationCents,
  maxDonationCents,
  anonymousAllowed,
}: {
  slug: string;
  suggestedAmountsCents: number[];
  minDonationCents: number;
  maxDonationCents: number;
  anonymousAllowed: boolean;
}) {
  const [selected, setSelected] = useState<number | "custom">(suggestedAmountsCents[0] ?? 2500);
  const [customAmount, setCustomAmount] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountCents =
    selected === "custom" ? Math.round(Number(customAmount || 0) * 100) : selected;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!amountCents || amountCents < minDonationCents || amountCents > maxDonationCents) {
      e.preventDefault();
      setError(
        `Please choose an amount between ${formatCents(minDonationCents)} and ${formatCents(maxDonationCents)}.`
      );
    } else {
      setError(null);
    }
  }

  return (
    <form
      action={`/checkout/${slug}`}
      method="get"
      onSubmit={handleSubmit}
      className="space-y-5"
      aria-describedby={error ? "donate-error" : undefined}
    >
      <div>
        <span className="block text-sm font-semibold text-rampage-charcoal mb-2">Choose an amount</span>
        <div className="grid grid-cols-4 gap-2">
          {suggestedAmountsCents.map((amt) => (
            <button
              type="button"
              key={amt}
              onClick={() => setSelected(amt)}
              aria-pressed={selected === amt}
              className={`rounded-xl border-2 py-3 text-sm font-bold transition focus-ring ${
                selected === amt
                  ? "border-rampage-purple bg-rampage-purple text-white"
                  : "border-black/10 text-rampage-charcoal hover:border-rampage-purple/50"
              }`}
            >
              {formatCents(amt).replace(".00", "")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected("custom")}
            aria-pressed={selected === "custom"}
            className={`rounded-xl border-2 py-3 text-sm font-bold transition focus-ring ${
              selected === "custom"
                ? "border-rampage-purple bg-rampage-purple text-white"
                : "border-black/10 text-rampage-charcoal hover:border-rampage-purple/50"
            }`}
          >
            Other
          </button>
        </div>
        {selected === "custom" && (
          <div className="mt-3">
            <label htmlFor="customAmount" className="sr-only">
              Custom donation amount in dollars
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rampage-gray">$</span>
              <input
                id="customAmount"
                type="number"
                min={minDonationCents / 100}
                max={maxDonationCents / 100}
                step="1"
                inputMode="decimal"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-black/10 pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
              />
            </div>
          </div>
        )}
      </div>

      <input type="hidden" name="amountCents" value={amountCents || ""} />

      <div>
        <label htmlFor="donorName" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Your name {anonymous && <span className="text-rampage-gray font-normal">(hidden — donating anonymously)</span>}
        </label>
        <input
          id="donorName"
          name="donorName"
          type="text"
          placeholder="Optional display name"
          disabled={anonymous}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple disabled:bg-black/5"
        />
      </div>

      <div>
        <label htmlFor="donorEmail" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Email (for your receipt — never shown publicly)
        </label>
        <input
          id="donorEmail"
          name="donorEmail"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>

      <div>
        <label htmlFor="donorMessage" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Message of support (optional)
        </label>
        <textarea
          id="donorMessage"
          name="donorMessage"
          rows={2}
          placeholder="Go get 'em!"
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>

      {anonymousAllowed && (
        <label className="flex items-center gap-2 text-sm text-rampage-charcoal">
          <input
            type="checkbox"
            name="anonymous"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-rampage-purple focus-ring"
          />
          Donate anonymously
        </label>
      )}

      {error && (
        <p id="donate-error" role="alert" className="text-sm text-red-600 font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3.5 hover:bg-rampage-purple-dark transition focus-ring"
      >
        Continue to Checkout
      </button>
    </form>
  );
}

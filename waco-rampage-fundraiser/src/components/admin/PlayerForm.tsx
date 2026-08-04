"use client";

import { useState } from "react";
import { Player } from "@/lib/types";

export default function PlayerForm({
  onSubmit,
  player,
  submitLabel,
}: {
  onSubmit: (values: {
    displayName: string;
    slug: string;
    goalCents: number;
    message: string;
    imageUrl: string;
    displayOrder?: number;
  }) => { ok: boolean; error?: string };
  player?: Player;
  submitLabel: string;
}) {
  const [displayName, setDisplayName] = useState(player?.displayName || "");
  const [slug, setSlug] = useState(player?.slug || "");
  const [goalDollars, setGoalDollars] = useState(player ? player.goalCents / 100 : 600);
  const [message, setMessage] = useState(player?.message || "");
  const [imageUrl, setImageUrl] = useState(player?.imageUrl || "");
  const [displayOrder, setDisplayOrder] = useState(player?.displayOrder ?? 0);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!displayName.trim() || !cleanSlug) {
      setError("Name and slug are required.");
      return;
    }
    const result = onSubmit({
      displayName: displayName.trim(),
      slug: cleanSlug,
      goalCents: Math.round(Number(goalDollars) * 100),
      message: message.trim(),
      imageUrl: imageUrl.trim(),
      displayOrder: player ? displayOrder : undefined,
    });
    if (!result.ok) {
      setError(result.error === "duplicate-slug" ? "That slug is already in use. Please choose a unique slug." : result.error || "Something went wrong.");
    }
  }

  const inputCls = "w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-black/5 shadow-card-light p-6 max-w-xl">
      {error && <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">{error}</p>}

      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Public display name
        </label>
        <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="e.g. Carter B." className={inputCls} />
        <p className="text-xs text-rampage-gray mt-1">Use first name and last initial only — never a full last name.</p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Slug (used in the link /support/[slug])
        </label>
        <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" placeholder="carter-b" className={`${inputCls} font-mono`} />
      </div>

      <div>
        <label htmlFor="goalDollars" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Fundraising goal (USD)
        </label>
        <input id="goalDollars" type="number" min={0} step="1" value={goalDollars} onChange={(e) => setGoalDollars(Number(e.target.value))} className={inputCls} />
        <p className="text-xs text-rampage-gray mt-1">Enter a dollar amount, e.g. 600 for a $600 goal.</p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Personal fundraising message
        </label>
        <textarea id="message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Photo URL (optional — placeholder used if blank)
        </label>
        <input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls} />
      </div>

      {player && (
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-semibold text-rampage-charcoal mb-1">
            Display order
          </label>
          <input id="displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className={inputCls} />
        </div>
      )}

      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
        {submitLabel}
      </button>
    </form>
  );
}

import { Player } from "@/lib/types";

export default function PlayerForm({
  action,
  player,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  player?: Player;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-5 bg-white rounded-2xl border border-black/5 shadow-card p-6 max-w-xl">
      {player && <input type="hidden" name="id" value={player.id} />}

      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Public display name
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={player?.displayName}
          required
          placeholder="e.g. Carter B."
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
        <p className="text-xs text-rampage-gray mt-1">Use first name and last initial only — never a full last name.</p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Slug (used in the link /support/[slug])
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={player?.slug}
          required
          pattern="[a-z0-9-]+"
          placeholder="carter-b"
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>

      <div>
        <label htmlFor="goalDollars" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Fundraising goal (USD)
        </label>
        <input
          id="goalDollars"
          name="goalDollars"
          type="number"
          min={0}
          step="1"
          defaultValue={player ? player.goalCents / 100 : 600}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
        <p className="text-xs text-rampage-gray mt-1">Enter a dollar amount, e.g. 600 for a $600 goal.</p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Personal fundraising message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={player?.message}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Photo URL (optional — placeholder used if blank)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={player?.imageUrl}
          placeholder="https://..."
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>

      {player && (
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-semibold text-rampage-charcoal mb-1">
            Display order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            defaultValue={player.displayOrder}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
          />
        </div>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring"
      >
        {submitLabel}
      </button>
    </form>
  );
}

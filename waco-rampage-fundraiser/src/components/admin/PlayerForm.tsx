import { Player } from "@/lib/types";

export default function PlayerForm({
  action,
  player,
  fundraiserId,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  player?: Player;
  fundraiserId: string;
  submitLabel: string;
}) {
  const inputCls = "w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple";

  return (
    <form action={action} className="space-y-5 bg-white rounded-2xl border border-black/5 shadow-card-light p-6 max-w-xl">
      {player ? <input type="hidden" name="id" value={player.id} /> : <input type="hidden" name="fundraiserId" value={fundraiserId} />}

      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-rampage-charcoal mb-1">Public display name</label>
        <input id="displayName" name="displayName" defaultValue={player?.display_name} required placeholder="e.g. Carter B." className={inputCls} />
        <p className="text-xs text-rampage-gray mt-1">Use first name and last initial only — never a full last name.</p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-semibold text-rampage-charcoal mb-1">Slug (used in the link /support/[slug])</label>
        <input id="slug" name="slug" defaultValue={player?.slug} required pattern="[a-z0-9-]+" placeholder="carter-b" className={`${inputCls} font-mono`} />
      </div>

      <div>
        <label htmlFor="goalDollars" className="block text-sm font-semibold text-rampage-charcoal mb-1">Fundraising goal (USD)</label>
        <input id="goalDollars" name="goalDollars" type="number" min={0} step="1" defaultValue={player ? player.goal_cents / 100 : 600} className={inputCls} />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-rampage-charcoal mb-1">Personal fundraising message</label>
        <textarea id="message" name="message" rows={3} defaultValue={player?.message} className={inputCls} />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-semibold text-rampage-charcoal mb-1">Photo URL (placeholder used if blank)</label>
        <input id="imageUrl" name="imageUrl" defaultValue={player?.image_url} placeholder="https://..." className={inputCls} />
        {player && <p className="text-xs text-rampage-gray mt-1">To upload a real photo instead, use the uploader on this page after saving.</p>}
      </div>

      {player && (
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-semibold text-rampage-charcoal mb-1">Display order</label>
          <input id="displayOrder" name="displayOrder" type="number" defaultValue={player.display_order} className={inputCls} />
        </div>
      )}

      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
        {submitLabel}
      </button>
    </form>
  );
}

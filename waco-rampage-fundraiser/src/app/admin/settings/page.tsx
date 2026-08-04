import * as db from "@/lib/db";
import { updateSettingsAction } from "@/app/actions";

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function AdminSettingsPage({ searchParams }: { searchParams: { success?: string } }) {
  const s = db.getSettings();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Fundraiser Settings</h1>

      {searchParams.success && (
        <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">
          Settings updated.
        </p>
      )}

      <form action={updateSettingsAction} className="bg-white rounded-2xl border border-black/5 shadow-card p-6 space-y-5">
        <div>
          <label htmlFor="fundraiserTitle" className="block text-sm font-semibold text-rampage-charcoal mb-1">
            Fundraiser title
          </label>
          <input id="fundraiserTitle" name="fundraiserTitle" defaultValue={s.fundraiserTitle} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
        </div>
        <div>
          <label htmlFor="fundraiserDescription" className="block text-sm font-semibold text-rampage-charcoal mb-1">
            Fundraiser description
          </label>
          <textarea id="fundraiserDescription" name="fundraiserDescription" rows={3} defaultValue={s.fundraiserDescription} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="teamGoalCents" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Team goal (USD)
            </label>
            <input id="teamGoalCents" name="teamGoalCents" type="number" defaultValue={s.teamGoalCents / 100} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="playerDefaultGoalCents" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Default player goal (USD)
            </label>
            <input id="playerDefaultGoalCents" name="playerDefaultGoalCents" type="number" defaultValue={s.playerDefaultGoalCents / 100} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Start date
            </label>
            <input id="startDate" name="startDate" type="date" defaultValue={toDateInput(s.startDate)} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              End date
            </label>
            <input id="endDate" name="endDate" type="date" defaultValue={toDateInput(s.endDate)} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minDonationCents" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Minimum donation (USD)
            </label>
            <input id="minDonationCents" name="minDonationCents" type="number" defaultValue={s.minDonationCents / 100} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="maxDonationCents" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Maximum donation (USD)
            </label>
            <input id="maxDonationCents" name="maxDonationCents" type="number" defaultValue={s.maxDonationCents / 100} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Contact email
            </label>
            <input id="contactEmail" name="contactEmail" defaultValue={s.contactEmail} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Contact phone
            </label>
            <input id="contactPhone" name="contactPhone" defaultValue={s.contactPhone} className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-rampage-charcoal mb-1">Visibility toggles</legend>
          {[
            { name: "leaderboardVisible", label: "Show top-fundraiser leaderboard", checked: s.leaderboardVisible },
            { name: "recentSupportersVisible", label: "Show recent supporters on player pages", checked: s.recentSupportersVisible },
            { name: "donorMessagesVisible", label: "Show donor messages publicly", checked: s.donorMessagesVisible },
            { name: "anonymousAllowed", label: "Allow anonymous donations", checked: s.anonymousAllowed },
          ].map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-sm text-rampage-charcoal">
              <input type="checkbox" name={f.name} defaultChecked={f.checked} className="h-4 w-4 rounded border-black/20 text-rampage-purple focus-ring" />
              {f.label}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring"
        >
          Save Settings
        </button>
      </form>

      <p className="text-xs text-rampage-gray">
        Branding (logo, colors, team name, contact links) is edited directly in{" "}
        <code>src/lib/config.ts</code> — see the README for details.
      </p>
    </div>
  );
}

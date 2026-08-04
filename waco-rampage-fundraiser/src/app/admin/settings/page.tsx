"use client";

import { useState } from "react";
import { useDataStore } from "@/lib/store";

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function AdminSettingsPage() {
  const { db, updateSettings } = useDataStore();
  const s = db.settings;
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fundraiserTitle: s.fundraiserTitle,
    fundraiserDescription: s.fundraiserDescription,
    teamGoalDollars: s.teamGoalCents / 100,
    playerDefaultGoalDollars: s.playerDefaultGoalCents / 100,
    startDate: toDateInput(s.startDate),
    endDate: toDateInput(s.endDate),
    minDonationDollars: s.minDonationCents / 100,
    maxDonationDollars: s.maxDonationCents / 100,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    leaderboardVisible: s.leaderboardVisible,
    recentSupportersVisible: s.recentSupportersVisible,
    donorMessagesVisible: s.donorMessagesVisible,
    anonymousAllowed: s.anonymousAllowed,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      fundraiserTitle: form.fundraiserTitle,
      fundraiserDescription: form.fundraiserDescription,
      teamGoalCents: Math.round(form.teamGoalDollars * 100),
      playerDefaultGoalCents: Math.round(form.playerDefaultGoalDollars * 100),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      minDonationCents: Math.round(form.minDonationDollars * 100),
      maxDonationCents: Math.round(form.maxDonationDollars * 100),
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      leaderboardVisible: form.leaderboardVisible,
      recentSupportersVisible: form.recentSupportersVisible,
      donorMessagesVisible: form.donorMessagesVisible,
      anonymousAllowed: form.anonymousAllowed,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputCls = "w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Fundraiser Settings</h1>

      {saved && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Settings updated.</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Fundraiser title</label>
          <input value={form.fundraiserTitle} onChange={(e) => setForm({ ...form, fundraiserTitle: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Fundraiser description</label>
          <textarea rows={3} value={form.fundraiserDescription} onChange={(e) => setForm({ ...form, fundraiserDescription: e.target.value })} className={inputCls} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Team goal (USD)</label>
            <input type="number" value={form.teamGoalDollars} onChange={(e) => setForm({ ...form, teamGoalDollars: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Default player goal (USD)</label>
            <input type="number" value={form.playerDefaultGoalDollars} onChange={(e) => setForm({ ...form, playerDefaultGoalDollars: Number(e.target.value) })} className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Start date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">End date</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Minimum donation (USD)</label>
            <input type="number" value={form.minDonationDollars} onChange={(e) => setForm({ ...form, minDonationDollars: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Maximum donation (USD)</label>
            <input type="number" value={form.maxDonationDollars} onChange={(e) => setForm({ ...form, maxDonationDollars: Number(e.target.value) })} className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact email</label>
            <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact phone</label>
            <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-rampage-charcoal mb-1">Visibility toggles</legend>
          {(
            [
              ["leaderboardVisible", "Show top-fundraiser leaderboard"],
              ["recentSupportersVisible", "Show recent supporters on player pages"],
              ["donorMessagesVisible", "Show donor messages publicly"],
              ["anonymousAllowed", "Allow anonymous donations"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-rampage-charcoal">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-black/20 text-rampage-purple focus-ring"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
          Save Settings
        </button>
      </form>

      <p className="text-xs text-rampage-gray">
        Branding (logo, colors, team name, contact links) is edited directly in <code>src/lib/config.ts</code> — see
        the README for details.
      </p>
    </div>
  );
}

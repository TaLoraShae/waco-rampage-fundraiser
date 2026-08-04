"use client";

import Link from "next/link";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { formatCents } from "@/lib/fees";

export default function AdminDashboardPage() {
  const { db, resetAll } = useDataStore();
  const settings = db.settings;
  const players = sel.getPlayers(db);
  const activePlayers = players.filter((p) => p.active && !p.isGeneralFund);
  const donations = sel.getDonations(db);
  const succeeded = donations.filter((d) => d.status === "succeeded");
  const teamRaised = sel.getTeamRaisedCents(db);
  const totalFees = succeeded.reduce((s, d) => s + d.feeCents, 0);
  const totalNet = succeeded.reduce((s, d) => s + d.netCents, 0);
  const avgDonation = succeeded.length ? Math.round(teamRaised / succeeded.length) : 0;
  const daysRemaining = Math.max(0, Math.ceil((new Date(settings.endDate).getTime() - Date.now()) / 86400000));
  const leaderboard = sel.getLeaderboard(db, 1);
  const topFundraiser = leaderboard[0];
  const recent = donations.slice(0, 6);

  const cards = [
    { label: "Team Goal", value: formatCents(settings.teamGoalCents) },
    { label: "Total Raised", value: formatCents(teamRaised) },
    { label: "Estimated Fees", value: formatCents(totalFees) },
    { label: "Estimated Net Proceeds", value: formatCents(totalNet) },
    { label: "Total Donations", value: String(succeeded.length) },
    { label: "Average Donation", value: formatCents(avgDonation) },
    { label: "Active Players", value: String(activePlayers.length) },
    { label: "Days Remaining", value: String(daysRemaining) },
  ];

  function handleReset() {
    if (window.confirm("Reset all prototype data back to the original sample players and donations?")) {
      resetAll();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-rampage-purple-dark">Dashboard</h1>
          <p className="text-sm text-rampage-gray">{settings.fundraiserTitle}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold rounded-full border border-red-300 text-red-600 px-4 py-2 hover:bg-red-50 transition focus-ring"
        >
          Reset All Prototype Data
        </button>
      </div>

      <p className="text-xs text-rampage-gray bg-rampage-gray-light border border-black/5 rounded-lg p-3">
        This prototype's data is stored in your browser (not a server), so it's specific to this device/browser and
        will reset if you clear site data.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-4">
            <p className="text-xs uppercase tracking-wide text-rampage-gray mb-1">{c.label}</p>
            <p className="font-display text-xl text-rampage-purple-dark">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6">
          <h2 className="font-display text-lg text-rampage-purple-dark mb-4">Top Fundraiser</h2>
          {topFundraiser ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-rampage-charcoal">{topFundraiser.player.displayName}</p>
                <Link href={`/admin/players/${topFundraiser.player.id}`} className="text-xs text-rampage-purple hover:underline focus-ring rounded">
                  View player
                </Link>
              </div>
              <p className="font-display text-xl text-rampage-purple-dark">{formatCents(topFundraiser.raisedCents)}</p>
            </div>
          ) : (
            <p className="text-sm text-rampage-gray">No donations yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6">
          <h2 className="font-display text-lg text-rampage-purple-dark mb-4">Recent Donations</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-rampage-gray">No donations yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((d) => {
                const player = sel.getPlayerById(db, d.playerId);
                return (
                  <li key={d.id} className="flex justify-between text-sm border-b border-black/5 pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-rampage-charcoal">{player?.displayName || "Unknown player"}</p>
                      <p className="text-xs text-rampage-gray capitalize">
                        {d.status} · {d.source} · {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-rampage-charcoal">{formatCents(d.grossCents)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/admin/donations" className="inline-block mt-4 text-sm text-rampage-purple hover:underline focus-ring rounded">
            View all donations →
          </Link>
        </div>
      </div>
    </div>
  );
}

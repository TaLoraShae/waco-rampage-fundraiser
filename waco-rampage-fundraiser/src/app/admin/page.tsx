import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import * as adminData from "@/lib/adminData";
import { formatCents } from "@/lib/fees";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const canSeeFinancials = admin.role === "owner" || admin.role === "treasurer";

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) {
    return <p className="text-rampage-gray">No fundraiser found. Run docs/SUPABASE_SETUP.sql first.</p>;
  }

  const [players, donations, financialDonations] = await Promise.all([
    data.getPlayers(fundraiser.id),
    data.getDonationsForFundraiser(fundraiser.id),
    canSeeFinancials ? adminData.getFinancialDonations(fundraiser.id) : Promise.resolve([]),
  ]);

  const activePlayers = players.filter((p) => p.active && !p.is_general_fund);
  const succeeded = donations.filter((d) => d.status === "succeeded");
  const teamRaised = data.getTeamRaisedCents(donations);
  const totalFees = financialDonations.filter((d) => d.status === "succeeded").reduce((s, d) => s + d.fee_cents, 0);
  const totalNet = financialDonations.filter((d) => d.status === "succeeded").reduce((s, d) => s + d.net_cents, 0);
  const avgDonation = succeeded.length ? Math.round(teamRaised / succeeded.length) : 0;
  const daysRemaining = Math.max(0, Math.ceil((new Date(fundraiser.end_date).getTime() - Date.now()) / 86400000));
  const leaderboard = data.getLeaderboard(donations, players, 1);
  const topFundraiser = leaderboard[0];
  const recent = donations.slice(0, 6);

  const cards = [
    { label: "Team Goal", value: formatCents(fundraiser.team_goal_cents) },
    { label: "Total Raised", value: formatCents(teamRaised) },
    ...(canSeeFinancials
      ? [
          { label: "Estimated Fees", value: formatCents(totalFees) },
          { label: "Estimated Net Proceeds", value: formatCents(totalNet) },
        ]
      : []),
    { label: "Total Donations", value: String(succeeded.length) },
    { label: "Average Donation", value: formatCents(avgDonation) },
    { label: "Active Players", value: String(activePlayers.length) },
    { label: "Days Remaining", value: String(daysRemaining) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-rampage-purple-dark">Dashboard</h1>
        <p className="text-sm text-rampage-gray">{fundraiser.title}</p>
      </div>

      <p className="text-xs text-rampage-gray bg-rampage-gray-light border border-black/5 rounded-lg p-3">
        Data is stored permanently in Supabase and shared across every device and administrator.
        {!canSeeFinancials && " Your Manager role doesn't include donor financial details (fees, net proceeds, donor emails)."}
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
                <p className="font-semibold text-rampage-charcoal">{topFundraiser.player.display_name}</p>
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
                const player = players.find((p) => p.id === d.player_id);
                return (
                  <li key={d.id} className="flex justify-between text-sm border-b border-black/5 pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-rampage-charcoal">{player?.display_name || "Unknown player"}</p>
                      <p className="text-xs text-rampage-gray capitalize">
                        {d.status} · {d.source} · {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-semibold text-rampage-charcoal">{formatCents(d.gross_cents)}</span>
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

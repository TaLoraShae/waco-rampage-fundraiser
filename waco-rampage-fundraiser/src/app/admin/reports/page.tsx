import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import * as adminData from "@/lib/adminData";
import { formatCents } from "@/lib/fees";
import { progressPercent } from "@/components/ProgressBar";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export default async function AdminReportsPage() {
  await requireAdmin(["owner", "treasurer"]);

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;

  const [players, donations] = await Promise.all([
    data.getPlayers(fundraiser.id),
    adminData.getFinancialDonations(fundraiser.id),
  ]);

  const succeeded = donations.filter((d) => d.status === "succeeded");

  const byPlayer = players.map((p) => {
    const playerDonations = succeeded.filter((d) => d.player_id === p.id);
    const gross = playerDonations.reduce((s, d) => s + d.gross_cents, 0);
    const fee = playerDonations.reduce((s, d) => s + d.fee_cents, 0);
    const net = playerDonations.reduce((s, d) => s + d.net_cents, 0);
    return { player: p, count: playerDonations.length, gross, fee, net };
  });

  const totalGross = succeeded.reduce((s, d) => s + d.gross_cents, 0);
  const totalFee = succeeded.reduce((s, d) => s + d.fee_cents, 0);
  const totalNet = succeeded.reduce((s, d) => s + d.net_cents, 0);
  const anonymousCount = succeeded.filter((d) => d.anonymous).length;
  const refundedCount = donations.filter((d) => d.refunded).length;
  const avgDonation = succeeded.length ? Math.round(totalGross / succeeded.length) : 0;

  const byDate = Object.entries(
    succeeded.reduce<Record<string, number>>((acc, d) => {
      const day = new Date(d.created_at).toLocaleDateString();
      acc[day] = (acc[day] || 0) + d.gross_cents;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Reports</h1>
        <ExportCsvButton donations={donations} players={players} filename={`waco-rampage-donations-${new Date().toISOString().slice(0, 10)}.csv`} label="Export All Donations (CSV)" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Gross Donations", value: formatCents(totalGross) },
          { label: "Estimated Fees", value: formatCents(totalFee) },
          { label: "Estimated Net", value: formatCents(totalNet) },
          { label: "Donation Count", value: String(succeeded.length) },
          { label: "Average Donation", value: formatCents(avgDonation) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-4">
            <p className="text-xs uppercase tracking-wide text-rampage-gray mb-1">{c.label}</p>
            <p className="font-display text-lg text-rampage-purple-dark">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6">
        <h2 className="font-display text-lg text-rampage-purple-dark mb-4">Donations by Player</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-rampage-gray">
              <tr>
                <th className="py-2 pr-4">Player</th>
                <th className="py-2 pr-4">Donations</th>
                <th className="py-2 pr-4">Gross</th>
                <th className="py-2 pr-4">Fees</th>
                <th className="py-2 pr-4">Net</th>
                <th className="py-2 pr-4">Goal Progress</th>
              </tr>
            </thead>
            <tbody>
              {byPlayer.map((row) => (
                <tr key={row.player.id} className="border-t border-black/5">
                  <td className="py-2 pr-4 font-medium text-rampage-charcoal">{row.player.display_name}</td>
                  <td className="py-2 pr-4">{row.count}</td>
                  <td className="py-2 pr-4">{formatCents(row.gross)}</td>
                  <td className="py-2 pr-4 text-rampage-gray">{formatCents(row.fee)}</td>
                  <td className="py-2 pr-4">{formatCents(row.net)}</td>
                  <td className="py-2 pr-4">{progressPercent(row.gross, row.player.goal_cents)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6">
          <h2 className="font-display text-lg text-rampage-purple-dark mb-4">Donations by Date</h2>
          {byDate.length === 0 ? (
            <p className="text-sm text-rampage-gray">No donations yet.</p>
          ) : (
            <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {byDate.map(([day, cents]) => (
                <li key={day} className="flex justify-between border-b border-black/5 pb-2 last:border-0">
                  <span className="text-rampage-gray">{day}</span>
                  <span className="font-semibold text-rampage-charcoal">{formatCents(cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-3">
          <h2 className="font-display text-lg text-rampage-purple-dark mb-1">Other Metrics</h2>
          <div className="flex justify-between text-sm border-b border-black/5 pb-2">
            <span className="text-rampage-gray">Fundraiser progress</span>
            <span className="font-semibold text-rampage-charcoal">{progressPercent(totalGross, fundraiser.team_goal_cents)}%</span>
          </div>
          <div className="flex justify-between text-sm border-b border-black/5 pb-2">
            <span className="text-rampage-gray">Anonymous donations</span>
            <span className="font-semibold text-rampage-charcoal">{anonymousCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rampage-gray">Refunded donations</span>
            <span className="font-semibold text-rampage-charcoal">{refundedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

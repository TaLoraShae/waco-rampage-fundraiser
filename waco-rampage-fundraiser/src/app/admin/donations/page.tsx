import * as db from "@/lib/db";
import { formatCents } from "@/lib/fees";
import { deleteDonationAction, markDonationRefunded } from "@/app/actions";

export default function AdminDonationsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    player?: string;
    status?: string;
    source?: string;
    from?: string;
    to?: string;
    success?: string;
  };
}) {
  const players = db.getPlayers();
  let donations = db.getDonations();

  if (searchParams.player) {
    donations = donations.filter((d) => d.playerId === searchParams.player);
  }
  if (searchParams.status) {
    donations = donations.filter((d) => d.status === searchParams.status);
  }
  if (searchParams.source) {
    donations = donations.filter((d) => d.source === searchParams.source);
  }
  if (searchParams.from) {
    donations = donations.filter((d) => new Date(d.createdAt) >= new Date(searchParams.from as string));
  }
  if (searchParams.to) {
    donations = donations.filter((d) => new Date(d.createdAt) <= new Date(searchParams.to as string));
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    donations = donations.filter(
      (d) => d.donorName.toLowerCase().includes(q) || d.donorEmail.toLowerCase().includes(q)
    );
  }

  const exportQuery = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Donation Management</h1>
        <a
          href={`/api/donations/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="inline-flex items-center rounded-full border border-rampage-purple text-rampage-purple text-sm font-semibold px-4 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
        >
          Export CSV
        </a>
      </div>

      {searchParams.success && (
        <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Updated.</p>
      )}

      <form className="bg-white rounded-2xl border border-black/5 shadow-card p-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-sm">
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search donor name/email"
          className="rounded-lg border border-black/10 px-3 py-2 sm:col-span-2"
        />
        <select name="player" defaultValue={searchParams.player || ""} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">All players</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.displayName}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status || ""} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">All statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="canceled">Canceled</option>
        </select>
        <select name="source" defaultValue={searchParams.source || ""} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">Mock or Stripe</option>
          <option value="mock">Mock</option>
          <option value="stripe">Stripe</option>
        </select>
        <div className="flex gap-2">
          <input type="date" name="from" defaultValue={searchParams.from} className="w-full rounded-lg border border-black/10 px-2 py-2" />
          <input type="date" name="to" defaultValue={searchParams.to} className="w-full rounded-lg border border-black/10 px-2 py-2" />
        </div>
        <button
          type="submit"
          className="sm:col-span-3 lg:col-span-6 inline-flex items-center justify-center rounded-full bg-rampage-purple text-white text-sm font-semibold px-4 py-2 hover:bg-rampage-purple-dark transition focus-ring"
        >
          Apply Filters
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rampage-gray-light text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => {
              const player = db.getPlayerById(d.playerId);
              return (
                <tr key={d.id} className="border-t border-black/5 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{player?.displayName || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-rampage-charcoal">{d.anonymous ? "Anonymous" : d.donorName}</p>
                    <p className="text-xs text-rampage-gray">{d.donorEmail || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{formatCents(d.grossCents)}</td>
                  <td className="px-4 py-3 text-rampage-gray">{formatCents(d.feeCents)}</td>
                  <td className="px-4 py-3">{formatCents(d.netCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                        d.status === "succeeded"
                          ? "bg-green-100 text-green-700"
                          : d.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-black/5 text-rampage-gray"
                      }`}
                    >
                      {d.status}
                    </span>
                    {d.refunded && (
                      <span className="ml-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 uppercase text-xs text-rampage-gray">{d.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <form action={markDonationRefunded}>
                        <input type="hidden" name="id" value={d.id} />
                        <input type="hidden" name="refunded" value={String(d.refunded)} />
                        <button type="submit" className="text-xs font-semibold text-amber-700 hover:underline focus-ring rounded">
                          {d.refunded ? "Unmark Refund" : "Mark Refunded"}
                        </button>
                      </form>
                      <form action={deleteDonationAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {donations.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-rampage-gray">
                  No donations match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

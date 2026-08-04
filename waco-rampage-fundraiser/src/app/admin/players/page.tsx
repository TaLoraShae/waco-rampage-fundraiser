import Link from "next/link";
import * as db from "@/lib/db";
import { formatCents } from "@/lib/fees";
import { getPlayerUrl } from "@/lib/qrcode";
import { togglePlayerActive, deletePlayerAction, resetPlayerTotals } from "@/app/actions";

const MESSAGES: Record<string, string> = {
  created: "Player added.",
  updated: "Player updated.",
  deleted: "Player deleted.",
  reset: "Player's mock donations were cleared.",
};

export default function AdminPlayersPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const players = db.getPlayers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Player Management</h1>
        <Link
          href="/admin/players/new"
          className="inline-flex items-center rounded-full bg-rampage-purple text-white text-sm font-semibold px-4 py-2 hover:bg-rampage-purple-dark transition focus-ring"
        >
          + Add Player
        </Link>
      </div>

      {searchParams.success && MESSAGES[searchParams.success] && (
        <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">
          {MESSAGES[searchParams.success]}
        </p>
      )}
      {searchParams.error && (
        <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
          {searchParams.error === "duplicate-slug"
            ? "That slug is already in use. Please choose a unique slug."
            : searchParams.error === "missing"
            ? "Name and slug are required."
            : searchParams.error}
        </p>
      )}

      <div className="bg-white rounded-2xl border border-black/5 shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rampage-gray-light text-rampage-charcoal text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Slug / Link</th>
              <th className="px-4 py-3">Goal</th>
              <th className="px-4 py-3">Raised</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              const raised = db.getPlayerRaisedCents(p.id);
              return (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-3 text-rampage-gray">{p.displayOrder}</td>
                  <td className="px-4 py-3 font-medium text-rampage-charcoal">
                    {p.displayName}
                    {p.isGeneralFund && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide bg-rampage-gold/20 text-rampage-purple-dark px-2 py-0.5 rounded-full">
                        General Fund
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={getPlayerUrl(p.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rampage-purple hover:underline focus-ring rounded"
                    >
                      /support/{p.slug}
                    </a>
                  </td>
                  <td className="px-4 py-3">{formatCents(p.goalCents)}</td>
                  <td className="px-4 py-3">{formatCents(raised)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.active ? "bg-green-100 text-green-700" : "bg-black/5 text-rampage-gray"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/players/${p.id}`}
                        className="text-xs font-semibold text-rampage-purple hover:underline focus-ring rounded"
                      >
                        Edit
                      </Link>
                      <form action={togglePlayerActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={String(p.active)} />
                        <button type="submit" className="text-xs font-semibold text-rampage-charcoal hover:underline focus-ring rounded">
                          {p.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                      <form action={resetPlayerTotals}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-xs font-semibold text-amber-700 hover:underline focus-ring rounded">
                          Reset Totals
                        </button>
                      </form>
                      {!p.isGeneralFund && (
                        <form action={deletePlayerAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-rampage-gray">
        Players with donation history can&apos;t be deleted — deactivate them instead, or use &ldquo;Reset
        Totals&rdquo; to clear their mock donations first.
      </p>
    </div>
  );
}

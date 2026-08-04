"use client";

import Link from "next/link";
import { useState } from "react";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { formatCents } from "@/lib/fees";
import { getPlayerUrl } from "@/lib/qrcode";

export default function AdminPlayersPage() {
  const { db, togglePlayerActive, deletePlayerById, resetPlayerTotals } = useDataStore();
  const players = sel.getPlayers(db);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!window.confirm("Delete this player? This can't be undone.")) return;
    const res = deletePlayerById(id);
    if (!res.ok) {
      setError(res.reason || "Couldn't delete this player.");
      setNotice(null);
    } else {
      setNotice("Player deleted.");
      setError(null);
    }
  }

  function handleResetTotals(id: string, name: string) {
    if (!window.confirm(`Clear all mock donations for ${name}?`)) return;
    resetPlayerTotals(id);
    setNotice("Player's mock donations were cleared.");
    setError(null);
  }

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

      {notice && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">{notice}</p>}
      {error && <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">{error}</p>}

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-x-auto">
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
              const raised = sel.getPlayerRaisedCents(db, p.id);
              return (
                <tr key={p.id} className="border-t border-black/5">
                  <td className="px-4 py-3 text-rampage-gray">{p.displayOrder}</td>
                  <td className="px-4 py-3 font-medium text-rampage-charcoal">
                    {p.displayName}
                    {p.isGeneralFund && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide bg-rampage-purple/10 text-rampage-purple-dark px-2 py-0.5 rounded-full">
                        General Fund
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={getPlayerUrl(p.slug)} target="_blank" rel="noreferrer" className="text-rampage-purple hover:underline focus-ring rounded">
                      /support/{p.slug}
                    </a>
                  </td>
                  <td className="px-4 py-3">{formatCents(p.goalCents)}</td>
                  <td className="px-4 py-3">{formatCents(raised)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-black/5 text-rampage-gray"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/players/${p.id}`} className="text-xs font-semibold text-rampage-purple hover:underline focus-ring rounded">
                        Edit
                      </Link>
                      <button type="button" onClick={() => togglePlayerActive(p.id)} className="text-xs font-semibold text-rampage-charcoal hover:underline focus-ring rounded">
                        {p.active ? "Deactivate" : "Reactivate"}
                      </button>
                      <button type="button" onClick={() => handleResetTotals(p.id, p.displayName)} className="text-xs font-semibold text-amber-700 hover:underline focus-ring rounded">
                        Reset Totals
                      </button>
                      {!p.isGeneralFund && (
                        <button type="button" onClick={() => handleDelete(p.id)} className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">
                          Delete
                        </button>
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

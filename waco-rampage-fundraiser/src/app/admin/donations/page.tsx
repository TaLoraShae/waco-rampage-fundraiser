"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { formatCents } from "@/lib/fees";
import { donationsToCsv, downloadCsv } from "@/lib/csv";

export default function AdminDonationsPage() {
  const { db, updateDonationById, deleteDonationById } = useDataStore();
  const players = sel.getPlayers(db);

  const [q, setQ] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const donations = useMemo(() => {
    let list = sel.getDonations(db);
    if (playerId) list = list.filter((d) => d.playerId === playerId);
    if (status) list = list.filter((d) => d.status === status);
    if (source) list = list.filter((d) => d.source === source);
    if (from) list = list.filter((d) => new Date(d.createdAt) >= new Date(from));
    if (to) list = list.filter((d) => new Date(d.createdAt) <= new Date(to));
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((d) => d.donorName.toLowerCase().includes(needle) || d.donorEmail.toLowerCase().includes(needle));
    }
    return list;
  }, [db, q, playerId, status, source, from, to]);

  function handleExport() {
    const csv = donationsToCsv(db, donations);
    downloadCsv(csv, `waco-rampage-donations-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this donation record? This can't be undone.")) return;
    deleteDonationById(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Donation Management</h1>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center rounded-full border border-rampage-purple text-rampage-purple text-sm font-semibold px-4 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6 text-sm">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search donor name/email" className="rounded-lg border border-black/10 px-3 py-2 sm:col-span-2" />
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">All players</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.displayName}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">All statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="canceled">Canceled</option>
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2">
          <option value="">Mock or Stripe</option>
          <option value="mock">Mock</option>
          <option value="stripe">Stripe</option>
        </select>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-black/10 px-2 py-2" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-black/10 px-2 py-2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-x-auto">
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
              const player = sel.getPlayerById(db, d.playerId);
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
                        d.status === "succeeded" ? "bg-green-100 text-green-700" : d.status === "failed" ? "bg-red-100 text-red-700" : "bg-black/5 text-rampage-gray"
                      }`}
                    >
                      {d.status}
                    </span>
                    {d.refunded && <span className="ml-1 text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">Refunded</span>}
                  </td>
                  <td className="px-4 py-3 uppercase text-xs text-rampage-gray">{d.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => updateDonationById(d.id, { refunded: !d.refunded })} className="text-xs font-semibold text-amber-700 hover:underline focus-ring rounded text-left">
                        {d.refunded ? "Unmark Refund" : "Mark Refunded"}
                      </button>
                      <button type="button" onClick={() => handleDelete(d.id)} className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded text-left">
                        Delete
                      </button>
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

"use client";

import { useMemo, useState } from "react";
import PlayerCard from "./PlayerCard";
import { Player } from "@/lib/types";

export interface DirectoryEntry {
  player: Player;
  raisedCents: number;
  playerUrl: string;
}

export default function PlayerDirectory({ entries }: { entries: DirectoryEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.player.display_name.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <label htmlFor="player-search" className="sr-only">
          Search for a player
        </label>
        <input
          id="player-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a player by name..."
          className="w-full rounded border border-rampage-silver-dark/30 bg-rampage-charcoal px-5 py-3 text-sm text-white placeholder:text-rampage-gray shadow-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple-light"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-rampage-gray">
          No players match &ldquo;{query}&rdquo;. Try a different name.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <PlayerCard key={e.player.id} player={e.player} raisedCents={e.raisedCents} playerUrl={e.playerUrl} />
          ))}
        </div>
      )}
    </div>
  );
}

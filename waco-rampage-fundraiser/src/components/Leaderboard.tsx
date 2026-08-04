import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/fees";
import { progressPercent } from "./ProgressBar";
import { Player } from "@/lib/types";

const MEDAL = ["🥇", "🥈", "🥉"];
const PODIUM_ORDER = [1, 0, 2]; // visually: 2nd, 1st, 3rd

export default function Leaderboard({
  entries,
}: {
  entries: { player: Player; raisedCents: number }[];
}) {
  if (entries.length === 0) return null;

  const podium = PODIUM_ORDER.map((i) => entries[i]).filter(Boolean);

  return (
    <section id="leaderboard" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-rampage-purple font-semibold uppercase tracking-widest text-xs mb-2">
          Top Fundraisers
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark">Leading the Lineup</h2>
        <p className="text-rampage-gray mt-2 max-w-xl mx-auto">
          These players are bringing in the most support this season. Think you can help move someone up the board?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        {podium.map((entry, idx) => {
          const originalRank = entries.indexOf(entry) + 1;
          const isFirst = originalRank === 1;
          return (
            <Link
              href={`/support/${entry.player.slug}`}
              key={entry.player.id}
              className={`group relative rounded-2xl bg-white shadow-card border overflow-hidden focus-ring transition hover:-translate-y-1 ${
                isFirst ? "border-rampage-gold sm:order-2 sm:scale-105 z-10" : "border-black/5 sm:order-none"
              } ${idx === 0 ? "sm:order-1" : idx === 2 ? "sm:order-3" : ""}`}
            >
              <div className="absolute top-3 right-3 text-2xl" aria-hidden>
                {MEDAL[originalRank - 1]}
              </div>
              <div className="relative w-full aspect-square bg-rampage-gray-light">
                <Image
                  src={entry.player.imageUrl}
                  alt={`Placeholder photo of ${entry.player.displayName}`}
                  fill
                  sizes="300px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4 text-center">
                <p className="font-display text-rampage-purple-dark tracking-wide">{entry.player.displayName}</p>
                <p className="text-sm text-rampage-charcoal font-semibold mt-1">
                  {formatCents(entry.raisedCents)} raised
                </p>
                <p className="text-xs text-rampage-gray">
                  {progressPercent(entry.raisedCents, entry.player.goalCents)}% of goal
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

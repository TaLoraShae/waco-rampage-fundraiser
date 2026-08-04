import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/fees";
import { progressPercent } from "./ProgressBar";
import { Player } from "@/lib/types";

const PODIUM_ORDER = [1, 0, 2]; // visually: 2nd, 1st, 3rd

export default function Leaderboard({
  entries,
}: {
  entries: { player: Player; raisedCents: number }[];
}) {
  if (entries.length === 0) return null;

  const podium = PODIUM_ORDER.map((i) => entries[i]).filter(Boolean);

  return (
    <section id="leaderboard" className="bg-rampage-charcoal texture-grain">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
            Top Fundraisers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">LEADING THE LINEUP</h2>
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
                className={`group relative rounded-2xl bg-rampage-black overflow-hidden focus-ring transition hover:-translate-y-1 ${
                  isFirst
                    ? "border-2 border-rampage-purple-light sm:order-2 sm:scale-105 z-10 shadow-glow"
                    : "metal-border sm:order-none"
                } ${idx === 0 ? "sm:order-1" : idx === 2 ? "sm:order-3" : ""}`}
              >
                <div
                  className={`absolute top-3 right-3 z-10 inline-flex items-center justify-center h-9 w-9 rounded-full font-display text-sm ${
                    isFirst ? "bg-rampage-purple-light text-black" : "bg-rampage-silver-dark text-black"
                  }`}
                  aria-hidden
                >
                  #{originalRank}
                </div>
                <div className="relative w-full aspect-square bg-black">
                  <Image
                    src={entry.player.image_url}
                    alt={`Placeholder photo of ${entry.player.display_name}`}
                    fill
                    sizes="300px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>
                <div className="p-4 text-center">
                  <p className="font-display text-white tracking-wide">{entry.player.display_name}</p>
                  <p className="text-sm text-rampage-silver font-semibold mt-1">
                    {formatCents(entry.raisedCents)} raised
                  </p>
                  <p className="text-xs text-rampage-gray">
                    {progressPercent(entry.raisedCents, entry.player.goal_cents)}% of goal
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

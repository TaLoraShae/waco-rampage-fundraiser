import Image from "next/image";
import Link from "next/link";
import ProgressBar, { progressPercent } from "./ProgressBar";
import CopyLinkButton from "./CopyLinkButton";
import QrCodeBox from "./QrCodeBox";
import { formatCents } from "@/lib/fees";
import { Player } from "@/lib/types";

export default function PlayerCard({
  player,
  raisedCents,
  playerUrl,
  rank,
}: {
  player: Player;
  raisedCents: number;
  playerUrl: string;
  rank?: number;
}) {
  const pct = progressPercent(raisedCents, player.goal_cents);

  return (
    <div className="bg-rampage-charcoal metal-border rounded-2xl shadow-card overflow-hidden flex flex-col">
      <div className="relative">
        {typeof rank === "number" && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-rampage-purple text-white font-display text-sm shadow-glow">
            #{rank}
          </span>
        )}
        <div className="relative w-full aspect-[4/3] bg-black">
          <Image
            src={player.image_url}
            alt={`Placeholder photo of ${player.display_name}`}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-display text-lg text-white tracking-wide">{player.display_name}</h3>
        <div>
          <div className="flex justify-between text-sm font-semibold text-white/90 mb-1">
            <span>{formatCents(raisedCents)} raised</span>
            <span className="text-rampage-silver">{pct}%</span>
          </div>
          <ProgressBar raisedCents={raisedCents} goalCents={player.goal_cents} size="sm" />
          <p className="text-xs text-rampage-gray mt-1">Goal: {formatCents(player.goal_cents)}</p>
        </div>
        <Link
          href={`/support/${player.slug}`}
          className="mt-auto inline-flex items-center justify-center rounded bg-rampage-purple text-white text-sm font-bold uppercase tracking-wide px-4 py-2.5 hover:bg-rampage-purple-light transition focus-ring"
        >
          View Fundraiser
        </Link>
        <div className="flex gap-2">
          <CopyLinkButton
            url={playerUrl}
            className="flex-1 inline-flex items-center justify-center rounded border border-rampage-silver-dark/40 text-white text-xs font-semibold px-2 py-2 hover:bg-white/10 transition focus-ring"
          />
          <QrCodeBox url={playerUrl} fileName={player.slug} compact />
        </div>
      </div>
    </div>
  );
}

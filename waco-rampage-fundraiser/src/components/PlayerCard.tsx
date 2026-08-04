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
  qrDataUrl,
  rank,
}: {
  player: Player;
  raisedCents: number;
  playerUrl: string;
  qrDataUrl: string;
  rank?: number;
}) {
  const pct = progressPercent(raisedCents, player.goalCents);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden flex flex-col">
      <div className="relative">
        {typeof rank === "number" && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-rampage-gold text-rampage-purple-dark font-display text-sm shadow">
            #{rank}
          </span>
        )}
        <div className="relative w-full aspect-[4/3] bg-rampage-gray-light">
          <Image
            src={player.imageUrl}
            alt={`Placeholder photo of ${player.displayName}`}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-display text-lg text-rampage-purple-dark tracking-wide">{player.displayName}</h3>
        <div>
          <div className="flex justify-between text-sm font-semibold text-rampage-charcoal mb-1">
            <span>{formatCents(raisedCents)} raised</span>
            <span className="text-rampage-gray">{pct}%</span>
          </div>
          <ProgressBar raisedCents={raisedCents} goalCents={player.goalCents} size="sm" />
          <p className="text-xs text-rampage-gray mt-1">Goal: {formatCents(player.goalCents)}</p>
        </div>
        <Link
          href={`/support/${player.slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-rampage-purple text-white text-sm font-bold px-4 py-2.5 hover:bg-rampage-purple-dark transition focus-ring"
        >
          View Fundraiser
        </Link>
        <div className="flex gap-2">
          <CopyLinkButton
            url={playerUrl}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-rampage-purple text-rampage-purple text-xs font-semibold px-2 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
          />
          <QrCodeBox dataUrl={qrDataUrl} fileName={player.slug} compact />
        </div>
      </div>
    </div>
  );
}

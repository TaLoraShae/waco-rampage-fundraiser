"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import PlayerForm from "@/components/admin/PlayerForm";
import { getPlayerUrl } from "@/lib/qrcode";
import { formatCents } from "@/lib/fees";
import QrCodeBox from "@/components/QrCodeBox";
import CopyLinkButton from "@/components/CopyLinkButton";

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const { db, updatePlayerById, ready } = useDataStore();
  const router = useRouter();
  const player = sel.getPlayerById(db, params.id);

  if (ready && !player) notFound();
  if (!player) return null;

  const playerUrl = getPlayerUrl(player.slug);
  const donations = sel.getDonationsForPlayer(db, player.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Edit {player.displayName}</h1>
        <Link href="/admin/players" className="text-sm text-rampage-purple hover:underline focus-ring rounded">
          ← Back to players
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PlayerForm
          player={player}
          submitLabel="Save Changes"
          onSubmit={(values) => {
            const result = updatePlayerById(player.id, values);
            if (result.ok) router.push("/admin/players");
            return result;
          }}
        />

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-5 space-y-3">
            <p className="text-xs uppercase tracking-wide text-rampage-gray font-semibold">Custom link</p>
            <p className="text-sm font-mono break-all text-rampage-charcoal">{playerUrl}</p>
            <div className="flex gap-2">
              <CopyLinkButton
                url={playerUrl}
                className="flex-1 text-center rounded-full border border-rampage-purple text-rampage-purple text-xs font-semibold px-3 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
              />
              <a href={playerUrl} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-full border border-black/10 text-rampage-charcoal text-xs font-semibold px-3 py-2 hover:bg-black/5 transition focus-ring">
                Open Page
              </a>
            </div>
            <QrCodeBox url={playerUrl} fileName={player.slug} compact />
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-5">
            <p className="text-xs uppercase tracking-wide text-rampage-gray font-semibold mb-3">
              Donation history ({donations.length})
            </p>
            {donations.length === 0 ? (
              <p className="text-sm text-rampage-gray">No donations recorded yet.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
                {donations.map((d) => (
                  <li key={d.id} className="flex justify-between border-b border-black/5 pb-2 last:border-0">
                    <span className="capitalize text-rampage-gray">{d.status}</span>
                    <span className="font-semibold text-rampage-charcoal">{formatCents(d.grossCents)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/admin/donations?player=${player.id}`} className="inline-block mt-3 text-xs text-rampage-purple hover:underline focus-ring rounded">
              View in Donations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

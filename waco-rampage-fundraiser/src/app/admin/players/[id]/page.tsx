import { notFound } from "next/navigation";
import Link from "next/link";
import * as db from "@/lib/db";
import PlayerForm from "@/components/admin/PlayerForm";
import { updatePlayerAction } from "@/app/actions";
import { generateQrDataUrl, getPlayerUrl } from "@/lib/qrcode";
import { formatCents } from "@/lib/fees";
import QrCodeBox from "@/components/QrCodeBox";
import CopyLinkButton from "@/components/CopyLinkButton";

export default async function EditPlayerPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const player = db.getPlayerById(params.id);
  if (!player) notFound();

  const playerUrl = getPlayerUrl(player.slug);
  const qrDataUrl = await generateQrDataUrl(playerUrl);
  const donations = db.getDonationsForPlayer(player.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl text-rampage-purple-dark">Edit {player.displayName}</h1>
        <Link href="/admin/players" className="text-sm text-rampage-purple hover:underline focus-ring rounded">
          ← Back to players
        </Link>
      </div>

      {searchParams.error === "duplicate-slug" && (
        <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
          That slug is already in use by another player.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PlayerForm action={updatePlayerAction} player={player} submitLabel="Save Changes" />

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 shadow-card p-5 space-y-3">
            <p className="text-xs uppercase tracking-wide text-rampage-gray font-semibold">Custom link</p>
            <p className="text-sm font-mono break-all text-rampage-charcoal">{playerUrl}</p>
            <div className="flex gap-2">
              <CopyLinkButton
                url={playerUrl}
                className="flex-1 text-center rounded-full border border-rampage-purple text-rampage-purple text-xs font-semibold px-3 py-2 hover:bg-rampage-purple hover:text-white transition focus-ring"
              />
              <a
                href={playerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-full border border-black/10 text-rampage-charcoal text-xs font-semibold px-3 py-2 hover:bg-black/5 transition focus-ring"
              >
                Open Page
              </a>
            </div>
            <QrCodeBox dataUrl={qrDataUrl} fileName={player.slug} compact />
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-card p-5">
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
            <Link
              href={`/admin/donations?player=${player.id}`}
              className="inline-block mt-3 text-xs text-rampage-purple hover:underline focus-ring rounded"
            >
              View in Donations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

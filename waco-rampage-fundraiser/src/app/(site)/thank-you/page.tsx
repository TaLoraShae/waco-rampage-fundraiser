"use client";

import Link from "next/link";
import { Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { formatCents } from "@/lib/fees";
import ShareButton from "@/components/ShareButton";
import { getPlayerUrl } from "@/lib/qrcode";
import { brand } from "@/lib/config";

function ThankYouContent() {
  const { db, ready } = useDataStore();
  const searchParams = useSearchParams();
  const donationId = searchParams.get("donationId");

  if (ready && !donationId) notFound();
  if (!donationId) return null;

  const donation = sel.getDonations(db).find((d) => d.id === donationId);
  if (ready && !donation) notFound();
  if (!donation) return null;

  const player = sel.getPlayerById(db, donation.playerId);
  if (ready && !player) notFound();
  if (!player) return null;

  const receiptNumber = `MOCK-${donation.id.slice(0, 8).toUpperCase()}`;
  const playerUrl = getPlayerUrl(player.slug);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="bg-rampage-charcoal metal-border rounded-2xl p-8">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-rampage-purple/20 text-rampage-purple-light flex items-center justify-center text-2xl border border-rampage-purple-light/40">
          ✓
        </div>
        <h1 className="font-display text-3xl text-white mb-2">THANK YOU!</h1>
        <p className="text-rampage-gray mb-6">
          Your simulated donation to <span className="font-semibold text-white">{player.displayName}</span> was
          completed.
        </p>

        <div className="rounded-xl bg-black/40 border border-white/10 p-4 text-left text-sm space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-rampage-gray">Donation amount</span>
            <span className="font-semibold text-white">{formatCents(donation.grossCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">Mock receipt number</span>
            <span className="font-mono text-white">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">Player supported</span>
            <span className="font-semibold text-white">{player.displayName}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/15 text-white/70 text-xs p-3 mb-6 text-left">
          Prototype notice: this receipt is simulated for testing purposes only. It is not proof of a real payment
          and will not be valid once Stripe is activated for live donations.
        </div>

        <div className="flex flex-col gap-3">
          <ShareButton
            url={playerUrl}
            title={`I just supported ${player.displayName}!`}
            text={`I just donated to ${player.displayName} with ${brand.teamName} — join me!`}
          />
          <Link
            href={`/support/${player.slug}`}
            className="inline-flex items-center justify-center rounded border border-rampage-purple-light text-rampage-purple-light font-semibold py-3 hover:bg-rampage-purple hover:text-white hover:border-transparent transition focus-ring"
          >
            Return to Player Page
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded text-rampage-gray font-semibold py-2 hover:text-white transition focus-ring">
            Return to Team Page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}

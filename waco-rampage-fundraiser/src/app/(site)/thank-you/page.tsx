import Link from "next/link";
import { notFound } from "next/navigation";
import * as db from "@/lib/db";
import { formatCents } from "@/lib/fees";
import ShareButton from "@/components/ShareButton";
import { getPlayerUrl } from "@/lib/qrcode";
import { brand } from "@/lib/config";

export default function ThankYouPage({ searchParams }: { searchParams: { donationId?: string } }) {
  const donationId = searchParams.donationId;
  if (!donationId) notFound();

  const donation = db.getDonations().find((d) => d.id === donationId);
  if (!donation) notFound();

  const player = db.getPlayerById(donation.playerId);
  if (!player) notFound();

  const receiptNumber = `MOCK-${donation.id.slice(0, 8).toUpperCase()}`;
  const playerUrl = getPlayerUrl(player.slug);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="bg-white rounded-2xl border border-black/5 shadow-card p-8">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h1 className="font-display text-3xl text-rampage-purple-dark mb-2">Thank You!</h1>
        <p className="text-rampage-gray mb-6">
          Your simulated donation to <span className="font-semibold text-rampage-charcoal">{player.displayName}</span>{" "}
          was completed.
        </p>

        <div className="rounded-xl bg-rampage-gray-light p-4 text-left text-sm space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-rampage-gray">Donation amount</span>
            <span className="font-semibold text-rampage-charcoal">{formatCents(donation.grossCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">Mock receipt number</span>
            <span className="font-mono text-rampage-charcoal">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">Player supported</span>
            <span className="font-semibold text-rampage-charcoal">{player.displayName}</span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 mb-6 text-left">
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
            className="inline-flex items-center justify-center rounded-full border border-rampage-purple text-rampage-purple font-semibold py-3 hover:bg-rampage-purple hover:text-white transition focus-ring"
          >
            Return to Player Page
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full text-rampage-gray font-semibold py-2 hover:text-rampage-charcoal transition focus-ring"
          >
            Return to Team Page
          </Link>
        </div>
      </div>
    </div>
  );
}

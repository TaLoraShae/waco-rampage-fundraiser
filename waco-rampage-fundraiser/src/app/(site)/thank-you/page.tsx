import Link from "next/link";
import { notFound } from "next/navigation";
import * as data from "@/lib/data";
import { formatCents } from "@/lib/fees";
import ShareButton from "@/components/ShareButton";
import StripeThankYouStatus from "@/components/StripeThankYouStatus";
import { getPlayerUrl } from "@/lib/qrcode";

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { donationId?: string; session_id?: string };
}) {
  const donationId = searchParams.donationId;
  const sessionId = searchParams.session_id;

  if (!donationId && !sessionId) notFound();

  const donation = donationId
    ? await data.getDonationById(donationId)
    : await data.getDonationByCheckoutSessionId(sessionId!);

  // Real Stripe payment: webhook may not have landed yet. Show a
  // polling state instead of a 404 — this is expected, not an error.
  if (!donation && sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
        <div className="bg-rampage-charcoal metal-border rounded-2xl p-8">
          <h1 className="font-display text-3xl text-white mb-2">THANK YOU!</h1>
          <StripeThankYouStatus sessionId={sessionId} />
        </div>
      </div>
    );
  }

  if (!donation) notFound();

  const player = await data.getPlayerById(donation.player_id);
  if (!player) notFound();
  const settings = await data.getSiteSettings(player.fundraiser_id);
  const teamName = settings?.team_name || "Team Fundraiser";
  const isMock = donation.source === "mock";

  const receiptNumber = isMock ? `MOCK-${donation.id.slice(0, 8).toUpperCase()}` : donation.id.slice(0, 8).toUpperCase();
  const playerUrl = getPlayerUrl(player.slug);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="bg-rampage-charcoal metal-border rounded-2xl p-8">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-rampage-purple/20 text-rampage-purple-light flex items-center justify-center text-2xl border border-rampage-purple-light/40">
          ✓
        </div>
        <h1 className="font-display text-3xl text-white mb-2">THANK YOU!</h1>
        <p className="text-rampage-gray mb-6">
          Your {isMock ? "simulated " : ""}donation to <span className="font-semibold text-white">{player.display_name}</span> was
          completed.
        </p>

        <div className="rounded-xl bg-black/40 border border-white/10 p-4 text-left text-sm space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-rampage-gray">Donation amount</span>
            <span className="font-semibold text-white">{formatCents(donation.gross_cents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">{isMock ? "Mock receipt number" : "Receipt reference"}</span>
            <span className="font-mono text-white">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-rampage-gray">Player supported</span>
            <span className="font-semibold text-white">{player.display_name}</span>
          </div>
        </div>

        {isMock ? (
          <div className="rounded-xl bg-white/5 border border-white/15 text-white/70 text-xs p-3 mb-6 text-left">
            Prototype notice: this receipt is simulated for testing purposes only. It is not proof of a real payment
            and will not be valid once Stripe is activated for live donations.
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 border border-white/15 text-white/70 text-xs p-3 mb-6 text-left">
            A payment receipt has been emailed to you by Stripe.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <ShareButton
            url={playerUrl}
            title={`I just supported ${player.display_name}!`}
            text={`I just donated to ${player.display_name} with ${teamName} — join me!`}
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

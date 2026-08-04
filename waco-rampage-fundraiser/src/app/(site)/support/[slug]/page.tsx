import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as db from "@/lib/db";
import { formatCents } from "@/lib/fees";
import { generateQrDataUrl, getPlayerUrl } from "@/lib/qrcode";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import DonateForm from "@/components/DonateForm";
import CopyLinkButton from "@/components/CopyLinkButton";
import ShareButton from "@/components/ShareButton";
import QrCodeBox from "@/components/QrCodeBox";
import { brand } from "@/lib/config";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { canceled?: string; error?: string };
}) {
  const player = db.getPlayerBySlug(params.slug);
  if (!player) notFound();

  if (!player.active) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-3">Fundraiser Unavailable</h1>
        <p className="text-rampage-gray mb-6">
          This player&apos;s fundraising page is not currently active. Please check back later or visit the team
          page to support the Waco Rampage 14U.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-semibold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring"
        >
          Back to Team Page
        </Link>
      </div>
    );
  }

  const settings = db.getSettings();
  const raisedCents = db.getPlayerRaisedCents(player.id);
  const teamRaisedCents = db.getTeamRaisedCents();
  const pct = progressPercent(raisedCents, player.goalCents);
  const playerUrl = getPlayerUrl(player.slug);
  const qrDataUrl = await generateQrDataUrl(playerUrl);

  const recentDonations = settings.recentSupportersVisible
    ? db.getDonationsForPlayer(player.id).filter((d) => d.status === "succeeded").slice(0, 8)
    : [];

  return (
    <div>
      <section className="bg-gradient-to-b from-rampage-purple-deep to-rampage-purple-dark">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-4 ring-white/10 mx-auto max-w-[280px]">
            <Image
              src={player.imageUrl}
              alt={`Placeholder photo of ${player.displayName}`}
              fill
              sizes="280px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-rampage-gold text-xs font-semibold uppercase tracking-widest mb-2">
              {brand.teamName}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-3">{player.displayName}</h1>
            <p className="text-white/80 leading-relaxed mb-6 max-w-xl">{player.message}</p>
            <div className="flex flex-wrap gap-3">
              <CopyLinkButton
                url={playerUrl}
                className="inline-flex items-center justify-center rounded-full border border-white/40 text-white text-sm font-semibold px-4 py-2 hover:bg-white/10 transition focus-ring"
              />
              <ShareButton url={playerUrl} title={`Support ${player.displayName}`} text={`Support ${player.displayName} with ${brand.teamName}!`} />
              <QrCodeBox dataUrl={qrDataUrl} fileName={player.slug} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-black/5 shadow-card p-6">
            <div className="flex justify-between items-baseline mb-2">
              <p className="font-display text-2xl text-rampage-purple-dark">{formatCents(raisedCents)} raised</p>
              <p className="text-rampage-gray text-sm">Goal: {formatCents(player.goalCents)}</p>
            </div>
            <ProgressBar raisedCents={raisedCents} goalCents={player.goalCents} size="lg" />
            <p className="text-sm text-rampage-gray mt-2">{pct}% of the way there</p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-card p-6">
            <h2 className="font-display text-xl text-rampage-purple-dark mb-4">What Your Donation Supports</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {brand.fundUsage.slice(0, 4).map((item) => (
                <div key={item.label}>
                  <p className="font-semibold text-rampage-charcoal text-sm">{item.label}</p>
                  <p className="text-xs text-rampage-gray">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {settings.recentSupportersVisible && (
            <div className="bg-white rounded-2xl border border-black/5 shadow-card p-6">
              <h2 className="font-display text-xl text-rampage-purple-dark mb-4">Recent Supporters</h2>
              {recentDonations.length === 0 ? (
                <p className="text-sm text-rampage-gray">
                  Be the first to support {player.displayName} this season!
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentDonations.map((d) => (
                    <li key={d.id} className="border-b border-black/5 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-rampage-charcoal">
                          {d.anonymous ? "Anonymous Supporter" : d.donorName || "Anonymous Supporter"}
                        </span>
                        <span className="text-rampage-purple font-bold">{formatCents(d.grossCents)}</span>
                      </div>
                      {settings.donorMessagesVisible && d.donorMessage && (
                        <p className="text-sm text-rampage-gray mt-1">&ldquo;{d.donorMessage}&rdquo;</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="bg-rampage-charcoal rounded-2xl p-6 text-center">
            <p className="text-white/70 text-sm mb-1">Team total raised so far</p>
            <p className="font-display text-2xl text-white">
              {formatCents(teamRaisedCents)}{" "}
              <span className="text-white/50 text-base">of {formatCents(settings.teamGoalCents)}</span>
            </p>
            <Link href="/#players" className="inline-block mt-3 text-sm text-rampage-gold hover:underline focus-ring rounded">
              ← Back to the team page
            </Link>
          </div>
        </div>

        <div>
          <div className="sticky top-24 bg-white rounded-2xl border border-black/5 shadow-card p-6">
            <h2 className="font-display text-xl text-rampage-purple-dark mb-1">Donate Now</h2>
            <p className="text-xs text-rampage-gray mb-5">
              This is a prototype — donations here are simulated and no real money is collected.
            </p>
            {searchParams.canceled && (
              <p className="mb-4 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-800 p-3">
                Your donation was canceled. No charge was made — feel free to try again below.
              </p>
            )}
            {searchParams.error === "amount" && (
              <p className="mb-4 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
                Please choose a valid donation amount and try again.
              </p>
            )}
            <DonateForm
              slug={player.slug}
              suggestedAmountsCents={
                settings.suggestedAmountsCents.length ? settings.suggestedAmountsCents : [2500, 5000, 10000]
              }
              minDonationCents={settings.minDonationCents}
              maxDonationCents={settings.maxDonationCents}
              anonymousAllowed={settings.anonymousAllowed}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

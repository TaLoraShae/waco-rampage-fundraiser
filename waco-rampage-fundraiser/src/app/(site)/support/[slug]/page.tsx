import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as data from "@/lib/data";
import { formatCents } from "@/lib/fees";
import { getPlayerUrl } from "@/lib/qrcode";
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
  const player = await data.getPlayerBySlug(params.slug);
  if (!player) notFound();

  if (!player.active) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-white mb-3">FUNDRAISER UNAVAILABLE</h1>
        <p className="text-rampage-gray mb-6">
          This player&apos;s fundraising page is not currently active. Please check back later or visit the team
          page to support the Waco Rampage 14U.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded bg-rampage-purple text-white font-bold uppercase tracking-wide px-6 py-3 hover:bg-rampage-purple-light transition focus-ring"
        >
          Back to Team Page
        </Link>
      </div>
    );
  }

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) notFound();

  const [donations, teamDonations] = await Promise.all([
    data.getDonationsForPlayer(player.id),
    data.getDonationsForFundraiser(fundraiser.id),
  ]);

  const raisedCents = data.getPlayerRaisedCents(donations, player.id);
  const teamRaisedCents = data.getTeamRaisedCents(teamDonations);
  const pct = progressPercent(raisedCents, player.goal_cents);
  const playerUrl = getPlayerUrl(player.slug);

  const recentDonations = fundraiser.recent_supporters_visible
    ? donations.filter((d) => d.status === "succeeded").slice(0, 8)
    : [];

  return (
    <div>
      <section className="bg-gradient-to-b from-rampage-purple-deep to-rampage-black texture-grain border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden metal-border mx-auto max-w-[280px]">
            <Image src={player.image_url} alt={`Placeholder photo of ${player.display_name}`} fill sizes="280px" className="object-cover" unoptimized />
          </div>
          <div>
            <p className="text-rampage-purple-light text-xs font-bold uppercase tracking-widest mb-2">{brand.teamName}</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white mb-3">{player.display_name}</h1>
            <p className="text-white/80 leading-relaxed mb-6 max-w-xl">{player.message}</p>
            <div className="flex flex-wrap gap-3">
              <CopyLinkButton url={playerUrl} className="inline-flex items-center justify-center rounded border border-white/40 text-white text-sm font-semibold px-4 py-2 hover:bg-white/10 transition focus-ring" />
              <ShareButton url={playerUrl} title={`Support ${player.display_name}`} text={`Support ${player.display_name} with ${brand.teamName}!`} />
              <QrCodeBox url={playerUrl} fileName={player.slug} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="bg-rampage-charcoal metal-border rounded-2xl p-6">
            <div className="flex justify-between items-baseline mb-2">
              <p className="font-display text-2xl text-white">{formatCents(raisedCents)} raised</p>
              <p className="text-rampage-gray text-sm">Goal: {formatCents(player.goal_cents)}</p>
            </div>
            <ProgressBar raisedCents={raisedCents} goalCents={player.goal_cents} size="lg" />
            <p className="text-sm text-rampage-gray mt-2">{pct}% of the way there</p>
          </div>

          <div className="bg-rampage-charcoal metal-border rounded-2xl p-6">
            <h2 className="font-display text-xl text-white mb-4">WHAT YOUR DONATION SUPPORTS</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {brand.fundUsage.slice(0, 4).map((item) => (
                <div key={item.label}>
                  <p className="font-semibold text-white text-sm">{item.label}</p>
                  <p className="text-xs text-rampage-gray">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {fundraiser.recent_supporters_visible && (
            <div className="bg-rampage-charcoal metal-border rounded-2xl p-6">
              <h2 className="font-display text-xl text-white mb-4">RECENT SUPPORTERS</h2>
              {recentDonations.length === 0 ? (
                <p className="text-sm text-rampage-gray">Be the first to support {player.display_name} this season!</p>
              ) : (
                <ul className="space-y-4">
                  {recentDonations.map((d) => (
                    <li key={d.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-white">{d.anonymous ? "Anonymous Supporter" : d.donor_name || "Anonymous Supporter"}</span>
                        <span className="text-rampage-purple-light font-bold">{formatCents(d.gross_cents)}</span>
                      </div>
                      {fundraiser.donor_messages_visible && d.donor_message && (
                        <p className="text-sm text-rampage-gray mt-1">&ldquo;{d.donor_message}&rdquo;</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="bg-black metal-border rounded-2xl p-6 text-center">
            <p className="text-rampage-gray text-sm mb-1">Team total raised so far</p>
            <p className="font-display text-2xl text-white">
              {formatCents(teamRaisedCents)} <span className="text-rampage-gray text-base">of {formatCents(fundraiser.team_goal_cents)}</span>
            </p>
            <Link href="/#players" className="inline-block mt-3 text-sm text-rampage-purple-light hover:underline focus-ring rounded">
              ← Back to the team page
            </Link>
          </div>
        </div>

        <div>
          <div className="sticky top-24 bg-rampage-charcoal metal-border rounded-2xl p-6">
            <h2 className="font-display text-xl text-white mb-1">DONATE NOW</h2>
            <p className="text-xs text-rampage-gray mb-5">
              This is a prototype — donations here are simulated and no real money is collected.
            </p>
            {searchParams.canceled && (
              <p className="mb-4 text-sm rounded-lg bg-white/5 border border-white/20 text-white/80 p-3">
                Your donation was canceled. No charge was made — feel free to try again below.
              </p>
            )}
            {searchParams.error === "amount" && (
              <p className="mb-4 text-sm rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 p-3">
                Please choose a valid donation amount and try again.
              </p>
            )}
            <DonateForm
              slug={player.slug}
              suggestedAmountsCents={fundraiser.suggested_amounts_cents.length ? fundraiser.suggested_amounts_cents : [2500, 5000, 10000]}
              minDonationCents={fundraiser.min_donation_cents}
              maxDonationCents={fundraiser.max_donation_cents}
              anonymousAllowed={fundraiser.anonymous_allowed}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

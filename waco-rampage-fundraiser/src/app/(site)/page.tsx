import Image from "next/image";
import Link from "next/link";
import * as db from "@/lib/db";
import { brand } from "@/lib/config";
import { formatCents } from "@/lib/fees";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerDirectory, { DirectoryEntry } from "@/components/PlayerDirectory";
import Leaderboard from "@/components/Leaderboard";
import { generateQrDataUrl, getPlayerUrl } from "@/lib/qrcode";

export default async function HomePage() {
  const settings = db.getSettings();
  const players = db.getDirectoryPlayers();
  const teamRaisedCents = db.getTeamRaisedCents();
  const leaderboard = db.getLeaderboard(3);
  const sponsors = db.getSponsors();
  const generalFund = db.getGeneralFundPlayer();

  const entries: DirectoryEntry[] = await Promise.all(
    players.map(async (player) => {
      const raisedCents = db.getPlayerRaisedCents(player.id);
      const playerUrl = getPlayerUrl(player.slug);
      const qrDataUrl = await generateQrDataUrl(playerUrl);
      return { player, raisedCents, playerUrl, qrDataUrl };
    })
  );

  const teamPct = progressPercent(teamRaisedCents, settings.teamGoalCents);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rampage-purple-deep via-rampage-purple-dark to-rampage-purple">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="relative h-20 w-20 mb-6 rounded-full bg-white/10 ring-1 ring-white/20 overflow-hidden">
              <Image src={brand.logoUrl} alt={`${brand.teamName} logo`} fill sizes="80px" className="object-contain p-2" />
            </div>
            <p className="text-rampage-gold font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3">
              {settings.fundraiserTitle}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
              {brand.fundraiserHeadline}
            </h1>
            <p className="text-white/80 max-w-md mb-8 leading-relaxed">{settings.fundraiserDescription}</p>

            <div className="flex flex-wrap gap-3 mb-10">
              {generalFund && (
                <Link
                  href={`/support/${generalFund.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-rampage-gold text-rampage-purple-dark font-bold px-7 py-3.5 hover:brightness-95 transition focus-ring text-sm sm:text-base"
                >
                  Donate to the Team Fund
                </Link>
              )}
              <a
                href="#players"
                className="inline-flex items-center justify-center rounded-full border border-white/40 text-white font-semibold px-7 py-3.5 hover:bg-white/10 transition focus-ring text-sm sm:text-base"
              >
                Support a Player
              </a>
            </div>

            <CountdownTimer endDate={settings.endDate} />
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/15 rounded-3xl p-6 sm:p-8">
            <div className="stitch-seam mb-6" aria-hidden />
            <p className="text-white/70 text-sm uppercase tracking-wide font-semibold mb-1">Team goal progress</p>
            <p className="font-display text-white text-3xl sm:text-4xl mb-4">
              {formatCents(teamRaisedCents)} <span className="text-white/50 text-xl">of {formatCents(settings.teamGoalCents)}</span>
            </p>
            <ProgressBar raisedCents={teamRaisedCents} goalCents={settings.teamGoalCents} size="lg" />
            <div className="flex justify-between text-white/70 text-sm mt-2">
              <span>{teamPct}% funded</span>
              <span>{players.length} players fundraising</span>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      {settings.leaderboardVisible && <Leaderboard entries={leaderboard} />}

      {/* PLAYER DIRECTORY */}
      <section id="players" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-rampage-purple font-semibold uppercase tracking-widest text-xs mb-2">Meet the Team</p>
          <h2 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark">Player Directory</h2>
          <p className="text-rampage-gray mt-2 max-w-xl mx-auto">
            Find your player, share their link, and help them reach their goal.
          </p>
        </div>
        <PlayerDirectory entries={entries} />
      </section>

      {/* FUND USAGE */}
      <section className="bg-rampage-charcoal">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-gold font-semibold uppercase tracking-widest text-xs mb-2">Where it goes</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">How Funds Will Be Used</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.fundUsage.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="font-display text-rampage-gold text-lg mb-2">{item.label}</p>
                <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      {sponsors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple font-semibold uppercase tracking-widest text-xs mb-2">
              With gratitude
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark">Our Sponsors</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {sponsors.map((s) => (
              <a
                key={s.id}
                href={s.website || "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-white border border-black/5 shadow-card p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition focus-ring"
              >
                <div className="relative h-16 w-16">
                  <Image src={s.logoUrl} alt={`${s.name} logo`} fill sizes="64px" className="object-contain" unoptimized />
                </div>
                <p className="font-semibold text-rampage-charcoal">{s.name}</p>
                <span className="text-xs uppercase tracking-wide text-rampage-gold font-bold">{s.level} Sponsor</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      <section className="bg-rampage-gray-light">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple font-semibold uppercase tracking-widest text-xs mb-2">Team photos</p>
            <h2 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark">Gallery</h2>
            <p className="text-rampage-gray mt-2 text-sm max-w-lg mx-auto">
              Placeholder photos shown below — replace them in <code>src/lib/config.ts</code> once real team photos
              (with parent/guardian consent) are ready.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {brand.galleryImages.map((_, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl bg-rampage-purple/10 border border-rampage-purple/20 flex items-center justify-center text-rampage-purple/50 font-display text-sm"
              >
                Team Photo Placeholder
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-rampage-purple font-semibold uppercase tracking-widest text-xs mb-2">Questions</p>
          <h2 className="font-display text-3xl sm:text-4xl text-rampage-purple-dark">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {brand.faq.map((item) => (
            <details key={item.q} className="group rounded-xl bg-white border border-black/5 shadow-card p-5">
              <summary className="cursor-pointer font-semibold text-rampage-charcoal focus-ring rounded list-none flex justify-between items-center">
                {item.q}
                <span className="text-rampage-purple group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-rampage-gray text-sm mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* PRIVACY STATEMENT */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-white border border-black/5 shadow-card p-6 text-sm text-rampage-gray leading-relaxed">
          <p className="font-semibold text-rampage-charcoal mb-2">A note on player privacy</p>
          <p>{brand.privacyStatement}</p>
        </div>
      </section>
    </div>
  );
}

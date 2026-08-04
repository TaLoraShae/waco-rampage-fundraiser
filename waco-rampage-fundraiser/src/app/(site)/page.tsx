"use client";

import Image from "next/image";
import Link from "next/link";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { brand } from "@/lib/config";
import { formatCents } from "@/lib/fees";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerDirectory, { DirectoryEntry } from "@/components/PlayerDirectory";
import Leaderboard from "@/components/Leaderboard";
import { LightningBolt, LightningField } from "@/components/Lightning";
import { getPlayerUrl } from "@/lib/qrcode";

const TEAM_VALUES = [
  { label: "COMPETE", body: "We play hard and represent Waco.", icon: "plate" },
  { label: "DEVELOP", body: "We train, learn, and get better every day.", icon: "ball" },
  { label: "FAMILY", body: "We're more than a team. We're a family.", icon: "people" },
  { label: "TOGETHER", body: "We bring the energy. We bring the fight. We are Rampage.", icon: "bolt" },
];

function ValueIcon({ icon }: { icon: string }) {
  const cls = "h-6 w-6 text-white";
  if (icon === "plate") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M4 3h16v9l-8 9-8-9V3z" />
      </svg>
    );
  }
  if (icon === "ball") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M5 8c3 2 3 6 0 8M19 8c-3 2-3 6 0 8" />
      </svg>
    );
  }
  if (icon === "people") {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6H2zM10 20c0-2.1.7-4 1.9-5.4A6 6 0 0 1 22 20h-12z" />
      </svg>
    );
  }
  return <LightningBolt className={cls} />;
}

export default function HomePage() {
  const { db } = useDataStore();
  const s = db.settings;
  const players = sel.getDirectoryPlayers(db);
  const teamRaisedCents = sel.getTeamRaisedCents(db);
  const leaderboard = sel.getLeaderboard(db, 3);
  const sponsors = sel.getSponsors(db);
  const generalFund = sel.getGeneralFundPlayer(db);

  const entries: DirectoryEntry[] = players.map((player) => ({
    player,
    raisedCents: sel.getPlayerRaisedCents(db, player.id),
    playerUrl: getPlayerUrl(player.slug),
  }));

  const teamPct = progressPercent(teamRaisedCents, s.teamGoalCents);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black texture-grain border-b border-white/10">
        <LightningField />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="relative h-24 w-44 sm:h-28 sm:w-52 mb-6 -ml-1">
              <Image src={brand.logoUrl} alt={`${brand.teamName} logo`} fill sizes="220px" className="object-contain object-left" priority />
            </div>
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs sm:text-sm mb-3">
              {s.fundraiserTitle}
            </p>
            <h1 className="leading-[0.95] mb-5">
              <span className="block font-display text-4xl sm:text-5xl lg:text-6xl text-white">HELP FUEL THE</span>
              <span className="block font-brush text-5xl sm:text-6xl lg:text-7xl text-rampage-purple-light drop-shadow-[0_0_18px_rgba(138,79,196,0.5)]">
                Waco Rampage
              </span>
            </h1>
            <p className="text-white/75 max-w-md mb-8 leading-relaxed">{s.fundraiserDescription}</p>

            <div className="flex flex-wrap gap-3 mb-10">
              {generalFund && (
                <Link
                  href={`/support/${generalFund.slug}`}
                  className="inline-flex items-center gap-2 justify-center rounded bg-rampage-purple text-white font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-rampage-purple-light transition focus-ring text-sm sm:text-base shadow-glow"
                >
                  <LightningBolt className="h-4 w-4" />
                  Donate to the Team Fund
                </Link>
              )}
              <a
                href="#players"
                className="inline-flex items-center justify-center rounded border-2 border-white/40 text-white font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-white/10 transition focus-ring text-sm sm:text-base"
              >
                Support a Player
              </a>
            </div>

            <CountdownTimer endDate={s.endDate} />
            <p className="mt-4 text-white/60 text-sm italic">
              Tournament season starts soon. <span className="text-rampage-purple-light not-italic font-semibold">Let&rsquo;s finish strong.</span>
            </p>
          </div>

          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-none aspect-[3/4] rounded-2xl overflow-hidden metal-border">
              <Image
                src="/images/hero-team-photo.jpg"
                alt="Waco Rampage 14U players huddled together on the field"
                fill
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-rampage-purple-deep/30 via-transparent to-transparent" />
            </div>

            <div className="mt-6 lg:mt-0 lg:absolute lg:-bottom-6 lg:-left-10 lg:w-[340px] bg-rampage-black/95 metal-border rounded-2xl p-6 shadow-card">
              <p className="text-rampage-purple-light text-xs font-bold uppercase tracking-widest mb-1">
                Team Goal Progress
              </p>
              <p className="font-display text-white text-3xl mb-3">
                {formatCents(teamRaisedCents)}{" "}
                <span className="text-rampage-gray text-lg">of {formatCents(s.teamGoalCents)}</span>
              </p>
              <ProgressBar raisedCents={teamRaisedCents} goalCents={s.teamGoalCents} size="lg" />
              <div className="flex justify-between text-rampage-gray text-xs mt-2 mb-4">
                <span>{teamPct}% funded</span>
                <span>{players.length} players fundraising</span>
              </div>
              <div className="flex items-start gap-3 border-t border-white/10 pt-4">
                <div className="h-9 w-9 shrink-0 rounded-full bg-rampage-purple/30 flex items-center justify-center">
                  <ValueIcon icon="people" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-wide">Together We Rampage</p>
                  <p className="text-rampage-gray text-xs mt-0.5">
                    Your support helps these young athletes compete, grow, and represent Waco with pride.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM VALUES STRIP */}
        <div className="relative z-[1] border-t border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 items-start">
            {TEAM_VALUES.map((v) => (
              <div key={v.label} className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded bg-rampage-purple/25 flex items-center justify-center">
                  <ValueIcon icon={v.icon} />
                </div>
                <div>
                  <p className="font-display text-white text-sm tracking-wide">{v.label}</p>
                  <p className="text-rampage-gray text-xs leading-snug mt-0.5">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      {s.leaderboardVisible && <Leaderboard entries={leaderboard} />}

      {/* PLAYER DIRECTORY */}
      <section id="players" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">Meet the Team</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">PLAYER DIRECTORY</h2>
          <p className="text-rampage-gray mt-2 max-w-xl mx-auto">
            Find your player, share their link, and help them reach their goal.
          </p>
        </div>
        <PlayerDirectory entries={entries} />
      </section>

      {/* FUND USAGE */}
      <section className="bg-rampage-charcoal texture-grain border-y border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">Where it goes</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">HOW FUNDS WILL BE USED</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.fundUsage.map((item) => (
              <div key={item.label} className="rounded-2xl bg-black/50 metal-border p-6">
                <p className="font-display text-rampage-purple-light text-lg mb-2 tracking-wide">{item.label}</p>
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
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">With gratitude</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">OUR SPONSORS</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {sponsors.map((sp) => (
              <a
                key={sp.id}
                href={sp.website || "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-rampage-charcoal metal-border p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition focus-ring"
              >
                <div className="relative h-16 w-16">
                  <Image src={sp.logoUrl} alt={`${sp.name} logo`} fill sizes="64px" className="object-contain" unoptimized />
                </div>
                <p className="font-semibold text-white">{sp.name}</p>
                <span className="text-xs uppercase tracking-wide text-rampage-purple-light font-bold">{sp.level} Sponsor</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      <section className="bg-rampage-charcoal texture-grain border-y border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">Team photos</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">GALLERY</h2>
            <p className="text-rampage-gray mt-2 text-sm max-w-lg mx-auto">
              Placeholder photos shown below — replace them in <code>src/lib/config.ts</code> once more real team
              photos (with parent/guardian consent) are ready.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {brand.galleryImages.map((_, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl bg-black/50 metal-border flex items-center justify-center text-rampage-gray font-display text-sm"
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
          <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">Questions</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">FREQUENTLY ASKED QUESTIONS</h2>
        </div>
        <div className="space-y-3">
          {brand.faq.map((item) => (
            <details key={item.q} className="group rounded-xl bg-rampage-charcoal metal-border p-5">
              <summary className="cursor-pointer font-semibold text-white focus-ring rounded list-none flex justify-between items-center">
                {item.q}
                <span className="text-rampage-purple-light group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-rampage-gray text-sm mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* PRIVACY STATEMENT */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-rampage-charcoal metal-border p-6 text-sm text-rampage-gray leading-relaxed">
          <p className="font-semibold text-white mb-2">A note on player privacy</p>
          <p>{brand.privacyStatement}</p>
        </div>
      </section>
    </div>
  );
}

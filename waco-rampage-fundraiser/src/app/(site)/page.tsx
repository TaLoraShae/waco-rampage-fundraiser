import Image from "next/image";
import Link from "next/link";
import * as data from "@/lib/data";
import { formatCents } from "@/lib/fees";
import ProgressBar, { progressPercent } from "@/components/ProgressBar";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerDirectory, { DirectoryEntry } from "@/components/PlayerDirectory";
import Leaderboard from "@/components/Leaderboard";
import { LightningBolt, LightningField } from "@/components/Lightning";
import { getPlayerUrl } from "@/lib/qrcode";

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

const VALUE_ICONS = ["plate", "ball", "people", "bolt"];

export default async function HomePage() {
  const fundraiser = await data.getFundraiser();
  if (!fundraiser) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center text-white">
        <h1 className="font-display text-2xl mb-3">Fundraiser not configured yet</h1>
        <p className="text-rampage-gray">
          No active fundraiser was found in Supabase. Run <code>docs/SUPABASE_SETUP.sql</code> in your Supabase
          project's SQL Editor to create the sample fundraiser, or check your environment variables.
        </p>
      </div>
    );
  }

  const [settings, players, sponsors, donations, contentItems] = await Promise.all([
    data.getSiteSettings(fundraiser.id),
    data.getPlayers(fundraiser.id),
    data.getSponsors(fundraiser.id),
    data.getDonationsForFundraiser(fundraiser.id),
    data.getSiteContent(fundraiser.id),
  ]);
  const content = data.contentMap(contentItems);
  // c() reads a site_content value, falling back to sensible default UI
  // copy if the row is blank/missing — structural text always renders
  // something; it only ever comes from Supabase or this fallback, never
  // a separate hard-coded source elsewhere in the component.
  const c = (key: string, fallback: string) => content[key] || fallback;

  const directoryPlayers = data.getDirectoryPlayers(players);
  const generalFund = data.getGeneralFundPlayer(players);
  const teamRaisedCents = data.getTeamRaisedCents(donations);
  const leaderboard = data.getLeaderboard(donations, players, 3);

  const entries: DirectoryEntry[] = directoryPlayers.map((player) => ({
    player,
    raisedCents: data.getPlayerRaisedCents(donations, player.id),
    playerUrl: getPlayerUrl(player.slug),
  }));

  const teamPct = progressPercent(teamRaisedCents, fundraiser.team_goal_cents);
  const teamName = settings?.team_name || "Team Fundraiser";
  const logoUrl = settings?.logo_url;
  const heroPhotoUrl = settings?.hero_photo_url;

  const fundUsageItems = [1, 2, 3, 4, 5, 6]
    .map((i) => ({
      label: content[`fund_usage.item${i}_label`] || "",
      description: content[`fund_usage.item${i}_description`] || "",
    }))
    .filter((item) => item.label);

  const faqItems = [1, 2, 3, 4, 5]
    .map((i) => ({ q: content[`faq.q${i}`] || "", a: content[`faq.a${i}`] || "" }))
    .filter((item) => item.q);

  const teamValues = [1, 2, 3, 4]
    .map((i, idx) => ({
      label: content[`team_values.value${i}_label`] || "",
      body: content[`team_values.value${i}_body`] || "",
      icon: VALUE_ICONS[idx],
    }))
    .filter((v) => v.label);

  const privacyStatement = content["legal.privacy_statement"];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black texture-grain border-b border-white/10">
        <LightningField />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            {logoUrl && (
              <div className="relative h-24 w-44 sm:h-28 sm:w-52 mb-6 -ml-1">
                <Image src={logoUrl} alt={`${teamName} logo`} fill sizes="220px" className="object-contain object-left" priority unoptimized={logoUrl.startsWith("http")} />
              </div>
            )}
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs sm:text-sm mb-3">
              {fundraiser.title}
            </p>
            <h1 className="leading-[0.95] mb-5">
              <span className="block font-display text-4xl sm:text-5xl lg:text-6xl text-white">
                {c("hero.headline_line1", "HELP FUEL THE")}
              </span>
              <span className="block font-brush text-5xl sm:text-6xl lg:text-7xl text-rampage-purple-light drop-shadow-[0_0_18px_rgba(138,79,196,0.5)]">
                {c("hero.headline_line2", teamName)}
              </span>
            </h1>
            <p className="text-white/75 max-w-md mb-8 leading-relaxed">{fundraiser.description}</p>

            <div className="flex flex-wrap gap-3 mb-10">
              {generalFund && (
                <Link
                  href={`/support/${generalFund.slug}`}
                  className="inline-flex items-center gap-2 justify-center rounded bg-rampage-purple text-white font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-rampage-purple-light transition focus-ring text-sm sm:text-base shadow-glow"
                >
                  <LightningBolt className="h-4 w-4" />
                  {c("buttons.donate_team", "Donate to the Team Fund")}
                </Link>
              )}
              <a
                href="#players"
                className="inline-flex items-center justify-center rounded border-2 border-white/40 text-white font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-white/10 transition focus-ring text-sm sm:text-base"
              >
                {c("buttons.support_player", "Support a Player")}
              </a>
            </div>

            <CountdownTimer endDate={fundraiser.end_date} />
            {content["hero.season_note"] !== "" && (
              <p className="mt-4 text-white/60 text-sm italic">
                {c("hero.season_note", "Tournament season starts soon. Let's finish strong.")}
              </p>
            )}
          </div>

          <div className="relative">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-none aspect-[3/4] rounded-2xl overflow-hidden metal-border bg-black/40 flex items-center justify-center">
              {heroPhotoUrl ? (
                <Image
                  src={heroPhotoUrl}
                  alt={`${teamName} players on the field`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover"
                  priority
                  unoptimized={heroPhotoUrl.startsWith("http")}
                />
              ) : (
                <p className="text-rampage-gray font-display text-sm px-6 text-center">
                  Hero photo not set yet
                </p>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-rampage-purple-deep/30 via-transparent to-transparent" />
            </div>

            <div className="mt-6 lg:mt-0 lg:absolute lg:-bottom-6 lg:-left-10 lg:w-[340px] bg-rampage-black/95 metal-border rounded-2xl p-6 shadow-card">
              <p className="text-rampage-purple-light text-xs font-bold uppercase tracking-widest mb-1">
                {c("hero.team_progress_heading", "Team Goal Progress")}
              </p>
              <p className="font-display text-white text-3xl mb-3">
                {formatCents(teamRaisedCents)}{" "}
                <span className="text-rampage-gray text-lg">of {formatCents(fundraiser.team_goal_cents)}</span>
              </p>
              <ProgressBar raisedCents={teamRaisedCents} goalCents={fundraiser.team_goal_cents} size="lg" />
              <div className="flex justify-between text-rampage-gray text-xs mt-2 mb-4">
                <span>{teamPct}% funded</span>
                <span>{directoryPlayers.length} players fundraising</span>
              </div>
              <div className="flex items-start gap-3 border-t border-white/10 pt-4">
                <div className="h-9 w-9 shrink-0 rounded-full bg-rampage-purple/30 flex items-center justify-center">
                  <ValueIcon icon="people" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-wide">
                    {c("hero.support_message_heading", "Together We Rampage")}
                  </p>
                  <p className="text-rampage-gray text-xs mt-0.5">
                    {c(
                      "hero.together_body",
                      "Your support helps these young athletes compete, grow, and represent Waco with pride."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {teamValues.length > 0 && (
          <div className="relative z-[1] border-t border-white/10 bg-black/40">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 items-start">
              {teamValues.map((v) => (
                <div key={v.label} className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded bg-rampage-purple/25 flex items-center justify-center">
                    <ValueIcon icon={v.icon} />
                  </div>
                  <div>
                    <p className="font-display text-white text-sm tracking-wide">{v.label}</p>
                    {v.body && <p className="text-rampage-gray text-xs leading-snug mt-0.5">{v.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {fundraiser.leaderboard_visible && <Leaderboard entries={leaderboard} />}

      <section id="players" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
            {c("headings.players_eyebrow", "Meet the Team")}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">{c("headings.players_heading", "PLAYER DIRECTORY")}</h2>
          <p className="text-rampage-gray mt-2 max-w-xl mx-auto">
            Find your player, share their link, and help them reach their goal.
          </p>
        </div>
        <PlayerDirectory entries={entries} />
      </section>

      {fundUsageItems.length > 0 && (
        <section className="bg-rampage-charcoal texture-grain border-y border-white/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <div className="text-center mb-10">
              <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
                {c("headings.fund_usage_eyebrow", "Where it goes")}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-white">
                {c("headings.fund_usage_heading", "HOW FUNDS WILL BE USED")}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fundUsageItems.map((item) => (
                <div key={item.label} className="rounded-2xl bg-black/50 metal-border p-6">
                  <p className="font-display text-rampage-purple-light text-lg mb-2 tracking-wide">{item.label}</p>
                  {item.description && <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {sponsors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
              {c("headings.sponsors_eyebrow", "With gratitude")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">{c("headings.sponsors_heading", "OUR SPONSORS")}</h2>
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
                  <Image src={sp.logo_url || "/images/team-logo.png"} alt={`${sp.name} logo`} fill sizes="64px" className="object-contain" unoptimized />
                </div>
                <p className="font-semibold text-white">{sp.name}</p>
                <span className="text-xs uppercase tracking-wide text-rampage-purple-light font-bold">{sp.level} Sponsor</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="bg-rampage-charcoal texture-grain border-y border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
              {c("headings.gallery_eyebrow", "Team photos")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">{c("headings.gallery_heading", "GALLERY")}</h2>
          </div>
          {settings?.gallery_urls && settings.gallery_urls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {settings.gallery_urls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-black/50 metal-border overflow-hidden">
                  <Image src={url} alt={`${teamName} team photo`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-rampage-gray text-sm">No gallery photos uploaded yet.</p>
          )}
        </div>
      </section>

      {faqItems.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <p className="text-rampage-purple-light font-bold uppercase tracking-widest text-xs mb-2">
              {c("headings.faq_eyebrow", "Questions")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">
              {c("headings.faq_heading", "FREQUENTLY ASKED QUESTIONS")}
            </h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="group rounded-xl bg-rampage-charcoal metal-border p-5">
                <summary className="cursor-pointer font-semibold text-white focus-ring rounded list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-rampage-purple-light group-open:rotate-45 transition">+</span>
                </summary>
                {item.a && <p className="text-rampage-gray text-sm mt-3 leading-relaxed">{item.a}</p>}
              </details>
            ))}
          </div>
        </section>
      )}

      {privacyStatement && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
          <div className="rounded-2xl bg-rampage-charcoal metal-border p-6 text-sm text-rampage-gray leading-relaxed">
            <p className="font-semibold text-white mb-2">{c("headings.privacy_note_heading", "A note on player privacy")}</p>
            <p>{privacyStatement}</p>
          </div>
        </section>
      )}
    </div>
  );
}

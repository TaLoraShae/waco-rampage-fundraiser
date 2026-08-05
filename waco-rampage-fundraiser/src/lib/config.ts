// =====================================================================
// SITE CONTENT (non-branding)
// ---------------------------------------------------------------------
// Everything that's site-wide BRANDING — logo, footer logo, colors,
// contact info, social links, hero/team photos, favicon, copyright —
// now lives in Supabase (`site_settings`, editable from Admin →
// Settings by the Owner). See src/lib/data.ts.
//
// This file only holds long-form marketing COPY that isn't part of
// that request: fund-usage descriptions and FAQ answers. These are
// also editable from the database via the `site_content` table /
// Admin → Site Wording page for the hero headline and button labels;
// the longer blocks below remain simple defaults you can hand-edit.
// =====================================================================

export const brand = {
  fundUsage: [
    {
      label: "Tournament fees",
      description: "Entry fees for regional and national tournaments throughout the season.",
    },
    {
      label: "Travel expenses",
      description: "Team hotel blocks and transportation for away tournaments.",
    },
    {
      label: "Equipment",
      description: "Catcher's gear, bats, helmets, and practice equipment for the team.",
    },
    {
      label: "Uniforms",
      description: "Game and practice uniforms for every player on the roster.",
    },
    {
      label: "Training",
      description: "Batting cage rental, pitching instruction, and skills clinics.",
    },
    {
      label: "Team operating expenses",
      description: "Field rental, insurance, umpire fees, and day-to-day team costs.",
    },
  ],

  faq: [
    {
      q: "Where does my donation go?",
      a: "100% of net proceeds support the team's expenses: tournament fees, travel, equipment, uniforms, training, and operating costs.",
    },
    {
      q: "Can I choose which player I support?",
      a: "Yes. You can donate through any individual player's page, or give to the team fund directly from the homepage.",
    },
    {
      q: "Is my donation tax-deductible?",
      a: "This prototype does not make a tax-deductibility claim. Contact the booster club directly for current tax status.",
    },
    {
      q: "Can I stay anonymous?",
      a: "Yes. You can choose to donate anonymously and your name will not be shown publicly.",
    },
    {
      q: "Is this site collecting real payments right now?",
      a: "No. This site is currently in Prototype Mode. No real card information is collected and no real money is processed.",
    },
  ],

  privacyStatement:
    "To protect our youth players, this site only ever displays a player's first name and last initial. We never publish birthdates, addresses, phone numbers, school information, or schedules. Donor emails and private messages are never shown publicly. Team photos are only used with a parent or guardian's consent.",
};

export type Brand = typeof brand;

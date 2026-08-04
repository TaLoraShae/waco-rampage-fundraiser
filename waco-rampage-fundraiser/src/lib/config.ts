// =====================================================================
// BRANDING CONFIGURATION
// Edit everything in this file to re-brand the site: no other files
// should need to change for a logo swap, color change, or wording edit.
// =====================================================================

export const brand = {
  teamName: "Waco Rampage 14U",
  shortName: "Rampage 14U",
  fundraiserHeadline: "Help Fuel the Waco Rampage",
  tagline: "Every donation gets us closer to the next tournament.",

  // Swap these placeholder paths for real files in /public/images once uploaded.
  logoUrl: "/images/team-logo.png",
  heroImageUrl: "/images/hero-placeholder.jpg",
  galleryImages: [
    "/images/gallery-1.jpg",
    "/images/gallery-2.jpg",
    "/images/gallery-3.jpg",
    "/images/gallery-4.jpg",
    "/images/gallery-5.jpg",
    "/images/gallery-6.jpg",
  ],

  colors: {
    primaryPurple: "#5B2A86",
    purpleDark: "#3B1B5A",
    purpleDeep: "#2A1240",
    charcoal: "#1C1B1F",
    black: "#0E0D10",
    gray: "#8A8790",
    grayLight: "#F1EFF4",
    white: "#FFFFFF",
    gold: "#D9C25C",
  },

  contact: {
    email: "boosterclub@wacorampage.test",
    phone: "(254) 555-0142",
  },

  social: {
    instagram: "https://instagram.com/wacorampage14u",
    facebook: "https://facebook.com/wacorampage14u",
    twitter: "https://x.com/wacorampage14u",
    tiktok: "",
  },

  footerText: `© ${new Date().getFullYear()} Waco Rampage 14U Baseball Booster Club. All rights reserved.`,

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
      a: "100% of net proceeds support Waco Rampage 14U team expenses: tournament fees, travel, equipment, uniforms, training, and operating costs.",
    },
    {
      q: "Can I choose which player I support?",
      a: "Yes. You can donate through any individual player's page, or give to the team fund directly from the homepage.",
    },
    {
      q: "Is my donation tax-deductible?",
      a: "This prototype does not make a tax-deductibility claim. Once the real fundraiser launches, the booster club will state its tax status here.",
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

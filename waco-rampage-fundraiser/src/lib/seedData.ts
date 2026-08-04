import { v4 as uuid } from "uuid";
import { Database, Donation, Player, Sponsor } from "./types";
import { estimateFeeCents, estimateNetCents } from "./fees";

const FUNDRAISER_ID = "fundraiser-2026-spring";

function avatar(seed: string) {
  // Neutral placeholder avatar (no external cost, easy to replace later).
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=5B2A86&textColor=ffffff`;
}

const playerSeeds: { name: string; slug: string; goal: number; message: string }[] = [
  {
    name: "DoMani G.",
    slug: "domani-g",
    goal: 80000,
    message:
      "This is my first season with the 14U squad and I'm working hard on my swing every day. Any support toward tournament fees means the world to me and my family. Thank you for believing in me!",
  },
  {
    name: "Carter B.",
    slug: "carter-b",
    goal: 60000,
    message: "Saving up for a new catcher's mitt and helping the team hit our travel goal this year.",
  },
  {
    name: "Mason T.",
    slug: "mason-t",
    goal: 60000,
    message: "Every rep in the cage counts. Thanks for helping our team make it to Regionals!",
  },
  {
    name: "Liam R.",
    slug: "liam-r",
    goal: 65000,
    message: "Working on my pitching this season — grateful for every bit of support toward our tournament run.",
  },
  {
    name: "Ethan K.",
    slug: "ethan-k",
    goal: 55000,
    message: "New to shortstop this year and loving it. Thanks for helping cover uniforms and gear!",
  },
  {
    name: "Noah P.",
    slug: "noah-p",
    goal: 60000,
    message: "Trying to help our team qualify for state. Every donation gets us closer.",
  },
  {
    name: "Jackson W.",
    slug: "jackson-w",
    goal: 70000,
    message: "Third baseman, first-time fundraiser. Thank you for supporting Rampage baseball!",
  },
  {
    name: "Aiden M.",
    slug: "aiden-m",
    goal: 55000,
    message: "Working on my speed on the base paths. Appreciate any support toward our travel fund.",
  },
  {
    name: "Bryce H.",
    slug: "bryce-h",
    goal: 60000,
    message: "Center field is my home. Thanks for helping our team reach our tournament goal!",
  },
  {
    name: "Colton S.",
    slug: "colton-s",
    goal: 50000,
    message: "First season on varsity travel ball — grateful for every bit of support.",
  },
  {
    name: "Dawson F.",
    slug: "dawson-f",
    goal: 60000,
    message: "Working on my curveball this year. Thank you for helping fund our training sessions.",
  },
  {
    name: "Easton V.",
    slug: "easton-v",
    goal: 55000,
    message: "Right field, big arm. Thanks for supporting our tournament travel this season!",
  },
  {
    name: "Gavin N.",
    slug: "gavin-n",
    goal: 60000,
    message: "Grateful to be part of this team. Every donation helps us get to the next tournament.",
  },
];

function buildPlayers(): Player[] {
  const roster: Player[] = playerSeeds.map((p, i) => ({
    id: uuid(),
    slug: p.slug,
    displayName: p.name,
    imageUrl: avatar(p.name),
    goalCents: p.goal,
    message: p.message,
    active: true,
    displayOrder: i + 1,
    createdAt: new Date().toISOString(),
  }));

  const generalFund: Player = {
    id: uuid(),
    slug: "team-general-fund",
    displayName: "Waco Rampage 14U — Team General Fund",
    imageUrl: avatar("Team Fund"),
    goalCents: 2000000,
    message:
      "Give directly to the team fund to cover whatever the squad needs most this season: tournament fees, travel, equipment, uniforms, and training.",
    active: true,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    isGeneralFund: true,
  };

  return [generalFund, ...roster];
}

function buildDonations(players: Player[]): Donation[] {
  const donors = [
    { name: "The Garcia Family", email: "garcia.family@example.com" },
    { name: "Uncle Rick", email: "rick.t@example.com" },
    { name: "Coach Reyes", email: "coach.reyes@example.com" },
    { name: "Grandma Sue", email: "sue.h@example.com" },
    { name: "Anonymous Supporter", email: "anon1@example.com" },
    { name: "The Nguyen Family", email: "nguyen.family@example.com" },
    { name: "Tom W.", email: "tomw@example.com" },
    { name: "The Patel Family", email: "patel.family@example.com" },
    { name: "Aunt Michelle", email: "michelle.k@example.com" },
    { name: "Bob's Hardware", email: "bob@example.com" },
  ];

  // Hand-picked donation counts per player so a clear top-3 leaderboard emerges.
  const plan: { slug: string; amounts: number[] }[] = [
    { slug: "domani-g", amounts: [10000, 7500, 5000, 2500, 15000, 5000] }, // #1
    { slug: "carter-b", amounts: [5000, 5000, 10000, 7500, 5000] }, // #2
    { slug: "mason-t", amounts: [10000, 5000, 5000, 5000] }, // #3
    { slug: "liam-r", amounts: [2500, 5000, 2500] },
    { slug: "ethan-k", amounts: [5000, 2500] },
    { slug: "noah-p", amounts: [2500, 2500, 2500] },
    { slug: "jackson-w", amounts: [5000] },
    { slug: "aiden-m", amounts: [2500, 2500] },
    { slug: "bryce-h", amounts: [5000] },
    { slug: "colton-s", amounts: [2500] },
    { slug: "dawson-f", amounts: [] },
    { slug: "easton-v", amounts: [2500] },
    { slug: "gavin-n", amounts: [] },
  ];

  const donations: Donation[] = [];
  let donorIdx = 0;
  let daysAgo = 21;

  for (const entry of plan) {
    const player = players.find((p) => p.slug === entry.slug)!;
    for (const amount of entry.amounts) {
      const donor = donors[donorIdx % donors.length];
      donorIdx++;
      daysAgo = Math.max(0, daysAgo - Math.floor(Math.random() * 2));
      const anonymous = donor.name === "Anonymous Supporter";
      const fee = estimateFeeCents(amount);
      donations.push({
        id: uuid(),
        playerId: player.id,
        fundraiserId: FUNDRAISER_ID,
        grossCents: amount,
        feeCents: fee,
        netCents: estimateNetCents(amount),
        donorName: anonymous ? "Anonymous" : donor.name,
        donorEmail: donor.email,
        donorMessage: "Go get 'em this season! Proud to support the team.",
        anonymous,
        status: "succeeded",
        paymentMethod: "mock_card",
        source: "mock",
        checkoutSessionId: `mock_cs_${uuid().slice(0, 12)}`,
        paymentIntentId: `mock_pi_${uuid().slice(0, 12)}`,
        createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
        refunded: false,
        adminNotes: "",
      });
    }
  }

  // A couple of failed / canceled records so the admin dashboard has realistic states.
  const domani = players.find((p) => p.slug === "domani-g")!;
  donations.push({
    id: uuid(),
    playerId: domani.id,
    fundraiserId: FUNDRAISER_ID,
    grossCents: 5000,
    feeCents: estimateFeeCents(5000),
    netCents: estimateNetCents(5000),
    donorName: "Test Donor",
    donorEmail: "test.fail@example.com",
    donorMessage: "",
    anonymous: false,
    status: "failed",
    paymentMethod: "mock_card",
    source: "mock",
    checkoutSessionId: `mock_cs_${uuid().slice(0, 12)}`,
    paymentIntentId: `mock_pi_${uuid().slice(0, 12)}`,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    refunded: false,
    adminNotes: "Simulated failed payment for testing.",
  });

  return donations;
}

function buildSponsors(): Sponsor[] {
  return [
    {
      id: uuid(),
      name: "Rampage Auto Body",
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=RampageAutoBody",
      website: "https://example.com/rampage-auto-body",
      level: "Gold",
      displayOrder: 1,
    },
    {
      id: uuid(),
      name: "Brazos Valley Orthodontics",
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=BrazosOrtho",
      website: "https://example.com/brazos-valley-orthodontics",
      level: "Silver",
      displayOrder: 2,
    },
    {
      id: uuid(),
      name: "Central Texas Batting Cages",
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=CTBattingCages",
      website: "https://example.com/central-texas-batting-cages",
      level: "Bronze",
      displayOrder: 3,
    },
  ];
}

export function buildSeed(): Database {
  const players = buildPlayers();
  const donations = buildDonations(players);
  const sponsors = buildSponsors();

  return {
    players,
    donations,
    sponsors,
    settings: {
      fundraiserTitle: "2026 Spring Tournament Fund",
      fundraiserDescription:
        "Help send the Waco Rampage 14U squad to Regionals. Every dollar raised goes directly toward tournament fees, travel, equipment, uniforms, and training.",
      teamGoalCents: 2000000,
      playerDefaultGoalCents: 60000,
      startDate: new Date(Date.now() - 21 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 45 * 86400000).toISOString(),
      minDonationCents: 500,
      maxDonationCents: 500000,
      suggestedAmountsCents: [2500, 5000, 10000],
      fundUsageCategories: [
        { label: "Tournament fees", description: "Entry fees for regional and national tournaments." },
        { label: "Travel expenses", description: "Team hotel blocks and transportation for away games." },
        { label: "Equipment", description: "Bats, helmets, catcher's gear, and practice equipment." },
        { label: "Uniforms", description: "Game and practice uniforms for the full roster." },
        { label: "Training", description: "Batting cage rental, pitching instruction, skills clinics." },
        { label: "Team operating expenses", description: "Field rental, insurance, and umpire fees." },
      ],
      leaderboardVisible: true,
      recentSupportersVisible: true,
      donorMessagesVisible: true,
      anonymousAllowed: true,
      contactEmail: "boosterclub@wacorampage.test",
      contactPhone: "(254) 555-0142",
      social: {
        instagram: "https://instagram.com/wacorampage14u",
        facebook: "https://facebook.com/wacorampage14u",
        twitter: "https://x.com/wacorampage14u",
      },
    },
  };
}

export const FUNDRAISER_ID_CONST = FUNDRAISER_ID;

// Central type definitions.
// This shape is intentionally close to the proposed Supabase schema
// (see docs/SUPABASE_SCHEMA.sql) so the mock layer can be swapped for
// a real database later without changing the UI.

export type PaymentStatus = "succeeded" | "failed" | "canceled";
export type PaymentSource = "mock" | "stripe";

export interface Player {
  id: string;
  slug: string;
  displayName: string; // e.g. "DoMani G." — first name + last initial only
  imageUrl: string; // placeholder or uploaded photo
  goalCents: number;
  message: string; // short personal fundraising message
  active: boolean;
  displayOrder: number;
  createdAt: string;
  /** True only for the single "Team General Fund" pseudo-player used by the
   * homepage's main Donate button. Excluded from the player directory,
   * search results, and the leaderboard. */
  isGeneralFund?: boolean;
}

export interface Donation {
  id: string;
  playerId: string;
  fundraiserId: string;
  grossCents: number;
  feeCents: number; // estimated Stripe fee (2.9% + $0.30) while in mock mode
  netCents: number;
  donorName: string;
  donorEmail: string;
  donorMessage: string;
  anonymous: boolean;
  status: PaymentStatus;
  paymentMethod: string; // e.g. "mock_card", "card"
  source: PaymentSource;
  checkoutSessionId: string;
  paymentIntentId: string;
  createdAt: string;
  refunded: boolean;
  adminNotes: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  level: "Gold" | "Silver" | "Bronze" | "Community";
  displayOrder: number;
}

export interface FundraiserSettings {
  fundraiserTitle: string;
  fundraiserDescription: string;
  teamGoalCents: number;
  playerDefaultGoalCents: number;
  startDate: string;
  endDate: string;
  minDonationCents: number;
  maxDonationCents: number;
  suggestedAmountsCents: number[];
  fundUsageCategories: { label: string; description: string }[];
  leaderboardVisible: boolean;
  recentSupportersVisible: boolean;
  donorMessagesVisible: boolean;
  anonymousAllowed: boolean;
  contactEmail: string;
  contactPhone: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
}

export interface Database {
  players: Player[];
  donations: Donation[];
  sponsors: Sponsor[];
  settings: FundraiserSettings;
}

// These types mirror the Supabase schema in docs/SUPABASE_SETUP.sql
// column-for-column (snake_case, matching the database) so query
// results can be used directly without a mapping layer.

export type AdminRole = "owner" | "treasurer" | "manager";
export type PaymentStatus = "succeeded" | "failed" | "canceled";
export type PaymentSource = "mock" | "stripe";
export type SponsorLevel = "Gold" | "Silver" | "Bronze" | "Community";

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface Fundraiser {
  id: string;
  team_id: string;
  title: string;
  description: string;
  team_goal_cents: number;
  player_default_goal_cents: number;
  start_date: string;
  end_date: string;
  min_donation_cents: number;
  max_donation_cents: number;
  suggested_amounts_cents: number[];
  leaderboard_visible: boolean;
  recent_supporters_visible: boolean;
  donor_messages_visible: boolean;
  anonymous_allowed: boolean;
  contact_email: string;
  contact_phone: string;
  social: { instagram?: string; facebook?: string; twitter?: string; tiktok?: string };
  active: boolean;
  created_at: string;
}

export interface Player {
  id: string;
  fundraiser_id: string;
  slug: string;
  display_name: string;
  image_url: string;
  goal_cents: number;
  message: string;
  active: boolean;
  display_order: number;
  is_general_fund: boolean;
  created_at: string;
}

// Public-safe donation shape (matches the column-restricted grant for
// anon/authenticated — see docs/SUPABASE_SETUP.sql section 6).
export interface PublicDonation {
  id: string;
  player_id: string;
  fundraiser_id: string;
  gross_cents: number;
  status: PaymentStatus;
  source: PaymentSource;
  anonymous: boolean;
  donor_name: string;
  donor_message: string;
  created_at: string;
  refunded: boolean;
}

// Full donation shape, only ever returned by the `donations_financial`
// view to owner/treasurer admins.
export interface FinancialDonation extends PublicDonation {
  fee_cents: number;
  net_cents: number;
  donor_email: string;
  payment_method: string;
  checkout_session_id: string;
  payment_intent_id: string;
  admin_notes: string;
}

export interface Sponsor {
  id: string;
  fundraiser_id: string;
  name: string;
  logo_url: string;
  website: string;
  level: SponsorLevel;
  display_order: number;
}

export interface SiteContentItem {
  id: string;
  fundraiser_id: string;
  section: string;
  key: string;
  value: string;
  display_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface SiteSettings {
  id: string;
  fundraiser_id: string;
  team_name: string;
  tagline: string;
  logo_url: string;
  hero_photo_url: string;
  gallery_urls: string[];
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Administrator {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface AuditLogEntry {
  id: string;
  actor_administrator_id: string | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

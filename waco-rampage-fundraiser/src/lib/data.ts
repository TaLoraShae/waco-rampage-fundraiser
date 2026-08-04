import { createClient } from "./supabase/server";
import { Fundraiser, Player, PublicDonation, SiteContentItem, SiteSettings, Sponsor } from "./types";

// These reads go through the same Supabase client whether the caller
// is a logged-out visitor or a logged-in admin — Row Level Security
// (docs/SUPABASE_SETUP.sql) automatically returns the right rows and
// columns for whoever is asking. No admin-only data leaks to public
// callers here.

export async function getFundraiser(): Promise<Fundraiser | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("fundraisers")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as Fundraiser | null;
}

export async function getSiteSettings(fundraiserId: string): Promise<SiteSettings | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("fundraiser_id", fundraiserId)
    .maybeSingle();
  return data as SiteSettings | null;
}

export async function getSiteContent(fundraiserId: string): Promise<SiteContentItem[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_content")
    .select("*")
    .eq("fundraiser_id", fundraiserId)
    .order("display_order", { ascending: true });
  return (data as SiteContentItem[]) || [];
}

export function contentMap(items: SiteContentItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) map[`${item.section}.${item.key}`] = item.value;
  return map;
}

export async function getPlayers(fundraiserId: string): Promise<Player[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("fundraiser_id", fundraiserId)
    .order("display_order", { ascending: true });
  return (data as Player[]) || [];
}

export function getDirectoryPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.active && !p.is_general_fund);
}

export function getGeneralFundPlayer(players: Player[]): Player | undefined {
  return players.find((p) => p.is_general_fund);
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const supabase = createClient();
  const { data } = await supabase.from("players").select("*").eq("slug", slug).maybeSingle();
  return data as Player | null;
}

export async function getDonationById(id: string): Promise<PublicDonation | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("donations")
    .select("id, player_id, fundraiser_id, gross_cents, status, source, anonymous, donor_name, donor_message, created_at, refunded")
    .eq("id", id)
    .maybeSingle();
  return data as PublicDonation | null;
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const supabase = createClient();
  const { data } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
  return data as Player | null;
}

export async function getSponsors(fundraiserId: string): Promise<Sponsor[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("sponsors")
    .select("*")
    .eq("fundraiser_id", fundraiserId)
    .order("display_order", { ascending: true });
  return (data as Sponsor[]) || [];
}

// Public-safe donation rows (see column grants in SUPABASE_SETUP.sql —
// donor_email, fees, and internal notes are never included here).
export async function getDonationsForFundraiser(fundraiserId: string): Promise<PublicDonation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("donations")
    .select("id, player_id, fundraiser_id, gross_cents, status, source, anonymous, donor_name, donor_message, created_at, refunded")
    .eq("fundraiser_id", fundraiserId)
    .order("created_at", { ascending: false });
  return (data as PublicDonation[]) || [];
}

export async function getDonationsForPlayer(playerId: string): Promise<PublicDonation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("donations")
    .select("id, player_id, fundraiser_id, gross_cents, status, source, anonymous, donor_name, donor_message, created_at, refunded")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  return (data as PublicDonation[]) || [];
}

export function getPlayerRaisedCents(donations: PublicDonation[], playerId: string): number {
  return donations
    .filter((d) => d.player_id === playerId && d.status === "succeeded")
    .reduce((sum, d) => sum + d.gross_cents, 0);
}

export function getTeamRaisedCents(donations: PublicDonation[]): number {
  return donations.filter((d) => d.status === "succeeded").reduce((sum, d) => sum + d.gross_cents, 0);
}

export function getLeaderboard(
  donations: PublicDonation[],
  players: Player[],
  limit = 3
): { player: Player; raisedCents: number }[] {
  const directory = getDirectoryPlayers(players);
  return directory
    .map((player) => ({ player, raisedCents: getPlayerRaisedCents(donations, player.id) }))
    .sort((a, b) => b.raisedCents - a.raisedCents)
    .slice(0, limit);
}

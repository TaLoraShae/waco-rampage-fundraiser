import { Database, Donation, Player } from "./types";

// Pure, side-effect-free read helpers that operate on a Database object
// already in memory (client-side state). No filesystem access anywhere
// in this file — safe to run in the browser or during SSR.

export function getPlayers(db: Database): Player[] {
  return [...db.players].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getActivePlayers(db: Database): Player[] {
  return getPlayers(db).filter((p) => p.active);
}

export function getDirectoryPlayers(db: Database): Player[] {
  return getActivePlayers(db).filter((p) => !p.isGeneralFund);
}

export function getGeneralFundPlayer(db: Database): Player | undefined {
  return db.players.find((p) => p.isGeneralFund);
}

export function getPlayerBySlug(db: Database, slug: string): Player | undefined {
  return db.players.find((p) => p.slug === slug);
}

export function getPlayerById(db: Database, id: string): Player | undefined {
  return db.players.find((p) => p.id === id);
}

export function slugExists(db: Database, slug: string, excludeId?: string): boolean {
  return db.players.some((p) => p.slug === slug && p.id !== excludeId);
}

export function getDonations(db: Database): Donation[] {
  return [...db.donations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDonationsForPlayer(db: Database, playerId: string): Donation[] {
  return getDonations(db).filter((d) => d.playerId === playerId);
}

export function getSucceededDonations(db: Database): Donation[] {
  return getDonations(db).filter((d) => d.status === "succeeded");
}

export function getPlayerRaisedCents(db: Database, playerId: string): number {
  return getSucceededDonations(db)
    .filter((d) => d.playerId === playerId)
    .reduce((sum, d) => sum + d.grossCents, 0);
}

export function getTeamRaisedCents(db: Database): number {
  return getSucceededDonations(db).reduce((sum, d) => sum + d.grossCents, 0);
}

export function getLeaderboard(db: Database, limit = 3): { player: Player; raisedCents: number }[] {
  const players = getDirectoryPlayers(db);
  return players
    .map((player) => ({ player, raisedCents: getPlayerRaisedCents(db, player.id) }))
    .sort((a, b) => b.raisedCents - a.raisedCents)
    .slice(0, limit);
}

export function getSponsors(db: Database) {
  return [...db.sponsors].sort((a, b) => a.displayOrder - b.displayOrder);
}

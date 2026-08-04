import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { Database, Donation, Player, Sponsor, FundraiserSettings } from "./types";
import { buildSeed } from "./seedData";

// =====================================================================
// DATABASE SERVICE LAYER (prototype implementation)
// ---------------------------------------------------------------------
// This is the ONLY file in the app that touches storage directly.
// Every page, component, and API route goes through the functions
// below instead of reading/writing files itself.
//
// Prototype storage: a single JSON file on disk (data/db.json).
//   - Works great for local development ("npm run dev") and for a
//     single always-on server ("npm run build && npm start").
//   - On serverless platforms (like a default Vercel deployment) the
//     filesystem is read-only/ephemeral, so writes will not persist
//     between requests. That's expected for a prototype — see
//     docs/SUPABASE_MIGRATION.md for how to swap this file for a real
//     database without changing any page or component.
//
// To reset the prototype data at any time: `npm run reset-data`
// =====================================================================

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDb(): Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const seed = buildSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw) as Database;
}

function readDb(): Database {
  return ensureDb();
}

function writeDb(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ---------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------

export function getPlayers(): Player[] {
  return readDb().players.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getActivePlayers(): Player[] {
  return getPlayers().filter((p) => p.active);
}

// Players shown in the public directory / search / leaderboard —
// excludes the Team General Fund pseudo-player, which has its own
// direct link from the homepage's main Donate button instead.
export function getDirectoryPlayers(): Player[] {
  return getActivePlayers().filter((p) => !p.isGeneralFund);
}

export function getGeneralFundPlayer(): Player | undefined {
  return readDb().players.find((p) => p.isGeneralFund);
}

export function getPlayerBySlug(slug: string): Player | undefined {
  return readDb().players.find((p) => p.slug === slug);
}

export function getPlayerById(id: string): Player | undefined {
  return readDb().players.find((p) => p.id === id);
}

export function slugExists(slug: string, excludeId?: string): boolean {
  return readDb().players.some((p) => p.slug === slug && p.id !== excludeId);
}

export function addPlayer(input: Omit<Player, "id" | "createdAt">): Player {
  const db = readDb();
  const player: Player = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  db.players.push(player);
  writeDb(db);
  return player;
}

export function updatePlayer(id: string, updates: Partial<Omit<Player, "id" | "createdAt">>): Player | undefined {
  const db = readDb();
  const idx = db.players.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.players[idx] = { ...db.players[idx], ...updates };
  writeDb(db);
  return db.players[idx];
}

export function deletePlayer(id: string): { ok: boolean; reason?: string } {
  const db = readDb();
  const hasDonations = db.donations.some((d) => d.playerId === id);
  if (hasDonations) {
    return { ok: false, reason: "This player has donation history and cannot be deleted. Deactivate instead." };
  }
  db.players = db.players.filter((p) => p.id !== id);
  writeDb(db);
  return { ok: true };
}

// ---------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------

export function getDonations(): Donation[] {
  return readDb().donations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDonationsForPlayer(playerId: string): Donation[] {
  return getDonations().filter((d) => d.playerId === playerId);
}

export function getSucceededDonations(): Donation[] {
  return getDonations().filter((d) => d.status === "succeeded");
}

export function getPlayerRaisedCents(playerId: string): number {
  return getSucceededDonations()
    .filter((d) => d.playerId === playerId)
    .reduce((sum, d) => sum + d.grossCents, 0);
}

export function getTeamRaisedCents(): number {
  return getSucceededDonations().reduce((sum, d) => sum + d.grossCents, 0);
}

export function addDonation(input: Omit<Donation, "id" | "createdAt">): Donation {
  const db = readDb();
  const donation: Donation = { ...input, id: uuid(), createdAt: new Date().toISOString() };
  db.donations.push(donation);
  writeDb(db);
  return donation;
}

export function updateDonation(id: string, updates: Partial<Donation>): Donation | undefined {
  const db = readDb();
  const idx = db.donations.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  db.donations[idx] = { ...db.donations[idx], ...updates };
  writeDb(db);
  return db.donations[idx];
}

export function deleteDonation(id: string): boolean {
  const db = readDb();
  const before = db.donations.length;
  db.donations = db.donations.filter((d) => d.id !== id);
  writeDb(db);
  return db.donations.length < before;
}

// Leaderboard: top fundraising players ranked by amount raised (succeeded donations only).
export function getLeaderboard(limit = 3): { player: Player; raisedCents: number }[] {
  const players = getDirectoryPlayers();
  const ranked = players
    .map((player) => ({ player, raisedCents: getPlayerRaisedCents(player.id) }))
    .sort((a, b) => b.raisedCents - a.raisedCents);
  return ranked.slice(0, limit);
}

// ---------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------

export function getSponsors(): Sponsor[] {
  return readDb().sponsors.sort((a, b) => a.displayOrder - b.displayOrder);
}

export function addSponsor(input: Omit<Sponsor, "id">): Sponsor {
  const db = readDb();
  const sponsor: Sponsor = { ...input, id: uuid() };
  db.sponsors.push(sponsor);
  writeDb(db);
  return sponsor;
}

export function updateSponsor(id: string, updates: Partial<Sponsor>): Sponsor | undefined {
  const db = readDb();
  const idx = db.sponsors.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  db.sponsors[idx] = { ...db.sponsors[idx], ...updates };
  writeDb(db);
  return db.sponsors[idx];
}

export function deleteSponsor(id: string): void {
  const db = readDb();
  db.sponsors = db.sponsors.filter((s) => s.id !== id);
  writeDb(db);
}

// ---------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------

export function getSettings(): FundraiserSettings {
  return readDb().settings;
}

export function updateSettings(updates: Partial<FundraiserSettings>): FundraiserSettings {
  const db = readDb();
  db.settings = { ...db.settings, ...updates };
  writeDb(db);
  return db.settings;
}

// ---------------------------------------------------------------------
// Reset (prototype only)
// ---------------------------------------------------------------------

export function resetDatabase(): Database {
  const seed = buildSeed();
  writeDb(seed);
  return seed;
}

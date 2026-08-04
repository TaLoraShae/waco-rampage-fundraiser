"use client";

// =====================================================================
// CLIENT-SIDE DATA STORE (Vercel-safe prototype storage)
// ---------------------------------------------------------------------
// This replaces the old fs-backed data/db.json approach. Vercel's
// serverless functions have a read-only, ephemeral filesystem, so any
// server-side file write disappears between requests. Instead, this
// prototype keeps its mutable "database" entirely in the browser:
//   - Initial state = the same deterministic seed data used for SSR,
//     so server-rendered HTML and the client's first render match.
//   - After mount, any saved data in localStorage (key below) is loaded
//     and takes over.
//   - Every mutation updates React state AND writes back to
//     localStorage, so it survives page reloads and tab closes.
//
// This is still a PROTOTYPE storage layer: it's per-browser only (a
// different device/browser won't see the same donations), and clearing
// site data resets it. See docs/SUPABASE_SCHEMA.md for the real,
// shared-database migration path — swapping this file for Supabase
// calls is the only thing that needs to change; no page/component
// should need to change again.
// =====================================================================

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { Database, Donation, FundraiserSettings, Player, Sponsor } from "./types";
import { buildSeed } from "./seedData";
import { estimateFeeCents, estimateNetCents } from "./fees";

const STORAGE_KEY = "waco-rampage-db-v1";

function loadFromStorage(): Database | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Database;
  } catch {
    return null;
  }
}

function saveToStorage(db: Database) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or unavailable — the prototype still works for this
    // session, it just won't persist across reloads.
  }
}

export interface FinalizeDonationInput {
  slug: string;
  amountCents: number;
  donorName: string;
  donorEmail: string;
  anonymous: boolean;
  donorMessage: string;
  result: "succeeded" | "failed" | "canceled";
}

interface StoreValue {
  db: Database;
  ready: boolean;

  addDonation: (input: FinalizeDonationInput) => Donation | null;
  createPlayer: (input: Omit<Player, "id" | "createdAt" | "displayOrder"> & { displayOrder?: number }) => { ok: boolean; error?: string };
  updatePlayerById: (id: string, updates: Partial<Omit<Player, "id" | "createdAt">>) => { ok: boolean; error?: string };
  togglePlayerActive: (id: string) => void;
  deletePlayerById: (id: string) => { ok: boolean; reason?: string };
  resetPlayerTotals: (id: string) => void;
  createSponsor: (input: Omit<Sponsor, "id" | "displayOrder">) => void;
  deleteSponsorById: (id: string) => void;
  updateSettings: (updates: Partial<FundraiserSettings>) => void;
  updateDonationById: (id: string, updates: Partial<Donation>) => void;
  deleteDonationById: (id: string) => void;
  resetAll: () => void;
}

const DataStoreContext = createContext<StoreValue | null>(null);

export function DataStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database>(() => buildSeed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) setDb(stored);
    setReady(true);
  }, []);

  const persist = useCallback((next: Database) => {
    setDb(next);
    saveToStorage(next);
  }, []);

  const addDonation = useCallback(
    (input: FinalizeDonationInput): Donation | null => {
      let created: Donation | null = null;
      setDb((prev) => {
        const player = prev.players.find((p) => p.slug === input.slug);
        if (!player) return prev;
        const donation: Donation = {
          id: uuid(),
          playerId: player.id,
          fundraiserId: "fundraiser-2026-spring",
          grossCents: input.amountCents,
          feeCents: estimateFeeCents(input.amountCents),
          netCents: estimateNetCents(input.amountCents),
          donorName: input.anonymous ? "Anonymous" : input.donorName || "Anonymous",
          donorEmail: input.donorEmail,
          donorMessage: input.donorMessage,
          anonymous: input.anonymous,
          status: input.result,
          paymentMethod: "mock_card",
          source: "mock",
          checkoutSessionId: `mock_cs_${uuid().slice(0, 12)}`,
          paymentIntentId: `mock_pi_${uuid().slice(0, 12)}`,
          createdAt: new Date().toISOString(),
          refunded: false,
          adminNotes: "",
        };
        created = donation;
        const next = { ...prev, donations: [...prev.donations, donation] };
        saveToStorage(next);
        return next;
      });
      return created;
    },
    []
  );

  const createPlayer: StoreValue["createPlayer"] = useCallback(
    (input) => {
      let result: { ok: boolean; error?: string } = { ok: true };
      setDb((prev) => {
        if (prev.players.some((p) => p.slug === input.slug)) {
          result = { ok: false, error: "duplicate-slug" };
          return prev;
        }
        const player: Player = {
          ...input,
          id: uuid(),
          createdAt: new Date().toISOString(),
          displayOrder: input.displayOrder ?? prev.players.length + 1,
        };
        const next = { ...prev, players: [...prev.players, player] };
        saveToStorage(next);
        return next;
      });
      return result;
    },
    []
  );

  const updatePlayerById: StoreValue["updatePlayerById"] = useCallback((id, updates) => {
    let result: { ok: boolean; error?: string } = { ok: true };
    setDb((prev) => {
      if (updates.slug && prev.players.some((p) => p.slug === updates.slug && p.id !== id)) {
        result = { ok: false, error: "duplicate-slug" };
        return prev;
      }
      const next = {
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
      saveToStorage(next);
      return next;
    });
    return result;
  }, []);

  const togglePlayerActive = useCallback((id: string) => {
    setDb((prev) => {
      const next = {
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deletePlayerById = useCallback((id: string): { ok: boolean; reason?: string } => {
    let result = { ok: true, reason: undefined as string | undefined };
    setDb((prev) => {
      const hasDonations = prev.donations.some((d) => d.playerId === id);
      if (hasDonations) {
        result = { ok: false, reason: "This player has donation history and can't be deleted. Deactivate instead." };
        return prev;
      }
      const next = { ...prev, players: prev.players.filter((p) => p.id !== id) };
      saveToStorage(next);
      return next;
    });
    return result;
  }, []);

  const resetPlayerTotals = useCallback((id: string) => {
    setDb((prev) => {
      const next = { ...prev, donations: prev.donations.filter((d) => d.playerId !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const createSponsor: StoreValue["createSponsor"] = useCallback((input) => {
    setDb((prev) => {
      const sponsor: Sponsor = { ...input, id: uuid(), displayOrder: prev.sponsors.length + 1 };
      const next = { ...prev, sponsors: [...prev.sponsors, sponsor] };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteSponsorById = useCallback((id: string) => {
    setDb((prev) => {
      const next = { ...prev, sponsors: prev.sponsors.filter((s) => s.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateSettings: StoreValue["updateSettings"] = useCallback((updates) => {
    setDb((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...updates } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateDonationById = useCallback((id: string, updates: Partial<Donation>) => {
    setDb((prev) => {
      const next = {
        ...prev,
        donations: prev.donations.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteDonationById = useCallback((id: string) => {
    setDb((prev) => {
      const next = { ...prev, donations: prev.donations.filter((d) => d.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const fresh = buildSeed();
    persist(fresh);
  }, [persist]);

  const value = useMemo<StoreValue>(
    () => ({
      db,
      ready,
      addDonation,
      createPlayer,
      updatePlayerById,
      togglePlayerActive,
      deletePlayerById,
      resetPlayerTotals,
      createSponsor,
      deleteSponsorById,
      updateSettings,
      updateDonationById,
      deleteDonationById,
      resetAll,
    }),
    [
      db,
      ready,
      addDonation,
      createPlayer,
      updatePlayerById,
      togglePlayerActive,
      deletePlayerById,
      resetPlayerTotals,
      createSponsor,
      deleteSponsorById,
      updateSettings,
      updateDonationById,
      deleteDonationById,
      resetAll,
    ]
  );

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore(): StoreValue {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within a DataStoreProvider");
  return ctx;
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import * as db from "@/lib/db";
import { estimateFeeCents, estimateNetCents } from "@/lib/fees";
import { checkDemoCredentials, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { Player, Sponsor } from "@/lib/types";

// ---------------------------------------------------------------------
// Mock checkout finalization
// ---------------------------------------------------------------------

export async function finalizeDonation(formData: FormData) {
  const slug = String(formData.get("slug") || "");
  const amountCents = Math.round(Number(formData.get("amountCents") || 0));
  const donorName = String(formData.get("donorName") || "").trim();
  const donorEmail = String(formData.get("donorEmail") || "").trim();
  const anonymous = formData.get("anonymous") === "on";
  const donorMessage = String(formData.get("donorMessage") || "").trim();
  const result = String(formData.get("result") || "succeeded") as
    | "succeeded"
    | "failed"
    | "canceled";

  const player = db.getPlayerBySlug(slug);
  if (!player) {
    redirect("/support");
  }

  if (result === "canceled") {
    redirect(`/support/${slug}?canceled=1`);
  }

  const settings = db.getSettings();
  if (amountCents < settings.minDonationCents || amountCents > settings.maxDonationCents) {
    redirect(`/support/${slug}?error=amount`);
  }

  const donation = db.addDonation({
    playerId: player!.id,
    fundraiserId: "fundraiser-2026-spring",
    grossCents: amountCents,
    feeCents: estimateFeeCents(amountCents),
    netCents: estimateNetCents(amountCents),
    donorName: anonymous ? "Anonymous" : donorName || "Anonymous",
    donorEmail,
    donorMessage,
    anonymous,
    status: result,
    paymentMethod: "mock_card",
    source: "mock",
    checkoutSessionId: `mock_cs_${uuid().slice(0, 12)}`,
    paymentIntentId: `mock_pi_${uuid().slice(0, 12)}`,
    refunded: false,
    adminNotes: "",
  });

  revalidatePath("/");
  revalidatePath(`/support/${slug}`);
  revalidatePath("/admin");

  if (result === "failed") {
    redirect(`/checkout/${slug}?result=failed&amountCents=${amountCents}&donorName=${encodeURIComponent(
      donorName
    )}&donorEmail=${encodeURIComponent(donorEmail)}&anonymous=${anonymous ? "1" : ""}&donorMessage=${encodeURIComponent(
      donorMessage
    )}`);
  }

  redirect(`/thank-you?donationId=${donation.id}`);
}

// ---------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");

  if (!checkDemoCredentials(email, password)) {
    redirect(`/admin/login?error=1`);
  }

  cookies().set(ADMIN_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(from || "/admin");
}

export async function adminLogout() {
  cookies().delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

// ---------------------------------------------------------------------
// Admin: players
// ---------------------------------------------------------------------

export async function createPlayer(formData: FormData) {
  const displayName = String(formData.get("displayName") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const goalCents = Math.round(Number(formData.get("goalDollars") || 0) * 100);
  const message = String(formData.get("message") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  if (!displayName || !slug) {
    redirect("/admin/players?error=missing");
  }
  if (db.slugExists(slug)) {
    redirect("/admin/players?error=duplicate-slug");
  }

  const players = db.getPlayers();
  const player: Omit<Player, "id" | "createdAt"> = {
    slug,
    displayName,
    imageUrl: imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=5B2A86&textColor=ffffff`,
    goalCents: goalCents || db.getSettings().playerDefaultGoalCents,
    message,
    active: true,
    displayOrder: players.length + 1,
  };
  db.addPlayer(player);
  revalidatePath("/admin/players");
  revalidatePath("/");
  redirect("/admin/players?success=created");
}

export async function updatePlayerAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const goalCents = Math.round(Number(formData.get("goalDollars") || 0) * 100);
  const message = String(formData.get("message") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const displayOrder = Math.round(Number(formData.get("displayOrder") || 0));

  if (db.slugExists(slug, id)) {
    redirect(`/admin/players/${id}?error=duplicate-slug`);
  }

  db.updatePlayer(id, { displayName, slug, goalCents, message, imageUrl, displayOrder });
  revalidatePath("/admin/players");
  revalidatePath("/");
  redirect("/admin/players?success=updated");
}

export async function togglePlayerActive(formData: FormData) {
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  db.updatePlayer(id, { active: !active });
  revalidatePath("/admin/players");
  revalidatePath("/");
}

export async function deletePlayerAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const res = db.deletePlayer(id);
  revalidatePath("/admin/players");
  revalidatePath("/");
  if (!res.ok) {
    redirect(`/admin/players?error=${encodeURIComponent(res.reason || "cannot-delete")}`);
  }
  redirect("/admin/players?success=deleted");
}

export async function resetPlayerTotals(formData: FormData) {
  const id = String(formData.get("id") || "");
  const donations = db.getDonationsForPlayer(id);
  for (const d of donations) db.deleteDonation(d.id);
  revalidatePath("/admin/players");
  revalidatePath("/admin/donations");
  revalidatePath("/");
  redirect("/admin/players?success=reset");
}

// ---------------------------------------------------------------------
// Admin: donations
// ---------------------------------------------------------------------

export async function deleteDonationAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  db.deleteDonation(id);
  revalidatePath("/admin/donations");
  revalidatePath("/");
  redirect("/admin/donations?success=deleted");
}

export async function markDonationRefunded(formData: FormData) {
  const id = String(formData.get("id") || "");
  const refunded = formData.get("refunded") === "true";
  db.updateDonation(id, { refunded: !refunded });
  revalidatePath("/admin/donations");
  redirect("/admin/donations?success=updated");
}

export async function updateDonationNotes(formData: FormData) {
  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "");
  db.updateDonation(id, { adminNotes });
  revalidatePath("/admin/donations");
  redirect("/admin/donations?success=updated");
}

// ---------------------------------------------------------------------
// Admin: sponsors
// ---------------------------------------------------------------------

export async function createSponsor(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const level = String(formData.get("level") || "Community") as Sponsor["level"];
  const logoUrl =
    String(formData.get("logoUrl") || "").trim() ||
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`;
  const sponsors = db.getSponsors();
  db.addSponsor({ name, website, level, logoUrl, displayOrder: sponsors.length + 1 });
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  redirect("/admin/sponsors?success=created");
}

export async function deleteSponsorAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  db.deleteSponsor(id);
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  redirect("/admin/sponsors?success=deleted");
}

// ---------------------------------------------------------------------
// Admin: fundraiser settings
// ---------------------------------------------------------------------

export async function updateSettingsAction(formData: FormData) {
  const teamGoalCents = Math.round(Number(formData.get("teamGoalCents") || 0));
  const playerDefaultGoalCents = Math.round(Number(formData.get("playerDefaultGoalCents") || 0));
  const fundraiserTitle = String(formData.get("fundraiserTitle") || "");
  const fundraiserDescription = String(formData.get("fundraiserDescription") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const minDonationCents = Math.round(Number(formData.get("minDonationCents") || 0));
  const maxDonationCents = Math.round(Number(formData.get("maxDonationCents") || 0));
  const contactEmail = String(formData.get("contactEmail") || "");
  const contactPhone = String(formData.get("contactPhone") || "");
  const leaderboardVisible = formData.get("leaderboardVisible") === "on";
  const recentSupportersVisible = formData.get("recentSupportersVisible") === "on";
  const donorMessagesVisible = formData.get("donorMessagesVisible") === "on";
  const anonymousAllowed = formData.get("anonymousAllowed") === "on";

  db.updateSettings({
    teamGoalCents,
    playerDefaultGoalCents,
    fundraiserTitle,
    fundraiserDescription,
    startDate,
    endDate,
    minDonationCents,
    maxDonationCents,
    contactEmail,
    contactPhone,
    leaderboardVisible,
    recentSupportersVisible,
    donorMessagesVisible,
    anonymousAllowed,
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  redirect("/admin/settings?success=updated");
}

// ---------------------------------------------------------------------
// Admin: reset all prototype data
// ---------------------------------------------------------------------

export async function resetAllData() {
  db.resetDatabase();
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?success=reset");
}

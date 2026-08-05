"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { logAudit } from "@/lib/auditLog";
import { AdminRole } from "@/lib/types";

// =====================================================================
// Every function here re-checks the caller's role on the server via
// requireAdmin() BEFORE touching the database — this is real
// server-side protection, not just hiding buttons in the UI. Row
// Level Security (docs/SUPABASE_SETUP.sql) is a second, independent
// layer underneath: even if a bug slipped past requireAdmin(), the
// database itself would still refuse the write.
// =====================================================================

// ---------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------

export async function createPlayer(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();

  const displayName = String(formData.get("displayName") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const fundraiserId = String(formData.get("fundraiserId") || "");
  const goalCents = Math.round(Number(formData.get("goalDollars") || 0) * 100);
  const message = String(formData.get("message") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  if (!displayName || !slug) redirect("/admin/players?error=missing");

  const { data: existing } = await supabase.from("players").select("id").eq("fundraiser_id", fundraiserId).eq("slug", slug).maybeSingle();
  if (existing) redirect("/admin/players?error=duplicate-slug");

  const { count } = await supabase.from("players").select("id", { count: "exact", head: true }).eq("fundraiser_id", fundraiserId);

  const { data: player, error } = await supabase
    .from("players")
    .insert({
      fundraiser_id: fundraiserId,
      slug,
      display_name: displayName,
      goal_cents: goalCents,
      message,
      image_url: imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=6B2FA0&textColor=ffffff`,
      active: true,
      display_order: (count || 0) + 1,
    })
    .select("id")
    .single();

  if (error || !player) redirect("/admin/players?error=save-failed");

  await logAudit(supabase, admin, "player.created", "player", player.id, { displayName, slug });
  revalidatePath("/admin/players");
  revalidatePath("/");
  redirect("/admin/players?success=created");
}

export async function updatePlayerAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();

  const id = String(formData.get("id") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const goalCents = Math.round(Number(formData.get("goalDollars") || 0) * 100);
  const message = String(formData.get("message") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const displayOrder = Math.round(Number(formData.get("displayOrder") || 0));

  const { data: current } = await supabase.from("players").select("fundraiser_id").eq("id", id).single();
  if (!current) redirect("/admin/players?error=not-found");

  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("fundraiser_id", current.fundraiser_id)
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) redirect(`/admin/players/${id}?error=duplicate-slug`);

  const { error } = await supabase
    .from("players")
    .update({ display_name: displayName, slug, goal_cents: goalCents, message, image_url: imageUrl, display_order: displayOrder })
    .eq("id", id);

  if (error) redirect(`/admin/players/${id}?error=save-failed`);

  await logAudit(supabase, admin, "player.updated", "player", id, { displayName, slug });
  revalidatePath("/admin/players");
  revalidatePath("/");
  redirect("/admin/players?success=updated");
}

export async function togglePlayerActive(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";

  await supabase.from("players").update({ active: !active }).eq("id", id);
  await logAudit(supabase, admin, active ? "player.deactivated" : "player.activated", "player", id);
  revalidatePath("/admin/players");
  revalidatePath("/");
}

export async function deletePlayerAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");

  const { count } = await supabase.from("donations").select("id", { count: "exact", head: true }).eq("player_id", id);
  if ((count || 0) > 0) {
    redirect("/admin/players?error=" + encodeURIComponent("This player has donation history and can't be deleted. Deactivate instead."));
  }

  await supabase.from("players").delete().eq("id", id);
  await logAudit(supabase, admin, "player.deleted", "player", id);
  revalidatePath("/admin/players");
  revalidatePath("/");
  redirect("/admin/players?success=deleted");
}

export async function resetPlayerTotals(formData: FormData) {
  const admin = await requireAdmin(["owner", "treasurer"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");

  await supabase.from("donations").delete().eq("player_id", id);
  await logAudit(supabase, admin, "player.totals_reset", "player", id);
  revalidatePath("/admin/players");
  revalidatePath("/admin/donations");
  revalidatePath("/");
  redirect("/admin/players?success=reset");
}

// ---------------------------------------------------------------------
// Sponsors
// ---------------------------------------------------------------------

export async function createSponsor(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();

  const fundraiserId = String(formData.get("fundraiserId") || "");
  const name = String(formData.get("name") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const level = String(formData.get("level") || "Community");
  const logoUrl = String(formData.get("logoUrl") || "").trim() || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`;

  const { count } = await supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("fundraiser_id", fundraiserId);

  const { data: sponsor } = await supabase
    .from("sponsors")
    .insert({ fundraiser_id: fundraiserId, name, website, level, logo_url: logoUrl, display_order: (count || 0) + 1 })
    .select("id")
    .single();

  await logAudit(supabase, admin, "sponsor.created", "sponsor", sponsor?.id || "", { name });
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  redirect("/admin/sponsors?success=created");
}

export async function deleteSponsorAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");

  await supabase.from("sponsors").delete().eq("id", id);
  await logAudit(supabase, admin, "sponsor.deleted", "sponsor", id);
  revalidatePath("/admin/sponsors");
  revalidatePath("/");
  redirect("/admin/sponsors?success=deleted");
}

// ---------------------------------------------------------------------
// Site content (editable wording)
// ---------------------------------------------------------------------

export async function updateSiteContentItems(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();

  const fundraiserId = String(formData.get("fundraiserId") || "");
  const raw = String(formData.get("items") || "[]");
  const items: { section: string; key: string; value: string }[] = JSON.parse(raw);

  for (const item of items) {
    await supabase
      .from("site_content")
      .upsert(
        { fundraiser_id: fundraiserId, section: item.section, key: item.key, value: item.value, updated_by: admin.id, updated_at: new Date().toISOString() },
        { onConflict: "fundraiser_id,section,key" }
      );
  }

  await logAudit(supabase, admin, "content.updated", "site_content", fundraiserId, { count: items.length });
  revalidatePath("/admin/content");
  revalidatePath("/");
  redirect("/admin/content?success=updated");
}

// ---------------------------------------------------------------------
// Fundraiser + site settings (branding)
// ---------------------------------------------------------------------

export async function updateFundraiserSettings(formData: FormData) {
  const admin = await requireAdmin(["owner", "manager"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");

  const { error } = await supabase
    .from("fundraisers")
    .update({
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      team_goal_cents: Math.round(Number(formData.get("teamGoalDollars") || 0) * 100),
      player_default_goal_cents: Math.round(Number(formData.get("playerDefaultGoalDollars") || 0) * 100),
      start_date: new Date(String(formData.get("startDate"))).toISOString(),
      end_date: new Date(String(formData.get("endDate"))).toISOString(),
      min_donation_cents: Math.round(Number(formData.get("minDonationDollars") || 0) * 100),
      max_donation_cents: Math.round(Number(formData.get("maxDonationDollars") || 0) * 100),
      contact_email: String(formData.get("contactEmail") || ""),
      contact_phone: String(formData.get("contactPhone") || ""),
      leaderboard_visible: formData.get("leaderboardVisible") === "on",
      recent_supporters_visible: formData.get("recentSupportersVisible") === "on",
      donor_messages_visible: formData.get("donorMessagesVisible") === "on",
      anonymous_allowed: formData.get("anonymousAllowed") === "on",
    })
    .eq("id", id);

  if (error) redirect("/admin/settings?error=save-failed");

  await logAudit(supabase, admin, "fundraiser.settings_updated", "fundraiser", id);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  redirect("/admin/settings?success=updated");
}

export async function updateSiteSettings(formData: FormData) {
  // Site-wide branding, contact info, colors, and images are Owner-only.
  const admin = await requireAdmin(["owner"]);
  const supabase = createClient();
  const fundraiserId = String(formData.get("fundraiserId") || "");

  await supabase.from("site_settings").upsert(
    {
      fundraiser_id: fundraiserId,
      team_name: String(formData.get("teamName") || ""),
      tagline: String(formData.get("tagline") || ""),
      primary_color: String(formData.get("primaryColor") || "#6B2FA0"),
      secondary_color: String(formData.get("secondaryColor") || "#1E0E30"),
      accent_color: String(formData.get("accentColor") || "#8A4FC4"),
      footer_text: String(formData.get("footerText") || ""),
      contact_email: String(formData.get("contactEmail") || "").trim(),
      contact_phone: String(formData.get("contactPhone") || "").trim(),
      facebook_url: String(formData.get("facebookUrl") || "").trim(),
      instagram_url: String(formData.get("instagramUrl") || "").trim(),
      twitter_url: String(formData.get("twitterUrl") || "").trim(),
      website_url: String(formData.get("websiteUrl") || "").trim(),
      footer_description: String(formData.get("footerDescription") || "").trim(),
      privacy_policy_url: String(formData.get("privacyPolicyUrl") || "").trim(),
      terms_url: String(formData.get("termsUrl") || "").trim(),
      copyright_text: String(formData.get("copyrightText") || "").trim(),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fundraiser_id" }
  );

  await logAudit(supabase, admin, "branding.updated", "site_settings", fundraiserId);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?success=updated");
}

// ---------------------------------------------------------------------
// Image uploads (Supabase Storage)
// ---------------------------------------------------------------------
// Fully automatic: the file goes straight into a public Storage
// bucket, the resulting public URL is written into the right column
// on site_settings (or players/sponsors) immediately, and the page is
// revalidated so the new image shows up on the live site on next
// load — no manual copying of a Storage URL into any table.

const BUCKET_FOR_TARGET: Record<string, string> = {
  logo: "branding",
  footer_logo: "branding",
  hero: "branding",
  team_photo: "branding",
  favicon: "branding",
  gallery: "gallery",
  player: "players",
  sponsor: "sponsors",
};

// These targets write to site-wide branding and are Owner-only —
// matches the `branding` storage bucket's RLS policy.
const OWNER_ONLY_TARGETS = new Set(["logo", "footer_logo", "hero", "team_photo", "favicon"]);

// Where each upload target's form lives, so a player-photo or
// sponsor-logo upload lands the admin back on that record instead of
// always bouncing to /admin/settings.
function defaultRedirectFor(target: string, relatedId: string): string {
  if (target === "player" && relatedId) return `/admin/players/${relatedId}`;
  if (target === "sponsor") return "/admin/sponsors";
  return "/admin/settings";
}

export async function uploadImage(formData: FormData) {
  const target = String(formData.get("target") || "");
  const admin = await requireAdmin(OWNER_ONLY_TARGETS.has(target) ? ["owner"] : ["owner", "manager"]);
  const supabase = createClient();

  const fundraiserId = String(formData.get("fundraiserId") || "");
  const relatedId = String(formData.get("relatedId") || ""); // player id or sponsor id, if applicable
  const file = formData.get("file") as File | null;
  const redirectTo = String(formData.get("redirectTo") || "") || defaultRedirectFor(target, relatedId);

  const bucket = BUCKET_FOR_TARGET[target];
  if (!bucket || !file || file.size === 0) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=upload-failed`);
  }

  const safeExt = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${target}/${relatedId || fundraiserId}-${Date.now()}.${safeExt}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (uploadError) {
    console.error("uploadImage: storage upload failed", uploadError);
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=upload-failed`);
  }

  // Public bucket (see docs/SUPABASE_SETUP.sql) — this URL is
  // permanent and directly usable, no signing step needed.
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  const siteSettingsColumn: Record<string, string> = {
    logo: "logo_url",
    footer_logo: "footer_logo_url",
    hero: "hero_photo_url",
    team_photo: "team_photo_url",
    favicon: "favicon_url",
  };

  let dbError: { message: string } | null = null;

  if (siteSettingsColumn[target]) {
    // Upsert (not update) so the URL is saved even if this fundraiser
    // doesn't have a site_settings row yet — a plain UPDATE would
    // silently affect zero rows and the upload would appear to
    // "succeed" without ever actually being used on the site.
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { fundraiser_id: fundraiserId, [siteSettingsColumn[target]]: publicUrl, updated_by: admin.id, updated_at: new Date().toISOString() },
        { onConflict: "fundraiser_id" }
      );
    dbError = error;
  } else if (target === "gallery") {
    const { data: settings } = await supabase.from("site_settings").select("gallery_urls").eq("fundraiser_id", fundraiserId).maybeSingle();
    const gallery = [...(settings?.gallery_urls || []), publicUrl];
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { fundraiser_id: fundraiserId, gallery_urls: gallery, updated_by: admin.id, updated_at: new Date().toISOString() },
        { onConflict: "fundraiser_id" }
      );
    dbError = error;
  } else if (target === "player" && relatedId) {
    const { error } = await supabase.from("players").update({ image_url: publicUrl }).eq("id", relatedId);
    dbError = error;
  } else if (target === "sponsor" && relatedId) {
    const { error } = await supabase.from("sponsors").update({ logo_url: publicUrl }).eq("id", relatedId);
    dbError = error;
  }

  if (dbError) {
    console.error("uploadImage: failed to save URL to database", dbError);
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=upload-save-failed`);
  }

  await logAudit(supabase, admin, "image.uploaded", target, relatedId || fundraiserId, { path, publicUrl });

  // Public pages are dynamically rendered per request (no ISR/caching
  // layer in front of them), so the new image is already "live" as
  // soon as this action returns — these revalidations are a belt-
  // and-suspenders refresh of any cached RSC payloads, not what makes
  // it show up.
  revalidatePath("/admin/settings");
  revalidatePath("/admin/players");
  revalidatePath("/admin/players/[id]", "page");
  revalidatePath("/admin/sponsors");
  revalidatePath("/", "layout");

  redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}success=updated`);
}

// ---------------------------------------------------------------------
// Donations (financial actions — owner/treasurer only)
// ---------------------------------------------------------------------

export async function markDonationRefunded(formData: FormData) {
  const admin = await requireAdmin(["owner", "treasurer"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const refunded = formData.get("refunded") === "true";

  await supabase.from("donations").update({ refunded: !refunded }).eq("id", id);
  await logAudit(supabase, admin, refunded ? "donation.refund_unmarked" : "donation.refund_marked", "donation", id);
  revalidatePath("/admin/donations");
  redirect("/admin/donations?success=updated");
}

export async function updateDonationNotes(formData: FormData) {
  const admin = await requireAdmin(["owner", "treasurer"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const adminNotes = String(formData.get("adminNotes") || "");

  await supabase.from("donations").update({ admin_notes: adminNotes }).eq("id", id);
  await logAudit(supabase, admin, "donation.notes_updated", "donation", id);
  revalidatePath("/admin/donations");
  redirect("/admin/donations?success=updated");
}

export async function deleteDonationAction(formData: FormData) {
  const admin = await requireAdmin(["owner", "treasurer"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");

  await supabase.from("donations").delete().eq("id", id);
  await logAudit(supabase, admin, "donation.deleted", "donation", id);
  revalidatePath("/admin/donations");
  revalidatePath("/");
  redirect("/admin/donations?success=deleted");
}

// ---------------------------------------------------------------------
// Administrators (owner only)
// ---------------------------------------------------------------------

export async function inviteAdministrator(formData: FormData) {
  const admin = await requireAdmin(["owner"]);

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") || "").trim();
  const role = String(formData.get("role") || "manager") as AdminRole;

  if (!email) redirect("/admin/administrators?error=missing-email");

  const serviceClient = createServiceRoleClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: invited, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/admin/reset-password`,
  });

  if (inviteError || !invited?.user) {
    redirect("/admin/administrators?error=" + encodeURIComponent(inviteError?.message || "Invite failed"));
  }

  const supabase = createClient();
  const { error: insertError } = await supabase.from("administrators").insert({
    user_id: invited.user.id,
    email,
    display_name: displayName,
    role,
    active: true,
    created_by: admin.id,
  });

  if (insertError) {
    redirect("/admin/administrators?error=" + encodeURIComponent(insertError.message));
  }

  await logAudit(supabase, admin, "administrator.invited", "administrator", invited.user.id, { email, role });
  revalidatePath("/admin/administrators");
  redirect("/admin/administrators?success=invited");
}

export async function changeAdministratorRole(formData: FormData) {
  const admin = await requireAdmin(["owner"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "") as AdminRole;

  const { data: target } = await supabase.from("administrators").select("role").eq("id", id).single();
  if (target?.role === "owner" && role !== "owner") {
    const { count } = await supabase.from("administrators").select("id", { count: "exact", head: true }).eq("role", "owner").eq("active", true);
    if ((count || 0) <= 1) {
      redirect("/admin/administrators?error=" + encodeURIComponent("You can't remove the last owner's owner role."));
    }
  }

  await supabase.from("administrators").update({ role }).eq("id", id);
  await logAudit(supabase, admin, "administrator.role_changed", "administrator", id, { role });
  revalidatePath("/admin/administrators");
  redirect("/admin/administrators?success=updated");
}

export async function toggleAdministratorActive(formData: FormData) {
  const admin = await requireAdmin(["owner"]);
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";

  const { data: target } = await supabase.from("administrators").select("role, user_id").eq("id", id).single();
  if (active && target?.role === "owner") {
    const { count } = await supabase.from("administrators").select("id", { count: "exact", head: true }).eq("role", "owner").eq("active", true);
    if ((count || 0) <= 1) {
      redirect("/admin/administrators?error=" + encodeURIComponent("You can't deactivate the last active owner."));
    }
  }
  if (target?.user_id === admin.user_id && active) {
    redirect("/admin/administrators?error=" + encodeURIComponent("You can't deactivate your own account."));
  }

  await supabase.from("administrators").update({ active: !active }).eq("id", id);
  await logAudit(supabase, admin, active ? "administrator.deactivated" : "administrator.activated", "administrator", id);
  revalidatePath("/admin/administrators");
  redirect("/admin/administrators?success=updated");
}

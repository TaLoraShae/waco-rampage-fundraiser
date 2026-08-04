import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { Administrator, AdminRole } from "./types";

// Server-only helpers for checking the current admin's identity and
// role. The middleware already blocks unauthenticated/unapproved
// visitors from reaching admin pages at all, but every page and
// Server Action re-checks here too — defense in depth, per the
// requirement to protect every admin action on the server, not just
// hide the link.

export async function getCurrentAdmin(): Promise<Administrator | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("administrators")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return (data as Administrator) || null;
}

/** Redirects to /admin/login or /admin/unauthorized if the check fails. */
export async function requireAdmin(allowedRoles?: AdminRole[]): Promise<Administrator> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (allowedRoles && !allowedRoles.includes(admin.role)) {
    redirect("/admin/unauthorized");
  }
  return admin;
}

export function roleLabel(role: AdminRole) {
  if (role === "owner") return "Owner";
  if (role === "treasurer") return "Treasurer";
  return "Manager";
}

"use server";

// The only things that still need to run on the server are the admin
// login/logout cookie handling — everything else (players, donations,
// sponsors, settings) now lives in the browser via src/lib/store.tsx,
// so it works correctly on Vercel's read-only serverless filesystem.
// See src/lib/store.tsx for all data mutations.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkDemoCredentials, ADMIN_COOKIE_NAME } from "@/lib/auth";

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

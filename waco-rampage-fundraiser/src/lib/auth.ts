import { cookies } from "next/headers";

// =====================================================================
// PROTOTYPE AUTHENTICATION — NOT PRODUCTION SECURE
// ---------------------------------------------------------------------
// This is a minimal demo login so the admin dashboard can be
// password-protected during the prototype review. It uses one
// hard-coded demo account from environment variables and a simple
// cookie flag. This is intentionally NOT a secure auth system.
//
// Before a real launch, replace this with a real auth provider
// (Supabase Auth, NextAuth, Clerk, etc.) — see docs/DEPLOYMENT.md.
// =====================================================================

const COOKIE_NAME = "rampage_admin_session";

export function checkDemoCredentials(email: string, password: string): boolean {
  const validEmail = process.env.ADMIN_DEMO_EMAIL || "admin@wacorampage.test";
  const validPassword = process.env.ADMIN_DEMO_PASSWORD || "RampageDemo2026!";
  return email.trim().toLowerCase() === validEmail.toLowerCase() && password === validPassword;
}

export function isAdminAuthed(): boolean {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "authenticated";
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

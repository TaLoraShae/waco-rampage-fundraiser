import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import this from a Client Component or expose
// SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix — doing so
// would hand out full database access to every visitor's browser.
//
// This client is used in exactly one place: inviteAdministrator() in
// src/app/admin/data-actions.ts, which is itself gated to owner-only
// via requireAdmin(['owner']) before this is ever called. Creating a
// new Supabase Auth user (so an invite email can be sent) requires
// the Admin API, which requires the service role key — there's no way
// to do this with the public anon key, by design.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) is not set. Add it in Vercel's Environment Variables — see docs/SUPABASE_ONBOARDING.md."
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

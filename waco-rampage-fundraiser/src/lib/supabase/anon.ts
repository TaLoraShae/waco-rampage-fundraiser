import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// For server-side routes that have no logged-in user and no request
// cookies to read (Stripe webhooks, the Stripe Checkout session
// creation route). Uses the public anon key only — every permission
// is still enforced by Row Level Security (docs/SUPABASE_SETUP.sql),
// exactly like a public visitor's browser. This is intentionally NOT
// the service-role client — donations, players, and fundraisers all
// already have RLS policies that allow the specific reads/writes
// these routes need without elevated privileges.
export function createAnonServerClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

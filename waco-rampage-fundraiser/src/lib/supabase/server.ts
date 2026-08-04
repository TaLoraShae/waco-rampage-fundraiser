import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for Server Components, Server Actions,
// and Route Handlers. Reads/writes the auth session via cookies, so
// every request is checked against the real logged-in user — this is
// what makes admin protection real server-side security rather than
// a client-side-only check.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render (not an action/route
            // handler) — the middleware below refreshes the session
            // instead, so this can be safely ignored.
          }
        },
      },
    }
  );
}

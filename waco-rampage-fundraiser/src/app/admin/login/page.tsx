"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { brand } from "@/lib/config";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password, or your account isn't set up yet.");
      setLoading(false);
      return;
    }

    // Full navigation (not client-side router.push) so the server and
    // middleware see the freshly-set session cookie immediately.
    window.location.href = from;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{brand.teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-6">Admin Dashboard Login</h1>

        {error && (
          <p role="alert" className="mb-4 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-rampage-charcoal mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-semibold text-rampage-charcoal">
                Password
              </label>
              <Link href="/admin/forgot-password" className="text-xs text-rampage-purple hover:underline focus-ring rounded">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3 hover:bg-rampage-purple-dark transition focus-ring disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-rampage-gray-light border border-black/10 text-rampage-charcoal text-xs p-3 leading-relaxed">
          <p>
            Administrator accounts are created by the team owner in Supabase — there's no public sign-up. If you
            don't have an account yet, ask your owner to invite you (see docs/SUPABASE_ONBOARDING.md).
          </p>
        </div>
      </div>
    </div>
  );
}

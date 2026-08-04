"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { brand } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    setLoading(false);
    if (resetError) {
      setError("Something went wrong sending the reset email. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rampage-black via-rampage-purple-deep to-rampage-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <p className="text-xs uppercase tracking-widest text-rampage-purple font-semibold mb-1">{brand.teamName}</p>
        <h1 className="font-display text-2xl text-rampage-purple-dark mb-4">Reset Your Password</h1>

        {sent ? (
          <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">
            If an account exists for that email, a password reset link has been sent. Check your inbox (and spam
            folder), then click the link to set a new password.
          </p>
        ) : (
          <>
            <p className="text-sm text-rampage-gray mb-4">
              Enter the email address for your administrator account and we&apos;ll send a link to reset your
              password.
            </p>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3 hover:bg-rampage-purple-dark transition focus-ring disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <Link href="/admin/login" className="block mt-6 text-sm text-rampage-purple hover:underline focus-ring rounded text-center">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}

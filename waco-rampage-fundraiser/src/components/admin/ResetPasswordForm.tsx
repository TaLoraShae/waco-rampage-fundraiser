"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Couldn't update your password. Your reset link may have expired — request a new one.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      window.location.href = "/admin";
    }, 1500);
  }

  if (!ready && !done) {
    return (
      <p className="text-sm text-rampage-gray">
        Verifying your reset link... if this doesn&apos;t update in a few seconds, your link may have expired —
        request a new one from the login page.
      </p>
    );
  }

  if (done) {
    return (
      <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">
        Password updated! Redirecting you to the admin dashboard...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-semibold text-rampage-charcoal mb-1">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rampage-purple"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3 hover:bg-rampage-purple-dark transition focus-ring disabled:opacity-50"
      >
        {loading ? "Saving..." : "Set New Password"}
      </button>
    </form>
  );
}

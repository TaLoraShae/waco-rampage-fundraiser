"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10; // ~20 seconds

// Polls Supabase for the donation the Stripe webhook writes
// asynchronously after a successful real payment. Once it appears,
// refreshes the page so the server component re-renders with the
// real donation data — no duplicate "thank you" UI needed here.
export default function StripeThankYouStatus({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      setGaveUp(true);
      return;
    }

    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("donations")
        .select("id")
        .eq("checkout_session_id", sessionId)
        .maybeSingle();

      if (data) {
        router.refresh();
      } else {
        setAttempts((a) => a + 1);
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [attempts, sessionId, router]);

  if (gaveUp) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/15 text-white/80 text-sm p-4">
        <p className="font-semibold text-white mb-1">Your payment was successful.</p>
        <p>
          It's taking a little longer than usual to confirm on our side. Stripe will still email you a receipt, and
          your donation will appear here and in the player's total shortly — try refreshing this page in a minute.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="h-8 w-8 rounded-full border-2 border-rampage-purple-light border-t-transparent animate-spin" />
      <p className="text-sm text-rampage-gray">Confirming your payment...</p>
    </div>
  );
}

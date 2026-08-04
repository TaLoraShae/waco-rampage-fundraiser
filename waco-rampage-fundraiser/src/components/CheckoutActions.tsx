"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { estimateFeeCents, estimateNetCents } from "@/lib/fees";

export default function CheckoutActions({
  playerId,
  fundraiserId,
  slug,
  amountCents,
  donorName,
  donorEmail,
  anonymous,
  donorMessage,
}: {
  playerId: string;
  fundraiserId: string;
  slug: string;
  amountCents: number;
  donorName: string;
  donorEmail: string;
  anonymous: boolean;
  donorMessage: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResult(result: "succeeded" | "failed" | "canceled") {
    setError(null);

    if (result === "canceled") {
      router.push(`/support/${slug}?canceled=1`);
      return;
    }

    setSubmitting(result);
    const supabase = createClient();

    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert({
        player_id: playerId,
        fundraiser_id: fundraiserId,
        gross_cents: amountCents,
        fee_cents: estimateFeeCents(amountCents),
        net_cents: estimateNetCents(amountCents),
        donor_name: anonymous ? "Anonymous" : donorName || "Anonymous",
        donor_email: donorEmail,
        donor_message: donorMessage,
        anonymous,
        status: result,
        payment_method: "mock_card",
        source: "mock",
        checkout_session_id: `mock_cs_${uuid().slice(0, 12)}`,
        payment_intent_id: `mock_pi_${uuid().slice(0, 12)}`,
      })
      .select("id")
      .single();

    setSubmitting(null);

    if (insertError || !donation) {
      setError("Something went wrong recording this donation. Please try again.");
      return;
    }

    if (result === "failed") {
      const qs = new URLSearchParams({
        result: "failed",
        amountCents: String(amountCents),
        donorName,
        donorEmail,
        anonymous: anonymous ? "1" : "",
        donorMessage,
      });
      router.push(`/checkout/${slug}?${qs.toString()}`);
      return;
    }

    router.push(`/thank-you?donationId=${donation.id}`);
  }

  return (
    <div className="space-y-3 pt-2">
      {error && (
        <p role="alert" className="rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm p-3">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={!!submitting}
        onClick={() => handleResult("succeeded")}
        className="w-full inline-flex items-center justify-center rounded bg-rampage-purple text-white font-bold uppercase tracking-wide py-3.5 hover:bg-rampage-purple-light transition focus-ring disabled:opacity-50"
      >
        {submitting === "succeeded" ? "Processing..." : "Complete Test Donation"}
      </button>
      <button
        type="button"
        disabled={!!submitting}
        onClick={() => handleResult("failed")}
        className="w-full inline-flex items-center justify-center rounded border-2 border-red-500/40 text-red-300 font-semibold py-3 hover:bg-red-950/30 transition focus-ring disabled:opacity-50"
      >
        Simulate Failed Payment
      </button>
      <button
        type="button"
        disabled={!!submitting}
        onClick={() => handleResult("canceled")}
        className="w-full inline-flex items-center justify-center rounded text-rampage-gray font-semibold py-3 hover:text-white transition focus-ring disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}

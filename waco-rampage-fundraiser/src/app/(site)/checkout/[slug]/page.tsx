"use client";

import { Suspense, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useDataStore } from "@/lib/store";
import * as sel from "@/lib/selectors";
import { formatCents } from "@/lib/fees";
import { isMockMode } from "@/lib/payment-mode";

function CheckoutContent({ params }: { params: { slug: string } }) {
  const { db, addDonation } = useDataStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const player = sel.getPlayerBySlug(db, params.slug);

  const amountCents = Math.round(Number(searchParams.get("amountCents") || 0));
  const donorName = searchParams.get("donorName") || "";
  const donorEmail = searchParams.get("donorEmail") || "";
  const anonymous = searchParams.get("anonymous") === "1" || searchParams.get("anonymous") === "on";
  const donorMessage = searchParams.get("donorMessage") || "";
  const failed = searchParams.get("result") === "failed";

  if (!player || !amountCents) {
    if (!player) notFound();
  }

  function handleResult(result: "succeeded" | "failed" | "canceled") {
    if (!player) return;
    setSubmitting(result);

    if (result === "canceled") {
      router.push(`/support/${player.slug}?canceled=1`);
      return;
    }

    const donation = addDonation({
      slug: player.slug,
      amountCents,
      donorName,
      donorEmail,
      anonymous,
      donorMessage,
      result,
    });

    if (result === "failed") {
      const qs = new URLSearchParams({
        result: "failed",
        amountCents: String(amountCents),
        donorName,
        donorEmail,
        anonymous: anonymous ? "1" : "",
        donorMessage,
      });
      router.push(`/checkout/${player.slug}?${qs.toString()}`);
      return;
    }

    if (donation) {
      router.push(`/thank-you?donationId=${donation.id}`);
    }
  }

  if (!player) return null;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <div className="bg-rampage-charcoal metal-border rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rampage-purple-deep to-rampage-black px-6 py-5">
          <p className="text-rampage-purple-light text-xs uppercase tracking-widest font-bold">Waco Rampage 14U</p>
          <h1 className="font-display text-2xl text-white">SIMULATED CHECKOUT</h1>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl bg-white/5 border border-white/15 text-white/80 text-sm p-3">
            {isMockMode()
              ? "This is a test payment. No real card information is collected and no real money will be charged."
              : "Stripe mode is enabled but this route is the mock checkout preview."}
          </div>

          {failed && (
            <div role="alert" className="rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm p-3">
              Your simulated payment failed. No charge was made. You can try again below.
            </div>
          )}

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Supporting</dt>
              <dd className="font-semibold text-white">{player.displayName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donation amount</dt>
              <dd className="font-semibold text-white">{formatCents(amountCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donor name</dt>
              <dd className="font-semibold text-white">{anonymous ? "Anonymous" : donorName || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donor email</dt>
              <dd className="font-semibold text-white">{donorEmail || "—"}</dd>
            </div>
            {donorMessage && (
              <div>
                <dt className="text-rampage-gray">Message</dt>
                <dd className="text-white italic mt-1">&ldquo;{donorMessage}&rdquo;</dd>
              </div>
            )}
          </dl>

          <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-rampage-gray">
            <p className="font-semibold text-white mb-1">Simulated payment method</p>
            <p>Card ending in •••• 4242 (mock — not a real card)</p>
          </div>

          <div className="space-y-3 pt-2">
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
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={null}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}

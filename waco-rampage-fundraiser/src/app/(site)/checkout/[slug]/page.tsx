import { notFound } from "next/navigation";
import * as db from "@/lib/db";
import { formatCents } from "@/lib/fees";
import { finalizeDonation } from "@/app/actions";
import { isMockMode } from "@/lib/payment-mode";

export default function CheckoutPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: {
    amountCents?: string;
    donorName?: string;
    donorEmail?: string;
    anonymous?: string;
    donorMessage?: string;
    result?: string;
  };
}) {
  const player = db.getPlayerBySlug(params.slug);
  if (!player) notFound();

  const amountCents = Math.round(Number(searchParams.amountCents || 0));
  const donorName = searchParams.donorName || "";
  const donorEmail = searchParams.donorEmail || "";
  const anonymous = searchParams.anonymous === "1" || searchParams.anonymous === "on";
  const donorMessage = searchParams.donorMessage || "";
  const failed = searchParams.result === "failed";

  if (!amountCents) notFound();

  const hiddenFields = { slug: player.slug, amountCents: String(amountCents), donorName, donorEmail, donorMessage };

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden">
        <div className="bg-rampage-purple-dark px-6 py-5">
          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">Waco Rampage 14U</p>
          <h1 className="font-display text-2xl text-white">Simulated Checkout</h1>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">
            {isMockMode()
              ? "This is a test payment. No real card information is collected and no real money will be charged."
              : "Stripe mode is enabled but this route is the mock checkout preview."}
          </div>

          {failed && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">
              Your simulated payment failed. No charge was made. You can try again below.
            </div>
          )}

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Supporting</dt>
              <dd className="font-semibold text-rampage-charcoal">{player.displayName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donation amount</dt>
              <dd className="font-semibold text-rampage-charcoal">{formatCents(amountCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donor name</dt>
              <dd className="font-semibold text-rampage-charcoal">{anonymous ? "Anonymous" : donorName || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rampage-gray">Donor email</dt>
              <dd className="font-semibold text-rampage-charcoal">{donorEmail || "—"}</dd>
            </div>
            {donorMessage && (
              <div>
                <dt className="text-rampage-gray">Message</dt>
                <dd className="text-rampage-charcoal italic mt-1">&ldquo;{donorMessage}&rdquo;</dd>
              </div>
            )}
          </dl>

          <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-rampage-gray">
            <p className="font-semibold text-rampage-charcoal mb-1">Simulated payment method</p>
            <p>Card ending in •••• 4242 (mock — not a real card)</p>
          </div>

          <div className="space-y-3 pt-2">
            <form action={finalizeDonation}>
              {Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {anonymous && <input type="hidden" name="anonymous" value="on" />}
              <input type="hidden" name="result" value="succeeded" />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-3.5 hover:bg-rampage-purple-dark transition focus-ring"
              >
                Complete Test Donation
              </button>
            </form>

            <form action={finalizeDonation}>
              {Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {anonymous && <input type="hidden" name="anonymous" value="on" />}
              <input type="hidden" name="result" value="failed" />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full border-2 border-red-300 text-red-600 font-semibold py-3 hover:bg-red-50 transition focus-ring"
              >
                Simulate Failed Payment
              </button>
            </form>

            <form action={finalizeDonation}>
              {Object.entries(hiddenFields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              {anonymous && <input type="hidden" name="anonymous" value="on" />}
              <input type="hidden" name="result" value="canceled" />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full text-rampage-gray font-semibold py-3 hover:text-rampage-charcoal transition focus-ring"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import * as data from "@/lib/data";
import { formatCents } from "@/lib/fees";
import { isMockMode } from "@/lib/payment-mode";
import CheckoutActions from "@/components/CheckoutActions";

export default async function CheckoutPage({
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
  // This page only ever exists for the simulated/mock donation flow —
  // real Stripe payments go through Stripe's own hosted Checkout page
  // instead (see /api/checkout/session). If PAYMENT_MODE=stripe, this
  // route has nothing valid to show, so send visitors back to the
  // player's real donate page rather than exposing simulated-checkout
  // wording on a live fundraiser.
  if (!isMockMode()) {
    redirect(`/support/${params.slug}`);
  }

  const player = await data.getPlayerBySlug(params.slug);
  if (!player) notFound();
  const settings = await data.getSiteSettings(player.fundraiser_id);
  const teamName = settings?.team_name || "Team Fundraiser";

  const amountCents = Math.round(Number(searchParams.amountCents || 0));
  const donorName = searchParams.donorName || "";
  const donorEmail = searchParams.donorEmail || "";
  const anonymous = searchParams.anonymous === "1" || searchParams.anonymous === "on";
  const donorMessage = searchParams.donorMessage || "";
  const failed = searchParams.result === "failed";

  if (!amountCents) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
      <div className="bg-rampage-charcoal metal-border rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-rampage-purple-deep to-rampage-black px-6 py-5">
          <p className="text-rampage-purple-light text-xs uppercase tracking-widest font-bold">{teamName}</p>
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
              <dd className="font-semibold text-white">{player.display_name}</dd>
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

          <CheckoutActions
            playerId={player.id}
            fundraiserId={player.fundraiser_id}
            slug={player.slug}
            amountCents={amountCents}
            donorName={donorName}
            donorEmail={donorEmail}
            anonymous={anonymous}
            donorMessage={donorMessage}
          />
        </div>
      </div>
    </div>
  );
}

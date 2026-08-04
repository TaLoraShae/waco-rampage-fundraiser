const SECTIONS = [
  {
    title: "What this website does",
    body: "This site lets the Waco Rampage 14U booster club run an online fundraiser: a team page, individual player pages with shareable links and QR codes, a donation flow, and an admin dashboard to manage players, donations, sponsors, and reports.",
  },
  {
    title: "What Mock Mode does",
    body: "While PAYMENT_MODE=mock, the entire donation flow is simulated. No real card details are collected, no money moves, and every 'payment' is created directly in the local data store so you can test the full experience risk-free.",
  },
  {
    title: "What Stripe does",
    body: "Stripe is the real payment processor. Once connected, Stripe securely collects card details, processes the charge, and tells this site (via a webhook) whether the payment succeeded. Stripe charges a standard processing fee per transaction (estimated in this prototype as 2.9% + $0.30 — confirm your actual rate on Stripe's pricing page).",
  },
  {
    title: "What Supabase would do",
    body: "Supabase would replace the local JSON file with a real hosted database (plus optional file storage for photos and authentication for admin logins), so data persists reliably in production and multiple people can manage it at once.",
  },
  {
    title: "What Vercel does",
    body: "Vercel is a hosting platform that builds and serves this Next.js site on the public internet, with automatic deployments whenever the code changes.",
  },
  {
    title: "What GitHub does",
    body: "GitHub stores the project's code and change history, and connects to Vercel so pushing a change automatically triggers a new deployment.",
  },
  {
    title: "What a domain does",
    body: "A custom domain (e.g. give.wacorampage14u.org) gives the site a memorable, branded web address instead of a default Vercel URL. It also makes QR codes and shared links look more trustworthy to donors.",
  },
];

const COSTS = [
  { item: "Vercel (Hobby plan)", type: "Free plan available", frequency: "N/A", notes: "Paid tiers exist for higher usage or team features." },
  { item: "GitHub", type: "Free plan available", frequency: "N/A", notes: "Free for public and most small private repositories." },
  { item: "Stripe account", type: "Free to create", frequency: "Per-transaction fee only", notes: "No monthly fee; a processing fee is deducted from each real donation." },
  { item: "Supabase", type: "Free plan available", frequency: "Monthly (if you outgrow the free tier)", notes: "Free tier is generous for a single-team fundraiser." },
  { item: "Custom domain", type: "Paid", frequency: "Annual, one-time renewal", notes: "Typically $10–$20/year depending on the registrar and domain extension." },
];

export default function SetupAndCostsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl text-rampage-purple-dark">Setup & Costs (Admin Only)</h1>
        <p className="text-sm text-rampage-gray mt-1">
          A plain-language explanation of every service this project touches, and what — if anything — it costs.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-black/5 shadow-card p-5">
            <p className="font-semibold text-rampage-charcoal mb-1">{s.title}</p>
            <p className="text-sm text-rampage-gray leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card p-5">
        <p className="font-semibold text-rampage-charcoal mb-3">Which costs are which</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-rampage-gray">
              <tr>
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 pr-4">Cost type</th>
                <th className="py-2 pr-4">Frequency</th>
                <th className="py-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {COSTS.map((c) => (
                <tr key={c.item} className="border-t border-black/5 align-top">
                  <td className="py-2 pr-4 font-medium text-rampage-charcoal">{c.item}</td>
                  <td className="py-2 pr-4">{c.type}</td>
                  <td className="py-2 pr-4">{c.frequency}</td>
                  <td className="py-2 pr-4 text-rampage-gray">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-rampage-gray mt-4">
          Pricing changes over time — this page intentionally avoids hard-coding dollar figures as permanent facts.
          Always confirm current pricing directly on each provider's website before making a decision.
        </p>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-5">
        <p className="font-semibold mb-1">Before accepting real donations, you must:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Get organization approval and identify the authorized account owner</li>
          <li>Create and verify a real Stripe account connected to an approved bank account</li>
          <li>Add real Stripe keys and create the Stripe webhook, then set PAYMENT_MODE=stripe</li>
          <li>Migrate from the local JSON data store to Supabase (or another real database)</li>
          <li>Replace the prototype demo login with real administrator authentication</li>
          <li>Add a complete privacy policy and collect photo permission for all players</li>
          <li>Remove the prototype banner and demo login before the public launch</li>
        </ul>
        <p className="mt-2">See <code>docs/PRODUCTION_LAUNCH_CHECKLIST.md</code> for the full checklist.</p>
      </div>
    </div>
  );
}

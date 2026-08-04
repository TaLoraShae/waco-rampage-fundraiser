# Waco Rampage 14U — Fundraiser Website (Prototype)

A complete, working prototype fundraising site for Waco Rampage 14U
Baseball: a team homepage, an individual page + shareable link + QR
code for every player, a simulated donation flow, and a full admin
dashboard — all running on mock data so you can review and test
everything before connecting real Stripe or Supabase accounts.

**No real payments are processed anywhere in this project until you
explicitly complete the steps in `docs/STRIPE_SETUP.md` and set
`PAYMENT_MODE=stripe`.**

## Quick start

Requires [Node.js](https://nodejs.org) 18.18 or newer.

```bash
cd waco-rampage
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 in your browser.

- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin/login
  - Email: `admin@wacorampage.test`
  - Password: `RampageDemo2026!`

That demo login is documented in `.env.local` and is **for prototype
review only** — see `docs/CHECKLISTS.md` before a real launch.

## Resetting sample data

The prototype stores its data in your **browser's local storage**
(not a server file), seeded automatically from `src/lib/seedData.ts`
the first time the app loads. To wipe it back to the original sample
players/donations/sponsors, open the admin dashboard and click
**Reset All Prototype Data** — or just clear this site's data in your
browser settings.

## What's included

- **Homepage** — hero, live team progress bar, countdown timer, a
  top-3 fundraising **leaderboard**, searchable player directory, fund
  usage breakdown, sponsors, photo gallery placeholders, FAQ, and a
  privacy statement.
- **13 sample players** (including the requested `DoMani G.` /
  `domani-g`), plus a "Team General Fund" for the homepage's main
  Donate button.
- **Individual player pages** at `/support/[slug]` — one dynamic route
  handles every player automatically; no per-player files needed.
  Includes preset/custom donation amounts, an anonymous option, copy
  link, native share, and a downloadable QR code.
- **Simulated checkout** at `/checkout/[slug]` — clearly labeled as a
  test payment, with buttons to simulate a successful, failed, or
  canceled payment.
- **Thank-you page** with a mock receipt number and a clear prototype
  notice.
- **Full admin dashboard** at `/admin` — summary stats, player
  management (add/edit/deactivate/delete/reorder), donation management
  (search/filter/refund-flag/delete/CSV export), sponsor management,
  fundraiser settings, reports, and a private `/admin/setup-and-costs`
  explainer page.
- **Stripe-ready architecture** — `src/lib/stripe.ts`,
  `src/app/api/checkout/session/route.ts`, and
  `src/app/api/webhooks/stripe/route.ts` are fully written but stay
  inactive until you set `PAYMENT_MODE=stripe` and add real keys.
- **Database-ready architecture** — every page/component reads and
  writes through `src/lib/store.tsx` (a browser-based data store — see
  "Resetting sample data" above) or `src/lib/selectors.ts` for reads.
  Swapping in Supabase means rewriting that data layer, not the UI. See
  `docs/SUPABASE_SCHEMA.md`.

## Editing branding and wording

Almost everything you'd want to re-brand lives in one file:

```
src/lib/config.ts
```

Team name, tagline, logo path, colors, contact info, social links,
fund-usage copy, and FAQ all live there. Fundraiser goals, dates, and
visibility toggles are editable from `/admin/settings` instead.

To replace the logo and team photos, drop your files into
`public/images/` and update the paths in `src/lib/config.ts` (defaults
point at `team-logo.png`, `hero-placeholder.jpg`, and `gallery-1.jpg`
through `gallery-6.jpg`).

## Project structure

```
src/
  app/
    (site)/            Public pages: homepage, player pages, checkout, thank-you, privacy
    admin/              Password-protected admin dashboard
    api/                 Route handlers (CSV export, future Stripe routes)
    actions.ts           Server actions: donation flow + all admin mutations
    globals.css
  components/            Shared UI components
    admin/                Admin-only form components
  lib/
    store.tsx              Client-side data store (React Context + localStorage) — the ONLY place data is mutated
    selectors.ts             Pure read helpers (getPlayers, getLeaderboard, etc.) operating on store state
    seedData.ts                Sample players/donations/sponsors, used to seed the store
    types.ts                Shared TypeScript types (mirrors the proposed Supabase schema)
    config.ts                Branding configuration
    fees.ts                    Stripe fee estimator
    payment-mode.ts             Reads PAYMENT_MODE
    stripe.ts                    Future Stripe client (inert until PAYMENT_MODE=stripe)
    qrcode.ts                     QR code generation (no external service)
    auth.ts                        Prototype admin auth
  middleware.ts            Protects /admin routes
docs/
  SUPABASE_SCHEMA.md / .sql   Proposed tables, SQL, RLS, storage, auth plan, migration steps
  STRIPE_SETUP.md               Exact steps to connect a real Stripe account
  DEPLOYMENT.md                   GitHub + Vercel + custom domain instructions
  CHECKLISTS.md                    Prototype review checklist + production launch checklist
  SIMULATED_VS_REAL.md               What's fake right now vs. what's already real
```

## Deploying

See `docs/DEPLOYMENT.md` for GitHub upload, Vercel deployment, and
custom domain instructions — no paid services are required to deploy
and review the prototype.

## Going live with real payments later

1. `docs/STRIPE_SETUP.md` — connect a real Stripe account
2. `docs/SUPABASE_SCHEMA.md` — migrate off browser-only storage
3. `docs/CHECKLISTS.md` — full production launch checklist
4. Set `PAYMENT_MODE=stripe` and redeploy — the prototype banner
   disappears automatically and the real Stripe Checkout flow takes
   over.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · `qrcode` for QR
generation · `uuid` for IDs · `stripe` SDK (ready, inactive until
configured) · browser-based (localStorage) storage with a documented
reset process (swap-ready for Supabase).

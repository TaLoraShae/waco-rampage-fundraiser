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

There's no demo login anymore — every administrator account is real
(Supabase Auth). Before the admin dashboard will work, complete the
setup in `docs/SUPABASE_ONBOARDING.md`, which walks through creating
your Supabase project, running the schema, adding environment
variables, and creating your first **owner** account.

## Data storage

This site's data — players, donations, sponsors, site wording, and
images — is stored permanently in **Supabase** (a real Postgres
database), not in browser storage or on the server filesystem. That
means it's safe to deploy on Vercel, shared across every admin and
device, and survives redeploys. See `docs/SUPABASE_ONBOARDING.md` for
the full setup walkthrough — you'll need to complete that before the
site will run, since it requires Supabase environment variables.

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
  writes through `src/lib/data.ts` / `src/lib/adminData.ts` (reads) and
  `src/app/admin/data-actions.ts` (writes) — every permission is
  enforced by Supabase Row Level Security, not just app code. See
  `docs/SUPABASE_SETUP.sql`.

## Editing branding, contact info, and wording

Nothing is hard-coded. Everything editable lives in Supabase and can
be changed directly in **Supabase → Table Editor** — no code changes,
no redeploy:

- **Branding, contact info, colors, images** → `site_settings` table
- **Homepage/player-page wording, headings, buttons, FAQ, fund-usage
  copy, privacy statement** → `site_content` table (matched by
  `section` + `key`)
- **Fundraiser goal, dates, donation limits** → `fundraisers` table

See `docs/CONTENT_FIELD_MAP.md` for the exact table/column/key that
controls every item on the public site, and
`docs/SUPABASE_MIGRATION_CONTENT.sql` for the safe, additive-only
migration that adds the `site_content` rows above (if you haven't run
it yet).

Logos, hero photos, team photos, and gallery images upload through
Admin → Settings into Supabase Storage; everything else is edited
straight in the Table Editor.

## Project structure

```
src/
  app/
    (site)/            Public pages: homepage, player pages, checkout, thank-you, privacy
    admin/              Real Supabase Auth admin dashboard (owner/treasurer/manager roles)
    api/                 checkout/session (Stripe Checkout) + stripe-webhook (live payment recording)
    globals.css
  components/            Shared UI components
    admin/                Admin-only form components
  lib/
    supabase/               Browser/server/middleware/anon Supabase clients
    data.ts                   Public/shared reads (RLS-aware — safe for both visitors and admins)
    adminData.ts                Admin-only reads (financial donations view, administrators, audit log)
    adminAuth.ts                  requireAdmin()/getCurrentAdmin() — server-side role checks
    auditLog.ts                     Writes to the audit_logs table
    types.ts                    Shared TypeScript types (mirrors docs/SUPABASE_SETUP.sql column-for-column)
    fees.ts                       Stripe fee estimator
    payment-mode.ts                 Reads PAYMENT_MODE
    stripe.ts                         Stripe client used by checkout/session and stripe-webhook
    qrcode.ts                           QR code generation (no external service)
    csv.ts                                Client-side CSV export for donation reports
  middleware.ts            Protects /admin routes: checks Supabase session AND administrators table
docs/
  SUPABASE_SETUP.sql            Full schema: tables, RLS policies, storage buckets, seed data
  SUPABASE_ONBOARDING.md          Click-by-click Supabase setup, env vars, first owner account, invites
  GITHUB_REPLACE_INSTRUCTIONS.md    Browser-only steps to update your GitHub repo so Vercel redeploys
  STRIPE_SETUP.md                     Exact steps to connect a real Stripe account (not yet connected)
  DEPLOYMENT.md                         GitHub + Vercel + custom domain instructions
  CHECKLISTS.md                           Prototype review checklist + production launch checklist
  SIMULATED_VS_REAL.md                      What's fake right now vs. what's already real
```

## Deploying

See `docs/DEPLOYMENT.md` for GitHub upload, Vercel deployment, and
custom domain instructions — no paid services are required to deploy
and review the prototype.

## Going live with real payments later

1. `docs/STRIPE_SETUP.md` — connect a real Stripe account
2. `docs/CHECKLISTS.md` — full production launch checklist
4. Set `PAYMENT_MODE=stripe` and redeploy — the prototype banner
   disappears automatically and the real Stripe Checkout flow takes
   over.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · `qrcode` for QR
generation · `uuid` for IDs · `stripe` SDK (ready, inactive until
configured) · Supabase (Postgres, Auth, Storage) with Row Level
Security for every table.

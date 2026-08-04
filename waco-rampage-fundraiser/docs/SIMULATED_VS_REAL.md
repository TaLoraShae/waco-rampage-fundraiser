# What's Simulated Right Now vs. What's Real

## Currently simulated (safe to click through freely)

- All donations — no real card data is collected, no money moves
- The "card ending in 4242" shown at checkout
- Payment success, failure, and cancellation outcomes (you choose which one)
- Mock transaction IDs, checkout session IDs, and payment intent IDs
- The receipt number on the thank-you page
- Stripe processing fees (calculated as an estimate: 2.9% + $0.30)

## Already real (Supabase-backed)

- Administrator login (real Supabase Auth, per-person accounts, no shared demo password)
- Owner/Treasurer/Manager roles enforced server-side and via Row Level Security
- Player, donation, sponsor, wording, and settings data (permanent Postgres database)
- Image uploads (Supabase Storage)
- Audit log of administrator actions

## Already real / production-ready

- The full page layouts, branding, and copy
- The player directory, search, and individual player pages
- QR code generation (generated locally, not from a paid third-party service)
- The donation record data model (matches the proposed Supabase schema)
- The admin dashboard's structure, filters, and CSV export
- The Stripe integration *code* (routes and webhook handler exist and are
  correctly structured — they simply don't run unless `PAYMENT_MODE=stripe`
  and real keys are present)

## Must happen before real payments are accepted

See `docs/CHECKLISTS.md` → "Production Launch Checklist" for the full
list. In short: a verified Stripe account, a migration to Supabase (or
another persistent database), real administrator authentication, a
privacy policy, photo consent, and `PAYMENT_MODE=stripe`.

# What's Simulated Right Now vs. What's Real

## Currently simulated (safe to click through freely)

- All donations — no real card data is collected, no money moves
- The "card ending in 4242" shown at checkout
- Payment success, failure, and cancellation outcomes (you choose which one)
- Mock transaction IDs, checkout session IDs, and payment intent IDs
- The receipt number on the thank-you page
- Stripe processing fees (calculated as an estimate: 2.9% + $0.30)
- The admin login (a single shared demo password, not real per-user auth)
- Data storage (kept in your browser's local storage — reset anytime from the admin dashboard's "Reset All Prototype Data" button, or by clearing site data)

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

# Prototype Review Checklist

Use this while reviewing the prototype locally, before anything is
connected to real money.

- [ ] Review the homepage layout and branding
- [ ] Review the purple/white/charcoal color scheme
- [ ] Replace the logo placeholder (`public/images/team-logo.png`, path set in `src/lib/config.ts`)
- [ ] Replace team/gallery photo placeholders
- [ ] Review an individual player page
- [ ] Test a player's custom link (`/support/[slug]`)
- [ ] Test a player's QR code (view + download)
- [ ] Test a mock donation: succeeded, failed, and canceled
- [ ] Review the admin dashboard summary
- [ ] Review admin reports and CSV export
- [ ] Approve or edit the fundraiser wording (`src/lib/config.ts`, `/admin/settings`)

Reset test data any time from the admin dashboard: open **Admin →
Dashboard** and click **Reset All Prototype Data**, or clear this
site's data in your browser settings.

---

# Production Launch Checklist

Complete all of these before accepting a single real donation.

- [ ] Receive organization approval to launch the fundraiser
- [ ] Identify the authorized account owner (Stripe account holder)
- [ ] Confirm the approved bank account for payouts
- [ ] Create and verify a real Stripe account
- [ ] Create a Supabase project and migrate off browser-only storage
- [ ] Set up real administrator authentication (replace the demo login)
- [ ] Add a complete privacy policy
- [ ] Collect photo permission for every player pictured
- [ ] Add the real roster (names, goals, messages, real photos)
- [ ] Set real team and player fundraising goals
- [ ] Add Stripe live keys to production environment variables
- [ ] Create the Stripe webhook pointed at your production domain
- [ ] Purchase or connect your custom domain
- [ ] Set `PAYMENT_MODE=stripe` and redeploy
- [ ] Complete one small, controlled live donation yourself
- [ ] Confirm the payment appears in the Stripe Dashboard
- [ ] Confirm the donation appears correctly in the admin dashboard
- [ ] Confirm the player's total updates correctly
- [ ] Confirm the team total updates correctly
- [ ] Confirm your Stripe payout schedule/settings are correct
- [ ] Remove the "Prototype Mode" banner (automatic once `PAYMENT_MODE=stripe`)
- [ ] Remove/replace the demo admin login credentials
- [ ] Launch publicly

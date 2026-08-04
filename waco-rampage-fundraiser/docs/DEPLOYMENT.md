# Deployment Guide

## 1. Upload the project to GitHub

```bash
cd waco-rampage
git init
git add .
git commit -m "Initial Waco Rampage 14U fundraiser prototype"
```

1. Create a new empty repository on https://github.com/new (do not
   initialize it with a README).
2. Connect and push:

```bash
git remote add origin https://github.com/YOUR_ORG/waco-rampage-fundraiser.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repository.
2. Framework preset: Vercel auto-detects **Next.js** — no changes needed.
3. Add environment variables (Project → Settings → Environment
   Variables) — at minimum:

   ```env
   PAYMENT_MODE=mock
   NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

   See `docs/SUPABASE_ONBOARDING.md` for exactly where to find each of
   the three Supabase values and how to add them in Vercel's UI.

4. Click **Deploy**.

### Storage — now backed by Supabase

This site's data (players, donations, sponsors, site wording, images)
lives permanently in your Supabase project, not in browser storage or
on the server filesystem. That means it's safe to deploy on Vercel's
serverless infrastructure, and every admin/device/browser sees the
same shared data. See `docs/SUPABASE_ONBOARDING.md` for the full setup
walkthrough (creating your project, running the schema, adding
environment variables, and creating your first owner account) — do
that **before** deploying, since the site needs those Supabase
environment variables to build and run correctly.

## 3. Connect a custom domain

1. Purchase a domain from any registrar (Namecheap, Google Domains,
   GoDaddy, etc.) if you don't already have one.
2. In Vercel: Project → Settings → Domains → Add your domain.
3. Add the DNS records Vercel gives you at your registrar (usually one
   `A` record and one `CNAME` record, or Vercel-managed nameservers).
4. Once DNS propagates (a few minutes to a few hours), update
   `NEXT_PUBLIC_SITE_URL` to your real domain and redeploy — this keeps
   every player's QR code pointing at the correct URL automatically.
5. Add your new domain to Supabase's allowed redirect URLs (Supabase
   dashboard → Authentication → URL Configuration) so password-reset
   and invite emails link back to the right place. See
   `docs/SUPABASE_ONBOARDING.md`.

## 4. Production launch checklist

See `docs/CHECKLISTS.md` for the full pre-launch list, and
`docs/STRIPE_SETUP.md` for connecting real payments.

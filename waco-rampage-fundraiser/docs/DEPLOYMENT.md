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
   ADMIN_DEMO_EMAIL=admin@wacorampage.test
   ADMIN_DEMO_PASSWORD=RampageDemo2026!
   ```

4. Click **Deploy**.

### Important: storage on Vercel

This prototype's storage layer (`src/lib/db.ts`) writes to a local
JSON file. That works well in local development (`npm run dev`) and on
a traditional always-on server, but **Vercel's filesystem is read-only
in production**, so admin changes won't persist between requests once
deployed there.

For a deployed *review* environment, this is usually fine — the site
still fully renders and the mock checkout flow still works within a
single request lifecycle. For a deployed environment where you want
admin edits to actually persist, migrate to Supabase first (see
`docs/SUPABASE_SCHEMA.md`) — no UI changes are required, only `db.ts`.

## 3. Connect a custom domain

1. Purchase a domain from any registrar (Namecheap, Google Domains,
   GoDaddy, etc.) if you don't already have one.
2. In Vercel: Project → Settings → Domains → Add your domain.
3. Add the DNS records Vercel gives you at your registrar (usually one
   `A` record and one `CNAME` record, or Vercel-managed nameservers).
4. Once DNS propagates (a few minutes to a few hours), update
   `NEXT_PUBLIC_SITE_URL` to your real domain and redeploy — this keeps
   every player's QR code pointing at the correct URL automatically.

## 4. Production launch checklist

See `docs/PRODUCTION_LAUNCH_CHECKLIST.md` for the full pre-launch list,
and `docs/STRIPE_SETUP.md` for connecting real payments.

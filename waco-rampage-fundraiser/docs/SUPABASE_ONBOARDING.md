# Supabase Onboarding — Exact, Click-by-Click Instructions

This walks through everything needed to connect this site to a real
Supabase database: creating the project, running the schema, getting
your API keys, adding them to Vercel, creating your first owner
account, inviting your treasurer and manager, and testing that it all
works. Everything happens in your browser — no software installs.

---

## 1. Create your Supabase project

1. Go to **supabase.com** and click **Start your project**.
2. Sign in (GitHub sign-in is the fastest option).
3. Click **New project**.
4. Choose an organization (or create one — any name is fine).
5. Fill in:
   - **Name**: `waco-rampage-fundraiser` (or anything you like)
   - **Database Password**: click "Generate a password" and **save it
     somewhere safe** (a password manager or a note). You likely won't
     need it directly, but keep it.
   - **Region**: choose the one closest to Waco, TX (e.g. "US East")
6. Click **Create new project**. Wait 1–2 minutes while Supabase sets
   it up.

---

## 2. Run the database schema

1. In your new Supabase project, click **SQL Editor** in the left
   sidebar.
2. Click **New query**.
3. Open `docs/SUPABASE_SETUP.sql` from this project (in GitHub, or on
   your computer after unzipping) and copy its **entire contents**.
4. Paste the whole thing into the Supabase SQL Editor.
5. Click **Run** (bottom right, or `Cmd/Ctrl + Enter`).
6. You should see "Success. No rows returned" (this is expected — the
   script creates tables and policies, and only the seed data section
   at the bottom actually inserts rows).

This one script creates every table, security policy, and storage
bucket the site needs, and loads the same sample players/donations you
saw in the prototype.

---

## 3. Find your three Supabase values

You need three values from Supabase to connect the site:

1. In your Supabase project, click the **gear icon (Settings)** in the
   bottom of the left sidebar, then click **API**.
2. You'll see:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → this is your
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → `service_role`** (click "Reveal" to see it)
     → this is your `SUPABASE_SERVICE_ROLE_KEY`

> **Important:** the `service_role` key has full access to your
> database and bypasses all security rules. Never share it, never put
> it in code that runs in the browser, and only ever paste it into
> Vercel's environment variables (server-only) as described below.

---

## 4. Add the values to Vercel

1. Go to **vercel.com** and open your project.
2. Click **Settings** → **Environment Variables**.
3. Add each of the following one at a time (name, then value, then
   click **Save**):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL from Step 3 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `anon` `public` key from Step 3 |
   | `SUPABASE_SERVICE_ROLE_KEY` | your `service_role` key from Step 3 |
   | `PAYMENT_MODE` | `mock` |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel site's URL, e.g. `https://waco-rampage.vercel.app` |

4. After adding all five, go to the **Deployments** tab, click the
   **"..."** menu on the most recent deployment, and choose
   **Redeploy** so the new environment variables take effect.

---

## 5. Set your redirect URLs in Supabase

This step makes sure password-reset and invite emails send people back
to the right page instead of erroring out.

1. In Supabase, click **Authentication** in the left sidebar, then
   **URL Configuration**.
2. Set **Site URL** to your Vercel site's URL, e.g.
   `https://waco-rampage.vercel.app`.
3. Under **Redirect URLs**, click **Add URL** and add:
   - `https://waco-rampage.vercel.app/admin/reset-password`
   - `http://localhost:3000/admin/reset-password` (only needed if you
     ever run the site locally)
4. Click **Save**.

If you later connect a custom domain, come back here and add
`https://yourdomain.com/admin/reset-password` too (and update the Site
URL).

---

## 6. Turn off public sign-ups (should be off by default, but verify)

1. Still in **Authentication**, click **Providers**.
2. Confirm **Email** is enabled (it should be, by default).
3. Click **Authentication → Policies** or the **Settings** tab within
   Authentication and confirm there's no public "Allow new users to
   sign up" self-registration path exposed — this app never links to
   one, but it's worth a quick look. Every administrator account in
   this app is created only through the **Invite** flow described
   below (Step 8), which is separate from public sign-up.

---

## 7. Create the first OWNER account

Because there's no public sign-up, your very first administrator has
to be created directly in Supabase.

1. In Supabase, click **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter your email address and a temporary password (you can change
   it later via "Forgot password" on the login page).
4. Leave "Auto Confirm User" turned **on** so you don't have to click
   an email confirmation link.
5. Click **Create user**. Copy the new user's **User UID** (it's shown
   in the users list — click the user to see it, or copy it from the
   table).
6. Click **SQL Editor** → **New query** and run this, replacing the
   two placeholders with your real email and the User UID you just
   copied:

   ```sql
   insert into administrators (user_id, email, display_name, role, active)
   values ('PASTE-THE-USER-UID-HERE', 'you@example.com', 'Your Name', 'owner', true);
   ```

7. Click **Run**.
8. Go to your live site's `/admin/login` page and log in with the
   email and password from step 3. You should land on the admin
   dashboard with full Owner access.

---

## 8. Invite your Treasurer and Manager

Once you're logged in as the owner:

1. Go to **Admin → Administrators** in the sidebar.
2. Under "Invite Administrator," enter their email, their name, and
   pick a role (**Treasurer** or **Manager**).
3. Click **Send Invite**.
4. Supabase sends them an email with a secure link. When they click
   it, they'll land on the **Set a New Password** page, choose a
   password, and they're in — no separate account creation step needed
   on their end.

If the invite email doesn't arrive:
- Check their spam folder first.
- Confirm Step 5 (redirect URLs) and Step 4 (Vercel environment
  variables, especially `SUPABASE_SERVICE_ROLE_KEY`) are both correct.
- In Supabase, **Authentication → Users** will still show the invited
  user even if the email didn't arrive — you can resend by removing
  the user there and inviting again from the app.

---

## 9. Password-reset configuration (already set up)

Password reset uses the same redirect URL you configured in Step 5.
To test it:

1. From `/admin/login`, click **Forgot password?**
2. Enter an administrator's email and submit.
3. Check that inbox for an email from Supabase with a reset link.
4. Clicking the link opens `/admin/reset-password` already logged into
   a temporary "recovery" session, where a new password can be set.

No further configuration is needed — this works automatically once
Step 5's redirect URLs are saved.

---

## 10. Testing checklist

Work through this after completing every step above.

**Public site**
- [ ] Homepage loads and shows the real fundraiser title/description
- [ ] Player directory shows all sample players
- [ ] An individual player page loads at `/support/domani-g`
- [ ] A mock donation completes successfully and updates the player's
      and team's totals
- [ ] A "Simulate Failed Payment" donation does **not** change totals
- [ ] A "Cancel" click returns to the player page without changing totals
- [ ] The thank-you page shows a mock receipt number

**Admin — Owner**
- [ ] Can log in at `/admin/login`
- [ ] Dashboard shows fee/net figures (Owner sees financial data)
- [ ] Can add, edit, deactivate, and delete a test player
- [ ] Can add and remove a sponsor
- [ ] Can edit homepage wording under Site Wording and see it change
      on the live homepage
- [ ] Can edit the team goal/dates under Fundraiser Settings
- [ ] Can upload a logo, hero photo, and a gallery photo
- [ ] Can view Donations, mark one refunded, and export a CSV
- [ ] Can view the Audit Log and see entries for the actions above
- [ ] Can invite a Treasurer and a Manager (Step 8)

**Admin — Treasurer** (log in as the invited treasurer account)
- [ ] Can view Donations and Reports with full financial detail
- [ ] **Cannot** see Players/Sponsors/Settings/Site Wording pages
      (should redirect to "Access Not Approved" or be hidden from nav)
- [ ] **Cannot** see the Administrators or Audit Log pages

**Admin — Manager** (log in as the invited manager account)
- [ ] Can edit Players, Sponsors, Site Wording, and Fundraiser Settings
- [ ] Can upload images
- [ ] **Cannot** see donor emails, fees, or net proceeds anywhere
- [ ] **Cannot** see the Donations, Reports, Administrators, or Audit
      Log pages

**Security**
- [ ] Visiting `/admin` while logged out redirects to `/admin/login`
- [ ] Logging out and clicking the browser "back" button does **not**
      show admin pages
- [ ] A logged-in but not-yet-approved Supabase user (if you test one)
      lands on `/admin/unauthorized`, not the dashboard

If every box above is checked, the Supabase integration is working
correctly end to end.

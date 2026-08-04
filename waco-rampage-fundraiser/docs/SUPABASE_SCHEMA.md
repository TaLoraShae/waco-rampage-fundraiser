# Proposed Supabase Schema

This is the proposed database schema for migrating off the prototype's
browser-based (localStorage) storage. It mirrors the shape already
used in `src/lib/types.ts`, so the migration mainly means rewriting
`src/lib/store.tsx` (and/or replacing it with server-fetched data plus
Supabase client calls) instead of the filesystem — no page or
component needs to change its JSX, only where the data comes from.

Run this in the Supabase SQL editor after creating a new project.

```sql
-- =====================================================================
-- EXTENSIONS
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- TEAMS
-- =====================================================================
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- FUNDRAISERS
-- =====================================================================
create table fundraisers (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null,
  description text not null default '',
  team_goal_cents integer not null default 0,
  player_default_goal_cents integer not null default 0,
  start_date timestamptz not null,
  end_date timestamptz not null,
  min_donation_cents integer not null default 500,
  max_donation_cents integer not null default 500000,
  suggested_amounts_cents integer[] not null default '{2500,5000,10000}',
  leaderboard_visible boolean not null default true,
  recent_supporters_visible boolean not null default true,
  donor_messages_visible boolean not null default true,
  anonymous_allowed boolean not null default true,
  contact_email text,
  contact_phone text,
  social jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- PLAYERS
-- =====================================================================
create table players (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references fundraisers(id) on delete cascade,
  slug text not null,
  display_name text not null,
  image_url text,
  goal_cents integer not null default 0,
  message text not null default '',
  active boolean not null default true,
  display_order integer not null default 0,
  is_general_fund boolean not null default false,
  created_at timestamptz not null default now(),
  constraint players_slug_unique unique (fundraiser_id, slug)
);

create index players_fundraiser_id_idx on players (fundraiser_id);
create index players_slug_idx on players (slug);

-- =====================================================================
-- DONATIONS
-- =====================================================================
create table donations (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete restrict,
  fundraiser_id uuid not null references fundraisers(id) on delete restrict,
  gross_cents integer not null,
  fee_cents integer not null default 0,
  net_cents integer not null default 0,
  donor_name text not null default 'Anonymous',
  donor_email text,
  donor_message text,
  anonymous boolean not null default false,
  status text not null check (status in ('succeeded', 'failed', 'canceled')),
  payment_method text,
  source text not null check (source in ('mock', 'stripe')),
  checkout_session_id text,
  payment_intent_id text,
  refunded boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  constraint donations_checkout_session_unique unique (checkout_session_id)
);

create index donations_player_id_idx on donations (player_id);
create index donations_fundraiser_id_idx on donations (fundraiser_id);
create index donations_status_idx on donations (status);
create index donations_created_at_idx on donations (created_at desc);

-- =====================================================================
-- SPONSORS
-- =====================================================================
create table sponsors (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references fundraisers(id) on delete cascade,
  name text not null,
  logo_url text,
  website text,
  level text not null check (level in ('Gold', 'Silver', 'Bronze', 'Community')),
  display_order integer not null default 0
);

create index sponsors_fundraiser_id_idx on sponsors (fundraiser_id);

-- =====================================================================
-- ADMINISTRATORS
-- (Prefer Supabase Auth for real login; this table is only for
-- role/permission bookkeeping once Supabase Auth is wired up.)
-- =====================================================================
create table administrators (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'treasurer', 'viewer')),
  created_at timestamptz not null default now(),
  constraint administrators_auth_user_unique unique (auth_user_id)
);

-- =====================================================================
-- ROW LEVEL SECURITY (recommended starting point)
-- =====================================================================
alter table players enable row level security;
alter table donations enable row level security;
alter table sponsors enable row level security;
alter table fundraisers enable row level security;
alter table administrators enable row level security;

-- Public (anon) read access to active players and fundraiser-safe fields.
create policy "Public can read active players"
  on players for select
  using (active = true);

create policy "Public can read fundraisers"
  on fundraisers for select
  using (true);

create policy "Public can read sponsors"
  on sponsors for select
  using (true);

-- Public can INSERT a donation (via a server route using the service
-- role key is strongly preferred instead — see note below).
-- If you do allow anon insert directly, restrict columns tightly and
-- validate amounts server-side with a Postgres function or trigger.

-- Only authenticated administrators can read/write full donation records,
-- including donor email and admin notes.
create policy "Admins can manage donations"
  on donations for all
  using (
    exists (
      select 1 from administrators a
      where a.auth_user_id = auth.uid()
    )
  );

create policy "Admins can manage players"
  on players for all
  using (
    exists (
      select 1 from administrators a
      where a.auth_user_id = auth.uid()
    )
  );

create policy "Admins can manage sponsors"
  on sponsors for all
  using (
    exists (
      select 1 from administrators a
      where a.auth_user_id = auth.uid()
    )
  );

create policy "Admins can manage fundraisers"
  on fundraisers for all
  using (
    exists (
      select 1 from administrators a
      where a.auth_user_id = auth.uid()
    )
  );

create policy "Admins can view their own admin row"
  on administrators for select
  using (auth_user_id = auth.uid());
```

## Storage buckets

Create two buckets in Supabase Storage:

| Bucket | Purpose | Public? |
| --- | --- | --- |
| `player-photos` | Player headshots uploaded by admins | Public read, admin-only write |
| `team-branding` | Logo, hero image, gallery photos, sponsor logos | Public read, admin-only write |

## Authentication plan

1. Enable Supabase Auth (email/password, or magic link) for the project.
2. Create one auth user per real administrator (booster club officers, treasurer).
3. Insert a matching row in `administrators` for each user, linked via `auth_user_id`.
4. Replace `src/lib/auth.ts` and `src/middleware.ts` with Supabase Auth's
   session helpers (`@supabase/ssr`), and remove the demo credential check.

## Migration steps from browser storage

1. Create the Supabase project and run the SQL above.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` to your environment.
3. Install `@supabase/supabase-js` (and `@supabase/ssr` for auth).
4. Replace `src/lib/store.tsx`'s localStorage read/writes with Supabase
   queries — either keep a thin client-side context that fetches from
   Supabase on mount and calls Supabase on each mutation, or convert
   the data-dependent pages to Server Components that fetch via
   Supabase directly and use Server Actions for mutations (more robust
   for a real multi-admin deployment). Keep the same field names from
   `src/lib/types.ts` and the same selector function signatures in
   `src/lib/selectors.ts` so page components don't need rewrites.
5. Run the seed script below once to load your real roster.
6. `src/lib/seedData.ts` (used only for the prototype's initial/reset
   state) can be deleted or left in place — it's unused once real data
   comes from Supabase.

## Seed script for the sample players (adapt for your real roster)

```sql
insert into teams (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Waco Rampage 14U');

insert into fundraisers (id, team_id, title, description, team_goal_cents, player_default_goal_cents, start_date, end_date)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '2026 Spring Tournament Fund',
  'Help send the Waco Rampage 14U squad to Regionals.',
  2000000, 60000, now(), now() + interval '45 days'
);

insert into players (fundraiser_id, slug, display_name, goal_cents, message, display_order)
values
  ('00000000-0000-0000-0000-000000000002', 'domani-g', 'DoMani G.', 80000, 'Thank you for your support!', 1),
  ('00000000-0000-0000-0000-000000000002', 'carter-b', 'Carter B.', 60000, 'Thank you for your support!', 2);
  -- ...repeat for the rest of the roster
```

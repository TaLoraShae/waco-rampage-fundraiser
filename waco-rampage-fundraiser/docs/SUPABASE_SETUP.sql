-- =====================================================================
-- WACO RAMPAGE 14U — SUPABASE SETUP
-- =====================================================================
-- Run this entire file once in your Supabase project's SQL Editor.
-- It creates every table, security policy, and storage bucket this
-- app needs. Safe to run top-to-bottom in a single paste.
--
-- After running this, see docs/SUPABASE_ONBOARDING.md for exact
-- click-by-click instructions (getting your API keys, creating your
-- first owner account, inviting other admins, redirect URLs, etc).
-- =====================================================================

create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. CORE TABLES
-- =====================================================================

create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists fundraisers (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  team_goal_cents integer not null default 0,
  player_default_goal_cents integer not null default 0,
  start_date timestamptz not null default now(),
  end_date timestamptz not null default now() + interval '45 days',
  min_donation_cents integer not null default 500,
  max_donation_cents integer not null default 500000,
  suggested_amounts_cents integer[] not null default '{2500,5000,10000}',
  leaderboard_visible boolean not null default true,
  recent_supporters_visible boolean not null default true,
  donor_messages_visible boolean not null default true,
  anonymous_allowed boolean not null default true,
  contact_email text not null default '',
  contact_phone text not null default '',
  social jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references fundraisers(id) on delete cascade,
  slug text not null,
  display_name text not null,
  image_url text not null default '',
  goal_cents integer not null default 0,
  message text not null default '',
  active boolean not null default true,
  display_order integer not null default 0,
  is_general_fund boolean not null default false,
  created_at timestamptz not null default now(),
  constraint players_slug_unique unique (fundraiser_id, slug)
);

create index if not exists players_fundraiser_id_idx on players (fundraiser_id);
create index if not exists players_slug_idx on players (slug);

create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete restrict,
  fundraiser_id uuid not null references fundraisers(id) on delete restrict,
  gross_cents integer not null check (gross_cents > 0),
  fee_cents integer not null default 0,
  net_cents integer not null default 0,
  donor_name text not null default 'Anonymous',
  donor_email text not null default '',
  donor_message text not null default '',
  anonymous boolean not null default false,
  status text not null check (status in ('succeeded', 'failed', 'canceled')),
  payment_method text not null default 'mock_card',
  source text not null check (source in ('mock', 'stripe')) default 'mock',
  checkout_session_id text not null,
  payment_intent_id text not null default '',
  refunded boolean not null default false,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  constraint donations_checkout_session_unique unique (checkout_session_id)
);

create index if not exists donations_player_id_idx on donations (player_id);
create index if not exists donations_fundraiser_id_idx on donations (fundraiser_id);
create index if not exists donations_status_idx on donations (status);
create index if not exists donations_created_at_idx on donations (created_at desc);

create table if not exists sponsors (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references fundraisers(id) on delete cascade,
  name text not null,
  logo_url text not null default '',
  website text not null default '',
  level text not null check (level in ('Gold', 'Silver', 'Bronze', 'Community')) default 'Community',
  display_order integer not null default 0
);

create index if not exists sponsors_fundraiser_id_idx on sponsors (fundraiser_id);

-- Flexible key/value editable wording: homepage headline, sub-headline,
-- button labels, FAQ entries, fund-usage blurbs, privacy statement, etc.
-- `section` groups related keys (e.g. 'hero', 'faq', 'fund_usage').
create table if not exists site_content (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references fundraisers(id) on delete cascade,
  section text not null,
  key text not null,
  value text not null default '',
  display_order integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint site_content_unique unique (fundraiser_id, section, key)
);

-- Branding / basic visual settings, separate from the numeric fundraiser
-- fields above.
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null unique references fundraisers(id) on delete cascade,
  team_name text not null default 'Waco Rampage 14U',
  tagline text not null default '',
  logo_url text not null default '',
  hero_photo_url text not null default '',
  gallery_urls text[] not null default '{}',
  primary_color text not null default '#6B2FA0',
  secondary_color text not null default '#1E0E30',
  footer_text text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- =====================================================================
-- 2. ADMINISTRATORS (connected to Supabase Auth)
-- =====================================================================

create table if not exists administrators (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null check (role in ('owner', 'treasurer', 'manager')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references administrators(id)
);

create index if not exists administrators_user_id_idx on administrators (user_id);

-- =====================================================================
-- 3. AUDIT LOG
-- =====================================================================

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_administrator_id uuid references administrators(id),
  actor_email text not null default '',
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);

-- =====================================================================
-- 4. SECURITY-DEFINER HELPER FUNCTIONS
-- ---------------------------------------------------------------------
-- SECURITY DEFINER lets these functions read the administrators table
-- to answer "is this user an admin / what's their role" WITHOUT
-- triggering the administrators table's own RLS policies recursively.
-- This is the standard, recommended Supabase pattern for role checks.
-- =====================================================================

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from administrators a
    where a.user_id = auth.uid() and a.active = true
  );
$$;

create or replace function public.has_role(required_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from administrators a
    where a.user_id = auth.uid()
      and a.active = true
      and a.role = any(required_roles)
  );
$$;

create or replace function public.current_admin_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select a.id from administrators a
  where a.user_id = auth.uid() and a.active = true
  limit 1;
$$;

-- =====================================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================================

alter table teams enable row level security;
alter table fundraisers enable row level security;
alter table players enable row level security;
alter table donations enable row level security;
alter table sponsors enable row level security;
alter table site_content enable row level security;
alter table site_settings enable row level security;
alter table administrators enable row level security;
alter table audit_logs enable row level security;

-- ---- teams: public read, owner/manager write ----
drop policy if exists teams_public_select on teams;
create policy teams_public_select on teams for select using (true);

drop policy if exists teams_admin_write on teams;
create policy teams_admin_write on teams for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ---- fundraisers: public read active, owner/manager write ----
drop policy if exists fundraisers_public_select on fundraisers;
create policy fundraisers_public_select on fundraisers for select
  using (active = true or is_active_admin());

drop policy if exists fundraisers_admin_write on fundraisers;
create policy fundraisers_admin_write on fundraisers for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ---- players: public read active, owner/manager write, admins read all ----
drop policy if exists players_public_select on players;
create policy players_public_select on players for select
  using (active = true or is_active_admin());

drop policy if exists players_admin_write on players;
create policy players_admin_write on players for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ---- sponsors: public read, owner/manager write ----
drop policy if exists sponsors_public_select on sponsors;
create policy sponsors_public_select on sponsors for select using (true);

drop policy if exists sponsors_admin_write on sponsors;
create policy sponsors_admin_write on sponsors for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ---- site_content / site_settings: public read, owner/manager write ----
drop policy if exists site_content_public_select on site_content;
create policy site_content_public_select on site_content for select using (true);

drop policy if exists site_content_admin_write on site_content;
create policy site_content_admin_write on site_content for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

drop policy if exists site_settings_public_select on site_settings;
create policy site_settings_public_select on site_settings for select using (true);

drop policy if exists site_settings_admin_write on site_settings;
create policy site_settings_admin_write on site_settings for all
  using (has_role(array['owner','manager']))
  with check (has_role(array['owner','manager']));

-- ---- donations: public may INSERT (mock checkout) + read limited
-- columns of succeeded donations (see column grants in section 6).
-- Only owner/treasurer may update (refund flag, notes) or delete.
drop policy if exists donations_public_insert on donations;
create policy donations_public_insert on donations for insert
  with check (true);

drop policy if exists donations_public_select on donations;
create policy donations_public_select on donations for select
  using (status = 'succeeded' or is_active_admin());

drop policy if exists donations_financial_write on donations;
create policy donations_financial_write on donations for update
  using (has_role(array['owner','treasurer']))
  with check (has_role(array['owner','treasurer']));

drop policy if exists donations_financial_delete on donations;
create policy donations_financial_delete on donations for delete
  using (has_role(array['owner','treasurer']));

-- ---- administrators: any active admin can read the roster;
-- only the owner can add, edit, or remove administrators.
drop policy if exists administrators_select on administrators;
create policy administrators_select on administrators for select
  using (is_active_admin());

drop policy if exists administrators_owner_write on administrators;
create policy administrators_owner_write on administrators for all
  using (has_role(array['owner']))
  with check (has_role(array['owner']));

-- ---- audit_logs: any active admin can insert (writes their own
-- actions); only the owner can read the log. No updates/deletes.
drop policy if exists audit_logs_insert on audit_logs;
create policy audit_logs_insert on audit_logs for insert
  with check (is_active_admin());

drop policy if exists audit_logs_owner_select on audit_logs;
create policy audit_logs_owner_select on audit_logs for select
  using (has_role(array['owner']));

-- =====================================================================
-- 6. COLUMN-LEVEL PRIVACY FOR DONATIONS
-- ---------------------------------------------------------------------
-- Row Level Security controls WHICH ROWS a role can see; it doesn't
-- limit which COLUMNS. To make sure the public (and managers, who
-- shouldn't see donor financial detail) never receive donor emails or
-- internal notes, we use Postgres column-level GRANTs on the base
-- table, then expose the sensitive columns only through a locked-down
-- view that's restricted to owner/treasurer by has_role().
-- =====================================================================

revoke all on donations from anon, authenticated;

grant select (
  id, player_id, fundraiser_id, gross_cents, status, source,
  anonymous, donor_name, donor_message, created_at, refunded
) on donations to anon, authenticated;

grant insert (
  player_id, fundraiser_id, gross_cents, fee_cents, net_cents,
  donor_name, donor_email, donor_message, anonymous, status,
  payment_method, source, checkout_session_id, payment_intent_id
) on donations to anon, authenticated;

grant update (refunded, admin_notes, status) on donations to authenticated;
grant delete on donations to authenticated;

-- Full-detail view (donor email, fees, notes, Stripe IDs) — only ever
-- returns rows when the caller is an owner or treasurer.
create or replace view donations_financial as
  select *
  from donations
  where has_role(array['owner','treasurer']);

grant select on donations_financial to authenticated;

-- =====================================================================
-- 7. STORAGE BUCKETS
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('branding', 'branding', true),
  ('players', 'players', true),
  ('sponsors', 'sponsors', true),
  ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Public read on every bucket (images are meant to be publicly visible
-- once uploaded — there's no "pending approval" step in this prototype).
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select
  using (bucket_id in ('branding','players','sponsors','gallery'));

-- Only owner/manager may upload, replace, or delete images.
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert
  with check (
    bucket_id in ('branding','players','sponsors','gallery')
    and has_role(array['owner','manager'])
  );

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update
  using (
    bucket_id in ('branding','players','sponsors','gallery')
    and has_role(array['owner','manager'])
  );

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete
  using (
    bucket_id in ('branding','players','sponsors','gallery')
    and has_role(array['owner','manager'])
  );

-- =====================================================================
-- 8. SEED DATA — migrated from the mock prototype
-- ---------------------------------------------------------------------
-- Re-running this section is safe: it checks for an existing team
-- named 'Waco Rampage 14U' first.
-- =====================================================================

do $$
declare
  v_team_id uuid;
  v_fundraiser_id uuid;
begin
  select id into v_team_id from teams where name = 'Waco Rampage 14U' limit 1;
  if v_team_id is null then
    insert into teams (name) values ('Waco Rampage 14U') returning id into v_team_id;
  end if;

  select id into v_fundraiser_id from fundraisers where team_id = v_team_id limit 1;
  if v_fundraiser_id is null then
    insert into fundraisers (
      team_id, title, description, team_goal_cents, player_default_goal_cents,
      start_date, end_date, contact_email, contact_phone, social
    ) values (
      v_team_id,
      '2026 Spring Tournament Fund',
      'Help send the Waco Rampage 14U squad to Regionals. Every dollar raised goes directly toward tournament fees, travel, equipment, uniforms, and training.',
      2000000, 60000,
      now(), now() + interval '45 days',
      'boosterclub@wacorampage.test', '(254) 555-0142',
      '{"instagram":"https://instagram.com/wacorampage14u","facebook":"https://facebook.com/wacorampage14u","twitter":"https://x.com/wacorampage14u"}'
    ) returning id into v_fundraiser_id;

    insert into site_settings (fundraiser_id, team_name, tagline, footer_text)
    values (v_fundraiser_id, 'Waco Rampage 14U', 'Every donation gets us closer to the next tournament.',
      '© 2026 Waco Rampage 14U Baseball Booster Club. All rights reserved.');

    insert into players (fundraiser_id, slug, display_name, goal_cents, message, display_order, is_general_fund) values
      (v_fundraiser_id, 'team-general-fund', 'Waco Rampage 14U — Team General Fund', 2000000, 'Give directly to the team fund to cover whatever the squad needs most this season.', 0, true),
      (v_fundraiser_id, 'domani-g', 'DoMani G.', 80000, 'This is my first season with the 14U squad and I''m working hard on my swing every day. Thank you for believing in me!', 1, false),
      (v_fundraiser_id, 'carter-b', 'Carter B.', 60000, 'Saving up for a new catcher''s mitt and helping the team hit our travel goal this year.', 2, false),
      (v_fundraiser_id, 'mason-t', 'Mason T.', 60000, 'Every rep in the cage counts. Thanks for helping our team make it to Regionals!', 3, false),
      (v_fundraiser_id, 'liam-r', 'Liam R.', 65000, 'Working on my pitching this season — grateful for every bit of support.', 4, false),
      (v_fundraiser_id, 'ethan-k', 'Ethan K.', 55000, 'New to shortstop this year and loving it. Thanks for helping cover uniforms and gear!', 5, false),
      (v_fundraiser_id, 'noah-p', 'Noah P.', 60000, 'Trying to help our team qualify for state. Every donation gets us closer.', 6, false),
      (v_fundraiser_id, 'jackson-w', 'Jackson W.', 70000, 'Third baseman, first-time fundraiser. Thank you for supporting Rampage baseball!', 7, false),
      (v_fundraiser_id, 'aiden-m', 'Aiden M.', 55000, 'Working on my speed on the base paths. Appreciate any support.', 8, false),
      (v_fundraiser_id, 'bryce-h', 'Bryce H.', 60000, 'Center field is my home. Thanks for helping our team reach our goal!', 9, false),
      (v_fundraiser_id, 'colton-s', 'Colton S.', 50000, 'First season on varsity travel ball — grateful for every bit of support.', 10, false),
      (v_fundraiser_id, 'dawson-f', 'Dawson F.', 60000, 'Working on my curveball this year. Thank you for helping fund our training.', 11, false),
      (v_fundraiser_id, 'easton-v', 'Easton V.', 55000, 'Right field, big arm. Thanks for supporting our tournament travel!', 12, false),
      (v_fundraiser_id, 'gavin-n', 'Gavin N.', 60000, 'Grateful to be part of this team. Every donation helps.', 13, false);

    insert into sponsors (fundraiser_id, name, website, level, display_order) values
      (v_fundraiser_id, 'Rampage Auto Body', 'https://example.com/rampage-auto-body', 'Gold', 1),
      (v_fundraiser_id, 'Brazos Valley Orthodontics', 'https://example.com/brazos-valley-orthodontics', 'Silver', 2),
      (v_fundraiser_id, 'Central Texas Batting Cages', 'https://example.com/central-texas-batting-cages', 'Bronze', 3);

    insert into site_content (fundraiser_id, section, key, value, display_order) values
      (v_fundraiser_id, 'hero', 'eyebrow', '2026 SPRING TOURNAMENT FUND', 1),
      (v_fundraiser_id, 'hero', 'headline_line1', 'HELP FUEL THE', 2),
      (v_fundraiser_id, 'hero', 'headline_line2', 'Waco Rampage', 3),
      (v_fundraiser_id, 'hero', 'support_message_heading', 'TOGETHER WE RAMPAGE', 4),
      (v_fundraiser_id, 'buttons', 'donate_team', 'Donate to the Team Fund', 1),
      (v_fundraiser_id, 'buttons', 'support_player', 'Support a Player', 2),
      (v_fundraiser_id, 'faq', 'q1', 'Where does my donation go?', 1),
      (v_fundraiser_id, 'faq', 'a1', '100% of net proceeds support Waco Rampage 14U team expenses: tournament fees, travel, equipment, uniforms, training, and operating costs.', 2),
      (v_fundraiser_id, 'faq', 'q2', 'Can I choose which player I support?', 3),
      (v_fundraiser_id, 'faq', 'a2', 'Yes. You can donate through any individual player''s page, or give to the team fund directly from the homepage.', 4),
      (v_fundraiser_id, 'faq', 'q3', 'Is this site collecting real payments right now?', 5),
      (v_fundraiser_id, 'faq', 'a3', 'No. This site is currently in Prototype Mode. No real card information is collected and no real money is processed.', 6);
  end if;
end $$;

-- =====================================================================
-- Done. Next: create your first OWNER account — see
-- docs/SUPABASE_ONBOARDING.md, section "Creating the first owner
-- account."
-- =====================================================================

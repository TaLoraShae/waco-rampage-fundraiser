-- =====================================================================
-- WACO RAMPAGE 14U — SITE CONTENT MIGRATION (SAFE, ADDITIVE ONLY)
-- =====================================================================
-- Run this once in your Supabase SQL Editor. It is completely separate
-- from docs/SUPABASE_SETUP.sql and safe to run on your existing,
-- already-live database.
--
-- WHAT THIS DOES
--   Adds new ROWS to the existing `site_content` table so more of the
--   public website's wording can be edited directly in the Supabase
--   Table Editor. `site_content` is already a flexible key/value table
--   (fundraiser_id, section, key, value) — this migration does NOT
--   add, remove, or alter any COLUMN on any table, and does NOT touch
--   `site_settings`, `fundraisers`, `players`, `donations`,
--   `sponsors`, `administrators`, or anything Stripe-related.
--
-- WHAT THIS NEVER DOES
--   - Never deletes or overwrites an existing row. Every insert below
--     uses ON CONFLICT (fundraiser_id, section, key) DO NOTHING, so if
--     you already edited a value (including the handful of keys added
--     in the original SUPABASE_SETUP.sql seed), this migration will
--     never touch it — it only fills in KEYS THAT DON'T EXIST YET.
--   - Never touches players, donations, administrators, audit logs,
--     Stripe metadata, or PAYMENT_MODE.
--
-- After running this, every key below becomes editable at:
--   Supabase → Table Editor → site_content
-- Find the row by its `section` and `key` columns, edit `value`,
-- save — the live site picks it up on next page load. No code
-- changes, no redeploy, no admin-dashboard form.
-- =====================================================================

do $$
declare
  fr record;
begin
  for fr in select id from fundraisers loop

    insert into site_content (fundraiser_id, section, key, value, display_order) values
      -- ---- Hero section ----
      (fr.id, 'hero', 'headline_line1', 'HELP FUEL THE', 1),
      (fr.id, 'hero', 'headline_line2', 'Waco Rampage', 2),
      (fr.id, 'hero', 'team_progress_heading', 'TEAM GOAL PROGRESS', 3),
      (fr.id, 'hero', 'support_message_heading', 'TOGETHER WE RAMPAGE', 4),
      (fr.id, 'hero', 'together_body', 'Your support helps these young athletes compete, grow, and represent Waco with pride.', 5),
      (fr.id, 'hero', 'season_note', 'Tournament season starts soon. Let''s finish strong.', 6),

      -- ---- Buttons ----
      (fr.id, 'buttons', 'donate_team', 'Donate to the Team Fund', 1),
      (fr.id, 'buttons', 'support_player', 'Support a Player', 2),

      -- ---- Section eyebrows + headings ----
      (fr.id, 'headings', 'leaderboard_eyebrow', 'Top Fundraisers', 1),
      (fr.id, 'headings', 'leaderboard_heading', 'LEADING THE LINEUP', 2),
      (fr.id, 'headings', 'players_eyebrow', 'Meet the Team', 3),
      (fr.id, 'headings', 'players_heading', 'PLAYER DIRECTORY', 4),
      (fr.id, 'headings', 'fund_usage_eyebrow', 'Where it goes', 5),
      (fr.id, 'headings', 'fund_usage_heading', 'HOW FUNDS WILL BE USED', 6),
      (fr.id, 'headings', 'sponsors_eyebrow', 'With gratitude', 7),
      (fr.id, 'headings', 'sponsors_heading', 'OUR SPONSORS', 8),
      (fr.id, 'headings', 'gallery_eyebrow', 'Team photos', 9),
      (fr.id, 'headings', 'gallery_heading', 'GALLERY', 10),
      (fr.id, 'headings', 'faq_eyebrow', 'Questions', 11),
      (fr.id, 'headings', 'faq_heading', 'FREQUENTLY ASKED QUESTIONS', 12),
      (fr.id, 'headings', 'privacy_note_heading', 'A note on player privacy', 13),

      -- ---- Team values strip ----
      (fr.id, 'team_values', 'value1_label', 'COMPETE', 1),
      (fr.id, 'team_values', 'value1_body', 'We play hard and represent Waco.', 2),
      (fr.id, 'team_values', 'value2_label', 'DEVELOP', 3),
      (fr.id, 'team_values', 'value2_body', 'We train, learn, and get better every day.', 4),
      (fr.id, 'team_values', 'value3_label', 'FAMILY', 5),
      (fr.id, 'team_values', 'value3_body', 'We''re more than a team. We''re a family.', 6),
      (fr.id, 'team_values', 'value4_label', 'TOGETHER', 7),
      (fr.id, 'team_values', 'value4_body', 'We bring the energy. We bring the fight. We are Rampage.', 8),

      -- ---- Fund-usage wording (up to 6 items; blank label = hidden) ----
      (fr.id, 'fund_usage', 'item1_label', 'Tournament fees', 1),
      (fr.id, 'fund_usage', 'item1_description', 'Entry fees for regional and national tournaments throughout the season.', 2),
      (fr.id, 'fund_usage', 'item2_label', 'Travel expenses', 3),
      (fr.id, 'fund_usage', 'item2_description', 'Team hotel blocks and transportation for away tournaments.', 4),
      (fr.id, 'fund_usage', 'item3_label', 'Equipment', 5),
      (fr.id, 'fund_usage', 'item3_description', 'Catcher''s gear, bats, helmets, and practice equipment for the team.', 6),
      (fr.id, 'fund_usage', 'item4_label', 'Uniforms', 7),
      (fr.id, 'fund_usage', 'item4_description', 'Game and practice uniforms for every player on the roster.', 8),
      (fr.id, 'fund_usage', 'item5_label', 'Training', 9),
      (fr.id, 'fund_usage', 'item5_description', 'Batting cage rental, pitching instruction, and skills clinics.', 10),
      (fr.id, 'fund_usage', 'item6_label', 'Team operating expenses', 11),
      (fr.id, 'fund_usage', 'item6_description', 'Field rental, insurance, umpire fees, and day-to-day team costs.', 12),

      -- ---- FAQ (up to 5 pairs; blank question = hidden) ----
      (fr.id, 'faq', 'q1', 'Where does my donation go?', 1),
      (fr.id, 'faq', 'a1', '100% of net proceeds support the team''s expenses: tournament fees, travel, equipment, uniforms, training, and operating costs.', 2),
      (fr.id, 'faq', 'q2', 'Can I choose which player I support?', 3),
      (fr.id, 'faq', 'a2', 'Yes. You can donate through any individual player''s page, or give to the team fund directly from the homepage.', 4),
      (fr.id, 'faq', 'q3', 'Is this site collecting real payments right now?', 5),
      (fr.id, 'faq', 'a3', 'Check the site for its current payment status.', 6),
      (fr.id, 'faq', 'q4', '', 7),
      (fr.id, 'faq', 'a4', '', 8),
      (fr.id, 'faq', 'q5', '', 9),
      (fr.id, 'faq', 'a5', '', 10),

      -- ---- Legal / privacy ----
      (fr.id, 'legal', 'privacy_statement', 'To protect our youth players, this site only ever displays a player''s first name and last initial. We never publish birthdates, addresses, phone numbers, school information, or schedules. Donor emails and private messages are never shown publicly. Team photos are only used with a parent or guardian''s consent.', 1),

      -- ---- Individual player page headings ----
      (fr.id, 'player_page', 'donate_heading', 'DONATE NOW', 1),
      (fr.id, 'player_page', 'supports_heading', 'WHAT YOUR DONATION SUPPORTS', 2),
      (fr.id, 'player_page', 'recent_supporters_heading', 'RECENT SUPPORTERS', 3)

    on conflict (fundraiser_id, section, key) do nothing;

  end loop;
end $$;

-- =====================================================================
-- Done. Nothing above overwrote any existing row. See
-- docs/CONTENT_FIELD_MAP.md for the full table of which Supabase
-- table/column or section/key controls each item on the public site.
-- =====================================================================

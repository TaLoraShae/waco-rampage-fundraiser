# Content Field Map — What Controls What

Every item below can be edited directly in **Supabase → Table Editor**.
No code changes, no redeploy — the live site re-reads these on every
page load. `site_content` rows are matched by their `section` and
`key` columns; the value to edit is always the `value` column.

| Public website item | Supabase table | Column / key | Example value |
|---|---|---|---|
| **Branding** | | | |
| Team name | `site_settings` | `team_name` | `Waco Rampage 14U` |
| Tagline | `site_settings` | `tagline` | `Every donation gets us closer to the next tournament.` |
| Team (header) logo | `site_settings` | `logo_url` | `https://…/branding/logo.png` |
| Footer logo | `site_settings` | `footer_logo_url` | `https://…/branding/footer-logo.png` (falls back to `logo_url` if blank) |
| Hero background photo | `site_settings` | `hero_photo_url` | `https://…/branding/hero.jpg` |
| Team photo (footer) | `site_settings` | `team_photo_url` | `https://…/branding/team.jpg` |
| Gallery photos | `site_settings` | `gallery_urls` | `{https://…/1.jpg,https://…/2.jpg}` |
| Favicon | `site_settings` | `favicon_url` | `https://…/branding/favicon.png` |
| Primary color | `site_settings` | `primary_color` | `#6B2FA0` |
| Secondary color | `site_settings` | `secondary_color` | `#1E0E30` |
| Accent color | `site_settings` | `accent_color` | `#8A4FC4` |
| **Contact & social** | | | |
| Contact email | `site_settings` | `contact_email` | `info@example.org` |
| Contact phone | `site_settings` | `contact_phone` | `(555) 555-0100` |
| Website URL | `site_settings` | `website_url` | `https://example.org` |
| Facebook URL | `site_settings` | `facebook_url` | `https://facebook.com/yourteam` |
| Instagram URL | `site_settings` | `instagram_url` | `https://instagram.com/yourteam` |
| X / Twitter URL | `site_settings` | `twitter_url` | `https://x.com/yourteam` |
| Footer description | `site_settings` | `footer_description` | `A short line next to the footer logo.` |
| Privacy Policy link | `site_settings` | `privacy_policy_url` | `https://example.org/privacy` (blank = uses built-in `/privacy` page) |
| Terms of Service link | `site_settings` | `terms_url` | `https://example.org/terms` |
| Copyright text | `site_settings` | `copyright_text` | `© 2026 Your Team. All rights reserved.` |
| **Fundraiser numbers & dates** | | | |
| Fundraiser title | `fundraisers` | `title` | `2026 Spring Tournament Fund` |
| Fundraiser description | `fundraisers` | `description` | `Help send the team to Regionals…` |
| Team goal | `fundraisers` | `team_goal_cents` (in cents) | `2000000` = $20,000.00 |
| Default player goal | `fundraisers` | `player_default_goal_cents` | `60000` = $600.00 |
| Start date | `fundraisers` | `start_date` | `2026-03-01` |
| End date | `fundraisers` | `end_date` | `2026-05-15` |
| Minimum donation | `fundraisers` | `min_donation_cents` | `500` = $5.00 |
| Maximum donation | `fundraisers` | `max_donation_cents` | `500000` = $5,000.00 |
| Suggested donation amounts | `fundraisers` | `suggested_amounts_cents` | `{2500,5000,10000}` |
| **Homepage hero text** | | | |
| Headline line 1 | `site_content` | section `hero`, key `headline_line1` | `HELP FUEL THE` |
| Headline line 2 | `site_content` | section `hero`, key `headline_line2` | `Waco Rampage` |
| Homepage eyebrow text | `fundraisers` | `title` *(reused — see note below)* | `2026 Spring Tournament Fund` |
| Homepage supporting text | `fundraisers` | `description` *(reused — see note below)* | `Help send the team to Regionals…` |
| Team progress heading | `site_content` | section `hero`, key `team_progress_heading` | `TEAM GOAL PROGRESS` |
| Support-message heading | `site_content` | section `hero`, key `support_message_heading` | `TOGETHER WE RAMPAGE` |
| Support-message body | `site_content` | section `hero`, key `together_body` | `Your support helps these young athletes…` |
| Season note (italic line under countdown) | `site_content` | section `hero`, key `season_note` | `Tournament season starts soon. Let's finish strong.` |
| **Buttons** | | | |
| Donate-to-team button text | `site_content` | section `buttons`, key `donate_team` | `Donate to the Team Fund` |
| Support-a-player button text | `site_content` | section `buttons`, key `support_player` | `Support a Player` |
| **Section headings** | | | |
| Leaderboard eyebrow / heading | `site_content` | section `headings`, keys `leaderboard_eyebrow` / `leaderboard_heading` | `Top Fundraisers` / `LEADING THE LINEUP` |
| Players eyebrow / heading | `site_content` | section `headings`, keys `players_eyebrow` / `players_heading` | `Meet the Team` / `PLAYER DIRECTORY` |
| Fund-usage eyebrow / heading | `site_content` | section `headings`, keys `fund_usage_eyebrow` / `fund_usage_heading` | `Where it goes` / `HOW FUNDS WILL BE USED` |
| Sponsors eyebrow / heading | `site_content` | section `headings`, keys `sponsors_eyebrow` / `sponsors_heading` | `With gratitude` / `OUR SPONSORS` |
| Gallery eyebrow / heading | `site_content` | section `headings`, keys `gallery_eyebrow` / `gallery_heading` | `Team photos` / `GALLERY` |
| FAQ eyebrow / heading | `site_content` | section `headings`, keys `faq_eyebrow` / `faq_heading` | `Questions` / `FREQUENTLY ASKED QUESTIONS` |
| Privacy note heading | `site_content` | section `headings`, key `privacy_note_heading` | `A note on player privacy` |
| Player page: donate heading | `site_content` | section `player_page`, key `donate_heading` | `DONATE NOW` |
| Player page: supports heading | `site_content` | section `player_page`, key `supports_heading` | `WHAT YOUR DONATION SUPPORTS` |
| Player page: recent supporters heading | `site_content` | section `player_page`, key `recent_supporters_heading` | `RECENT SUPPORTERS` |
| **Team values strip** | | | |
| Value 1–4 label / body | `site_content` | section `team_values`, keys `value1_label`/`value1_body` … `value4_label`/`value4_body` | `COMPETE` / `We play hard and represent Waco.` |
| **Fund-usage cards** | | | |
| Item 1–6 label / description | `site_content` | section `fund_usage`, keys `item1_label`/`item1_description` … `item6_label`/`item6_description` | `Tournament fees` / `Entry fees for regional and national tournaments…` |
| **FAQ** | | | |
| Question / answer 1–5 | `site_content` | section `faq`, keys `q1`/`a1` … `q5`/`a5` | `Where does my donation go?` / `100% of net proceeds support…` |
| **Legal** | | | |
| Privacy statement paragraph | `site_content` | section `legal`, key `privacy_statement` | `To protect our youth players, this site only ever displays…` |

## Notes

- **Blank = hidden, not a placeholder.** Optional fields (contact info,
  social links, images, an individual FAQ pair, a fund-usage item, the
  season note) simply don't render if the value is blank — the site
  never shows fake sample text.
- **Structural headings keep a sensible default** if their
  `site_content` row is blank or missing (e.g. `PLAYER DIRECTORY`),
  since a completely empty heading would look broken rather than
  intentional. Edit the row any time to override it.
- **Single source of truth:** the homepage "eyebrow" text and
  supporting paragraph reuse `fundraisers.title` and
  `fundraisers.description` rather than duplicating them into
  `site_content` — those columns already existed and already served
  exactly that purpose.
- `fundraisers.contact_email`, `fundraisers.contact_phone`, and
  `fundraisers.social` are legacy columns from an earlier version of
  the schema. The public site no longer reads them — `site_settings`
  is the single source of truth for contact info and social links now.
  They're left in place untouched (nothing was deleted), just unused.
- Payment/checkout/Stripe/webhook code and text were intentionally
  **not** touched by this update and are not included in this table.

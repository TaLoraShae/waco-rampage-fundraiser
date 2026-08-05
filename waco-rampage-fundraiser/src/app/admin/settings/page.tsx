import Image from "next/image";
import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import { updateFundraiserSettings, updateSiteSettings, uploadImage } from "@/app/admin/data-actions";

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AdminSettingsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const admin = await requireAdmin(["owner", "manager"]);
  const isOwner = admin.role === "owner";

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;
  const settings = await data.getSiteSettings(fundraiser.id);

  const inputCls = "w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Settings</h1>

      {searchParams.success && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Settings updated.</p>}
      {searchParams.error === "upload-failed" && <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">Image upload failed. Check the file and try again.</p>}

      {/* ---- Fundraiser goal, dates, donation limits — Owner + Manager ---- */}
      <form action={updateFundraiserSettings} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
        <input type="hidden" name="id" value={fundraiser.id} />
        <h2 className="font-display text-lg text-rampage-purple-dark">Fundraiser</h2>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Fundraiser title</label>
          <input name="title" defaultValue={fundraiser.title} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Fundraiser description</label>
          <textarea name="description" rows={3} defaultValue={fundraiser.description} className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Team goal (USD)</label>
            <input name="teamGoalDollars" type="number" defaultValue={fundraiser.team_goal_cents / 100} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Default player goal (USD)</label>
            <input name="playerDefaultGoalDollars" type="number" defaultValue={fundraiser.player_default_goal_cents / 100} className={inputCls} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Start date</label>
            <input name="startDate" type="date" defaultValue={toDateInput(fundraiser.start_date)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">End date</label>
            <input name="endDate" type="date" defaultValue={toDateInput(fundraiser.end_date)} className={inputCls} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Minimum donation (USD)</label>
            <input name="minDonationDollars" type="number" defaultValue={fundraiser.min_donation_cents / 100} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Maximum donation (USD)</label>
            <input name="maxDonationDollars" type="number" defaultValue={fundraiser.max_donation_cents / 100} className={inputCls} />
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-rampage-charcoal mb-1">Visibility toggles</legend>
          {[
            ["leaderboardVisible", "Show top-fundraiser leaderboard", fundraiser.leaderboard_visible],
            ["recentSupportersVisible", "Show recent supporters on player pages", fundraiser.recent_supporters_visible],
            ["donorMessagesVisible", "Show donor messages publicly", fundraiser.donor_messages_visible],
            ["anonymousAllowed", "Allow anonymous donations", fundraiser.anonymous_allowed],
          ].map(([name, label, checked]) => (
            <label key={name as string} className="flex items-center gap-2 text-sm text-rampage-charcoal">
              <input type="checkbox" name={name as string} defaultChecked={checked as boolean} className="h-4 w-4 rounded border-black/20 text-rampage-purple focus-ring" />
              {label as string}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
          Save Fundraiser Settings
        </button>
      </form>

      {!isOwner && (
        <p className="text-xs text-rampage-gray bg-rampage-gray-light border border-black/5 rounded-lg p-3">
          Site-wide branding, contact info, colors, and images below are Owner-only. Ask your Owner to make changes
          there, or to grant you Owner access.
        </p>
      )}

      {isOwner && (
        <>
          {/* ---- Branding + contact + colors — Owner only ---- */}
          <form action={updateSiteSettings} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <h2 className="font-display text-lg text-rampage-purple-dark">Branding</h2>
            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Team name</label>
              <input name="teamName" defaultValue={settings?.team_name || ""} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Tagline</label>
              <input name="tagline" defaultValue={settings?.tagline || ""} className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Primary color</label>
                <input name="primaryColor" type="color" defaultValue={settings?.primary_color || "#6B2FA0"} className="h-11 w-full rounded-xl border border-black/10" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Secondary color</label>
                <input name="secondaryColor" type="color" defaultValue={settings?.secondary_color || "#1E0E30"} className="h-11 w-full rounded-xl border border-black/10" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Accent color</label>
                <input name="accentColor" type="color" defaultValue={settings?.accent_color || "#8A4FC4"} className="h-11 w-full rounded-xl border border-black/10" />
              </div>
            </div>
            <p className="text-xs text-rampage-gray">Colors update across the entire site (public + admin) as soon as you save.</p>

            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Footer description</label>
              <textarea name="footerDescription" rows={2} defaultValue={settings?.footer_description || ""} placeholder="A short line shown next to your logo in the footer." className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Copyright text</label>
              <input name="copyrightText" defaultValue={settings?.copyright_text || ""} placeholder="© 2026 Your Team. All rights reserved." className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Legacy footer text field</label>
              <input name="footerText" defaultValue={settings?.footer_text || ""} className={inputCls} />
              <p className="text-xs text-rampage-gray mt-1">Kept for backward compatibility — most sites can leave this blank and use Footer description above instead.</p>
            </div>

            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
              Save Branding
            </button>
          </form>

          {/* ---- Contact + social + legal links — Owner only ---- */}
          <form action={updateSiteSettings} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            {/* Re-send branding fields too so this form doesn't blank them out on save */}
            <input type="hidden" name="teamName" value={settings?.team_name || ""} />
            <input type="hidden" name="tagline" value={settings?.tagline || ""} />
            <input type="hidden" name="primaryColor" value={settings?.primary_color || "#6B2FA0"} />
            <input type="hidden" name="secondaryColor" value={settings?.secondary_color || "#1E0E30"} />
            <input type="hidden" name="accentColor" value={settings?.accent_color || "#8A4FC4"} />
            <input type="hidden" name="footerDescription" value={settings?.footer_description || ""} />
            <input type="hidden" name="copyrightText" value={settings?.copyright_text || ""} />
            <input type="hidden" name="footerText" value={settings?.footer_text || ""} />

            <h2 className="font-display text-lg text-rampage-purple-dark">Contact & Social</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact email</label>
                <input name="contactEmail" type="email" defaultValue={settings?.contact_email || ""} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact phone</label>
                <input name="contactPhone" defaultValue={settings?.contact_phone || ""} placeholder="(555) 555-5555" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Website URL (optional)</label>
              <input name="websiteUrl" defaultValue={settings?.website_url || ""} placeholder="https://..." className={inputCls} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Facebook URL</label>
                <input name="facebookUrl" defaultValue={settings?.facebook_url || ""} placeholder="https://facebook.com/..." className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Instagram URL</label>
                <input name="instagramUrl" defaultValue={settings?.instagram_url || ""} placeholder="https://instagram.com/..." className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">X / Twitter URL</label>
                <input name="twitterUrl" defaultValue={settings?.twitter_url || ""} placeholder="https://x.com/..." className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Privacy Policy URL</label>
                <input name="privacyPolicyUrl" defaultValue={settings?.privacy_policy_url || ""} placeholder="https://... (leave blank to use the built-in /privacy page)" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Terms of Service URL (optional)</label>
                <input name="termsUrl" defaultValue={settings?.terms_url || ""} placeholder="https://..." className={inputCls} />
              </div>
            </div>
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
              Save Contact & Social
            </button>
          </form>

          {/* ---- Images — Owner only ---- */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-6">
            <h2 className="font-display text-lg text-rampage-purple-dark">Images</h2>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0">
                {settings?.logo_url && <Image src={settings.logo_url} alt="Current logo" width={64} height={64} className="object-contain" unoptimized />}
              </div>
              <form action={uploadImage} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="target" value="logo" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Upload Header Logo
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0">
                {settings?.footer_logo_url && <Image src={settings.footer_logo_url} alt="Current footer logo" width={64} height={64} className="object-contain" unoptimized />}
              </div>
              <form action={uploadImage} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="target" value="footer_logo" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Upload Footer Logo
                </button>
              </form>
            </div>
            <p className="text-xs text-rampage-gray -mt-4">If no footer logo is uploaded, the header logo is reused automatically.</p>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0">
                {settings?.hero_photo_url && <Image src={settings.hero_photo_url} alt="Current hero photo" width={64} height={64} className="object-cover rounded" unoptimized />}
              </div>
              <form action={uploadImage} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="target" value="hero" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Upload Hero Background
                </button>
              </form>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0">
                {settings?.team_photo_url && <Image src={settings.team_photo_url} alt="Current team photo" width={64} height={64} className="object-cover rounded" unoptimized />}
              </div>
              <form action={uploadImage} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="target" value="team_photo" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Upload Team Photo
                </button>
              </form>
            </div>
            <p className="text-xs text-rampage-gray -mt-4">Shown in the site footer, next to your description.</p>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0">
                {settings?.favicon_url && <Image src={settings.favicon_url} alt="Current favicon" width={32} height={32} className="object-contain" unoptimized />}
              </div>
              <form action={uploadImage} className="flex-1 flex items-center gap-2">
                <input type="hidden" name="target" value="favicon" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/png,image/x-icon,image/svg+xml" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Upload Favicon
                </button>
              </form>
            </div>
            <p className="text-xs text-rampage-gray -mt-4">A square PNG works best (e.g. 512×512).</p>

            <div>
              <p className="text-sm font-semibold text-rampage-charcoal mb-2">Gallery photos ({settings?.gallery_urls?.length || 0})</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(settings?.gallery_urls || []).map((url) => (
                  <div key={url} className="relative aspect-square rounded overflow-hidden border border-black/10">
                    <Image src={url} alt="Gallery photo" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
              <form action={uploadImage} className="flex items-center gap-2">
                <input type="hidden" name="target" value="gallery" />
                <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
                <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
                  Add Gallery Photo
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

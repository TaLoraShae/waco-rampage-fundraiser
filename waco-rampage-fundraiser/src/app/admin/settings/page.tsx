import Image from "next/image";
import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import { updateFundraiserSettings, updateSiteSettings, uploadImage } from "@/app/admin/data-actions";

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default async function AdminSettingsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  await requireAdmin(["owner", "manager"]);

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;
  const settings = await data.getSiteSettings(fundraiser.id);

  const inputCls = "w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Fundraiser Settings</h1>

      {searchParams.success && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Settings updated.</p>}
      {searchParams.error === "upload-failed" && <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">Image upload failed. Check the file and try again.</p>}

      <form action={updateFundraiserSettings} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
        <input type="hidden" name="id" value={fundraiser.id} />
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
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact email</label>
            <input name="contactEmail" defaultValue={fundraiser.contact_email} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Contact phone</label>
            <input name="contactPhone" defaultValue={fundraiser.contact_phone} className={inputCls} />
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

      <form action={updateSiteSettings} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-5">
        <input type="hidden" name="fundraiserId" value={fundraiser.id} />
        <h2 className="font-display text-lg text-rampage-purple-dark">Branding</h2>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Team name</label>
          <input name="teamName" defaultValue={settings?.team_name || "Waco Rampage 14U"} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Tagline</label>
          <input name="tagline" defaultValue={settings?.tagline || ""} className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Primary color</label>
            <input name="primaryColor" type="color" defaultValue={settings?.primary_color || "#6B2FA0"} className="h-11 w-full rounded-xl border border-black/10" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Secondary color</label>
            <input name="secondaryColor" type="color" defaultValue={settings?.secondary_color || "#1E0E30"} className="h-11 w-full rounded-xl border border-black/10" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Footer text</label>
          <input name="footerText" defaultValue={settings?.footer_text || ""} className={inputCls} />
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold px-6 py-3 hover:bg-rampage-purple-dark transition focus-ring">
          Save Branding
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light p-6 space-y-6">
        <h2 className="font-display text-lg text-rampage-purple-dark">Images</h2>

        <div className="flex items-center gap-4">
          {settings?.logo_url && <Image src={settings.logo_url} alt="Current logo" width={64} height={64} className="object-contain" unoptimized />}
          <form action={uploadImage} className="flex-1 flex items-center gap-2">
            <input type="hidden" name="target" value="logo" />
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
            <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
              Upload Logo
            </button>
          </form>
        </div>

        <div className="flex items-center gap-4">
          {settings?.hero_photo_url && <Image src={settings.hero_photo_url} alt="Current hero photo" width={64} height={64} className="object-cover rounded" unoptimized />}
          <form action={uploadImage} className="flex-1 flex items-center gap-2">
            <input type="hidden" name="target" value="hero" />
            <input type="hidden" name="fundraiserId" value={fundraiser.id} />
            <input type="file" name="file" accept="image/*" required className="text-xs flex-1" />
            <button type="submit" className="text-xs font-semibold rounded-full bg-rampage-purple text-white px-3 py-2 hover:bg-rampage-purple-dark transition focus-ring">
              Upload Hero Photo
            </button>
          </form>
        </div>

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
    </div>
  );
}

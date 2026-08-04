import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import { updateSiteContentItems } from "@/app/admin/data-actions";
import ContentEditor from "@/components/admin/ContentEditor";

export default async function AdminContentPage({ searchParams }: { searchParams: { success?: string } }) {
  await requireAdmin(["owner", "manager"]);

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;

  const items = await data.getSiteContent(fundraiser.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Site Wording</h1>
      <p className="text-sm text-rampage-gray">
        Edit homepage headline, button labels, and FAQ content. Changes save to Supabase and appear on the live site
        immediately — no code changes or redeploys needed.
      </p>

      {searchParams.success && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Wording updated.</p>}

      {items.length === 0 ? (
        <p className="text-sm text-rampage-gray">
          No editable content rows found yet — run <code>docs/SUPABASE_SETUP.sql</code> to seed the default wording.
        </p>
      ) : (
        <ContentEditor fundraiserId={fundraiser.id} items={items} action={updateSiteContentItems} />
      )}
    </div>
  );
}

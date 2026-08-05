import Image from "next/image";
import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import { createSponsor, deleteSponsorAction, uploadImage } from "@/app/admin/data-actions";

export default async function AdminSponsorsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  await requireAdmin(["owner", "manager"]);

  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;

  const sponsors = await data.getSponsors(fundraiser.id);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Sponsor Management</h1>
      {searchParams.success && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Saved.</p>}
      {(searchParams.error === "upload-failed" || searchParams.error === "upload-save-failed") && (
        <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">Logo upload failed. Check the file and try again.</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-rampage-gray-light text-left">
              <tr>
                <th className="px-4 py-3">Logo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10">
                      <Image src={s.logo_url} alt={`${s.name} logo`} fill className="object-contain" unoptimized />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-rampage-charcoal">{s.name}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3 truncate max-w-[160px]">
                    <a href={s.website} target="_blank" rel="noreferrer" className="text-rampage-purple hover:underline focus-ring rounded">{s.website}</a>
                  </td>
                  <td className="px-4 py-3 space-y-2">
                    <form action={uploadImage} className="flex items-center gap-1">
                      <input type="hidden" name="target" value="sponsor" />
                      <input type="hidden" name="relatedId" value={s.id} />
                      <input type="hidden" name="fundraiserId" value={fundraiser.id} />
                      <input type="file" name="file" accept="image/*" required className="text-[10px] w-24" />
                      <button type="submit" className="text-[10px] font-semibold text-rampage-purple hover:underline focus-ring rounded">Logo</button>
                    </form>
                    <form action={deleteSponsorAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-rampage-gray">No sponsors added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={createSponsor} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-5 space-y-4 h-fit">
          <input type="hidden" name="fundraiserId" value={fundraiser.id} />
          <h2 className="font-display text-lg text-rampage-purple-dark">Add Sponsor</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-rampage-charcoal mb-1">Sponsor name</label>
            <input id="name" name="name" required className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-semibold text-rampage-charcoal mb-1">Website</label>
            <input id="website" name="website" placeholder="https://..." className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-semibold text-rampage-charcoal mb-1">Logo URL (optional — or upload after creating)</label>
            <input id="logoUrl" name="logoUrl" placeholder="https://..." className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-rampage-charcoal mb-1">Sponsor level</label>
            <select id="level" name="level" className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm">
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
              <option>Community</option>
            </select>
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-2.5 hover:bg-rampage-purple-dark transition focus-ring">
            Add Sponsor
          </button>
        </form>
      </div>
    </div>
  );
}

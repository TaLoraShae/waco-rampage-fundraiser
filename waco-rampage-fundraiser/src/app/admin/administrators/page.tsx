import { requireAdmin, roleLabel } from "@/lib/adminAuth";
import * as adminData from "@/lib/adminData";
import { inviteAdministrator, changeAdministratorRole, toggleAdministratorActive } from "@/app/admin/data-actions";

export default async function AdministratorsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const me = await requireAdmin(["owner"]);
  const admins = await adminData.getAdministrators();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Administrators</h1>
      <p className="text-sm text-rampage-gray">
        Only the owner can add, remove, or change the role of an administrator. There's no public sign-up — every
        account here was invited by you.
      </p>

      {searchParams.success && <p className="text-sm rounded-lg bg-green-50 border border-green-200 text-green-700 p-3">Done.</p>}
      {searchParams.error && <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-700 p-3">{searchParams.error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-rampage-gray-light text-left">
              <tr>
                <th className="px-4 py-3">Name / Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-black/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-rampage-charcoal">{a.display_name || "—"}</p>
                    <p className="text-xs text-rampage-gray">{a.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <form action={changeAdministratorRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <select name="role" defaultValue={a.role} className="rounded-lg border border-black/10 px-2 py-1 text-xs">
                        <option value="owner">Owner</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="manager">Manager</option>
                      </select>
                      <button type="submit" className="text-xs font-semibold text-rampage-purple hover:underline focus-ring rounded">Save</button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.active ? "bg-green-100 text-green-700" : "bg-black/5 text-rampage-gray"}`}>
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.user_id !== me.user_id && (
                      <form action={toggleAdministratorActive}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="active" value={String(a.active)} />
                        <button type="submit" className="text-xs font-semibold text-red-600 hover:underline focus-ring rounded">
                          {a.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={inviteAdministrator} className="bg-white rounded-2xl border border-black/5 shadow-card-light p-5 space-y-4 h-fit">
          <h2 className="font-display text-lg text-rampage-purple-dark">Invite Administrator</h2>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Email</label>
            <input name="email" type="email" required className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Display name</label>
            <input name="displayName" className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rampage-charcoal mb-1">Role</label>
            <select name="role" defaultValue="manager" className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm">
              <option value="manager">Manager</option>
              <option value="treasurer">Treasurer</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center rounded-full bg-rampage-purple text-white font-bold py-2.5 hover:bg-rampage-purple-dark transition focus-ring">
            Send Invite
          </button>
          <p className="text-xs text-rampage-gray">
            Sends a Supabase invite email with a secure link to set their password. See
            docs/SUPABASE_ONBOARDING.md if the email doesn't arrive.
          </p>
        </form>
      </div>

      <p className="text-xs text-rampage-gray">
        Role summary — <strong>{roleLabel("owner")}</strong>: full access, including managing administrators.{" "}
        <strong>{roleLabel("treasurer")}</strong>: donations, reports, and refunds. <strong>{roleLabel("manager")}</strong>: players,
        sponsors, wording, images, and fundraiser settings — no donor financial detail.
      </p>
    </div>
  );
}

import { requireAdmin } from "@/lib/adminAuth";
import * as adminData from "@/lib/adminData";

export default async function AuditLogPage() {
  await requireAdmin(["owner"]);
  const logs = await adminData.getAuditLogs(200);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Audit Log</h1>
      <p className="text-sm text-rampage-gray">
        A record of administrator changes, role changes, player/sponsor edits, wording changes, and image uploads.
        Visible to the owner only.
      </p>

      <div className="bg-white rounded-2xl border border-black/5 shadow-card-light overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rampage-gray-light text-left">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-black/5 align-top">
                <td className="px-4 py-3 whitespace-nowrap text-rampage-gray">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{log.actor_email}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-3 text-xs text-rampage-gray">
                  {log.entity_type}
                  {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-rampage-gray font-mono max-w-xs truncate">{JSON.stringify(log.details)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-rampage-gray">No audit log entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

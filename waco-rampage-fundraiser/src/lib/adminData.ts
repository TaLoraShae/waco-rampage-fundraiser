import { createClient } from "./supabase/server";
import { Administrator, AuditLogEntry, FinancialDonation } from "./types";

// These reads rely on RLS + the donations_financial view to return
// data ONLY when the caller is an approved owner/treasurer (see
// docs/SUPABASE_SETUP.sql). A manager calling these gets empty
// results, not an error — callers should still gate the UI with
// requireAdmin()/role checks for a clear "not allowed" message rather
// than a silently empty table.

export async function getFinancialDonations(fundraiserId: string): Promise<FinancialDonation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("donations_financial")
    .select("*")
    .eq("fundraiser_id", fundraiserId)
    .order("created_at", { ascending: false });
  return (data as FinancialDonation[]) || [];
}

export async function getAdministrators(): Promise<Administrator[]> {
  const supabase = createClient();
  const { data } = await supabase.from("administrators").select("*").order("created_at", { ascending: true });
  return (data as Administrator[]) || [];
}

export async function getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AuditLogEntry[]) || [];
}

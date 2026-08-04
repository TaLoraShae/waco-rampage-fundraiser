import { SupabaseClient } from "@supabase/supabase-js";
import { Administrator } from "./types";

// Records an entry in the audit_logs table. Call this from every
// Server Action that changes something an owner would want a record
// of: administrators added/removed, roles changed, players added or
// removed, fundraiser settings changed, wording changed, images
// changed. RLS only allows an active admin to insert their own
// action (see docs/SUPABASE_SETUP.sql).
export async function logAudit(
  supabase: SupabaseClient,
  actor: Administrator,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {}
) {
  await supabase.from("audit_logs").insert({
    actor_administrator_id: actor.id,
    actor_email: actor.email,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

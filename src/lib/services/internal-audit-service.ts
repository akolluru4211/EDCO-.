import { supabase } from "@/lib/supabase";

export interface AuditLogEntry {
  actorUserId?: string;
  actorRole: "FOUNDER" | "HR" | "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN" | "SYSTEM";
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export async function logInternalAction(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from("internal_audit_logs").insert({
      actor_user_id: entry.actorUserId || null,
      actor_role: entry.actorRole,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      metadata: entry.metadata || {},
    });

    if (error && typeof window !== "undefined") {
      await fetch("/api/internal/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Audit logging error:", err);
  }
}

export async function fetchInternalAuditLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from("internal_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Fetch audit logs error:", err);
    return [];
  }
}

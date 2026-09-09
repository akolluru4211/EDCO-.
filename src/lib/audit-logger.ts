import { SystemAuditLog, UserRole } from "./types";
import { supabase } from "./supabase";

const AUDIT_STORAGE_KEY = "edworld_audit_logs";

/**
 * Creates and records an audit log entry.
 * Resiliently attempts Supabase write, falling back to local audit buffer if offline.
 */
export async function recordAuditLog(params: {
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  action: string;
  resource: string;
  resourceId?: string;
  result: "SUCCESS" | "FAILURE" | "DENIED";
  metadata?: Record<string, any>;
}): Promise<SystemAuditLog> {
  const logEntry: SystemAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: params.actorId || "system",
    actorName: params.actorName || "System Actor",
    actorRole: params.actorRole || "SYSTEM",
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    result: params.result,
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };

  // Local Storage Buffer for zero-latency audit trail exploration
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(AUDIT_STORAGE_KEY);
      const logs: SystemAuditLog[] = existing ? JSON.parse(existing) : [];
      logs.unshift(logEntry);
      // Keep last 250 audit events locally
      if (logs.length > 250) logs.length = 250;
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn("[Audit Logger Local Buffer Exception]:", e);
    }
  }

  // Background write to Supabase table
  try {
    supabase.from("audit_logs").insert({
      id: logEntry.id,
      actor_id: logEntry.actorId,
      actor_name: logEntry.actorName,
      actor_role: logEntry.actorRole,
      action: logEntry.action,
      resource: logEntry.resource,
      resource_id: logEntry.resourceId || null,
      result: logEntry.result,
      metadata: logEntry.metadata,
      created_at: logEntry.timestamp,
    }).then(() => {});
  } catch (err) {
    console.warn("[Audit Logger Supabase Sync Note]:", err);
  }

  return logEntry;
}

/**
 * Retrieves audit logs for administration inspection
 */
export async function getAuditLogs(): Promise<SystemAuditLog[]> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse local audit logs", e);
    }
  }

  // Fallback query to Supabase
  try {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        actorId: d.actor_id,
        actorName: d.actor_name || "Unknown",
        actorRole: d.actor_role || "SYSTEM",
        action: d.action,
        resource: d.resource,
        resourceId: d.resource_id,
        result: d.result || "SUCCESS",
        metadata: d.metadata || {},
        timestamp: d.created_at,
      }));
    }
  } catch (err) {
    console.warn("[getAuditLogs Error]:", err);
  }

  return [];
}

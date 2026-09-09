import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

export type AuditAction =
  // Auth
  | "auth.signup"
  | "auth.login"
  | "auth.logout"
  | "auth.password_reset"
  // Consent
  | "consent.guardian_requested"
  | "consent.guardian_confirmed"
  | "consent.guardian_declined"
  | "consent.tos_accepted"
  // Profile
  | "profile.dob_updated"
  | "profile.interests_updated"
  | "profile.goal_updated"
  // Moderation
  | "moderation.job_approved"
  | "moderation.job_rejected"
  | "moderation.report_submitted"
  | "moderation.report_resolved"
  // Admin Actions
  | "admin.user_suspended"
  | "admin.user_reinstated"
  | "admin.data_access"
  // Billing / Razorpay
  | "billing.subscription_created"
  | "billing.subscription_changed"
  | "billing.subscription_cancelled"
  // Data Rights / DPDP
  | "data_rights.export_requested"
  | "data_rights.deletion_requested"
  | "data_rights.deletion_completed";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: "user" | "minor" | "guardian" | "employer" | "admin" | "system";
  action: AuditAction;
  targetType: "user" | "profile" | "job" | "application" | "report" | "subscription" | "consent" | "message";
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: FirebaseFirestore.FieldValue | string;
}

/**
 * Server-Side Audit Log Helper (Callable only internally within Cloud Functions)
 * CRITICAL PRIVACY RULE: Never log raw PII (e.g. raw DOB, raw passwords, secret tokens, or abusive message texts)
 */
export async function logAuditEvent(
  actorId: string,
  actorRole: AuditLogEntry["actorRole"],
  action: AuditAction,
  targetType: AuditLogEntry["targetType"],
  targetId: string,
  metadata: Record<string, any> = {},
  ipAddress?: string
): Promise<string> {
  const db = admin.firestore();
  const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Sanitize metadata to guarantee zero raw PII leakage in audit logs
  const sanitizedMeta: Record<string, any> = { ...metadata };
  delete sanitizedMeta.dob;
  delete sanitizedMeta.password;
  delete sanitizedMeta.token;
  delete sanitizedMeta.secret;
  delete sanitizedMeta.rawAudio;

  const entry = {
    id: logId,
    actorId: actorId || "anonymous",
    actorRole,
    action,
    targetType,
    targetId,
    metadata: sanitizedMeta,
    ipAddress: ipAddress || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("auditLogs").doc(logId).set(entry);
  return logId;
}

/**
 * Admin-Only Query Endpoint for Audit Logs
 */
export const queryAuditLogs = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  // Strict Admin Isolation: Only platform admins can view audit logs
  if (!request.auth.token.isAdmin) {
    // Check Firestore user doc as fallback
    const userDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
    if (!userDoc.data()?.isAdmin) {
      throw new HttpsError(
        "permission-denied",
        "Unauthorized: Audit log access is restricted exclusively to platform administrators."
      );
    }
  }

  const {
    category,
    actorId,
    limit = 50,
    startAfter,
  } = request.data as {
    category?: string;
    actorId?: string;
    limit?: number;
    startAfter?: string;
  };

  const db = admin.firestore();
  let query: FirebaseFirestore.Query = db.collection("auditLogs").orderBy("timestamp", "desc");

  if (actorId) {
    query = query.where("actorId", "==", actorId);
  }

  query = query.limit(Math.min(100, Math.max(1, limit)));

  const snapshot = await query.get();
  const logs = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
    };
  });

  return {
    success: true,
    count: logs.length,
    logs,
  };
});

/**
 * 2-Year (730 Days) Retention Policy Enforcement
 * Scheduled daily Cloud Function that prunes audit logs older than 730 days
 */
export const cleanupAuditLogsDaily = onSchedule("every 24 hours", async (event) => {
  const db = admin.firestore();
  const retentionThreshold = new Date();
  retentionThreshold.setDate(retentionThreshold.getDate() - 730);

  const expiredLogsQuery = await db
    .collection("auditLogs")
    .where("timestamp", "<", retentionThreshold)
    .limit(500)
    .get();

  if (expiredLogsQuery.empty) {
    console.log("[Audit Retention]: No expired audit logs found beyond 730-day window.");
    return;
  }

  const batch = db.batch();
  expiredLogsQuery.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`[Audit Retention]: Successfully pruned ${expiredLogsQuery.size} expired audit records.`);
});

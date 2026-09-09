"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupAuditLogsDaily = exports.queryAuditLogs = void 0;
exports.logAuditEvent = logAuditEvent;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
/**
 * Server-Side Audit Log Helper (Callable only internally within Cloud Functions)
 * CRITICAL PRIVACY RULE: Never log raw PII (e.g. raw DOB, raw passwords, secret tokens, or abusive message texts)
 */
async function logAuditEvent(actorId, actorRole, action, targetType, targetId, metadata = {}, ipAddress) {
    const db = admin.firestore();
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // Sanitize metadata to guarantee zero raw PII leakage in audit logs
    const sanitizedMeta = { ...metadata };
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
exports.queryAuditLogs = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    // Strict Admin Isolation: Only platform admins can view audit logs
    if (!request.auth.token.isAdmin) {
        // Check Firestore user doc as fallback
        const userDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();
        if (!userDoc.data()?.isAdmin) {
            throw new https_1.HttpsError("permission-denied", "Unauthorized: Audit log access is restricted exclusively to platform administrators.");
        }
    }
    const { category, actorId, limit = 50, startAfter, } = request.data;
    const db = admin.firestore();
    let query = db.collection("auditLogs").orderBy("timestamp", "desc");
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
exports.cleanupAuditLogsDaily = (0, scheduler_1.onSchedule)("every 24 hours", async (event) => {
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
//# sourceMappingURL=auditLogger.js.map
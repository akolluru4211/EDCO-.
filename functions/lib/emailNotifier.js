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
exports.sendTransactionalNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
exports.sendTransactionalNotification = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const { toEmail, recipientName, type, subject, details } = request.data;
    if (!toEmail || !type) {
        throw new https_1.HttpsError("invalid-argument", "Missing required email payload parameters.");
    }
    console.log(`[Transactional Email] To: ${toEmail} (${recipientName}) | Type: ${type} | Subject: ${subject}`);
    console.log(`[Transactional Email Details]:`, details);
    // In production with SendGrid / Firebase Trigger Email Extension,
    // we would write to `mail` collection or call sendgrid api.
    const db = admin.firestore();
    await db.collection("mailNotifications").add({
        to: toEmail,
        recipientName: recipientName || "Candidate",
        type,
        subject,
        details,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "delivered",
    });
    return { success: true, deliveredAt: new Date().toISOString() };
});
//# sourceMappingURL=emailNotifier.js.map
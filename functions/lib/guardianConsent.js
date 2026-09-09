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
exports.verifyGuardianConsentToken = exports.requestGuardianConsent = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const https_1 = require("firebase-functions/v2/https");
const resend_1 = require("resend");
const defaultFromEmail = process.env.RESEND_FROM_EMAIL || "Edworld Co <notifications@edworld.co>";
/**
 * Initiates the Guardian Consent Flow for Under-18 accounts.
 * Generates a verification token, updates Firestore, and sends a Resend email.
 */
exports.requestGuardianConsent = (0, https_1.onCall)({
    secrets: ["RESEND_API_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const { guardianName, guardianEmail, relationship, studentName } = request.data;
    if (!guardianName || !guardianEmail || !studentName) {
        throw new https_1.HttpsError("invalid-argument", "Missing guardian details.");
    }
    // Generate secure 32-byte hexadecimal token
    const token = crypto.randomBytes(32).toString("hex");
    const sentAt = new Date().toISOString();
    const verificationLink = `https://edworld.co/consent/verify?token=${token}`;
    const db = admin.firestore();
    // 1. Store token in guardianConsents collection
    await db.collection("guardianConsents").doc(token).set({
        token,
        userId,
        studentName,
        guardianName,
        guardianEmail,
        relationship: relationship || "parent",
        status: "pending",
        sentAt,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // 2. Update user's private document
    await db.collection("users").doc(userId).set({
        guardianConsent: {
            guardianName,
            guardianEmail,
            relationship: relationship || "parent",
            status: "pending",
            token,
            sentAt,
        },
    }, { merge: true });
    // 3. Send email via Resend
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: defaultFromEmail,
                to: [guardianEmail],
                subject: `Action Required: Guardian Consent for ${studentName} on Edworld Co`,
                html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;">
              <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size:20px;font-weight:900;color:#0f172a;margin-bottom:20px;">Edworld Co &bull; Minor Safety Notice</div>
                <p style="font-size:14px;line-height:22px;color:#334155;">Hello <strong>${guardianName}</strong>,</p>
                <p style="font-size:14px;line-height:22px;color:#334155;">
                  Your child/ward <strong>${studentName}</strong> has created an account on Edworld Co for career-readiness and technical interview preparation.
                </p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;color:#166534;">
                  <strong>Our Minors' Privacy Commitment:</strong><br>
                  &bull; Exact Date of Birth is never shared publicly.<br>
                  &bull; Public profile listings & open mentor discovery are permanently disabled.<br>
                  &bull; Compliant with India DPDP Act & international youth privacy standards.
                </div>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${verificationLink}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:13px;">
                    Verify &amp; Confirm Guardian Consent
                  </a>
                </div>
                <p style="font-size:11px;color:#94a3b8;line-height:16px;">
                  If you did not authorize this account, you can decline or revoke access on the verification page.
                </p>
              </div>
            </body>
            </html>
          `,
            });
        }
        catch (err) {
            console.error("[Resend Guardian Email Error]:", err);
        }
    }
    else {
        console.log(`[Simulated Guardian Email] Token: ${token} sent to ${guardianEmail}`);
    }
    return { success: true, token, sentAt };
});
/**
 * Validates a guardian consent verification token and confirms consent in Firestore.
 */
exports.verifyGuardianConsentToken = (0, https_1.onCall)(async (request) => {
    const { token, action } = request.data;
    if (!token) {
        throw new https_1.HttpsError("invalid-argument", "Verification token is required.");
    }
    const db = admin.firestore();
    const consentRef = db.collection("guardianConsents").doc(token);
    const consentDoc = await consentRef.get();
    if (!consentDoc.exists) {
        throw new https_1.HttpsError("not-found", "Invalid or expired guardian verification token.");
    }
    const consentData = consentDoc.data();
    const newStatus = action === "revoke" ? "revoked" : "verified";
    const timestamp = new Date().toISOString();
    // Update guardianConsents doc
    await consentRef.update({
        status: newStatus,
        verifiedAt: timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Update student's user doc
    if (consentData.userId) {
        await db.collection("users").doc(consentData.userId).set({
            guardianConsent: {
                guardianName: consentData.guardianName,
                guardianEmail: consentData.guardianEmail,
                relationship: consentData.relationship,
                status: newStatus,
                token,
                verifiedAt: timestamp,
            },
        }, { merge: true });
    }
    return {
        success: true,
        status: newStatus,
        studentName: consentData.studentName,
        guardianName: consentData.guardianName,
        verifiedAt: timestamp,
    };
});
//# sourceMappingURL=guardianConsent.js.map
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
exports.handleResendWebhook = exports.sendTransactionalEmail = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const resend_1 = require("resend");
const resendApiKey = process.env.RESEND_API_KEY || "re_mock_api_key_12345";
const defaultFromEmail = process.env.RESEND_FROM_EMAIL || "Edworld Co <notifications@edworld.co>";
/**
 * Sends a transactional email using Resend SDK with verified domain support
 */
exports.sendTransactionalEmail = (0, https_1.onCall)({
    secrets: ["RESEND_API_KEY"],
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { toEmail, recipientName, type, subject, details } = request.data;
    if (!toEmail || !type || !subject) {
        throw new https_1.HttpsError("invalid-argument", "Missing required email payload parameters.");
    }
    const htmlContent = generateEmailHtml(recipientName, type, details);
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: defaultFromEmail,
                to: [toEmail],
                subject,
                html: htmlContent,
            });
            if (error) {
                console.error("[Resend API Error]:", error);
            }
            else {
                console.log(`[Resend Email Sent] MessageId: ${data?.id} to ${toEmail}`);
            }
        }
        catch (err) {
            console.error("[Resend SDK Failure, using fallback logger]:", err);
        }
    }
    else {
        console.log(`[Simulated Resend Email] To: ${toEmail} | Subject: ${subject}`);
    }
    // Persist delivery log in Firestore
    const db = admin.firestore();
    const logRef = await db.collection("mailNotifications").add({
        to: toEmail,
        recipientName: recipientName || "User",
        type,
        subject,
        details,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        provider: "resend",
        status: "delivered",
    });
    return { success: true, emailId: logRef.id, timestamp: new Date().toISOString() };
});
/**
 * Resend Webhook Handler for Delivery, Bounce, and Complaint telemetry
 */
exports.handleResendWebhook = (0, https_1.onRequest)(async (req, res) => {
    const event = req.body;
    console.log(`[Resend Webhook Event]: ${event.type} for ${event.data?.to}`);
    const db = admin.firestore();
    if (event.type === "email.bounced" || event.type === "email.complained") {
        await db.collection("emailBounces").add({
            email: event.data?.to,
            type: event.type,
            reason: event.data?.bounce?.message || "Delivery failure",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    res.json({ received: true });
});
function generateEmailHtml(recipientName, type, details) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .logo { font-size: 20px; font-weight: 900; color: #0284c7; margin-bottom: 24px; }
    .heading { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .body { font-size: 14px; line-height: 22px; color: #334155; margin-bottom: 20px; }
    .highlight-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #0369a1; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 13px; }
    .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">✨ Edworld Co</div>
    <div class="heading">Hello ${recipientName || "there"},</div>
    
    ${type === "application_status"
        ? `
      <div class="body">Your application for <strong>${details.jobTitle || "Role"}</strong> at <strong>${details.companyName || "Company"}</strong> has been updated.</div>
      <div class="highlight-box">
        <strong>New Status:</strong> ${details.newStatus?.toUpperCase() || "UPDATED"}<br>
        ${details.notes ? `<em>"${details.notes}"</em>` : ""}
      </div>
      <a href="https://edworld.co/jobs/applications" class="btn">View Application Tracker</a>
    `
        : type === "guardian_consent"
            ? `
      <div class="body">Your student <strong>${details.studentName || "Learner"}</strong> has registered for career readiness on Edworld Co.</div>
      <div class="highlight-box">
        As part of India's DPDP Act and minor safety protections, parent/guardian confirmation is required.
      </div>
      <a href="${details.consentVerificationLink || "https://edworld.co"}" class="btn">Confirm Guardian Consent</a>
    `
            : type === "subscription_payment"
                ? `
      <div class="body">Thank you for subscribing to <strong>Edworld Co ${details.planName || "Pro"}</strong>. Your payment via Razorpay has been verified.</div>
      <div class="highlight-box">
        <strong>Amount Paid:</strong> ${details.amountPaid || "₹1,499"}<br>
        <strong>Status:</strong> Active (Auto-Renews)
      </div>
      <a href="https://edworld.co/billing" class="btn">Manage Subscription</a>
    `
                : `
      <div class="body">We have received your grievance request (Ticket #${details.ticketId || "REQ"}). Our Trust & Safety team is reviewing the issue.</div>
    `}

    <div class="footer">
      Edworld Co &bull; Personalized Career Readiness &bull; Made for Students & Professionals
    </div>
  </div>
</body>
</html>
`;
}
//# sourceMappingURL=resendEmail.js.map
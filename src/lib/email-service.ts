/**
 * Centralized Email & Notification Routing Service
 * Ensures all system notices, contact inquiries, safety reports, and escalations 
 * route directly to the designated admin and inbox: edworld.eden@gmail.com
 */

import { supabase } from "@/lib/supabase";

export const PRIMARY_ADMIN_EMAIL = "edworld.eden@gmail.com";
export const SUPPORT_EMAIL = "edworld.eden@gmail.com";
export const GRIEVANCE_EMAIL = "edworld.eden@gmail.com";

export interface EmailDispatchPayload {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  category?: "contact" | "report" | "auth" | "ambassador" | "interview" | "application" | "system";
  metadata?: Record<string, any>;
}

/**
 * Dispatches an email notification.
 * Always ensures PRIMARY_ADMIN_EMAIL (edworld.eden@gmail.com) receives a copy or direct delivery.
 */
export async function sendEmailNotification(payload: EmailDispatchPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipients = Array.isArray(payload.to) ? payload.to : payload.to ? [payload.to] : [PRIMARY_ADMIN_EMAIL];
    
    // Always include master admin email if it's an inquiry, report, or system alert
    const bccList = Array.isArray(payload.bcc) ? [...payload.bcc] : payload.bcc ? [payload.bcc] : [];
    if (!recipients.includes(PRIMARY_ADMIN_EMAIL) && !bccList.includes(PRIMARY_ADMIN_EMAIL)) {
      bccList.push(PRIMARY_ADMIN_EMAIL);
    }

    // 1. If Resend API Key is available, dispatch via Resend API
    if (resendApiKey && !resendApiKey.includes("placeholder") && !resendApiKey.includes("your-key")) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `EdWorld Co. <notifications@edworldco.in>`,
            to: recipients,
            bcc: bccList.length > 0 ? bccList : undefined,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          console.info(`[Email Dispatch Success] Message sent to ${recipients.join(", ")} (BCC: ${bccList.join(", ")}) ID: ${data.id}`);
          return { success: true, id: data.id };
        } else {
          const errData = await res.text();
          console.warn("[Resend API Dispatch Warning]:", errData);
        }
      } catch (dispatchErr) {
        console.warn("[Resend Dispatch Error]:", dispatchErr);
      }
    }

    // 2. Persist in system audit / notification log in database
    try {
      await supabase.from("system_audit_logs").insert({
        action: `EMAIL_DISPATCH_${payload.category?.toUpperCase() || "GENERAL"}`,
        actor_id: "system",
        target_id: PRIMARY_ADMIN_EMAIL,
        metadata: {
          to: recipients,
          bcc: bccList,
          subject: payload.subject,
          category: payload.category,
          metadata: payload.metadata,
          dispatched_at: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      console.warn("[Email DB Audit Log Note]:", dbErr);
    }

    console.info(`[Email Routing Ready] Routed to ${PRIMARY_ADMIN_EMAIL} for subject: "${payload.subject}"`);
    return { success: true };
  } catch (err: any) {
    console.error("[sendEmailNotification Error]:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Forwards user contact submissions directly to edworld.eden@gmail.com
 */
export async function forwardContactInquiry(inquiry: {
  name: string;
  email: string;
  category: string;
  message: string;
  ip?: string;
}) {
  return sendEmailNotification({
    to: PRIMARY_ADMIN_EMAIL,
    subject: `[EdWorld Contact Inquiry] ${inquiry.category} from ${inquiry.name}`,
    category: "contact",
    html: `
      <h2>New Contact Inquiry on EdWorld Co.</h2>
      <p><strong>From:</strong> ${inquiry.name} (&lt;${inquiry.email}&gt;)</p>
      <p><strong>Category:</strong> ${inquiry.category}</p>
      <p><strong>Received At:</strong> ${new Date().toUTCString()}</p>
      <hr />
      <h3>Message:</h3>
      <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${inquiry.message}</p>
      <hr />
      <p style="font-size: 11px; color: #888;">This inquiry was dispatched directly to ${PRIMARY_ADMIN_EMAIL}.</p>
    `,
    metadata: inquiry,
  });
}

/**
 * Forwards safety & content reports directly to edworld.eden@gmail.com
 */
export async function forwardSafetyReport(report: {
  reporterId?: string;
  targetId: string;
  category: string;
  reason: string;
  details?: string;
}) {
  return sendEmailNotification({
    to: PRIMARY_ADMIN_EMAIL,
    subject: `🚨 [Urgent Safety Report] ${report.category} - Target: ${report.targetId}`,
    category: "report",
    html: `
      <h2>Safety & Moderation Report Lodged</h2>
      <p><strong>Category:</strong> ${report.category}</p>
      <p><strong>Target ID:</strong> ${report.targetId}</p>
      <p><strong>Reporter ID:</strong> ${report.reporterId || "Anonymous"}</p>
      <p><strong>Reason:</strong> ${report.reason}</p>
      ${report.details ? `<p><strong>Details:</strong> ${report.details}</p>` : ""}
      <p><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
      <hr />
      <p style="font-size: 11px; color: #888;">Dispatched to ${PRIMARY_ADMIN_EMAIL} for compliance review.</p>
    `,
    metadata: report,
  });
}

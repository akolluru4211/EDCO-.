import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmailNotification, PRIMARY_ADMIN_EMAIL } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "meeting", // "meeting" | "task"
      title,
      scheduledAt, // string date/time or deadline
      meetingUrl,
      agenda,
      taskInstructions,
      sendTestToAdmin = false,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required for the broadcast." }, { status: 400 });
    }

    // 1. Fetch all accepted ambassadors
    const { data: ambassadors, error: ambError } = await supabase
      .from("ambassadors")
      .select("*, users:user_id(name, email, phone)")
      .eq("is_active", true);

    const activeAmbassadors = ambassadors || [];

    // Extract valid recipient emails
    let recipientEmails: string[] = activeAmbassadors
      .map((a: any) => a.users?.email)
      .filter((email: string | undefined): email is string => Boolean(email && email.includes("@")));

    if (sendTestToAdmin || recipientEmails.length === 0) {
      recipientEmails = [PRIMARY_ADMIN_EMAIL];
    }

    const isMeeting = type === "meeting";
    const subject = `[EdWorld Ambassador Hub] ${isMeeting ? "📅 Campus Leader Sync" : "📋 Action Task"}: ${title}`;

    const innerContentHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111111;">
        <div style="padding: 24px 0; border-bottom: 2px solid #000000;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #000000; color: #ffffff; padding: 4px 10px; border-radius: 4px;">
            OFFICIAL AMBASSADOR DISPATCH
          </span>
          <h1 style="font-size: 24px; font-weight: 900; margin: 16px 0 8px 0; letter-spacing: -0.02em; color: #000000;">
            ${title}
          </h1>
          <p style="font-size: 14px; color: #666666; margin: 0;">
            ${isMeeting ? "You have been scheduled for an official campus coordination session." : "A high-priority campus outreach and engagement task has been assigned."}
          </p>
        </div>

        <div style="padding: 24px 0; border-bottom: 1px solid #eeeeee;">
          <table style="width: 100%; border-collapse: collapse;">
            ${scheduledAt ? `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #666666; width: 140px;">${isMeeting ? "Session Date & Time:" : "Task Due Date:"}</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 800; color: #000000;">${scheduledAt}</td>
            </tr>` : ""}
            ${meetingUrl ? `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #666666;">Meeting Link:</td>
              <td style="padding: 8px 0; font-size: 14px;">
                <a href="${meetingUrl}" target="_blank" rel="noopener noreferrer" style="color: #000000; font-weight: 800; text-decoration: underline;">
                  ${meetingUrl} &rarr;
                </a>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #666666;">Target Group:</td>
              <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #444444;">All Accepted Campus Ambassadors</td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px 0;">
          <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 0; color: #000000;">
            ${isMeeting ? "Agenda & Discussion Points" : "Action Item Details & Instructions"}
          </h3>
          <div style="font-size: 14px; line-height: 1.6; color: #222222; background: #fafafa; border: 1px solid #eaeaea; border-radius: 12px; padding: 18px; white-space: pre-wrap;">
${agenda || taskInstructions || "Please review the ambassador dashboard for instructions and coordinates."}
          </div>
        </div>

        ${meetingUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">
            Join Scheduled Meeting &rarr;
          </a>
        </div>
        ` : `
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://edworldco.in/ambassador/hub" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">
            Open Ambassador Hub &rarr;
          </a>
        </div>
        `}

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">EdWorld Co. • Campus Ambassador Network</p>
          <p style="margin: 0;">Hyderabad, Telangana, India • Confidential Student Leadership Portal</p>
        </div>
      </div>
    `;

    const brandedEmailHtml = renderBrandedEmailHtml({
      previewText: subject,
      title: subject,
      contentHtml: innerContentHtml,
      ctaText: meetingUrl ? "Join Scheduled Meeting" : "Open Ambassador Hub",
      ctaUrl: meetingUrl || "https://edworldco.in/ambassador/hub",
    });

    // 2. Dispatch email via Resend
    const dispatchResult = await sendEmailNotification({
      to: recipientEmails.length === 1 ? recipientEmails[0] : recipientEmails,
      bcc: [PRIMARY_ADMIN_EMAIL],
      subject,
      html: brandedEmailHtml,
      category: "ambassador",
      metadata: {
        type,
        title,
        scheduledAt,
        ambassadorCount: recipientEmails.length,
      }
    });

    return NextResponse.json({
      success: true,
      deliveredToCount: recipientEmails.length,
      recipients: recipientEmails,
      messageId: dispatchResult.id || "resend-simulated",
      notice: dispatchResult.success ? "Emails successfully dispatched via Resend." : "Logged to system audit trail."
    });
  } catch (err: any) {
    console.error("[Ambassador Broadcast Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch ambassador emails." }, { status: 500 });
  }
}

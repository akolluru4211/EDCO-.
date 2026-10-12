import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmailNotification, PRIMARY_ADMIN_EMAIL } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch audience stats
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, role, career_stage, onboarding_completed, email");

    const allProfiles = profiles || [];
    const students = allProfiles.filter(p => !p.career_stage || p.career_stage === "STUDENT" || p.role === "STUDENT" || p.career_stage === "college");
    const onboardedStudents = students.filter(s => s.onboarding_completed);

    // 2. Fetch past bulk mail broadcasts
    const { data: logs } = await supabase
      .from("system_audit_logs")
      .select("*")
      .ilike("action", "EMAIL_DISPATCH_BULK%")
      .order("created_at", { ascending: false })
      .limit(10);

    const hasResendKey = Boolean(
      process.env.RESEND_API_KEY &&
      !process.env.RESEND_API_KEY.includes("placeholder") &&
      !process.env.RESEND_API_KEY.includes("your-key")
    );

    return NextResponse.json({
      success: true,
      counts: {
        allStudents: students.length,
        onboardedStudents: onboardedStudents.length,
        totalUsers: allProfiles.length,
      },
      hasResendKey,
      recentBroadcasts: logs || [],
    });
  } catch (err: any) {
    console.error("[Bulk Mail GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load audience telemetry." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      audience = "all_students", // "all_students" | "onboarded_students" | "all_users" | "test_admin"
      subject,
      headline,
      message,
      ctaLabel,
      ctaUrl,
      isTest = false,
    } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Subject and Message body are required." }, { status: 400 });
    }

    // 1. Resolve recipients
    let recipientEmails: string[] = [];

    if (isTest || audience === "test_admin") {
      recipientEmails = [PRIMARY_ADMIN_EMAIL];
    } else {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email, career_stage, role, onboarding_completed");

      const allProfiles = profiles || [];

      if (audience === "all_students") {
        recipientEmails = allProfiles
          .filter(p => !p.career_stage || p.career_stage === "STUDENT" || p.role === "STUDENT" || p.career_stage === "college")
          .map(p => p.email)
          .filter((e): e is string => Boolean(e && e.includes("@")));
      } else if (audience === "onboarded_students") {
        recipientEmails = allProfiles
          .filter(p => (!p.career_stage || p.career_stage === "STUDENT") && p.onboarding_completed)
          .map(p => p.email)
          .filter((e): e is string => Boolean(e && e.includes("@")));
      } else {
        // All users
        recipientEmails = allProfiles
          .map(p => p.email)
          .filter((e): e is string => Boolean(e && e.includes("@")));
      }
    }

    // Ensure test/fallback recipient if no emails exist in DB yet
    if (recipientEmails.length === 0) {
      recipientEmails = [PRIMARY_ADMIN_EMAIL];
    }

    // Format clean HTML body
    const formattedBodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111111;">
        <div style="padding: 24px 0 16px 0; border-bottom: 2px solid #000000;">
          <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #000000; color: #ffffff; padding: 4px 10px; border-radius: 4px;">
            COMMUNITY ANNOUNCEMENT
          </span>
          <h1 style="font-size: 26px; font-weight: 900; margin: 16px 0 8px 0; letter-spacing: -0.02em; color: #000000;">
            ${headline || subject}
          </h1>
        </div>

        <div style="padding: 24px 0; font-size: 15px; line-height: 1.7; color: #222222; white-space: pre-wrap;">
${message}
        </div>

        ${ctaLabel && ctaUrl ? `
        <div style="text-align: center; margin: 28px 0;">
          <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">
            ${ctaLabel} &rarr;
          </a>
        </div>
        ` : ""}

        <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">EdWorld Co. • Skills &amp; Career OS</p>
          <p style="margin: 0 0 8px 0;">Hyderabad, Telangana, India</p>
          <p style="margin: 0; font-size: 11px; color: #aaaaaa;">
            You received this email as a registered student member. To manage email preferences, visit your account settings.
          </p>
        </div>
      </div>
    `;

    const fullBrandedEmail = renderBrandedEmailHtml({
      previewText: subject,
      title: headline || subject,
      contentHtml: formattedBodyHtml,
      ctaText: ctaLabel || undefined,
      ctaUrl: ctaUrl || undefined,
    });

    // 2. Batch dispatch via Resend SDK
    // To handle Resend limits, batch into slices of 50
    const BATCH_SIZE = 50;
    let deliveredCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
      const chunk = recipientEmails.slice(i, i + BATCH_SIZE);
      try {
        await sendEmailNotification({
          to: chunk.length === 1 ? chunk[0] : chunk,
          bcc: [PRIMARY_ADMIN_EMAIL],
          subject,
          html: fullBrandedEmail,
          category: "newsletter",
          metadata: {
            bulkBatchIndex: Math.floor(i / BATCH_SIZE) + 1,
            audience,
            isTest,
          }
        });
        deliveredCount += chunk.length;
      } catch (err: any) {
        errors.push(err.message || "Failed dispatch for chunk");
      }
    }

    // 3. Log bulk campaign to audit trail
    await supabase.from("system_audit_logs").insert({
      action: isTest ? "EMAIL_DISPATCH_BULK_TEST" : "EMAIL_DISPATCH_BULK_STUDENTS",
      actor_id: "admin",
      metadata: {
        subject,
        headline,
        audience,
        recipientCount: deliveredCount,
        isTest,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }
    });

    return NextResponse.json({
      success: true,
      deliveredCount,
      audience,
      isTest,
      notice: isTest
        ? `Test preview sent successfully to ${PRIMARY_ADMIN_EMAIL}`
        : `Dispatched announcement to ${deliveredCount} students via Resend.`,
    });
  } catch (err: any) {
    console.error("[Bulk Mail POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch bulk email." }, { status: 500 });
  }
}

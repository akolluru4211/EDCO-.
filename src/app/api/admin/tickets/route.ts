import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUserRole } from "@/lib/server-role-guard";
import { sendEmailNotification, PRIMARY_ADMIN_EMAIL } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export interface AdminTicket {
  id: string;
  type: "inquiry" | "report" | "ugc_review";
  title: string;
  category: string;
  sourceEmail?: string;
  authorName?: string;
  description: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "APPROVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  rawPayload?: any;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (userId) {
      const roleCheck = await verifyUserRole(userId, ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EMPLOYEE", "HR"]);
      if (!roleCheck.authorized) {
        return NextResponse.json({ success: false, error: "Unauthorized access to tickets portal." }, { status: 403 });
      }
    }

    const tickets: AdminTicket[] = [];

    // 1. Fetch User Inquiries from support_inquiries
    try {
      const { data: inquiries } = await supabase
        .from("support_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (inquiries && inquiries.length > 0) {
        inquiries.forEach((inq: any) => {
          tickets.push({
            id: inq.id,
            type: "inquiry",
            title: `[${inq.category || "General Support"}] Inquiry from ${inq.name || "User"}`,
            category: inq.category || "General Support",
            sourceEmail: inq.email,
            authorName: inq.name || "Visitor / User",
            description: inq.message || "No message content",
            status: (inq.status || "NEW").toUpperCase(),
            priority: inq.category?.includes("Grievance") || inq.category?.includes("Privacy") ? "HIGH" : "MEDIUM",
            assignedTo: inq.assigned_to,
            resolutionNotes: inq.resolution_notes,
            createdAt: inq.created_at || new Date().toISOString(),
            updatedAt: inq.updated_at || inq.created_at || new Date().toISOString(),
            rawPayload: inq,
          });
        });
      }
    } catch (e) {
      console.warn("[Fetch support_inquiries note]:", e);
    }

    // 2. Fetch Safety & Content Reports from user_reports
    try {
      const { data: reports } = await supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (reports && reports.length > 0) {
        reports.forEach((rep: any) => {
          tickets.push({
            id: rep.id,
            type: "report",
            title: `🚨 Report: ${rep.category || "Content Violation"} (Target: ${rep.reported_id || rep.target_id || "Account"})`,
            category: rep.category || "Violation",
            authorName: `Reporter (${rep.reporter_id || "Anonymous"})`,
            description: `Reason: ${rep.reason || "Policy Violation"}\nDetails: ${rep.details || "No additional text"}`,
            status: (rep.status || "NEW").toUpperCase(),
            priority: "URGENT",
            assignedTo: rep.assigned_to,
            resolutionNotes: rep.resolution_notes,
            createdAt: rep.created_at || new Date().toISOString(),
            updatedAt: rep.updated_at || rep.created_at || new Date().toISOString(),
            rawPayload: rep,
          });
        });
      }
    } catch (e) {
      console.warn("[Fetch user_reports note]:", e);
    }

    // 3. Fetch Pending UGC Moderation items from interview_experiences
    try {
      const { data: ugcItems } = await supabase
        .from("interview_experiences")
        .select("id, company, role, author_id, moderation_status, created_at, overall_notes")
        .eq("moderation_status", "pending")
        .limit(30);

      if (ugcItems && ugcItems.length > 0) {
        ugcItems.forEach((ugc: any) => {
          tickets.push({
            id: ugc.id,
            type: "ugc_review",
            title: `Review Interview Archive: ${ugc.company} - ${ugc.role}`,
            category: "UGC Moderation",
            authorName: `Author (${ugc.author_id || "Candidate"})`,
            description: ugc.overall_notes || "Interview breakdown submission pending editorial review.",
            status: "NEW",
            priority: "MEDIUM",
            createdAt: ugc.created_at || new Date().toISOString(),
            updatedAt: ugc.created_at || new Date().toISOString(),
            rawPayload: ugc,
          });
        });
      }
    } catch (e) {
      console.warn("[Fetch interview_experiences note]:", e);
    }

    // Sort all tickets newest first
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: tickets.length,
      openCount: tickets.filter((t) => t.status === "NEW" || t.status === "IN_PROGRESS").length,
      resolvedCount: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "APPROVED").length,
      tickets,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to load tickets" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { ticketId, ticketType, status, resolutionNotes, assignedTo } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ success: false, error: "Missing ticketId or status." }, { status: 400 });
    }

    const normStatus = status.toUpperCase();

    // 1. Update in the corresponding table
    if (ticketType === "inquiry") {
      await supabase
        .from("support_inquiries")
        .update({
          status: normStatus,
          resolution_notes: resolutionNotes || null,
          assigned_to: assignedTo || userId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      // Fetch email to notify if resolved
      const { data: inq } = await supabase.from("support_inquiries").select("*").eq("id", ticketId).maybeSingle();
      if (inq?.email && (normStatus === "RESOLVED" || normStatus === "CLOSED")) {
        const emailHtml = renderBrandedEmailHtml({
          previewText: `Your inquiry regarding ${inq.category || "EdWorld Support"} has been resolved.`,
          title: "Your Support Request Has Been Resolved",
          contentHtml: `
            <p>Hi <strong>${inq.name || "there"}</strong>,</p>
            <p>Our support & compliance team has reviewed and resolved your inquiry (Ticket: <code>#${ticketId.slice(0, 8)}</code>).</p>
            ${resolutionNotes ? `
              <div style="background-color: #F4F6FB; border: 1px solid #E8ECF2; border-radius: 16px; padding: 18px; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #8E95A5; text-transform: uppercase;">Resolution Summary</div>
                <div style="font-size: 14px; color: #13141B; margin-top: 6px; line-height: 1.6;">${resolutionNotes}</div>
              </div>
            ` : ""}
            <p>If you have further questions or require additional assistance, please reply to this email or visit our help center.</p>
          `,
          ctaText: "Open EdWorld Platform",
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in"}/contact`,
        });

        await sendEmailNotification({
          to: inq.email,
          subject: `[Resolved] Support Request #${ticketId.slice(0, 8)}: ${inq.category || "EdWorld Co"}`,
          html: emailHtml,
          category: "contact",
        });
      }
    } else if (ticketType === "report") {
      await supabase
        .from("user_reports")
        .update({
          status: normStatus,
          resolution_notes: resolutionNotes || null,
          assigned_to: assignedTo || userId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
    } else if (ticketType === "ugc_review") {
      const ugcStatus = normStatus === "APPROVED" ? "approved" : normStatus === "REJECTED" ? "rejected" : "approved";
      await supabase
        .from("interview_experiences")
        .update({
          moderation_status: ugcStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticketId);
    }

    // 2. Insert immutable audit log
    try {
      await supabase.from("audit_logs").insert({
        actor_id: userId || "admin-system",
        action: `ticket.status_updated_${normStatus.toLowerCase()}`,
        target_type: ticketType || "ticket",
        target_id: ticketId,
        metadata: {
          status: normStatus,
          resolutionNotes,
          assignedTo,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      console.warn("[Audit log error]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Ticket #${ticketId.slice(0, 8)} updated to ${normStatus}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update ticket" }, { status: 500 });
  }
}

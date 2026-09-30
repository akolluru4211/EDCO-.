import { NextRequest, NextResponse } from "next/server";
import { broadcastToSubscribers } from "@/lib/email-service";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { subject, title, contentHtml, ctaText, ctaUrl } = body;

    if (!subject || !title || !contentHtml) {
      return NextResponse.json(
        { success: false, error: "Subject, title, and contentHtml are required." },
        { status: 400 }
      );
    }

    // Role check: Only admin, founder, or super_admin can broadcast
    if (userId) {
      const roleCheck = await verifyUserRole(userId, ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE"]);
      if (!roleCheck.authorized) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Elevated role required to broadcast emails." },
          { status: 403 }
        );
      }
    }

    const result = await broadcastToSubscribers({
      subject,
      title,
      contentHtml,
      ctaText,
      ctaUrl,
      sentByUserId: userId || "admin-system",
    });

    return NextResponse.json({
      success: result.success,
      totalSent: result.totalSent,
      failedCount: result.failedCount,
      subscribersCount: result.subscribersCount,
      message: `Broadcast completed. Sent to ${result.totalSent} subscribers.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to broadcast newsletter" },
      { status: 500 }
    );
  }
}

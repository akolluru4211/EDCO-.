import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { forwardSafetyReport } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reporterId = req.headers.get("x-user-id") || body.reporterId || body.userId;
    const reportedId = body.reportedId || body.targetId;
    const category = body.category || body.type || "profile";
    const reason = body.reason || "Policy violation";
    const details = body.details || "";

    if (!reporterId || !reportedId) {
      return NextResponse.json({ success: false, error: "Missing reporter or reported user ID." }, { status: 400 });
    }

    if (reporterId === reportedId) {
      return NextResponse.json({ success: false, error: "Cannot report your own account." }, { status: 400 });
    }

    const { data: reportRecord, error } = await supabase
      .from("user_reports")
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        category,
        reason,
        details: details || null,
        status: "PENDING"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Forward report notification directly to edworld.eden@gmail.com
    await forwardSafetyReport({
      reporterId,
      targetId: reportedId,
      category,
      reason,
      details,
    });

    return NextResponse.json({ success: true, report: reportRecord, message: "Report submitted for moderation review." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

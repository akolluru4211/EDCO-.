import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logAdminStudentInspection, verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, studentId, reason = "Compliance & Verification Review" } = body;

    if (!adminId || !studentId) {
      return NextResponse.json({ error: "adminId and studentId are required." }, { status: 400 });
    }

    // Role Verification: Caller must be an authenticated platform admin
    const check = await verifyUserRole(adminId, ["admin"]);
    if (!check.authorized) {
      return NextResponse.json({ error: check.error }, { status: check.statusCode || 403 });
    }

    // Purpose-built logged access
    await logAdminStudentInspection(adminId, studentId, reason);

    // Fetch student summary for admin review
    const { data: studentRecord } = await supabase
      .from("profiles")
      .select("id, name, age_band, grade_level, created_at, primary_goal")
      .eq("id", studentId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      message: "Student record inspected and logged to audit trail.",
      student: studentRecord
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

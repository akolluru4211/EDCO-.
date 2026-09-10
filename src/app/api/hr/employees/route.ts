import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const check = await requireRole(req, ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json(
      { error: check.error || "Forbidden: HR clearance required." },
      { status: check.statusCode || 403 }
    );
  }

  const { data: employees, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, age_band, is_admin, is_hr, is_founder, is_teacher, is_school_admin, is_employer")
    .in("role", ["EMPLOYEE", "HR", "FOUNDER", "TEACHER", "COLLEGE_ADMIN"]);

  return NextResponse.json({
    success: true,
    employees: employees || []
  });
}


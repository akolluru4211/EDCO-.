import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server-role-guard";
import { getEmployeePayrollRecords } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const check = await requireRole(req, ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json(
      { error: check.error || "Forbidden: Employee role required." },
      { status: check.statusCode || 403 }
    );
  }

  const userId = check.user?.id || "emp-101";
  const records = await getEmployeePayrollRecords(userId);
  return NextResponse.json({
    success: true,
    payroll: records
  });
}


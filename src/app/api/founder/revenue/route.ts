import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server-role-guard";
import { getExecutiveKPI } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const check = await requireRole(req, ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json(
      { error: check.error || "Forbidden: Founder clearance required." },
      { status: check.statusCode || 403 }
    );
  }

  const kpi = await getExecutiveKPI();
  return NextResponse.json({
    success: true,
    revenue: kpi
  });
}


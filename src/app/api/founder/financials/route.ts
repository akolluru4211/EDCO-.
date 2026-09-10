import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server-role-guard";
import { getExecutiveKPI, getFounderAlerts } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const check = await requireRole(req, ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]);
  if (!check.authorized) {
    return NextResponse.json(
      { error: check.error || "Forbidden: Founder clearance required." },
      { status: check.statusCode || 403 }
    );
  }

  const [kpi, alerts] = await Promise.all([
    getExecutiveKPI(),
    getFounderAlerts()
  ]);

  return NextResponse.json({
    success: true,
    financials: kpi,
    alerts
  });
}


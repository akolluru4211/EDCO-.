import { NextRequest, NextResponse } from "next/server";
import { computeCareerGapSummary, TARGET_ROLE_PROFILES } from "@/lib/career-switch-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { targetRoleId = "fullstack_engineer", userSkillLevels = {} } = body;

    const gapSummary = computeCareerGapSummary(targetRoleId, userSkillLevels);

    return NextResponse.json({
      success: true,
      availableRoles: TARGET_ROLE_PROFILES.map(r => ({ id: r.id, title: r.title, description: r.description })),
      summary: gapSummary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upskilling path error" }, { status: 500 });
  }
}

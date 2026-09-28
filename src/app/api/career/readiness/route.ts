import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeMultidimensionalReadiness, computeCareerGapAnalysis } from "@/lib/services/career-intelligence-graph";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get("role") || "Full Stack Software Engineer";

    const [readiness, gapAnalysis] = await Promise.all([
      computeMultidimensionalReadiness(user.id, targetRole, supabase),
      computeCareerGapAnalysis(user.id, targetRole, supabase)
    ]);

    return NextResponse.json({
      success: true,
      readiness,
      gapAnalysis
    });
  } catch (err: any) {
    console.error("[Career Readiness API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch career readiness" }, { status: 500 });
  }
}

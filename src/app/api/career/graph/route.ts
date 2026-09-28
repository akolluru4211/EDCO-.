import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { synthesizePersonalCareerGraph, computeSkillIntelligence } from "@/lib/services/career-intelligence-graph";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [graph, skills] = await Promise.all([
      synthesizePersonalCareerGraph(user.id, supabase),
      computeSkillIntelligence(user.id, supabase)
    ]);

    return NextResponse.json({
      success: true,
      graph,
      skills
    });
  } catch (err: any) {
    console.error("[Career Graph API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch career graph" }, { status: 500 });
  }
}

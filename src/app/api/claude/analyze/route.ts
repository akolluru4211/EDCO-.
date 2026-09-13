import { NextRequest, NextResponse } from "next/server";
import { ClaudeOrchestrator, ClaudeAnalysisRequest } from "@/lib/ai/claude-orchestrator";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type ClaudeAnalysisType = 
  | "analyze_resume" 
  | "analyze_job_match" 
  | "analyze_interview" 
  | "analyze_language" 
  | "analyze_project" 
  | "analyze_coding_attempt" 
  | "generate_personalized_feedback" 
  | "generate_practice_plan"
  | "code_review" 
  | "resume_ats" 
  | "project_architecture" 
  | "appraisal_performance" 
  | "interview_response"
  | "problem_solution";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const { 
      type = "analyze_resume", 
      content, 
      metadata = {}, 
      inputReference,
      bypassCache = false
    }: {
      type: ClaudeAnalysisType;
      content: string;
      metadata?: Record<string, any>;
      inputReference?: Record<string, any>;
      bypassCache?: boolean;
    } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required for Claude analysis." }, { status: 400 });
    }

    // Map legacy names to canonical Phase 33 analysis types
    let canonicalType: ClaudeAnalysisRequest["analysisType"] = "analyze_resume";
    let feature: ClaudeAnalysisRequest["feature"] = "resume";

    if (type === "analyze_job_match" || type === "resume_ats") {
      canonicalType = "analyze_job_match";
      feature = "ats";
    } else if (type === "analyze_interview" || type === "interview_response") {
      canonicalType = "analyze_interview";
      feature = "interview";
    } else if (type === "analyze_language") {
      canonicalType = "analyze_language";
      feature = "language";
    } else if (type === "analyze_project" || type === "project_architecture") {
      canonicalType = "analyze_project";
      feature = "project";
    } else if (type === "analyze_coding_attempt" || type === "code_review" || type === "problem_solution") {
      canonicalType = "analyze_coding_attempt";
      feature = "coding";
    } else if (type === "generate_personalized_feedback" || type === "appraisal_performance") {
      canonicalType = "generate_personalized_feedback";
      feature = "career";
    } else if (type === "generate_practice_plan") {
      canonicalType = "generate_practice_plan";
      feature = "career";
    }

    const userId = user?.id || req.headers.get("x-user-id") || "guest";

    const res = await ClaudeOrchestrator.analyze({
      userId,
      feature,
      analysisType: canonicalType,
      content: content.trim(),
      metadata,
      inputReference,
      bypassCache
    });

    if (res.success && res.data) {
      return NextResponse.json({
        success: true,
        type: canonicalType,
        source: "claude-orchestrator",
        analysis: res.data,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: res.error || "Failed to execute Claude analysis."
    }, { status: res.statusCode || 500 });

  } catch (error: any) {
    console.error("[Claude Analysis Route Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to execute Claude analysis." }, { status: 500 });
  }
}


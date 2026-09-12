import { NextRequest, NextResponse } from "next/server";
import { executeMCPTool } from "@/lib/mcp/engine";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export interface GeneratedQuestion {
  id: string;
  text: string;
  category: string;
  difficultyLevel: 0 | 1 | 2;
  keyPoints?: string[];
  suggestedDurationSeconds?: number;
  isWarmup?: boolean;
  type: "warmup" | "behavioral" | "technical";
}

const FIXED_OPENING_QUESTION: GeneratedQuestion = {
  id: "warmup-opening-1",
  text: "Tell me about yourself, your background, and what drives your passion for this domain.",
  category: "General",
  difficultyLevel: 0,
  keyPoints: ["Clear professional overview", "Key achievements", "Alignment with career goals"],
  suggestedDurationSeconds: 120,
  isWarmup: true,
  type: "warmup"
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { jobDescription, category = "Software Engineering", effectiveLevel = 0, userId = "learner-user", candidateName = "" } = body;

    const firstName = candidateName ? candidateName.trim().split(" ")[0] : "";
    const personalizedWarmup = {
      ...FIXED_OPENING_QUESTION,
      text: firstName 
        ? `Hi ${firstName}, welcome to your mock interview. Let's begin by having you tell me about yourself, your background, and what drives your passion for this domain.`
        : FIXED_OPENING_QUESTION.text,
    };

    // Execute via Central MCP Engine
    const mcpResult = await executeMCPTool(
      "generate_interview_questions",
      { category, effectiveLevel, jobDescription, candidateName },
      {
        userId: req.headers.get("x-user-id") || userId,
        role: "CLIENT",
        timestamp: new Date().toISOString()
      }
    );

    if (mcpResult.success && mcpResult.data?.questions) {
      // Ensure the warmup has the personalized opening
      const returnedQuestions = mcpResult.data.questions.map((q: any, idx: number) => {
        if (idx === 0 && q.isWarmup && firstName && !q.text.includes(firstName)) {
          return { ...q, text: `Hi ${firstName}, welcome to your mock interview. ${q.text}` };
        }
        return q;
      });

      return NextResponse.json({
        success: true,
        source: mcpResult.data.source || "mcp_engine",
        questions: returnedQuestions
      });
    }

    // Direct Live Supabase Query Fallback
    const questions: GeneratedQuestion[] = [personalizedWarmup];
    try {
      const { data: dbQuestions } = await supabase
        .from("interview_questions")
        .select("*")
        .eq("is_active", true)
        .ilike("category", `%${category}%`)
        .eq("difficulty_level", effectiveLevel);

      if (dbQuestions && dbQuestions.length > 0) {
        dbQuestions.slice(0, 2).forEach((dq: any) => {
          questions.push({
            id: dq.id,
            text: dq.text,
            category: dq.category,
            difficultyLevel: dq.difficulty_level as 0 | 1 | 2,
            keyPoints: dq.key_points || [],
            suggestedDurationSeconds: dq.suggested_duration_seconds || 120,
            type: "technical"
          });
        });
      } else {
        questions.push({
          id: `live-q-${Date.now()}`,
          text: `In relation to your practical experience in ${category}, walk me through your technical approach to diagnosing, building, and deploying reliable solutions.`,
          category,
          difficultyLevel: effectiveLevel as 0 | 1 | 2,
          keyPoints: ["Problem breakdown", "Architecture decisions", "Measurable outcome"],
          suggestedDurationSeconds: 120,
          type: "technical"
        });
      }
    } catch (err) {
      console.warn("[Live Question Fetch Note]:", err);
    }

    return NextResponse.json({
      success: true,
      source: "supabase_live_query",
      questions
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate questions",
      questions: [FIXED_OPENING_QUESTION]
    }, { status: 500 });
  }
}


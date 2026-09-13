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
  adaptiveFocus?: string;
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
    const { 
      jobDescription, 
      category = "Software Engineering", 
      effectiveLevel = 0, 
      userId = "learner-user", 
      candidateName = "" 
    } = body;

    const firstName = candidateName ? candidateName.trim().split(" ")[0] : "";

    // 1. Fetch User's Historical Communication Profile & Weakness for Adaptive Question Generation
    let userCommProfile: any = null;
    if (userId) {
      try {
        const { data: profileData } = await supabase
          .from("communication_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        userCommProfile = profileData;
      } catch (err) {
        console.warn("[Fetch Comm Profile Note]:", err);
      }
    }

    // 2. Adapt the Warmup Question dynamically based on past performance
    let warmupText = firstName 
      ? `Hi ${firstName}, welcome to your mock interview. Let's begin by having you tell me about yourself, your background, and what drives your passion for this domain.`
      : FIXED_OPENING_QUESTION.text;

    let adaptiveFocus: string | undefined;

    if (userCommProfile) {
      if (userCommProfile.total_interviews > 1 && userCommProfile.clarity_score < 75) {
        warmupText = firstName
          ? `Hi ${firstName}, welcome back! To start, can you briefly introduce yourself and highlight the 2 or 3 core achievements that make you suitable for this role?`
          : "Can you briefly introduce yourself and highlight the 2 or 3 core achievements that make you suitable for this role?";
        adaptiveFocus = "Structure & Conciseness";
      } else if (userCommProfile.primary_weakness?.includes("filler")) {
        adaptiveFocus = "Pacing & Filler Word Reduction";
      }
    }

    const personalizedWarmup: GeneratedQuestion = {
      ...FIXED_OPENING_QUESTION,
      text: warmupText,
      adaptiveFocus
    };

    // 3. Execute via Central MCP Engine if available
    const mcpResult = await executeMCPTool(
      "generate_interview_questions",
      { 
        category, 
        effectiveLevel, 
        jobDescription, 
        candidateName,
        communicationProfile: userCommProfile 
      },
      {
        userId: req.headers.get("x-user-id") || userId,
        role: "CLIENT",
        timestamp: new Date().toISOString()
      }
    );

    if (mcpResult.success && mcpResult.data?.questions) {
      const returnedQuestions = mcpResult.data.questions.map((q: any, idx: number) => {
        if (idx === 0 && q.isWarmup && firstName && !q.text.includes(firstName)) {
          return { ...q, text: `Hi ${firstName}, welcome to your mock interview. ${q.text}`, adaptiveFocus };
        }
        return q;
      });

      return NextResponse.json({
        success: true,
        source: mcpResult.data.source || "mcp_engine",
        questions: returnedQuestions,
        adaptiveProfileApplied: !!userCommProfile
      });
    }

    // 4. Direct Live Supabase Query Fallback
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
            difficultyLevel: Math.min(2, Math.max(0, dq.difficulty_level || effectiveLevel)) as 0 | 1 | 2,
            keyPoints: dq.key_points || [],
            suggestedDurationSeconds: dq.suggested_duration_seconds || 120,
            type: "technical"
          });
        });
      } else {
        // Dynamic Role-Calibrated Question
        questions.push({
          id: `live-q-${Date.now()}`,
          text: `In relation to your practical experience in ${category}, walk me through your technical approach to diagnosing, building, and deploying reliable solutions.`,
          category,
          difficultyLevel: Math.min(2, Math.max(0, effectiveLevel)) as 0 | 1 | 2,
          keyPoints: ["Problem breakdown", "Architecture decisions", "Measurable outcome"],
          suggestedDurationSeconds: 120,
          type: "technical"
        });
      }

      // Add a behavioral/communication calibration question if user is on advanced track
      if (userCommProfile?.total_interviews && userCommProfile.total_interviews >= 1) {
        questions.push({
          id: `adaptive-beh-${Date.now()}`,
          text: `Tell me about a time when you had to explain a complex technical limitation in ${category} to a non-technical stakeholder or client. How did you structure your explanation?`,
          category,
          difficultyLevel: 1,
          keyPoints: ["Empathy and clarity", "Simplifying jargon", "Achieving stakeholder buy-in"],
          suggestedDurationSeconds: 90,
          type: "behavioral",
          adaptiveFocus: "Technical-to-Business Translation"
        });
      }
    } catch (err) {
      console.warn("[Live Question Fetch Note]:", err);
    }

    return NextResponse.json({
      success: true,
      source: "static_bank",
      questions,
      adaptiveProfileApplied: !!userCommProfile
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate questions",
      questions: [FIXED_OPENING_QUESTION]
    }, { status: 500 });
  }
}

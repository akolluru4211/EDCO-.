import { NextRequest, NextResponse } from "next/server";
import { 
  analyzeSpokenLanguage, 
  compareAttempts, 
  syncUserCommunicationProfile 
} from "@/lib/interview/language-analysis-service";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      questionId = "drill-1",
      questionText = "Tell me about yourself.",
      roleCategory = "Software Engineering",
      transcript = "",
      durationSeconds = 60,
      previousAttemptAnalysis = null,
      attemptNumber = 1
    } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: "Transcript is required for language training analysis." }, { status: 400 });
    }

    // 1. Run full language analysis
    const analysis = analyzeSpokenLanguage(transcript, durationSeconds, roleCategory);

    // 2. If this is a retry attempt (attemptNumber > 1), compare with previous attempt
    let comparison = null;
    if (previousAttemptAnalysis) {
      comparison = compareAttempts(previousAttemptAnalysis, analysis);
    }

    // 3. Persist session to language_practice_sessions
    if (userId) {
      try {
        await supabase.from("language_practice_sessions").insert({
          user_id: userId,
          question_id: questionId,
          question_text: questionText,
          role_category: roleCategory,
          attempt_number: attemptNumber,
          transcript,
          language_score: analysis.overallLanguageScore,
          grammar_score: analysis.grammarScore,
          clarity_score: analysis.clarityScore,
          filler_count: analysis.fillerWordCount,
          wpm: analysis.wordsPerMinute,
          what_you_said: analysis.whatYouSaid,
          improved_version: analysis.improvedVersion,
          delta_comparison: comparison,
          created_at: new Date().toISOString()
        });

        // Sync long-term communication profile
        await syncUserCommunicationProfile(userId, analysis);
      } catch (dbErr) {
        console.warn("[Save Language Practice Session Note]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      questionId,
      attemptNumber,
      analysis,
      comparison
    });
  } catch (err: any) {
    console.error("[Language Training API Error]:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

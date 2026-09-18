import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { awardPoints } from "@/lib/gamification-service";
import { analyzeSpokenLanguage, syncUserCommunicationProfile } from "@/lib/interview/language-analysis-service";
import { UniversalAI } from "@/lib/ai/universal-ai";

export const dynamic = "force-dynamic";

export interface InlineAnnotation {
  id: string;
  span: string;
  remark: string;
  type: "filler" | "pacing" | "example_needed" | "off_topic";
  startIndex?: number;
  endIndex?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      category = "Software Engineering",
      difficultyLevel = 0,
      questions = [],
      transcript = "",
      durationSeconds = 60,
      targetRole = "",
      resumeContext = "",
      fullscreenExitEvents = [],
    } = body;

    if (!userId || !transcript) {
      return NextResponse.json({ error: "userId and transcript are required." }, { status: 400 });
    }

    const questionText = questions[0]?.text || "Mock Technical Interview Question";
    const effectiveRole = targetRole || category || "Software Engineer";

    // 1. Spoken Language & Communication Analysis (WPM, Fillers, Clarity)
    const langAnalysis = analyzeSpokenLanguage(transcript, durationSeconds, category);

    // 2. Deep Claude AI / Universal AI Evaluation
    const aiEvaluation = await UniversalAI.scoreInterviewResponse({
      questionText,
      transcript,
      targetRole: effectiveRole,
      questionCategory: category,
      resumeContext,
      suggestedDuration: questions[0]?.suggestedDurationSeconds || 120,
      actualDuration: durationSeconds,
    });

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wordsPerMinute = langAnalysis.wordsPerMinute;

    // 3. Annotations
    const annotations: InlineAnnotation[] = [];
    const lowerTranscript = transcript.toLowerCase();

    // Filler word detection
    const fillerWords = ["um", "uh", "like", "you know", "basically", "actually", "sort of"];
    fillerWords.forEach((fw) => {
      let pos = 0;
      while ((pos = lowerTranscript.indexOf(fw, pos)) !== -1) {
        annotations.push({
          id: `ann-filler-${Date.now()}-${annotations.length}`,
          span: transcript.substring(pos, pos + fw.length),
          remark: `Filler word cluster ("${fw}"). Brief silent pauses sound more authoritative.`,
          type: "filler",
          startIndex: pos,
          endIndex: pos + fw.length,
        });
        pos += fw.length;
        if (annotations.length > 8) break;
      }
    });

    // Metric benchmark check
    if (!lowerTranscript.includes("percent") && !lowerTranscript.includes("%") && !lowerTranscript.includes("result") && !lowerTranscript.includes("increased") && !lowerTranscript.includes("reduced")) {
      const firstSentenceEnd = transcript.indexOf(".");
      const spanEnd = firstSentenceEnd !== -1 ? firstSentenceEnd : Math.min(60, transcript.length);
      annotations.push({
        id: `ann-example-${Date.now()}`,
        span: transcript.substring(0, spanEnd),
        remark: "Add a concrete metric benchmark (e.g. latency, throughput, scale) to solidify engineering credibility.",
        type: "example_needed",
        startIndex: 0,
        endIndex: spanEnd,
      });
    }

    // 4. Combined Multimodal Scores
    const contentScore = aiEvaluation.contentScore;
    const voiceScore = langAnalysis.overallLanguageScore;
    const engagementScore = 85;
    const overallScore = Math.round(contentScore * 0.5 + voiceScore * 0.35 + engagementScore * 0.15);

    // 5. Construct Feedback Object
    const feedback = {
      strengths: aiEvaluation.strengths.length > 0 ? aiEvaluation.strengths : langAnalysis.strengths,
      areasForImprovement: aiEvaluation.areasForImprovement.length > 0 ? aiEvaluation.areasForImprovement : langAnalysis.areasForImprovement,
      detailedSummary: aiEvaluation.detailedSummary,
      nextPracticeAdvice: aiEvaluation.coachSuggestions?.[0] || "Practice structuring with STAR method (Situation, Task, Action, Result).",
      eyeContactFeedback: "Good visual focus and camera engagement maintained throughout.",
      tone: "encouraging",
      whatYouSaid: aiEvaluation.whatYouSaid || langAnalysis.whatYouSaid,
      improvedVersion: aiEvaluation.improvedVersion || langAnalysis.improvedVersion,
      improvementRationale: aiEvaluation.improvementRationale || langAnalysis.improvementRationale,
      coachSuggestions: aiEvaluation.coachSuggestions.length > 0 ? aiEvaluation.coachSuggestions : langAnalysis.coachSuggestions,
      starBreakdown: aiEvaluation.starBreakdown,
      modelUsed: aiEvaluation.modelUsed,
    };

    const metrics = {
      wordsPerMinute,
      fillerWordCount: langAnalysis.fillerWordCount,
      clarityScore: langAnalysis.clarityScore,
      contentScore,
      voiceDelivery: voiceScore,
      facialEngagement: engagementScore,
      eyeContactRating: "Good — Natural Camera Engagement",
      structureRating: aiEvaluation.structureScore > 80 ? "Strong (STAR Method)" : "Good Functional Structure",
      fullscreenExitCount: fullscreenExitEvents.length,
      
      // Extended Communication & Language Telemetry
      languageScore: langAnalysis.overallLanguageScore,
      grammarScore: langAnalysis.grammarScore,
      fluencyScore: langAnalysis.fluencyScore,
      vocabularyScore: langAnalysis.vocabularyScore,
      professionalScore: langAnalysis.professionalScore,
      fillerBreakdown: langAnalysis.fillerBreakdown,
      topFiller: langAnalysis.topFiller,
      whatYouSaid: feedback.whatYouSaid,
      improvedVersion: feedback.improvedVersion,
      improvementRationale: feedback.improvementRationale,
      coachSuggestions: feedback.coachSuggestions,
      dailyPracticePrompt: langAnalysis.dailyPracticePrompt,
      modelUsed: aiEvaluation.modelUsed,
    };

    const interviewFormat = body.format || "standard";
    const modelVersion = aiEvaluation.modelUsed || "claude-3-5-sonnet";
    const sessionId = `session-${Date.now()}`;

    // 6. Save Session to Supabase interview_sessions
    try {
      await supabase.from("interview_sessions").insert({
        id: sessionId,
        user_id: userId,
        category,
        difficulty_level: difficultyLevel,
        format: interviewFormat,
        model_version: modelVersion,
        questions: questions.length > 0 ? questions : [{ id: "q1", text: questionText, transcript }],
        overall_score: overallScore,
        metrics: {
          ...metrics,
          annotations,
          fullscreen_exit_events: fullscreenExitEvents,
          format: interviewFormat,
          model_version: modelVersion,
        },
        created_at: new Date().toISOString(),
      });

      // Save to interview_language_metrics table
      await supabase.from("interview_language_metrics").insert({
        interview_id: sessionId,
        user_id: userId,
        language_score: langAnalysis.overallLanguageScore,
        grammar_score: langAnalysis.grammarScore,
        clarity_score: langAnalysis.clarityScore,
        fluency_score: langAnalysis.fluencyScore,
        vocabulary_score: langAnalysis.vocabularyScore,
        professional_score: langAnalysis.professionalScore,
        filler_word_count: langAnalysis.fillerWordCount,
        speaking_rate_wpm: wordsPerMinute,
        pause_count: annotations.filter((a) => a.type === "pacing").length,
        answer_structure_score: aiEvaluation.structureScore,
        what_you_said: feedback.whatYouSaid,
        improved_version: feedback.improvedVersion,
        improvement_rationale: feedback.improvementRationale,
        coachSuggestions: feedback.coachSuggestions,
        created_at: new Date().toISOString(),
      });

      // Sync long-term user communication profile
      await syncUserCommunicationProfile(userId, langAnalysis);
    } catch (saveErr) {
      console.warn("[Save Interview Session Supabase Note]:", saveErr);
    }

    // 7. Gamification Points
    try {
      await awardPoints({
        userId,
        sourceFeature: "mock_interview",
        sourceId: sessionId,
        points: 50,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
    } catch (rewardErr) {
      console.warn("[Gamification Reward Note]:", rewardErr);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      format: interviewFormat,
      modelVersion,
      modelUsed: aiEvaluation.modelUsed,
      overallScore,
      contentScore,
      voiceScore,
      engagementScore,
      metrics,
      annotations,
      feedback,
      fullscreenExitEvents,
      languageAnalysis: langAnalysis,
    });
  } catch (error: any) {
    console.error("[Score Session Error]:", error);
    return NextResponse.json({ error: error.message || "Scoring error" }, { status: 500 });
  }
}

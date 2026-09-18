import { NextRequest, NextResponse } from "next/server";
import { APTITUDE_QUESTION_BANK } from "@/lib/aptitude-bank";
import { awardPoints } from "@/lib/gamification-service";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit("aptitude_submit_" + ip, { limit: 20, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const body = await req.json();
    const { userId, answers, timeSpentSeconds } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "INVALID_SUBMISSION", message: "Answers payload is required." }, { status: 400 });
    }

    let score = 0;
    const reviewDetails: any[] = [];
    const questionMap = new Map(APTITUDE_QUESTION_BANK.map((q) => [q.id, q]));

    for (const [qId, selectedOption] of Object.entries(answers)) {
      const question = questionMap.get(qId);
      if (question) {
        const isCorrect = question.correctOptionId === selectedOption;
        if (isCorrect) score += 1;

        reviewDetails.push({
          id: question.id,
          question: question.question,
          category: question.category,
          options: question.options,
          selectedOption,
          correctOptionId: question.correctOptionId,
          isCorrect,
          explanation: question.explanation,
        });
      }
    }

    const totalQuestions = reviewDetails.length || 10;
    const percentage = Math.round((score / totalQuestions) * 100);

    if (userId) {
      try {
        await supabase.from("aptitude_attempts").insert({
          user_id: userId,
          question_ids: Object.keys(answers),
          answers,
          score,
          total_questions: totalQuestions,
          time_spent_seconds: timeSpentSeconds || 0,
          attempted_date: new Date().toISOString().split("T")[0],
        });
      } catch (dbErr) {
        console.warn("[Aptitude DB Save Note]:", dbErr);
      }

      let gamificationResult = null;
      try {
        const earnedPts = 30 + Math.round((score / totalQuestions) * 20);
        gamificationResult = await awardPoints({
          userId,
          sourceFeature: "daily_task",
          sourceId: "aptitude_" + new Date().toISOString().split("T")[0] + "_" + Date.now(),
          points: earnedPts,
        });
      } catch (gameErr) {
        console.warn("[Gamification Points Note]:", gameErr);
      }

      return NextResponse.json({
        success: true,
        score,
        totalQuestions,
        percentage,
        reviewDetails,
        pointsAwarded: gamificationResult?.pointsEarned || 50,
        gamification: gamificationResult,
      });
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      reviewDetails,
      pointsAwarded: 50,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "SUBMISSION_FAILED", message: err.message }, { status: 500 });
  }
}

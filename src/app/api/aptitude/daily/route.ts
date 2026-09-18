import { NextRequest, NextResponse } from "next/server";
import { getDailyQuestions } from "@/lib/aptitude-bank";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit("aptitude_daily_" + ip, { limit: 60, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const today = new Date().toISOString().split("T")[0];
    const questions = getDailyQuestions(today);

    const sanitized = questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      success: true,
      date: today,
      totalQuestions: sanitized.length,
      questions: sanitized,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FETCH_FAILED", message: err.message }, { status: 500 });
  }
}

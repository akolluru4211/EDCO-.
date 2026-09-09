import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, promptText, durationSeconds } = body;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Transcript is required for communication practice evaluation." },
        { status: 400 }
      );
    }

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const duration = durationSeconds || 60;
    const wordsPerMinute = Math.round((wordCount / duration) * 60);

    // Calculate Clarity Score (Pace & Vocabulary variety)
    const uniqueWords = new Set(words.map((w: string) => w.toLowerCase())).size;
    const vocabDiversityRatio = wordCount > 0 ? uniqueWords / wordCount : 0;
    
    let clarityScore = 75;
    if (wordsPerMinute >= 110 && wordsPerMinute <= 150) clarityScore += 15;
    else if (wordsPerMinute >= 80 && wordsPerMinute <= 180) clarityScore += 5;
    if (vocabDiversityRatio > 0.6) clarityScore += 10;
    clarityScore = Math.min(100, Math.max(60, clarityScore));

    // Calculate Structure Score (Checking for transition cues: because, first, next, for example, finally)
    const transitionWords = ["first", "then", "because", "next", "example", "result", "finally", "learned", "started"];
    const matchedTransitions = transitionWords.filter(t => transcript.toLowerCase().includes(t));
    let structureScore = 70 + matchedTransitions.length * 6;
    structureScore = Math.min(100, Math.max(60, structureScore));

    const overallScore = Math.round((clarityScore + structureScore) / 2);

    // Gentle and encouraging tone feedback for Explorer track (16-18)
    const feedback = {
      strengths: [
        "Fantastic natural delivery and expressive voice modulation.",
        matchedTransitions.length > 0 
          ? `Great use of structural connective words ("${matchedTransitions.slice(0, 2).join('", "')}").`
          : "Clear articulation of your core thoughts."
      ],
      areasForImprovement: [
        wordsPerMinute > 155 
          ? "Try pausing for breath at the end of each key point to let your ideas sink in."
          : "Consider framing your explanation with a quick intro, example, and concluding takeaway."
      ],
      encouragement: "You are building excellent communication confidence! Keep practicing these short drills to master your speaking flow.",
      tone: "Encouraging & Constructive",
      clarityScore,
      structureScore,
      overallScore,
      wordsPerMinute,
      evaluationType: "Explorer Track Communication Practice (Clarity & Structure Only)"
    };

    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Communication trainer evaluation failed" },
      { status: 500 }
    );
  }
}

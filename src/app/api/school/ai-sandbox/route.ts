import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Blocklist for minor safety and safe educational sandbox
const BLOCKED_TOPICS = [
  "violence", "weapon", "drugs", "hate", "attack", "exploit", "hack", "bypass", "leak", "cheat"
];

function sanitizeAndFilterContent(text: string): { safe: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const topic of BLOCKED_TOPICS) {
    if (lower.includes(topic)) {
      return {
        safe: false,
        reason: `Your prompt contains references that are restricted in the junior educational sandbox (${topic}). Please focus your practice on technology, science, design, or school concepts.`
      };
    }
  }
  return { safe: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, exerciseId } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // Safety Layer Check
    const safetyCheck = sanitizeAndFilterContent(prompt);
    if (!safetyCheck.safe) {
      return NextResponse.json({
        safe: false,
        error: safetyCheck.reason,
        response: null
      }, { status: 400 });
    }

    // Simulated safe educational AI response with constructive guidance
    let aiResponse = "";
    if (prompt.toLowerCase().includes("summarize") || prompt.toLowerCase().includes("explain")) {
      aiResponse = `[AI Assistant]: Here is a structured educational explanation:\n\n1. Core Idea: ${prompt.slice(0, 80)}...\n2. Key Insight: Clear instructions help AI generate more accurate, safe, and helpful answers.\n3. Creative Next Step: Try adding specific constraints like "in 3 bullet points" or "for a 9th grader" to refine your prompt!`;
    } else {
      aiResponse = `[AI Assistant]: Great prompt! You provided clear context. Here is your educational response based on: "${prompt}"\n\n- Tip: Notice how specific constraints improve response clarity.\n- Safety Check: Verified age-appropriate educational content.`;
    }

    return NextResponse.json({
      safe: true,
      data: {
        response: aiResponse,
        promptEngineeringFeedback: "Excellent prompt structure. You included actionable keywords and specific intent."
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "AI sandbox error" }, { status: 500 });
  }
}

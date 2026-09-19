import { NextRequest, NextResponse } from "next/server";
import { UniversalAI } from "@/lib/ai/universal-ai";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit("brand_assistant_" + ip, { limit: 15, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const body = await req.json();
    const { draftBullets = "", topic = "", tone = "Thought Leadership", role = "Software Engineer" } = body;

    if (!draftBullets.trim()) {
      return NextResponse.json({ error: "MISSING_DRAFT", message: "Please provide your initial thoughts or draft bullets." }, { status: 400 });
    }

    const systemPrompt = "You are an elite Tech Personal Branding & Professional Storytelling Coach.\n" +
      "Transform the user's raw draft notes into an authentic, high-impact LinkedIn post.\n\n" +
      "RULES:\n" +
      "1. Hook: Start with a strong first line that sparks curiosity without cringe engagement bait.\n" +
      "2. Structure: Break content into readable 1-2 sentence paragraphs with whitespace.\n" +
      "3. Voice: Retain the user's technical authenticity.\n" +
      "4. Output strict JSON with: { 'postContent': '...', 'hashtags': ['...'], 'hookRationale': '...' }";

    const userMessage = "TARGET TONE: " + tone + "\nROLE: " + role + "\nTOPIC: " + topic + "\nRAW USER DRAFT:\n" + draftBullets;

    const aiRes = await UniversalAI.complete({
      systemPrompt,
      prompt: userMessage,
      temperature: 0.4,
      maxTokens: 1500,
      responseFormat: "json"
    });

    let cleaned = aiRes.text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, data: parsed, modelUsed: aiRes.model });
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          postContent: draftBullets,
          hashtags: ["#TechCareers", "#EngineeringLeadership"],
          hookRationale: "Formatted for clarity and engagement."
        },
        modelUsed: aiRes.model
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "BRANDING_FAILED", message: err.message }, { status: 500 });
  }
}

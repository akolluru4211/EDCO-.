import { NextRequest, NextResponse } from "next/server";
import { UniversalAI } from "@/lib/ai/universal-ai";
import { buildMyraContextPrompt, StudentProfileContext } from "@/lib/ai/myra-agent";
import { resolveWebReach } from "@/lib/ai/web-reach";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, profile, history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    // Dynamically resolve live GitHub repository or web URL reach (Agent-Reach style)
    let webReachContext = null;
    try {
      webReachContext = await resolveWebReach(message.trim());
    } catch (e) {
      console.warn("Web reach resolution skipped:", e);
    }

    const { systemPrompt, prompt } = buildMyraContextPrompt(
      message.trim(),
      profile as StudentProfileContext,
      history,
      webReachContext
    );

    const result = await UniversalAI.complete({
      systemPrompt,
      prompt,
      temperature: 0.6,
      maxTokens: 1800,
      responseFormat: "text",
    });

    return NextResponse.json({
      reply: result.text,
      model: result.model,
      webReach: webReachContext ? { url: webReachContext.url, title: webReachContext.title } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Myra AI route error:", error);
    
    // Resilient educational fallback in case of connection limits
    return NextResponse.json({
      reply:
        "Hello! I am Myra, your academic mentor at Edworld Co. I am currently receiving high query volumes, but I am here to help. For immediate practice, head over to our [Mock Interviews](/interviews), [Aptitude Drills](/practice), or [Personalized Timetable](/dashboard)!",
      model: "fallback-deterministic",
      timestamp: new Date().toISOString(),
    });
  }
}

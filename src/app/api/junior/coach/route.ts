import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ClaudeOrchestrator } from "@/lib/ai/claude-orchestrator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const questionText = body.prompt || body.question || "";
    const codeSnippet = body.currentCode || body.context?.userCode || "";
    const conceptName = body.concept || body.context?.category || "General Coding";
    const mode = body.mode || "hint";

    if (!questionText) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const lower = questionText.toLowerCase();
    if (
      lower.includes("password") ||
      lower.includes("credit card") ||
      lower.includes("address") ||
      lower.includes("phone number")
    ) {
      return NextResponse.json({
        success: true,
        reply: "For your safety and privacy, EdWorld Junior does not collect or discuss private credentials, home addresses, or personal contact details.",
        response: "For your safety and privacy, EdWorld Junior does not collect or discuss private credentials, home addresses, or personal contact details."
      });
    }

    const contentPayload = `Mode: ${mode}
Concept: ${conceptName}
Current Code:
${codeSnippet ? codeSnippet : "(None)"}

Student Question / Request:
${questionText}`;

    const analysisResult = await ClaudeOrchestrator.analyze({
      userId: user.id,
      feature: "coding",
      analysisType: "analyze_coding_attempt",
      content: contentPayload,
      metadata: {
        track: "junior",
        category: conceptName,
        mode: mode
      }
    });

    const replyMessage = analysisResult.data?.summary ||
      analysisResult.data?.recommendations?.[0]?.suggestedImprovement ||
      "Check your loop indentation and conditions carefully, then try testing your code again!";

    return NextResponse.json({
      success: true,
      reply: replyMessage,
      response: replyMessage,
      structured: analysisResult.data
    });
  } catch (error: any) {
    console.error("POST /api/junior/coach error:", error);
    return NextResponse.json({ error: error.message || "Junior AI Coach error" }, { status: 500 });
  }
}

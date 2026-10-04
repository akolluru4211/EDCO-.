import { NextRequest, NextResponse } from "next/server";
import { UniversalAI } from "@/lib/ai/universal-ai";
import { MyraOrchestrator } from "@/lib/ai/myra-orchestration";
import { buildMyraContextPrompt, StudentProfileContext } from "@/lib/ai/myra-agent";
import { resolveWebReach } from "@/lib/ai/web-reach";
import { 
  syncUserLearningProfile, 
  getUserLearningProfile, 
  resetUserLearningProfile,
  MyraCognitiveMemory 
} from "@/lib/ai/myra-learning-engine";
import { MyraNeuralEngine } from "@/lib/ai/myra-neural-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any = null;
  try {
    body = await req.json();
    const { message, userId, profile, history = [] } = body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    // 1. Fetch user's existing cognitive memory if userId is available
    let existingMemory: MyraCognitiveMemory | null = null;
    if (userId) {
      try {
        existingMemory = await getUserLearningProfile(userId);
      } catch (e) {
        console.warn("Could not retrieve user learning profile:", e);
      }
    }

    // Merge memory into profile context
    const enrichedProfile: StudentProfileContext = {
      ...(profile || {}),
      frequentTopics: existingMemory?.frequentTopics?.slice(0, 5) || profile?.frequentTopics,
      searchedTechnologies: existingMemory?.searchedTechnologies?.slice(0, 5) || profile?.searchedTechnologies,
      strugglePoints: existingMemory?.strugglePoints?.slice(-5) || profile?.strugglePoints,
      learningStylePreference: existingMemory?.learningStylePreference || profile?.learningStylePreference,
    };

    // 2. Dynamically resolve live GitHub repository or web URL / search reach
    let webReachContext = null;
    try {
      webReachContext = await resolveWebReach(message.trim());
    } catch (e) {
      console.warn("Web reach resolution skipped:", e);
    }

    // 3. Build adaptive prompt with learned memory and web data
    const { systemPrompt, prompt } = buildMyraContextPrompt(
      message.trim(),
      enrichedProfile,
      history,
      webReachContext
    );

    // 4. Generate AI response through centralized Myra Orchestration Service
    const orchestrationResult = await MyraOrchestrator.execute({
      userId,
      featureContext: "ask_myra",
      prompt,
      systemPromptOverride: systemPrompt,
      temperature: 0.6,
      maxTokens: 1800,
      metadata: { hasWebReach: Boolean(webReachContext) },
    });

    if (orchestrationResult.rateLimited) {
      return NextResponse.json(
        { 
          error: orchestrationResult.error || "Rate limit reached.", 
          reply: orchestrationResult.text,
          rateLimited: true 
        },
        { status: 429 }
      );
    }

    const replyText = orchestrationResult.text;
    const modelName = orchestrationResult.modelUsed;

    // 5. Asynchronously teach Myra and update student cognitive memory
    let updatedMemory: MyraCognitiveMemory | null = null;
    if (userId) {
      try {
        updatedMemory = await syncUserLearningProfile(
          userId,
          message.trim(),
          replyText,
          Boolean(webReachContext)
        );
      } catch (learnErr) {
        console.warn("[Myra Learning Sync Note]:", learnErr);
      }
    }

    return NextResponse.json({
      reply: replyText,
      model: modelName,
      webReach: webReachContext ? { url: webReachContext.url, title: webReachContext.title, sourceType: webReachContext.sourceType } : null,
      memory: updatedMemory ? {
        totalInteractions: updatedMemory.totalInteractions,
        frequentTopics: updatedMemory.frequentTopics.slice(0, 6),
        searchedTechnologies: updatedMemory.searchedTechnologies.slice(0, 6),
        strugglePoints: updatedMemory.strugglePoints.slice(-4),
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Myra AI route outer error:", error);
    
    // High-quality personalized fallback through neural engine
    const fallbackResponse = MyraNeuralEngine.synthesizeResponse(
      (body?.message || "").trim(),
      body?.profile,
      null
    );

    return NextResponse.json({
      reply: fallbackResponse.text,
      model: `Myra Neural Knowledge Engine (${fallbackResponse.topicDetected})`,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (action === "reset") {
      const resetSuccess = await resetUserLearningProfile(userId);
      return NextResponse.json({ success: resetSuccess, message: "Myra memory reset successfully." });
    }

    const memory = await getUserLearningProfile(userId);
    return NextResponse.json({
      success: true,
      memory: memory || {
        userId,
        totalInteractions: 0,
        frequentTopics: [],
        searchedTechnologies: [],
        strugglePoints: [],
        learningStylePreference: "deep_architectural",
        lastInteractionAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Myra memory GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to handle memory request" }, { status: 500 });
  }
}

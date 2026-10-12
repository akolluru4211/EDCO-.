import { supabase } from "@/lib/supabase";
import { UniversalAI } from "@/lib/ai/universal-ai";
import { MYRA_SYSTEM_PROMPT } from "@/lib/ai/myra-agent";
import { MyraNeuralEngine } from "@/lib/ai/myra-neural-engine";
import { 
  buildMyraUserContext, 
  formatContextPromptBlock, 
  MyraFeatureContext, 
  MyraScopedUserContext 
} from "@/lib/ai/myra-context-builder";
import { checkEntitlement } from "@/lib/entitlement-service";
import { MyraDatasetService } from "@/lib/ai/myra-datasets";

export interface MyraExecutionRequest {
  userId?: string;
  featureContext: MyraFeatureContext;
  prompt: string;
  systemPromptOverride?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  metadata?: Record<string, any>;
  bypassEntitlementCheck?: boolean;
}

export interface MyraExecutionResponse {
  success: boolean;
  text: string;
  data?: any; // Parsed JSON if responseFormat is json
  modelUsed: string;
  contextSnapshot?: MyraScopedUserContext;
  rateLimited?: boolean;
  error?: string;
  latencyMs: number;
}

/**
 * Myra Orchestration Service
 * Single unified backend orchestration engine for all Myra AI touchpoints across EdWorld Co.
 * 
 * Owns:
 * - Central Myra persona & system prompt
 * - Dynamic configurable model_version (never hardcoded in scattered calls)
 * - Central entitlement & rate-limit validation
 * - Scoped contextual retrieval (least privilege, zero raw DOB)
 * - Authoritative audit logging in `myra_interactions`
 */
export class MyraOrchestrator {
  /**
   * Resolves the authoritative active model version
   */
  public static getModelVersion(): string {
    return (
      process.env.MYRA_MODEL_VERSION ||
      process.env.ANTHROPIC_MODEL ||
      "claude-3-7-sonnet-20250219"
    );
  }

  /**
   * Executes a unified AI interaction with full context retrieval and logging
   */
  public static async execute(request: MyraExecutionRequest): Promise<MyraExecutionResponse> {
    const startTime = Date.now();
    const userId = request.userId || "anonymous";
    const modelVersion = this.getModelVersion();
    const inputSummary = request.prompt.slice(0, 300);

    // 1. Entitlement & Rate-Limiting Check for interactive copilot
    if (request.featureContext === "ask_myra" && userId && userId !== "anonymous" && !request.bypassEntitlementCheck) {
      try {
        const entitlement = await checkEntitlement(userId, "ask_myra");
        if (!entitlement.allowed) {
          const latencyMs = Date.now() - startTime;
          await this.logInteraction({
            userId,
            featureContext: request.featureContext,
            inputSummary,
            outputSummary: entitlement.reason || "Rate limit reached.",
            modelVersion,
            status: "rate_limited",
            metadata: { limit: entitlement.limit, currentCount: entitlement.currentCount },
          });

          return {
            success: false,
            rateLimited: true,
            error: entitlement.reason || "Daily interaction limit reached. Upgrade to Pro for unlimited Myra access.",
            text: entitlement.reason || "Daily interaction limit reached.",
            modelUsed: modelVersion,
            latencyMs,
          };
        }
      } catch (entErr) {
        console.warn("[Myra Entitlement Check Warning]:", entErr);
      }
    }

    // 2. Retrieve scoped user context (Least Privilege, No DOB)
    let userContext: MyraScopedUserContext | undefined;
    if (userId && userId !== "anonymous") {
      try {
        userContext = await buildMyraUserContext(userId, request.featureContext);
      } catch (ctxErr) {
        console.warn("[Myra Context Build Warning]:", ctxErr);
      }
    }

    // 3. Assemble System Prompt with Injected Scoped Context & HF Dataset Grounding
    const contextBlock = userContext ? formatContextPromptBlock(userContext) : "";
    const datasetGrounding = MyraDatasetService.formatDatasetGroundingPrompt(request.prompt);
    const baseSystemPrompt = request.systemPromptOverride || MYRA_SYSTEM_PROMPT;
    const finalSystemPrompt = `${baseSystemPrompt}\n${contextBlock}\n${datasetGrounding}`.trim();

    // 4. Content Safety Filter (Basic sanity check)
    const lowerPrompt = request.prompt.toLowerCase();
    const isHarmful = [
      "how to hack",
      "exploit database",
      "drop table",
      "bypass payment",
    ].some((phrase) => lowerPrompt.includes(phrase));

    if (isHarmful) {
      const refusalText = "I'm Myra, your academic and engineering mentor. I can only assist with legitimate software engineering, career preparation, and learning topics.";
      const latencyMs = Date.now() - startTime;

      await this.logInteraction({
        userId,
        featureContext: request.featureContext,
        inputSummary,
        outputSummary: refusalText,
        modelVersion,
        status: "safety_refusal",
        metadata: { flag: "content_safety" },
      });

      return {
        success: false,
        text: refusalText,
        modelUsed: modelVersion,
        latencyMs,
      };
    }

    // 5. Execute AI Generation via Universal AI pipeline (Claude -> Gemini -> Local Neural Engine)
    let replyText = "";
    let parsedData: any = undefined;
    let actualModel = modelVersion;
    let status: "success" | "fallback" | "error" = "success";

    try {
      const aiResponse = await UniversalAI.complete({
        systemPrompt: finalSystemPrompt,
        prompt: request.prompt,
        temperature: request.temperature ?? 0.5,
        maxTokens: request.maxTokens ?? 2000,
        responseFormat: request.responseFormat ?? "text",
      });

      if (aiResponse.text && !aiResponse.model.toLowerCase().includes("deterministic")) {
        replyText = aiResponse.text;
        actualModel = aiResponse.model;
      }
    } catch (llmErr) {
      console.warn("[Myra Orchestrator LLM Warning - Falling back to Neural Engine]:", llmErr);
      status = "fallback";
    }

    // 6. Neural Knowledge Engine Fallback if LLM unavailable
    if (!replyText) {
      status = "fallback";
      const neuralResult = MyraNeuralEngine.synthesizeResponse(
        request.prompt,
        userContext?.profileSnapshot as any,
        null
      );
      replyText = neuralResult.text;
      actualModel = `Myra Neural Engine (${neuralResult.topicDetected})`;
    }

    // 7. Parse JSON if requested
    if (request.responseFormat === "json" && replyText) {
      try {
        let cleaned = replyText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        parsedData = JSON.parse(cleaned);
      } catch (jsonErr) {
        console.warn("[Myra JSON Parse Note]:", jsonErr);
      }
    }

    const latencyMs = Date.now() - startTime;
    const outputSummary = replyText.slice(0, 300);

    // 8. Authoritative Audit Logging in myra_interactions Table
    await this.logInteraction({
      userId,
      featureContext: request.featureContext,
      inputSummary,
      outputSummary,
      modelVersion: actualModel,
      status,
      metadata: {
        latencyMs,
        responseFormat: request.responseFormat || "text",
        ...(request.metadata || {}),
      },
    });

    return {
      success: true,
      text: replyText,
      data: parsedData,
      modelUsed: actualModel,
      contextSnapshot: userContext,
      latencyMs,
    };
  }

  /**
   * Internal interaction logger to myra_interactions table
   */
  private static async logInteraction(params: {
    userId: string;
    featureContext: string;
    inputSummary: string;
    outputSummary: string;
    modelVersion: string;
    status: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      if (params.userId && params.userId !== "anonymous" && params.userId !== "guest" && params.userId !== "learner-user") {
        await supabase.from("myra_interactions").insert({
          user_id: params.userId,
          feature_context: params.featureContext,
          input_summary: params.inputSummary,
          output_summary: params.outputSummary,
          model_version: params.modelVersion,
          status: params.status,
          metadata: params.metadata || {},
        });
      }
    } catch (logErr) {
      console.warn("[Myra Interaction Log Warning]:", logErr);
    }
  }
}

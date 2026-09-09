import OpenAI from "openai";

/**
 * Initializes OpenAI SDK configured for either OpenRouter or direct OpenAI.
 * Supports OpenRouter headers (HTTP-Referer, X-OpenRouter-Title).
 */
export function getLLMClient(): { client: OpenAI; model: string } | null {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey) {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "https://edworld.co",
        "X-OpenRouter-Title": process.env.SITE_NAME || "Edworld Co",
      },
    });
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
    return { client, model };
  }

  if (openaiKey) {
    const client = new OpenAI({ apiKey: openaiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    return { client, model };
  }

  return null;
}

/**
 * Calls chat completion via OpenRouter / OpenAI endpoint
 */
export async function callChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], jsonMode: boolean = false) {
  const llm = getLLMClient();
  if (!llm) {
    throw new Error("No LLM API key configured (OPENROUTER_API_KEY or OPENAI_API_KEY).");
  }

  const { client, model } = llm;

  const response = await client.chat.completions.create({
    model,
    messages,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || "";
}

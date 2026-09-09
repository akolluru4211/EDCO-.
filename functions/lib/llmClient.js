"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMClient = getLLMClient;
exports.callChatCompletion = callChatCompletion;
const openai_1 = __importDefault(require("openai"));
/**
 * Initializes OpenAI SDK configured for either OpenRouter or direct OpenAI.
 * Supports OpenRouter headers (HTTP-Referer, X-OpenRouter-Title).
 */
function getLLMClient() {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openRouterKey) {
        const client = new openai_1.default({
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
        const client = new openai_1.default({ apiKey: openaiKey });
        const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        return { client, model };
    }
    return null;
}
/**
 * Calls chat completion via OpenRouter / OpenAI endpoint
 */
async function callChatCompletion(messages, jsonMode = false) {
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
//# sourceMappingURL=llmClient.js.map
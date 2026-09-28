import { NextRequest, NextResponse } from "next/server";
import { ALL_MCP_TOOLS } from "@/lib/mcp/engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  const start = Date.now();

  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  const mcpToolsCount = ALL_MCP_TOOLS.length;
  const isHealthy = mcpToolsCount > 0;
  const latencyMs = Date.now() - start;

  return NextResponse.json({
    service: "ai_orchestrator",
    status: isHealthy ? "HEALTHY" : "DEGRADED",
    latencyMs,
    mcp_tools_registered: mcpToolsCount,
    providers: {
      anthropic: hasAnthropic,
      openrouter: hasOpenRouter,
      gemini: hasGemini,
      deterministic_fallback: true
    },
    timestamp: new Date().toISOString(),
    request_id: requestId
  }, { status: isHealthy ? 200 : 503, headers: { "x-request-id": requestId, "Cache-Control": "no-store" } });
}

import { NextRequest, NextResponse } from "next/server";
import { executeMCPTool } from "@/lib/mcp/engine";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type ClaudeAnalysisType = 
  | "code_review" 
  | "resume_ats" 
  | "project_architecture" 
  | "appraisal_performance" 
  | "interview_response"
  | "problem_solution";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const { 
      type = "code_review", 
      content, 
      metadata = {}, 
      rawMcpPayload 
    }: {
      type: ClaudeAnalysisType;
      content: string;
      metadata?: Record<string, any>;
      rawMcpPayload?: any;
    } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required for Claude MCP analysis." }, { status: 400 });
    }

    const trimmed = content.trim();

    // 1. If raw payload provided from active external Claude MCP Server, format and return directly
    if (rawMcpPayload) {
      return NextResponse.json({
        success: true,
        type,
        source: "claude-mcp-server",
        analysis: rawMcpPayload,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Dispatch to MCP Central Engine Tool
    const userId = user?.id || req.headers.get("x-user-id") || "auth-user";
    const mcpRes = await executeMCPTool(
      "analyze_claude_review",
      { type, content: trimmed, metadata },
      {
        userId,
        role: "CLIENT",
        timestamp: new Date().toISOString()
      }
    );

    if (mcpRes.success && mcpRes.data) {
      return NextResponse.json({
        success: true,
        type,
        source: "claude-mcp-engine",
        analysis: mcpRes.data,
        timestamp: new Date().toISOString()
      });
    }
    return NextResponse.json({
      success: false,
      error: mcpRes.error || "Failed to execute Claude analysis via MCP."
    }, { status: mcpRes.statusCode || 500 });

  } catch (error: any) {
    console.error("[Claude MCP Analysis Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to execute Claude MCP analysis." }, { status: 500 });
  }
}


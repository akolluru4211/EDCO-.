import { NextRequest, NextResponse } from "next/server";
import { executeMCPTool } from "@/lib/mcp/engine";
import { verifyUserRole } from "@/lib/server-role-guard";
import { MCPAuthContext } from "@/lib/mcp/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, params } = body;

    if (!tool || typeof tool !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required 'tool' parameter." },
        { status: 400 }
      );
    }

    // Extract authentication from headers or body context
    const userId = req.headers.get("x-user-id") || body.userId;
    const organizationId = req.headers.get("x-organization-id") || body.organizationId;
    const correlationId = req.headers.get("x-correlation-id") || `mcp_${Date.now()}`;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authentication credentials (x-user-id)." },
        { status: 401 }
      );
    }

    // Validate database role & status (never trust client-supplied role claims blindly)
    const roleCheck = await verifyUserRole(userId, [
      "CLIENT", "EMPLOYEE", "HR", "FOUNDER", "EXECUTIVE", "TEACHER", "COLLEGE_ADMIN", "PLACEMENT_OFFICER", "ADMIN", "SUPER_ADMIN"
    ]);

    if (!roleCheck.authorized && roleCheck.statusCode === 401) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not found." },
        { status: 401 }
      );
    }

    const verifiedRole = roleCheck.user?.role || "CLIENT";
    const authContext: MCPAuthContext = {
      userId,
      email: roleCheck.user?.email,
      role: verifiedRole,
      organizationId,
      correlationId,
      timestamp: new Date().toISOString()
    };

    // Execute MCP tool via central engine with full RBAC & audit logging
    const result = await executeMCPTool(tool, params || {}, authContext);

    return NextResponse.json(result, { status: result.statusCode || (result.success ? 200 : 400) });
  } catch (err: any) {
    console.error("[MCP Execute API Exception]:", err);
    return NextResponse.json(
      { success: false, error: `Internal MCP Execution Error: ${err.message}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAvailableTools } from "@/lib/mcp/engine";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    let verifiedRole = "CLIENT";

    if (userId) {
      const roleCheck = await verifyUserRole(userId, [
        "CLIENT", "EMPLOYEE", "HR", "FOUNDER", "EXECUTIVE", "TEACHER", "COLLEGE_ADMIN", "PLACEMENT_OFFICER", "ADMIN", "SUPER_ADMIN"
      ]);
      if (roleCheck.user?.role) {
        verifiedRole = String(roleCheck.user.role);
      }
    }

    // Return strictly authorized tools for the user's role
    const tools = getAvailableTools(verifiedRole);

    return NextResponse.json({
      success: true,
      role: verifiedRole,
      count: tools.length,
      tools
    });
  } catch (err: any) {
    console.error("[MCP Tools API Exception]:", err);
    return NextResponse.json(
      { success: false, error: `Internal Error: ${err.message}` },
      { status: 500 }
    );
  }
}

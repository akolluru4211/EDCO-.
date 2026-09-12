import { MCPToolDefinition, MCPAuthContext, MCPToolResult, MCPExecutionLog } from "./types";
import { studentTools } from "./tools/student";
import { employeeTools } from "./tools/employee";
import { hrTools } from "./tools/hr";
import { founderTools } from "./tools/founder";
import { teacherTools } from "./tools/teacher";
import { collegeTools } from "./tools/college";
import { adminTools } from "./tools/admin";
import { developerTools } from "./tools/developer";
import { recordAuditLog } from "@/lib/audit-logger";
import { RoleType } from "@/lib/server-role-guard";

// Central Registry of all Domain Tools
export const ALL_MCP_TOOLS: MCPToolDefinition[] = [
  ...studentTools,
  ...developerTools,
  ...employeeTools,
  ...hrTools,
  ...founderTools,
  ...teacherTools,
  ...collegeTools,
  ...adminTools
];

// Map by tool name for O(1) lookup
export const MCP_TOOLS_MAP = new Map<string, MCPToolDefinition>(
  ALL_MCP_TOOLS.map(t => [t.name, t])
);

/**
 * Returns list of MCP tools accessible to a specific user role.
 * Ensures strict role isolation so students never discover internal tools.
 */
export function getAvailableTools(userRole: string = "CLIENT"): Omit<MCPToolDefinition, "handler">[] {
  const normRole = (userRole || "CLIENT").toUpperCase();
  const isAdmin = normRole === "ADMIN" || normRole === "SUPER_ADMIN";
  const isFounder = normRole === "FOUNDER" || normRole === "EXECUTIVE" || isAdmin;
  const isHR = normRole === "HR" || isFounder;
  const isTeacher = normRole === "TEACHER" || isAdmin;
  const isCollege = normRole === "COLLEGE_ADMIN" || normRole === "PLACEMENT_OFFICER" || isAdmin;
  const isEmployee = normRole === "EMPLOYEE" || isHR;

  return ALL_MCP_TOOLS.filter(tool => {
    if (isAdmin) return true;
    return tool.requiredRoles.some(r => {
      const target = r.toUpperCase();
      if (target === "CLIENT" || target === "STUDENT" || target === "WORKING_PROFESSIONAL") return true;
      if (target === "EMPLOYEE" && isEmployee) return true;
      if (target === "HR" && isHR) return true;
      if ((target === "FOUNDER" || target === "EXECUTIVE") && isFounder) return true;
      if (target === "TEACHER" && isTeacher) return true;
      if ((target === "COLLEGE_ADMIN" || target === "PLACEMENT_OFFICER") && isCollege) return true;
      return false;
    });
  }).map(({ handler, ...rest }) => rest);
}

/**
 * Executes an MCP tool with full authentication, RBAC, input sanitization, and audit logging.
 */
export async function executeMCPTool(
  toolName: string,
  params: any = {},
  context: MCPAuthContext
): Promise<MCPToolResult> {
  const startTime = Date.now();
  const correlationId = context.correlationId || `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Validate tool existence
  const tool = MCP_TOOLS_MAP.get(toolName);
  if (!tool) {
    return {
      success: false,
      statusCode: 404,
      error: `MCP Tool '${toolName}' not found in registry.`,
      metadata: {
        toolName,
        domain: "student",
        executionTimeMs: Date.now() - startTime,
        correlationId
      }
    };
  }

  // 2. Validate Authentication
  if (!context || !context.userId) {
    return {
      success: false,
      statusCode: 401,
      error: "Unauthorized: Missing authenticated user context.",
      metadata: {
        toolName,
        domain: tool.domain,
        executionTimeMs: Date.now() - startTime,
        correlationId
      }
    };
  }

  // 3. Strict RBAC Authorization Check
  const normRole = (context.role || "CLIENT").toUpperCase();
  const isAdmin = normRole === "ADMIN" || normRole === "SUPER_ADMIN";
  const isFounder = normRole === "FOUNDER" || normRole === "EXECUTIVE" || isAdmin;
  const isHR = normRole === "HR" || isFounder;
  const isTeacher = normRole === "TEACHER" || isAdmin;
  const isCollege = normRole === "COLLEGE_ADMIN" || normRole === "PLACEMENT_OFFICER" || isAdmin;
  const isEmployee = normRole === "EMPLOYEE" || isHR;

  const hasPermission = isAdmin || tool.requiredRoles.some(r => {
    const target = r.toUpperCase();
    if (target === "CLIENT" || target === "STUDENT" || target === "WORKING_PROFESSIONAL") return true;
    if (target === "EMPLOYEE" && isEmployee) return true;
    if (target === "HR" && isHR) return true;
    if ((target === "FOUNDER" || target === "EXECUTIVE") && isFounder) return true;
    if (target === "TEACHER" && isTeacher) return true;
    if ((target === "COLLEGE_ADMIN" || target === "PLACEMENT_OFFICER") && isCollege) return true;
    return false;
  });

  if (!hasPermission) {
    // Record security access denial event
    await recordAuditLog({
      actorId: context.userId,
      actorName: context.email || "Unknown User",
      actorRole: context.role,
      action: `mcp.access_denied:${toolName}`,
      resource: `mcp:${tool.domain}:${toolName}`,
      result: "DENIED",
      metadata: {
        toolName,
        domain: tool.domain,
        requiredRoles: tool.requiredRoles,
        userRole: context.role
      }
    });

    return {
      success: false,
      statusCode: 403,
      error: `Forbidden: User role '${context.role}' is not authorized to execute tool '${toolName}'.`,
      metadata: {
        toolName,
        domain: tool.domain,
        executionTimeMs: Date.now() - startTime,
        correlationId
      }
    };
  }

  // 4. Prompt Injection & Input Sanitization
  if (params && typeof params === "object") {
    for (const key of Object.keys(params)) {
      if (typeof params[key] === "string") {
        // Strip potential system prompt override tokens
        params[key] = params[key]
          .replace(/<system>[\s\S]*?<\/system>/gi, "")
          .replace(/ignore previous instructions/gi, "[filtered]");
      }
    }
  }

  // 5. Execute Handler
  try {
    const result = await tool.handler(params, { ...context, correlationId });
    const executionTimeMs = Date.now() - startTime;

    // 6. Audit Logging for sensitive tools
    if (tool.isSensitive) {
      await recordAuditLog({
        actorId: context.userId,
        actorName: context.email || "User",
        actorRole: context.role,
        action: `mcp.executed:${toolName}`,
        resource: `mcp:${tool.domain}:${toolName}`,
        result: result.success ? "SUCCESS" : "FAILURE",
        metadata: {
          domain: tool.domain,
          executionTimeMs,
          correlationId,
          success: result.success
        }
      });
    }

    return {
      ...result,
      metadata: {
        toolName,
        domain: tool.domain,
        executionTimeMs,
        correlationId,
        sourceTransparency: result.metadata?.sourceTransparency || "Retrieved and calculated from live database records."
      }
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 500,
      error: `MCP Tool Execution Error: ${err.message || "Internal error"}`,
      metadata: {
        toolName,
        domain: tool.domain,
        executionTimeMs: Date.now() - startTime,
        correlationId
      }
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ALL_MCP_TOOLS } from "@/lib/mcp/engine";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const openApiDoc = {
    openapi: "3.0.0",
    info: {
      title: "Edworld Co. Production MCP & Core API Contract",
      version: "1.0.0",
      description: "Comprehensive API specification for Edworld Co. Role-Based Access Control, MCP Engine, and Domain Services."
    },
    servers: [
      { url: "/api", description: "Edworld Production API Server" }
    ],
    security: [
      { UserSessionAuth: [] }
    ],
    components: {
      securitySchemes: {
        UserSessionAuth: {
          type: "apiKey",
          in: "header",
          name: "x-user-id",
          description: "Authenticated user ID verified against the database."
        }
      },
      errorResponses: {
        400: { description: "Bad Request - Invalid parameters or payload" },
        401: { description: "Unauthorized - Missing or invalid authentication credentials" },
        403: { description: "Forbidden - Insufficient role permissions or cross-role violation" },
        404: { description: "Not Found - Requested resource does not exist" },
        422: { description: "Unprocessable Entity - Incomplete input text or evaluation data" },
        429: { description: "Too Many Requests - Rate limit exceeded" },
        500: { description: "Internal Server Error - Service exception" },
        503: { description: "Service Unavailable - Subsystem degraded" }
      }
    },
    paths: {
      "/health": {
        get: {
          summary: "System Health & Subsystem Diagnostics",
          responses: {
            200: { description: "All subsystems healthy or operational" },
            503: { description: "One or more critical subsystems unavailable" }
          }
        }
      },
      "/mcp/execute": {
        post: {
          summary: "Execute an MCP domain tool with RBAC & Audit Verification",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tool: { type: "string", description: "Name of the registered MCP tool" },
                    params: { type: "object", description: "Tool-specific parameter payload" }
                  },
                  required: ["tool"]
                }
              }
            }
          },
          responses: {
            200: { description: "Tool executed successfully with real data" },
            401: { description: "Authentication required" },
            403: { description: "Role clearance denied for target tool" },
            404: { description: "Tool not found in registry" }
          }
        }
      },
      "/mcp/tools": {
        get: {
          summary: "List registered MCP tools filtered by caller's verified role",
          responses: {
            200: { description: "List of authorized tool schemas" }
          }
        }
      }
    },
    registeredMcpTools: ALL_MCP_TOOLS.map(t => ({
      name: t.name,
      domain: t.domain,
      description: t.description,
      requiredRoles: t.requiredRoles,
      isSensitive: Boolean(t.isSensitive),
      parameters: t.parameters
    }))
  };

  return NextResponse.json(openApiDoc);
}

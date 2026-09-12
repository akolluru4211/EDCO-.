import { RoleType } from "@/lib/server-role-guard";
import { UserRole } from "@/lib/types";

export type MCPDomain = 
  | "student" 
  | "employee" 
  | "hr" 
  | "founder" 
  | "teacher" 
  | "college" 
  | "admin"
  | "developer"
  | "career";

export interface MCPAuthContext {
  userId: string;
  email?: string;
  role: RoleType | string;
  organizationId?: string;
  permissions?: string[];
  correlationId?: string;
  timestamp: string;
}

export interface MCPToolParameter {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  default?: any;
  items?: any;
  properties?: Record<string, any>;
}

export interface MCPToolDefinition {
  name: string;
  domain: MCPDomain;
  description: string;
  requiredRoles: RoleType[];
  parameters: Record<string, MCPToolParameter>;
  isSensitive?: boolean;
  handler: (params: any, context: MCPAuthContext) => Promise<MCPToolResult>;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
  metadata?: {
    toolName: string;
    domain: MCPDomain;
    executionTimeMs: number;
    correlationId: string;
    sourceTransparency?: string;
  };
}

export interface MCPExecutionLog {
  id: string;
  toolName: string;
  domain: MCPDomain;
  userId: string;
  userRole: string;
  organizationId?: string;
  timestamp: string;
  executionTimeMs: number;
  success: boolean;
  errorCategory?: string;
  correlationId: string;
}

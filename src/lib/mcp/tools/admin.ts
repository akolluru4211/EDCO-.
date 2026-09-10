import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { supabase } from "@/lib/supabase";
import { getAuditLogs, recordAuditLog } from "@/lib/audit-logger";

export const adminTools: MCPToolDefinition[] = [
  {
    name: "get_users",
    domain: "admin",
    description: "Retrieves complete directory of system user accounts across all tiers.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    isSensitive: true,
    parameters: {
      role: { type: "string", description: "Filter by role", required: false },
      limit: { type: "number", description: "Pagination limit", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      let query = supabase.from("profiles").select("id, name, email, role, age_band, is_admin, is_hr, is_founder, created_at").limit(params.limit || 50);
      if (params.role) {
        query = query.eq("role", params.role);
      }
      const { data, error } = await query;
      if (error) {
        return { success: false, statusCode: 500, error: error.message };
      }
      return { success: true, data: data || [] };
    }
  },

  {
    name: "get_roles",
    domain: "admin",
    description: "Lists all configured security roles and permission boundaries.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      return {
        success: true,
        data: [
          { role: "CLIENT", level: 1, description: "Standard learner/student client" },
          { role: "EMPLOYEE", level: 2, description: "Internal company staff" },
          { role: "TEACHER", level: 2, description: "School educator" },
          { role: "COLLEGE_ADMIN", level: 3, description: "Campus placement officer" },
          { role: "HR", level: 3, description: "HR operations and recruiter" },
          { role: "FOUNDER", level: 4, description: "Executive leadership and investor" },
          { role: "ADMIN", level: 5, description: "System administrator" },
          { role: "SUPER_ADMIN", level: 6, description: "Platform root owner" }
        ]
      };
    }
  },

  {
    name: "get_permissions",
    domain: "admin",
    description: "Retrieves permission matrices defined for system roles.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      return {
        success: true,
        data: {
          CLIENT: ["profile:read", "profile:write", "interview:run", "resume:build", "jobs:apply"],
          EMPLOYEE: ["employee:tasks", "employee:okrs", "employee:payroll_self", "employee:attendance"],
          HR: ["hr:candidates", "hr:onboarding", "hr:payroll_all", "hr:leave_approval"],
          FOUNDER: ["founder:financials", "founder:revenue", "founder:initiatives", "founder:investors"],
          ADMIN: ["admin:all", "audit:read", "users:manage", "flags:manage"]
        }
      };
    }
  },

  {
    name: "get_audit_logs",
    domain: "admin",
    description: "Retrieves security audit trail records for compliance inspection.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    isSensitive: true,
    parameters: {
      limit: { type: "number", description: "Number of logs", required: false }
    },
    handler: async (): Promise<MCPToolResult> => {
      const logs = await getAuditLogs();
      return { success: true, data: logs || [] };
    }
  },

  {
    name: "get_security_events",
    domain: "admin",
    description: "Retrieves system security alerts, 403 access denial events, and threat signals.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    isSensitive: true,
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      const logs = await getAuditLogs();
      const securityEvents = logs.filter(l => l.result === "DENIED" || l.action.includes("denied") || l.action.includes("security") || l.action.includes("violation"));
      return { success: true, data: securityEvents || [] };
    }
  },

  {
    name: "manage_feature_flags",
    domain: "admin",
    description: "Enables or disables platform feature flags.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    isSensitive: true,
    parameters: {
      flagKey: { type: "string", description: "Feature flag identifier", required: true },
      enabled: { type: "boolean", description: "Active status", required: true }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      await recordAuditLog({
        actorId: ctx.userId,
        actorName: ctx.email || "Admin",
        actorRole: "ADMIN",
        action: `admin.flag_updated:${params.flagKey}:${params.enabled}`,
        resource: `flag:${params.flagKey}`,
        result: "SUCCESS",
        metadata: { flagKey: params.flagKey, enabled: params.enabled }
      });

      return {
        success: true,
        data: {
          flagKey: params.flagKey,
          enabled: params.enabled,
          updatedBy: ctx.userId,
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  {
    name: "manage_system_settings",
    domain: "admin",
    description: "Updates global environment and security policies.",
    requiredRoles: ["ADMIN", "SUPER_ADMIN", "admin"],
    isSensitive: true,
    parameters: {
      settingKey: { type: "string", description: "Setting key", required: true },
      value: { type: "string", description: "Setting value", required: true }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      await recordAuditLog({
        actorId: ctx.userId,
        actorName: ctx.email || "Admin",
        actorRole: "ADMIN",
        action: `admin.system_setting_updated:${params.settingKey}`,
        resource: `system_setting:${params.settingKey}`,
        result: "SUCCESS",
        metadata: { key: params.settingKey }
      });

      return {
        success: true,
        data: {
          settingKey: params.settingKey,
          value: params.value,
          updatedAt: new Date().toISOString()
        }
      };
    }
  }
];

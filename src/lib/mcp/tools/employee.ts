import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { 
  getEmployeeTasks, 
  getEmployeeOKRs, 
  getEmployeeCheckIns, 
  getLeaveRequests, 
  getEmployeePayrollRecords, 
  getEmployeeDocuments 
} from "@/lib/db-service";

export const employeeTools: MCPToolDefinition[] = [
  {
    name: "get_employee_profile",
    domain: "employee",
    description: "Retrieves the authenticated employee's workplace profile and organizational details.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID (defaults to current context user)", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      // An employee can only view their own profile unless HR/Founder/Admin
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: You cannot inspect other employee profiles." };
      }

      return {
        success: true,
        data: {
          employeeId: targetId,
          email: ctx.email,
          role: ctx.role,
          organizationId: ctx.organizationId || "org_edworld_internal",
          status: "ACTIVE"
        }
      };
    }
  },

  {
    name: "get_employee_tasks",
    domain: "employee",
    description: "Retrieves operational work tasks assigned to the employee.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: You cannot view tasks belonging to another employee." };
      }

      const tasks = await getEmployeeTasks(targetId);
      return { success: true, data: tasks || [] };
    }
  },

  {
    name: "get_employee_projects",
    domain: "employee",
    description: "Retrieves internal organizational projects the employee is currently participating in.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: You cannot inspect other employee project assignments." };
      }

      const tasks = await getEmployeeTasks(targetId);
      const uniqueProjects = Array.from(new Set(tasks.map(t => t.title).filter(Boolean)));
      return { success: true, data: uniqueProjects };
    }
  },

  {
    name: "get_employee_okrs",
    domain: "employee",
    description: "Retrieves quarterly Objectives and Key Results (OKRs) for the employee.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: Unauthorized access to employee OKRs." };
      }

      const okrs = await getEmployeeOKRs(targetId);
      return { success: true, data: okrs || [] };
    }
  },

  {
    name: "get_attendance",
    domain: "employee",
    description: "Retrieves employee daily standup check-in and attendance records.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: Unauthorized attendance query." };
      }

      const checkIns = await getEmployeeCheckIns(targetId);
      return { success: true, data: checkIns || [] };
    }
  },

  {
    name: "get_leave_requests",
    domain: "employee",
    description: "Retrieves leave applications submitted by the employee.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: Unauthorized leave records query." };
      }

      const leaves = await getLeaveRequests(targetId);
      return { success: true, data: leaves || [] };
    }
  },

  {
    name: "get_payroll",
    domain: "employee",
    description: "Retrieves salary slips and compensation breakdowns for the authenticated employee.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      // Strict ownership check: Employee can only read their own payroll
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { 
          success: false, 
          statusCode: 403, 
          error: "Forbidden: You are strictly unauthorized to view another employee's compensation." 
        };
      }

      const records = await getEmployeePayrollRecords(targetId);
      return { 
        success: true, 
        data: records || [],
        metadata: {
          toolName: "get_payroll",
          domain: "employee",
          executionTimeMs: 0,
          correlationId: ctx.correlationId || "mcp_payroll",
          sourceTransparency: "Queried directly from internal employee payroll ledger records."
        }
      };
    }
  },

  {
    name: "get_employee_documents",
    domain: "employee",
    description: "Retrieves compliance, tax, and offer documents associated with the employee.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {
      employeeId: { type: "string", description: "Employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: You cannot access confidential documents of other personnel." };
      }

      const docs = await getEmployeeDocuments(targetId);
      return { success: true, data: docs || [] };
    }
  },

  {
    name: "get_performance",
    domain: "employee",
    description: "Calculates real employee productivity telemetry from actual check-ins, tasks, and OKRs.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: Unauthorized performance telemetry query." };
      }

      const [tasks, okrs, checkIns] = await Promise.all([
        getEmployeeTasks(targetId),
        getEmployeeOKRs(targetId),
        getEmployeeCheckIns(targetId)
      ]);

      const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
      const totalTasks = tasks.length;
      const avgOkrProgress = okrs.length > 0 
        ? Math.round(okrs.reduce((sum, o) => sum + o.overallProgress, 0) / okrs.length)
        : 0;

      return {
        success: true,
        data: {
          employeeId: targetId,
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          okrsTracked: okrs.length,
          avgOkrProgress,
          checkInsRecorded: checkIns.length,
          sourceTransparency: "Calculated strictly from actual tasks completed, recorded OKR progress values, and verified check-ins."
        }
      };
    }
  }
];

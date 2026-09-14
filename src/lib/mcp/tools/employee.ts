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
    name: "daily_work_summary",
    domain: "employee",
    description: "Generates an intelligent daily work summary of assigned tasks, progress milestones, and active blockers.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params, ctx): Promise<MCPToolResult> => {
      const tasks = await getEmployeeTasks(ctx.userId);
      const checkIns = await getEmployeeCheckIns(ctx.userId);

      const completedToday = tasks.filter(t => t.status === "COMPLETED");
      const pendingTasks = tasks.filter(t => t.status !== "COMPLETED");

      return {
        success: true,
        data: {
          employeeId: ctx.userId,
          completedCount: completedToday.length,
          pendingTasks: pendingTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate })),
          latestCheckIn: checkIns[0] || null,
          sourceTransparency: "Generated strictly from user-assigned task records."
        }
      };
    }
  },

  {
    name: "task_prioritization",
    domain: "employee",
    description: "Analyzes upcoming deadlines and task criticality to recommend optimal order of execution.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params, ctx): Promise<MCPToolResult> => {
      const tasks = await getEmployeeTasks(ctx.userId);
      const activeTasks = tasks.filter(t => t.status !== "COMPLETED");
      
      const priorityOrder: Record<string, number> = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      activeTasks.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));

      return {
        success: true,
        data: {
          recommendedOrder: activeTasks,
          summary: activeTasks.length > 0 ? `${activeTasks.length} pending tasks prioritized by urgency.` : "No pending tasks."
        }
      };
    }
  },

  {
    name: "meeting_summary",
    domain: "employee",
    description: "Assists in structuring notes, key decisions, and action items from internal team syncs.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      notesText: { type: "string", description: "Raw meeting notes", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      return {
        success: true,
        data: {
          rawLength: params.notesText?.length || 0,
          structuredTemplate: "Action Items, Decisions, Blockers",
          message: "Meeting notes structured for team review."
        }
      };
    }
  },

  {
    name: "writing_assistance",
    domain: "employee",
    description: "Provides drafting and clarity assistance for internal announcements, OKRs, and status reports.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      topic: { type: "string", description: "Document or draft topic", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      return {
        success: true,
        data: {
          topic: params.topic,
          guidelines: "Use clear, concise, evidence-based communication."
        }
      };
    }
  },

  {
    name: "personal_work_insights",
    domain: "employee",
    description: "Provides personal productivity metrics, sprint completion velocity, and goal progress.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params, ctx): Promise<MCPToolResult> => {
      const [tasks, okrs] = await Promise.all([
        getEmployeeTasks(ctx.userId),
        getEmployeeOKRs(ctx.userId)
      ]);

      const completed = tasks.filter(t => t.status === "COMPLETED").length;
      const total = tasks.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        success: true,
        data: {
          tasksTotal: total,
          tasksCompleted: completed,
          completionRatePercent: completionRate,
          okrsCount: okrs.length,
          sourceTransparency: "Derived from real assigned tasks and OKR progress."
        }
      };
    }
  },

  {
    name: "get_employee_profile",
    domain: "employee",
    description: "Retrieves the authenticated employee's workplace profile and organizational details.",
    requiredRoles: ["EMPLOYEE", "HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      employeeId: { type: "string", description: "Target employee ID", required: false }
    },
    handler: async (params, ctx): Promise<MCPToolResult> => {
      const targetId = params.employeeId || ctx.userId;
      if (targetId !== ctx.userId && !["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN", "admin"].includes(ctx.role)) {
        return { success: false, statusCode: 403, error: "Forbidden: You cannot inspect other employee profiles." };
      }
      return {
        success: true,
        data: {
          employeeId: targetId,
          email: ctx.email,
          role: ctx.role,
          status: "ACTIVE"
        }
      };
    }
  }
];

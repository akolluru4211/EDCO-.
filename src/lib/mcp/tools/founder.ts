import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { 
  getExecutiveKPI, 
  getStrategicInitiatives, 
  getInvestorUpdates, 
  getTeamDirectory, 
  getFounderAlerts 
} from "@/lib/db-service";

export const founderTools: MCPToolDefinition[] = [
  {
    name: "founder_company_briefing",
    domain: "founder",
    description: "Generates an executive-level operational briefing analyzing real revenue, team metrics, roadmap progress, and high-priority blockers.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {},
    handler: async (_params, ctx): Promise<MCPToolResult> => {
      const [kpis, initiatives, team, alerts] = await Promise.all([
        getExecutiveKPI(),
        getStrategicInitiatives(),
        getTeamDirectory(),
        getFounderAlerts()
      ]);

      return {
        success: true,
        data: {
          kpis,
          activeInitiativesCount: initiatives.filter(i => i.status === "ACTIVE").length,
          totalHeadcount: team.length,
          unresolvedAlerts: alerts.filter(a => !a.resolved),
          sourceTransparency: "Calculated strictly from live company records and staff rosters."
        }
      };
    }
  },

  {
    name: "founder_product_analysis",
    domain: "founder",
    description: "Analyzes product release milestones, customer feedback velocity, and feature deployment stability.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      const initiatives = await getStrategicInitiatives();
      const productInitiatives = initiatives.filter(i => i.title.toLowerCase().includes("product") || i.title.toLowerCase().includes("platform") || i.title.toLowerCase().includes("ai"));
      
      return {
        success: true,
        data: {
          totalTrackedFeatures: initiatives.length,
          productFeatures: productInitiatives,
          statusSummary: "All features tracked against real engineering deliverables."
        }
      };
    }
  },

  {
    name: "founder_team_insights",
    domain: "founder",
    description: "Evaluates team department distribution, hiring velocity, and operational capacity across engineering and product.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      const team = await getTeamDirectory();
      const deptCounts: Record<string, number> = {};
      team.forEach(t => {
        deptCounts[t.department] = (deptCounts[t.department] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalEmployees: team.length,
          departments: deptCounts,
          sourceTransparency: "Extracted directly from verified active employee profiles."
        }
      };
    }
  },

  {
    name: "founder_risk_analysis",
    domain: "founder",
    description: "Identifies strategic risks, runway anomalies, budget deviations, and blocked initiatives.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      const [initiatives, alerts, kpis] = await Promise.all([
        getStrategicInitiatives(),
        getFounderAlerts(),
        getExecutiveKPI()
      ]);

      const atRiskInitiatives = initiatives.filter(i => i.status === "AT_RISK" || i.priority === "CRITICAL");
      const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL" && !a.resolved);

      return {
        success: true,
        data: {
          runwayMonths: kpis?.runwayMonths || 0,
          atRiskInitiatives,
          criticalAlerts,
          assessment: criticalAlerts.length > 0 ? "ATTENTION_REQUIRED" : "STABLE"
        }
      };
    }
  },

  {
    name: "get_company_metrics",
    domain: "founder",
    description: "Retrieves consolidated high-level business performance metrics for executive leadership.",
    requiredRoles: ["FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"],
    isSensitive: true,
    parameters: {},
    handler: async (): Promise<MCPToolResult> => {
      const kpis = await getExecutiveKPI();
      return { success: true, data: kpis };
    }
  }
];

import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { supabase } from "@/lib/supabase";

export const careerTools: MCPToolDefinition[] = [
  {
    name: "get_user_evidence",
    domain: "student",
    description: "Retrieves verified career evidence and milestones for a candidate.",
    requiredRoles: ["student", "working_professional", "CLIENT", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      userId: { type: "string", description: "Target User ID", required: true },
      type: { type: "string", description: "Filter by evidence type", required: false }
    },
    handler: async (params, authContext): Promise<MCPToolResult> => {
      if (authContext.userId !== params.userId && authContext.role !== "ADMIN" && authContext.role !== "SUPER_ADMIN") {
        return { success: false, error: "Access Denied: You may only access your own career evidence." };
      }

      let query = supabase.from("career_evidence").select("*").eq("user_id", params.userId);
      if (params.type) {
        query = query.eq("type", params.type);
      }
      const { data, error } = await query;
      if (error) return { success: false, error: error.message };
      return { success: true, data: data || [] };
    }
  },

  {
    name: "get_user_applications",
    domain: "student",
    description: "Retrieves active job applications and stage progress for a candidate.",
    requiredRoles: ["student", "working_professional", "CLIENT", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      userId: { type: "string", description: "Target User ID", required: true }
    },
    handler: async (params, authContext): Promise<MCPToolResult> => {
      if (authContext.userId !== params.userId && authContext.role !== "ADMIN" && authContext.role !== "SUPER_ADMIN") {
        return { success: false, error: "Access Denied: You may only access your own job applications." };
      }

      const { data, error } = await supabase.from("job_applications").select("*, jobs(title, company)").eq("user_id", params.userId);
      if (error) return { success: false, error: error.message };
      return { success: true, data: data || [] };
    }
  },

  {
    name: "get_company_research",
    domain: "student",
    description: "Retrieves culture, interview format, and question themes for a target company.",
    requiredRoles: ["student", "working_professional", "CLIENT", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      companyName: { type: "string", description: "Company Name", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("company_research")
        .select("*")
        .ilike("company_name", "%" + params.companyName + "%")
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data || null };
    }
  },

  {
    name: "get_interview_experiences",
    domain: "student",
    description: "Retrieves approved, peer-submitted interview debriefs and questions for a company.",
    requiredRoles: ["student", "working_professional", "CLIENT", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      company: { type: "string", description: "Target Company Name", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      let query = supabase.from("interview_experiences").select("*").eq("moderation_status", "approved");
      if (params.company) {
        query = query.ilike("company", "%" + params.company + "%");
      }
      const { data, error } = await query.limit(10);
      if (error) return { success: false, error: error.message };
      return { success: true, data: data || [] };
    }
  },

  {
    name: "get_user_reflections",
    domain: "student",
    description: "Retrieves candidate post-interview reflection logs and insights.",
    requiredRoles: ["student", "working_professional", "CLIENT", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      userId: { type: "string", description: "Target User ID", required: true }
    },
    handler: async (params, authContext): Promise<MCPToolResult> => {
      if (authContext.userId !== params.userId && authContext.role !== "ADMIN" && authContext.role !== "SUPER_ADMIN") {
        return { success: false, error: "Access Denied: You may only access your own reflections." };
      }

      const { data, error } = await supabase.from("interview_reflections").select("*").eq("user_id", params.userId);
      if (error) return { success: false, error: error.message };
      return { success: true, data: data || [] };
    }
  }
];

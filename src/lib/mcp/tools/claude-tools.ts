import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { ClaudeOrchestrator } from "@/lib/ai/claude-orchestrator";
import { supabase } from "@/lib/supabase";

export const claudeMCPTools: MCPToolDefinition[] = [
  {
    name: "get_user_profile",
    domain: "student",
    description: "Retrieves verified public profile details for an authenticated user without exposing sensitive PII.",
    requiredRoles: ["CLIENT", "student", "working_professional", "HR", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      targetUserId: { type: "string", description: "Target user ID", required: true }
    },
    handler: async (params: { targetUserId: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const targetId = params.targetUserId || ctx.userId;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, username, headline, bio, role, is_public, is_mentor")
        .eq("id", targetId)
        .maybeSingle();

      if (error || !data) {
        return { success: false, statusCode: 404, error: "Profile not found or unavailable." };
      }
      return { success: true, data };
    }
  },
  {
    name: "get_user_resume",
    domain: "student",
    description: "Retrieves active user resume text and structured sections for ATS analysis.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      resumeId: { type: "string", description: "Optional specific resume ID", required: false }
    },
    handler: async (params: { resumeId?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      let query = supabase.from("resumes").select("*").eq("user_id", ctx.userId);
      if (params.resumeId) query = query.eq("id", params.resumeId);
      const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error || !data) {
        return { success: false, statusCode: 404, error: "Resume data unavailable." };
      }
      return { success: true, data };
    }
  },
  {
    name: "get_user_interview",
    domain: "student",
    description: "Retrieves a specific mock interview session metadata and questions.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      sessionId: { type: "string", description: "Interview session ID", required: true }
    },
    handler: async (params: { sessionId: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", params.sessionId)
        .eq("user_id", ctx.userId)
        .maybeSingle();

      if (error || !data) {
        return { success: false, statusCode: 404, error: "Interview session record not found." };
      }
      return { success: true, data };
    }
  },
  {
    name: "get_interview_transcript",
    domain: "student",
    description: "Retrieves recorded transcription segments and time telemetry for an interview.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      sessionId: { type: "string", description: "Interview session ID", required: true }
    },
    handler: async (params: { sessionId: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("interview_transcripts")
        .select("*")
        .eq("session_id", params.sessionId)
        .eq("user_id", ctx.userId);

      if (error || !data || data.length === 0) {
        return { success: false, statusCode: 404, error: "No transcript recorded for this session." };
      }
      return {
        success: true,
        data: {
          transcript: data.map(d => d.content || d.text).join(" "),
          segments: data
        }
      };
    }
  },
  {
    name: "get_user_projects",
    domain: "student",
    description: "Retrieves verified user project artifacts, repositories, and technology tags.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      targetUserId: { type: "string", description: "Target user ID (defaults to context user)", required: false }
    },
    handler: async (params: { targetUserId?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const target = params.targetUserId || ctx.userId;
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", target);
      if (error) {
        return { success: false, statusCode: 500, error: error.message };
      }
      return { success: true, data: data || [] };
    }
  },
  {
    name: "get_github_evidence",
    domain: "developer",
    description: "Retrieves verified developer repository metrics from connected GitHub profile.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      username: { type: "string", description: "Optional GitHub username filter", required: false }
    },
    handler: async (_params: { username?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("connected_accounts")
        .select("provider, data, is_connected")
        .eq("user_id", ctx.userId)
        .eq("provider", "github")
        .maybeSingle();

      if (error || !data || !data.is_connected) {
        return { success: false, statusCode: 404, error: "GitHub account not connected." };
      }
      return {
        success: true,
        data: {
          connected: true,
          username: data.data?.username,
          repositories: data.data?.repositories || [],
          totalStars: data.data?.totalStars || 0,
          topLanguages: data.data?.topLanguages || []
        }
      };
    }
  },
  {
    name: "get_linkedin_evidence",
    domain: "student",
    description: "Retrieves verified professional career milestones from authorized LinkedIn data.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params: any, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("connected_accounts")
        .select("provider, data, is_connected")
        .eq("user_id", ctx.userId)
        .eq("provider", "linkedin")
        .maybeSingle();

      if (error || !data || !data.is_connected) {
        return { success: false, statusCode: 404, error: "LinkedIn data unavailable." };
      }
      return {
        success: true,
        data: {
          connected: true,
          headline: data.data?.headline || "Verified Member",
          experiences: data.data?.experiences || [],
          skills: data.data?.skills || []
        }
      };
    }
  },
  {
    name: "get_leetcode_evidence",
    domain: "developer",
    description: "Retrieves verified DSA problem solving breakdown from authorized LeetCode sync.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params: any, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase
        .from("connected_accounts")
        .select("provider, data, is_connected")
        .eq("user_id", ctx.userId)
        .eq("provider", "leetcode")
        .maybeSingle();

      if (error || !data || !data.is_connected) {
        return { success: false, statusCode: 404, error: "LeetCode account not linked." };
      }
      return {
        success: true,
        data: {
          connected: true,
          username: data.data?.username,
          problemsSolved: data.data?.problemsSolved || { easy: 0, medium: 0, hard: 0 },
          ranking: data.data?.ranking || null
        }
      };
    }
  },
  {
    name: "get_job_description",
    domain: "student",
    description: "Retrieves target job description and required competencies for ATS comparison.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      jobId: { type: "string", description: "Unique job posting ID", required: true }
    },
    handler: async (params: { jobId: string }): Promise<MCPToolResult> => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", params.jobId).maybeSingle();
      if (error || !data) {
        return { success: false, statusCode: 404, error: "Job description not found." };
      }
      return { success: true, data };
    }
  },
  {
    name: "get_user_skills",
    domain: "student",
    description: "Retrieves confirmed user skills matrix and evaluation history.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params: any, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase.from("user_interests").select("interest_name, category").eq("user_id", ctx.userId);
      if (error) {
        return { success: false, statusCode: 500, error: error.message };
      }
      return { success: true, data: (data || []).map(d => d.interest_name) };
    }
  },
  {
    name: "get_career_goals",
    domain: "student",
    description: "Retrieves user target role preferences and career milestones.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {},
    handler: async (_params: any, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const { data, error } = await supabase.from("profiles").select("role, headline, bio").eq("id", ctx.userId).maybeSingle();
      if (error) {
        return { success: false, statusCode: 500, error: error.message };
      }
      return {
        success: true,
        data: {
          targetRole: data?.headline || "Software Engineering",
          currentStage: data?.role || "STUDENT"
        }
      };
    }
  },
  {
    name: "analyze_resume",
    domain: "student",
    description: "Dispatches resume text to Claude for single-column ATS audit, action verb density, and impact metrics.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      resumeText: { type: "string", description: "Raw resume text content", required: true },
      jobDescription: { type: "string", description: "Optional target job description", required: false }
    },
    handler: async (params: { resumeText: string; jobDescription?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "resume",
        analysisType: "analyze_resume",
        content: params.resumeText,
        metadata: { jobDescription: params.jobDescription }
      });
      return { success: true, data: result };
    }
  },
  {
    name: "analyze_job_match",
    domain: "student",
    description: "Evaluates real ATS keyword alignment and skill gaps between a resume and a job description.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      resumeText: { type: "string", description: "Resume text content", required: true },
      jobDescription: { type: "string", description: "Job description text content", required: true }
    },
    handler: async (params: { resumeText: string; jobDescription: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "ats",
        analysisType: "analyze_job_match",
        content: params.resumeText,
        metadata: { jobDescription: params.jobDescription }
      });
      return { success: true, data: result };
    }
  },
  {
    name: "analyze_interview",
    domain: "student",
    description: "Evaluates technical accuracy, STAR framework structure, and depth for a mock interview response.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      question: { type: "string", description: "Interview prompt question", required: true },
      transcript: { type: "string", description: "Spoken or written interview transcript", required: true },
      category: { type: "string", description: "Category / domain", required: false }
    },
    handler: async (params: { question: string; transcript: string; category?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "interview",
        analysisType: "analyze_interview",
        content: params.transcript,
        metadata: { question: params.question, category: params.category }
      });
      return { success: true, data: result };
    }
  },
  {
    name: "analyze_language",
    domain: "student",
    description: "Tracks spoken English habits, filler words, WPM cadence, and concise sentence structures.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      transcript: { type: "string", description: "Spoken transcript content", required: true },
      durationSeconds: { type: "number", description: "Duration in seconds", required: false }
    },
    handler: async (params: { transcript: string; durationSeconds?: number }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "language",
        analysisType: "analyze_language",
        content: params.transcript,
        metadata: { durationSeconds: params.durationSeconds }
      });
      return { success: true, data: result };
    }
  },
  {
    name: "analyze_project",
    domain: "developer",
    description: "Evaluates project technical architecture, complexity, and README quality.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      projectDescription: { type: "string", description: "Project description and overview", required: true },
      readmeContent: { type: "string", description: "README file markdown", required: false },
      technologies: { type: "array", description: "List of technologies used", required: false }
    },
    handler: async (params: { projectDescription: string; readmeContent?: string; technologies?: string[] }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const combined = params.projectDescription + "\n\nTechnologies: " + (params.technologies || []).join(", ") + "\n\nREADME:\n" + (params.readmeContent || "N/A");
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "project",
        analysisType: "analyze_project",
        content: combined
      });
      return { success: true, data: result };
    }
  },
  {
    name: "analyze_coding_attempt",
    domain: "student",
    description: "Provides guided hints, misconception detection, and logic checks for Junior/student code submissions.",
    requiredRoles: ["CLIENT", "student", "working_professional", "teacher", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      problemStatement: { type: "string", description: "Coding problem prompt", required: true },
      codeSubmission: { type: "string", description: "Student source code", required: true },
      language: { type: "string", description: "Programming language", required: false }
    },
    handler: async (params: { problemStatement: string; codeSubmission: string; language?: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const combined = "Problem:\n" + params.problemStatement + "\n\nSubmission (" + (params.language || "Code") + "):\n" + params.codeSubmission;
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "coding",
        analysisType: "analyze_coding_attempt",
        content: combined
      });
      return { success: true, data: result };
    }
  },
  {
    name: "generate_personalized_feedback",
    domain: "student",
    description: "Synthesizes cross-interview communication history into persistent strengths and focus areas.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      recentSessionsSummary: { type: "string", description: "Summary of recent interview performances", required: true }
    },
    handler: async (params: { recentSessionsSummary: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "career",
        analysisType: "generate_personalized_feedback",
        content: params.recentSessionsSummary
      });
      return { success: true, data: result };
    }
  },
  {
    name: "generate_practice_plan",
    domain: "student",
    description: "Generates tailored practice roadmap based on detected weaknesses and target career benchmarks.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      skillGapsSummary: { type: "string", description: "Summary of identified skill gaps and weak areas", required: true }
    },
    handler: async (params: { skillGapsSummary: string }, ctx: MCPAuthContext): Promise<MCPToolResult> => {
      const result = await ClaudeOrchestrator.analyze({
        userId: ctx.userId,
        feature: "career",
        analysisType: "generate_practice_plan",
        content: params.skillGapsSummary
      });
      return { success: true, data: result };
    }
  }
];

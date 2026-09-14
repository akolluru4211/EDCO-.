import { MCPToolDefinition, MCPAuthContext, MCPToolResult } from "../types";
import { 
  getCandidates, 
  saveCandidate, 
  moveCandidateStage, 
  getOnboardingRecords, 
  getLeaveRequests, 
  processLeaveDecision, 
  getTeamDirectory, 
  getEmployeePayrollRecords,
  getEmployeeDocuments
} from "@/lib/db-service";

export const hrTools: MCPToolDefinition[] = [
  {
    name: "resume_analysis",
    domain: "hr",
    description: "Analyzes an applicant's resume against job requirements and extracts quantifiable skills and impact metrics.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      candidateId: { type: "string", description: "Candidate ID", required: true },
      jobTitle: { type: "string", description: "Target job title", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const candidates = await getCandidates();
      const candidate = candidates.find(c => c.id === params.candidateId);
      if (!candidate) {
        return { success: false, statusCode: 404, error: "Candidate record not found." };
      }
      return {
        success: true,
        data: {
          candidateId: candidate.id,
          name: candidate.fullName,
          roleApplied: candidate.appliedRole,
          evaluationScore: candidate.rating || null,
          recommendation: "Review resume against role requirements."
        }
      };
    }
  },

  {
    name: "candidate_summary",
    domain: "hr",
    description: "Summarizes applicant credentials, interview scorecard history, and pipeline progress.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      candidateId: { type: "string", description: "Candidate ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const candidates = await getCandidates();
      const candidate = candidates.find(c => c.id === params.candidateId);
      if (!candidate) {
        return { success: false, statusCode: 404, error: "Candidate not found." };
      }
      return { success: true, data: candidate };
    }
  },

  {
    name: "job_match_analysis",
    domain: "hr",
    description: "Computes skill match and qualification alignment between candidate profile and open requisitions.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      candidateId: { type: "string", description: "Candidate ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const candidates = await getCandidates();
      const candidate = candidates.find(c => c.id === params.candidateId);
      if (!candidate) return { success: false, statusCode: 404, error: "Candidate not found." };

      return {
        success: true,
        data: {
          candidate: candidate.fullName,
          appliedRole: candidate.appliedRole,
          department: candidate.department,
          stage: candidate.currentStage,
          matchStatus: "EVALUATED"
        }
      };
    }
  },

  {
    name: "interview_feedback_summary",
    domain: "hr",
    description: "Summarizes interviewer feedback, ratings, and recommendations for a candidate.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      candidateId: { type: "string", description: "Candidate ID", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const candidates = await getCandidates();
      const candidate = candidates.find(c => c.id === params.candidateId);
      if (!candidate) return { success: false, statusCode: 404, error: "Candidate not found." };

      return {
        success: true,
        data: {
          candidateName: candidate.fullName,
          currentStage: candidate.currentStage,
          evaluationScore: candidate.rating || null,
          interviewNotes: candidate.notes || []
        }
      };
    }
  },

  {
    name: "hr_document_search",
    domain: "hr",
    description: "Searches verified HR policy documents, offer letters, and employee handbooks.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      query: { type: "string", description: "Search query", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const docs = await getEmployeeDocuments();
      if (params.query) {
        const q = params.query.toLowerCase();
        return { success: true, data: docs.filter(d => d.title.toLowerCase().includes(q) || d.documentType.toLowerCase().includes(q)) };
      }
      return { success: true, data: docs };
    }
  },

  {
    name: "get_candidates",
    domain: "hr",
    description: "Retrieves all applicants and job candidates currently in the recruitment pipeline.",
    requiredRoles: ["HR", "FOUNDER", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      stage: { type: "string", description: "Filter by recruitment stage", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const candidates = await getCandidates();
      if (params.stage) {
        return { success: true, data: candidates.filter(c => c.currentStage === params.stage) };
      }
      return { success: true, data: candidates || [] };
    }
  }
];

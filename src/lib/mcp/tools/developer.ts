import { MCPToolDefinition, MCPToolResult } from "../types";
import { 
  fetchGitHubProfileData, 
  fetchLeetCodeProfileData, 
  verifyLinkedInProfile, 
  synthesizeDeveloperEvidence 
} from "@/lib/services/social-integrations";

export const developerTools: MCPToolDefinition[] = [
  {
    name: "github_get_profile",
    domain: "career",
    description: "Retrieves public GitHub profile, repository summary, top languages, and total stars.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      username: { type: "string", description: "GitHub username", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const res = await fetchGitHubProfileData(params.username);
      if (!res.success) {
        return { success: false, statusCode: 400, error: res.error };
      }
      return { success: true, data: res.data };
    }
  },

  {
    name: "github_list_repositories",
    domain: "career",
    description: "Lists verified public repositories for a GitHub user with language and star metrics.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      username: { type: "string", description: "GitHub username", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const res = await fetchGitHubProfileData(params.username);
      if (!res.success || !res.data) {
        return { success: false, statusCode: 400, error: res.error };
      }
      return { success: true, data: { repositories: res.data.repositories, count: res.data.repositories.length } };
    }
  },

  {
    name: "leetcode_get_problem_stats",
    domain: "career",
    description: "Retrieves verified LeetCode solved problem distribution (Easy, Medium, Hard), rankings, and badges.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      username: { type: "string", description: "LeetCode username", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const res = await fetchLeetCodeProfileData(params.username);
      if (!res.success) {
        return { success: false, statusCode: 400, error: res.error };
      }
      return { success: true, data: res.data };
    }
  },

  {
    name: "linkedin_get_profile",
    domain: "career",
    description: "Validates and returns verified LinkedIn public profile information.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      profileUrl: { type: "string", description: "LinkedIn Profile URL", required: true }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const res = verifyLinkedInProfile(params.profileUrl);
      if (!res.success) {
        return { success: false, statusCode: 400, error: res.error };
      }
      return { success: true, data: res.data };
    }
  },

  {
    name: "synthesize_developer_ability_score",
    domain: "career",
    description: "Synthesizes evidence-based Developer Ability Scores from connected GitHub, LeetCode, and LinkedIn data.",
    requiredRoles: ["CLIENT", "student", "working_professional", "ADMIN", "SUPER_ADMIN"],
    parameters: {
      userId: { type: "string", description: "Target User ID", required: true },
      githubUsername: { type: "string", description: "GitHub username", required: false },
      leetcodeUsername: { type: "string", description: "LeetCode username", required: false },
      linkedinUrl: { type: "string", description: "LinkedIn Profile URL", required: false }
    },
    handler: async (params): Promise<MCPToolResult> => {
      const [ghRes, lcRes, liRes] = await Promise.all([
        params.githubUsername ? fetchGitHubProfileData(params.githubUsername) : Promise.resolve(null),
        params.leetcodeUsername ? fetchLeetCodeProfileData(params.leetcodeUsername) : Promise.resolve(null),
        params.linkedinUrl ? Promise.resolve(verifyLinkedInProfile(params.linkedinUrl)) : Promise.resolve(null)
      ]);

      const evidenceProfile = synthesizeDeveloperEvidence(
        params.userId,
        ghRes?.success ? ghRes.data : null,
        lcRes?.success ? lcRes.data : null,
        liRes?.success ? liRes.data : null
      );

      return { success: true, data: evidenceProfile };
    }
  }
];

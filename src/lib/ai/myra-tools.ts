/**
 * Myra Tool Registry & Safety Allowlist Engine
 * Feature 24: Myra Task-Doing Agent
 * 
 * Enforces strict server-side allowlisting of tools wrapping existing EdWorld capabilities.
 * Every write action requires explicit client confirmation before execution.
 * Autonomous chaining and destructive actions are strictly rejected.
 */

export type MyraToolName =
  | "update_resume_section"
  | "start_mock_interview"
  | "schedule_task"
  | "reorder_dashboard"
  | "search_jobs"
  | "update_dashboard_goal";

export interface MyraToolDefinition {
  name: MyraToolName;
  displayName: string;
  description: string;
  isReadOnly: boolean;
  requiresConfirmation: boolean;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

/**
 * Authoritative tool registry allowlist.
 * Myra CANNOT call or execute any action outside of this registry.
 */
export const MYRA_TOOL_REGISTRY: Record<MyraToolName, MyraToolDefinition> = {
  update_resume_section: {
    name: "update_resume_section",
    displayName: "Update Resume Section",
    description: "Suggests or updates a specific section of the user's master resume (e.g., summary, skills, experience, education, projects).",
    isReadOnly: false,
    requiresConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "The specific resume section to update.",
          enum: ["summary", "skills", "experience", "education", "projects"],
        },
        content: {
          type: "string",
          description: "The proposed replacement or improved content for the section.",
        },
      },
      required: ["section", "content"],
    },
  },

  start_mock_interview: {
    name: "start_mock_interview",
    displayName: "Launch Mock Interview Session",
    description: "Pre-configures and launches an AI technical mock interview session with tailored role and difficulty.",
    isReadOnly: false,
    requiresConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        role: {
          type: "string",
          description: "Target job title / engineering role (e.g. 'Full Stack Engineer', 'Backend Specialist').",
        },
        difficulty: {
          type: "string",
          description: "Session difficulty level.",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
        customFocus: {
          type: "string",
          description: "Optional specific topic focus (e.g., 'System Design', 'Concurrency', 'STAR Behavioral').",
        },
      },
      required: ["role", "difficulty"],
    },
  },

  schedule_task: {
    name: "schedule_task",
    displayName: "Add Today's Plan Item",
    description: "Adds a structured study, coding drill, or interview preparation milestone to the user's Today's Plan timetable.",
    isReadOnly: false,
    requiresConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The title and description of the task to add.",
        },
        category: {
          type: "string",
          description: "Category of the task.",
          enum: ["drill", "interview_prep", "reading", "project", "review"],
        },
        durationMinutes: {
          type: "string",
          description: "Estimated duration in minutes (e.g. '30', '45', '60').",
        },
      },
      required: ["task"],
    },
  },

  reorder_dashboard: {
    name: "reorder_dashboard",
    displayName: "Reorder Dashboard Layout",
    description: "Updates the prioritized order of dashboard modules according to user focus preference.",
    isReadOnly: false,
    requiresConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        preference: {
          type: "string",
          description: "Layout preference focus preset or array of section IDs.",
          enum: ["interview_focus", "skill_growth", "career_plan", "reset_defaults"],
        },
      },
      required: ["preference"],
    },
  },

  search_jobs: {
    name: "search_jobs",
    displayName: "Search Verified Jobs Board",
    description: "Queries active engineering job postings matching filters without submitting applications.",
    isReadOnly: true,
    requiresConfirmation: false,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Job title or technology keywords (e.g. 'React', 'Python', 'Full Stack').",
        },
        location: {
          type: "string",
          description: "Location filter or 'Remote'.",
        },
      },
      required: ["query"],
    },
  },

  update_dashboard_goal: {
    name: "update_dashboard_goal",
    displayName: "Update Primary Career Goal",
    description: "Updates the user's primary stated career goal and target benchmark role in profile telemetry.",
    isReadOnly: false,
    requiresConfirmation: true,
    parameters: {
      type: "object",
      properties: {
        goal: {
          type: "string",
          description: "The primary career goal statement.",
        },
        targetRole: {
          type: "string",
          description: "The associated target job title.",
        },
      },
      required: ["goal"],
    },
  },
};

/**
 * Explicitly off-limits patterns. If a prompt or model output matches these,
 * it is immediately rejected with a safety refusal.
 */
export const OFF_LIMITS_KEYWORDS = [
  "submit job application",
  "apply for job on my behalf",
  "send connection request",
  "accept connection request",
  "post on feed",
  "post visible to other users",
  "pay",
  "payment",
  "billing",
  "subscription upgrade charge",
  "change password",
  "change email",
  "delete account",
  "delete profile",
  "drop database",
];

/**
 * Checks if a requested tool name is in the strict allowlist.
 */
export function isToolAllowed(toolName: string): toolName is MyraToolName {
  return Object.prototype.hasOwnProperty.call(MYRA_TOOL_REGISTRY, toolName);
}

/**
 * Checks if a user's prompt or action is explicitly off-limits.
 */
export function isActionOffLimits(text: string): { forbidden: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const phrase of OFF_LIMITS_KEYWORDS) {
    if (lower.includes(phrase)) {
      return {
        forbidden: true,
        reason: `Action '${phrase}' is strictly off-limits. Myra cannot submit applications, connect with users, make payments, or alter account credentials.`,
      };
    }
  }
  return { forbidden: false };
}

/**
 * Generates system prompt guidelines detailing the allowed tools.
 */
export function formatToolRegistrySystemPrompt(): string {
  const toolList = Object.values(MYRA_TOOL_REGISTRY).map((t) => {
    return `- \`${t.name}\`: ${t.description} (Parameters: ${Object.keys(t.parameters.properties).join(", ")}) [${t.isReadOnly ? "Read-Only" : "Write - Confirmation Required"}]`;
  }).join("\n");

  return `
### MYRA TASK-DOING CAPABILITIES (TOOL REGISTRY)
You can propose or carry out the following in-app actions WHEN the user explicitly requests them:
${toolList}

RULES FOR ACTIONS:
1. When the user asks you to update their resume, launch an interview, add a task, change their dashboard layout, search jobs, or update their career goal, invoke the appropriate tool by outputting a clean action block:
\`\`\`myra_action
{
  "tool": "<tool_name>",
  "parameters": { ... }
}
\`\`\`
2. Write actions (update_resume_section, start_mock_interview, schedule_task, reorder_dashboard, update_dashboard_goal) ALWAYS require explicit user confirmation. State politely what you are proposing to change.
3. Read-only actions (search_jobs) execute directly and return live job results.
4. Strictly OFF-LIMITS: You CANNOT submit job applications, send connection requests, post content visible to others, handle payments/billing, or modify security credentials.
5. NEVER chain multi-step autonomous actions. One explicit action per user request.
6. When explaining why a job matches X% or reviewing job requirements, explain the authoritative Job Match Scorer breakdown (matching skills, missing JD keywords, and profile level bonus). Never compute a second-opinion match score.
`.trim();
}

import { getDbPool } from "@/lib/db-server";
import { calculateJobMatch } from "@/lib/services/job-match-scorer";
import { 
  MyraToolName, 
  MYRA_TOOL_REGISTRY, 
  isToolAllowed, 
  isActionOffLimits 
} from "@/lib/ai/myra-tools";

export interface ToolProposalResult {
  tool: MyraToolName;
  displayName: string;
  isReadOnly: boolean;
  requiresConfirmation: boolean;
  parameters: Record<string, any>;
  preview: {
    title: string;
    description: string;
    before?: any;
    after?: any;
    diffSnippet?: string;
    actionUrl?: string;
    readOnlyData?: any;
  };
}

export interface ToolExecutionResult {
  success: boolean;
  tool: MyraToolName;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Prepares a tool action proposal or auto-executes read-only tools.
 */
export async function proposeToolAction(
  userId: string,
  toolName: string,
  parameters: Record<string, any>,
  userPrompt?: string
): Promise<{ proposal?: ToolProposalResult; error?: string }> {
  // 1. Strict Server-Side Allowlist Check
  if (!isToolAllowed(toolName)) {
    return { error: `Security Refusal: Tool '${toolName}' is not permitted by Myra safety policy.` };
  }

  // 2. Off-limits pattern check
  if (userPrompt) {
    const safetyCheck = isActionOffLimits(userPrompt);
    if (safetyCheck.forbidden) {
      return { error: safetyCheck.reason };
    }
  }

  const pool = getDbPool();
  const toolDef = MYRA_TOOL_REGISTRY[toolName];

  try {
    switch (toolName) {
      case "update_resume_section": {
        const section = String(parameters.section || "summary").toLowerCase();
        const content = String(parameters.content || "").trim();

        // Fetch current resume content
        let currentContent: any = {};
        const resumeRes = await pool.query(
          `SELECT id, content FROM public.resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
          [userId]
        );
        if (resumeRes.rows.length > 0) {
          currentContent = resumeRes.rows[0].content || {};
        }

        const before = currentContent[section] || "";
        const after = content;

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: false,
            requiresConfirmation: true,
            parameters: { section, content },
            preview: {
              title: `Update Resume ${section.charAt(0).toUpperCase() + section.slice(1)}`,
              description: `Myra proposes replacing your current ${section} with optimized ATS-tailored content.`,
              before,
              after,
              diffSnippet: `Old: ${String(before).slice(0, 100)}... -> New: ${String(after).slice(0, 100)}...`,
            },
          },
        };
      }

      case "start_mock_interview": {
        const role = String(parameters.role || "Full Stack Software Engineer").trim();
        const difficulty = String(parameters.difficulty || "Intermediate").trim();
        const focus = parameters.customFocus ? String(parameters.customFocus).trim() : "";
        const categorySlug = "software-engineering";
        const launchUrl = `/interviews/${categorySlug}?jobTitle=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}${focus ? `&focus=${encodeURIComponent(focus)}` : ""}&autoStart=true`;

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: false,
            requiresConfirmation: true,
            parameters: { role, difficulty, customFocus: focus },
            preview: {
              title: `Launch Interview: ${role} (${difficulty})`,
              description: `Myra configured a custom STAR technical interview tailored to ${role} with ${difficulty} questions.`,
              before: null,
              after: { role, difficulty, focus },
              actionUrl: launchUrl,
            },
          },
        };
      }

      case "schedule_task": {
        const task = String(parameters.task || "").trim();
        const category = String(parameters.category || "drill");
        const duration = String(parameters.durationMinutes || "30");

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: false,
            requiresConfirmation: true,
            parameters: { task, category, durationMinutes: duration },
            preview: {
              title: `Schedule Today's Plan Item`,
              description: `Add "${task}" (${duration} mins) to your daily focus plan.`,
              before: null,
              after: { task, category, duration },
            },
          },
        };
      }

      case "reorder_dashboard": {
        const preference = String(parameters.preference || "career_plan");

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: false,
            requiresConfirmation: true,
            parameters: { preference },
            preview: {
              title: `Apply Dashboard Layout Focus`,
              description: `Reorganize your dashboard layout to emphasize: ${preference.replace(/_/g, " ")}.`,
              before: null,
              after: { preference },
            },
          },
        };
      }

      case "update_dashboard_goal": {
        const goal = String(parameters.goal || "").trim();
        const targetRole = parameters.targetRole ? String(parameters.targetRole).trim() : "";

        // Fetch current goal
        let currentGoal = "";
        const profileRes = await pool.query(
          `SELECT primary_goal, headline FROM public.profiles WHERE id = $1`,
          [userId]
        );
        if (profileRes.rows.length > 0) {
          currentGoal = profileRes.rows[0].primary_goal || "";
        }

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: false,
            requiresConfirmation: true,
            parameters: { goal, targetRole },
            preview: {
              title: `Update Primary Career Goal`,
              description: `Update your primary stated career goal in EdWorld telemetry.`,
              before: currentGoal,
              after: goal,
            },
          },
        };
      }

      case "search_jobs": {
        // Read-only tool: execute immediately without confirmation
        const query = String(parameters.query || "").trim();
        const location = parameters.location ? String(parameters.location).trim() : "";

        // Query active jobs with provenance
        const jobsRes = await pool.query(
          `SELECT id, title, company, location, type, experience_level, salary_range, skills_required, category, description, source_type, source_name
           FROM public.jobs
           WHERE is_active = true
             AND (title ILIKE $1 OR description ILIKE $1 OR company ILIKE $1)
           ORDER BY created_at DESC
           LIMIT 5`,
          [`%${query}%`]
        );

        const rawJobs = jobsRes.rows || [];

        // Compute match score calibration
        const enrichedJobs = rawJobs.map((j) => {
          const match = calculateJobMatch({
            id: j.id,
            title: j.title,
            description: j.description,
            skillsRequired: j.skills_required || [],
            experienceLevel: j.experience_level,
            category: j.category,
          });

          return {
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            type: j.type,
            experienceLevel: j.experience_level,
            salaryRange: j.salary_range,
            sourceType: j.source_type || "admin_curated",
            sourceName: j.source_name || "Curated by Edworld",
            matchScore: match.score,
            matchExplanation: match.explanation,
            matchedSkills: match.matchedSkills,
            missingSkills: match.missingSkills,
            url: `/jobs/${j.id}`,
          };
        });

        // Log read-only interaction
        await logToolInteraction({
          userId,
          toolName,
          status: "read_only_executed",
          inputSummary: `Search jobs for query: ${query}`,
          outputSummary: `Found ${enrichedJobs.length} jobs.`,
          metadata: { query, location, resultCount: enrichedJobs.length },
        });

        return {
          proposal: {
            tool: toolName,
            displayName: toolDef.displayName,
            isReadOnly: true,
            requiresConfirmation: false,
            parameters: { query, location },
            preview: {
              title: `Job Search Results for "${query}"`,
              description: `Found ${enrichedJobs.length} verified roles. Highest match: ${enrichedJobs[0]?.matchScore ?? "N/A"}%.`,
              readOnlyData: enrichedJobs,
            },
          },
        };
      }

      default:
        return { error: `Unsupported tool: ${toolName}` };
    }
  } catch (err: any) {
    console.error("[proposeToolAction Error]:", err);
    return { error: err.message || "Failed to process tool action." };
  }
}

/**
 * Executes a user-confirmed write action against the database.
 */
export async function executeConfirmedToolAction(
  userId: string,
  toolName: string,
  parameters: Record<string, any>
): Promise<ToolExecutionResult> {
  // 1. Strict Server-Side Allowlist Check
  if (!isToolAllowed(toolName)) {
    return {
      success: false,
      tool: toolName as any,
      message: `Security Refusal: Tool '${toolName}' is not allowed by policy.`,
      error: "UNAUTHORIZED_TOOL",
    };
  }

  const pool = getDbPool();

  try {
    switch (toolName) {
      case "update_resume_section": {
        const section = String(parameters.section || "summary").toLowerCase();
        const content = parameters.content;

        // Fetch or create primary resume
        const resumeRes = await pool.query(
          `SELECT id, content FROM public.resumes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
          [userId]
        );

        let resumeId = "";
        let currentContent: any = {};

        if (resumeRes.rows.length > 0) {
          resumeId = resumeRes.rows[0].id;
          currentContent = resumeRes.rows[0].content || {};
        } else {
          // Create initial resume
          const newResumeRes = await pool.query(
            `INSERT INTO public.resumes (id, user_id, title, content, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, 'ATS Master Resume', '{}', NOW(), NOW())
             RETURNING id, content`,
            [userId]
          );
          resumeId = newResumeRes.rows[0].id;
          currentContent = {};
        }

        const before = currentContent[section] || "";
        currentContent[section] = content;

        await pool.query(
          `UPDATE public.resumes SET content = $1, updated_at = NOW() WHERE id = $2`,
          [currentContent, resumeId]
        );

        await logToolInteraction({
          userId,
          toolName,
          status: "action_executed",
          inputSummary: `User confirmed resume update for section '${section}'`,
          outputSummary: `Updated resume ${resumeId} section ${section}`,
          metadata: { section, before, after: content },
        });

        return {
          success: true,
          tool: toolName,
          message: `Your resume ${section} has been successfully updated!`,
          data: { section, content, resumeId },
        };
      }

      case "start_mock_interview": {
        const role = String(parameters.role || "Software Engineer");
        const difficulty = String(parameters.difficulty || "Intermediate");
        const launchUrl = `/interviews/software-engineering?jobTitle=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}&autoStart=true`;

        await logToolInteraction({
          userId,
          toolName,
          status: "action_executed",
          inputSummary: `User confirmed interview launch for role: ${role}`,
          outputSummary: `Launched mock interview session`,
          metadata: { role, difficulty, launchUrl },
        });

        return {
          success: true,
          tool: toolName,
          message: `Mock interview session configured for ${role}!`,
          data: { launchUrl, role, difficulty },
        };
      }

      case "schedule_task": {
        const task = String(parameters.task || "").trim();
        const category = String(parameters.category || "drill");
        const duration = String(parameters.durationMinutes || "30");

        const newTask = {
          id: `task_${Date.now()}`,
          title: task,
          category,
          durationMinutes: parseInt(duration, 10) || 30,
          completed: false,
          createdAt: new Date().toISOString(),
        };

        // Append to profiles.daily_tasks
        const profileRes = await pool.query(
          `SELECT daily_tasks FROM public.profiles WHERE id = $1`,
          [userId]
        );

        let tasks: any[] = [];
        if (profileRes.rows.length > 0 && Array.isArray(profileRes.rows[0].daily_tasks)) {
          tasks = profileRes.rows[0].daily_tasks;
        }
        tasks.push(newTask);

        await pool.query(
          `UPDATE public.profiles SET daily_tasks = $1, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(tasks), userId]
        );

        await logToolInteraction({
          userId,
          toolName,
          status: "action_executed",
          inputSummary: `User confirmed adding daily task: ${task}`,
          outputSummary: `Appended task to daily_tasks`,
          metadata: { newTask },
        });

        return {
          success: true,
          tool: toolName,
          message: `Task "${task}" has been added to Today's Plan!`,
          data: newTask,
        };
      }

      case "reorder_dashboard": {
        const preference = String(parameters.preference || "career_plan");
        const layoutObj = {
          focusPreset: preference,
          updatedAt: new Date().toISOString(),
        };

        await pool.query(
          `UPDATE public.profiles SET dashboard_layout_preference = $1, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(layoutObj), userId]
        );

        await logToolInteraction({
          userId,
          toolName,
          status: "action_executed",
          inputSummary: `User confirmed dashboard reorder preference: ${preference}`,
          outputSummary: `Updated profiles.dashboard_layout_preference`,
          metadata: { layoutObj },
        });

        return {
          success: true,
          tool: toolName,
          message: `Dashboard layout preference updated to ${preference.replace(/_/g, " ")}!`,
          data: layoutObj,
        };
      }

      case "update_dashboard_goal": {
        const goal = String(parameters.goal || "").trim();
        const targetRole = parameters.targetRole ? String(parameters.targetRole).trim() : null;

        await pool.query(
          `UPDATE public.profiles
           SET primary_goal = $1,
               headline = COALESCE($2, headline),
               updated_at = NOW()
           WHERE id = $3`,
          [goal, targetRole, userId]
        );

        await logToolInteraction({
          userId,
          toolName,
          status: "action_executed",
          inputSummary: `User confirmed primary goal update: ${goal}`,
          outputSummary: `Updated profiles.primary_goal`,
          metadata: { goal, targetRole },
        });

        return {
          success: true,
          tool: toolName,
          message: `Primary career goal updated to "${goal}"!`,
          data: { goal, targetRole },
        };
      }

      default:
        return {
          success: false,
          tool: toolName as any,
          message: `Tool '${toolName}' execution handler not implemented.`,
          error: "UNKNOWN_TOOL",
        };
    }
  } catch (err: any) {
    console.error("[executeConfirmedToolAction Error]:", err);
    return {
      success: false,
      tool: toolName as any,
      message: err.message || "Failed to execute tool action.",
      error: "EXECUTION_FAILED",
    };
  }
}

/**
 * Authoritative interaction logger to public.myra_interactions.
 */
async function logToolInteraction(params: {
  userId: string;
  toolName: string;
  status: string;
  inputSummary: string;
  outputSummary: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO public.myra_interactions (id, user_id, feature_context, input_summary, output_summary, model_version, status, metadata, created_at)
       VALUES (gen_random_uuid(), $1, 'myra_tool_agent', $2, $3, 'Myra Task Agent 1.0', $4, $5, NOW())`,
      [
        params.userId,
        params.inputSummary.slice(0, 300),
        params.outputSummary.slice(0, 300),
        params.status,
        JSON.stringify(params.metadata || {}),
      ]
    );
  } catch (err) {
    console.warn("[myra_interactions Tool Log Note]:", err);
  }
}

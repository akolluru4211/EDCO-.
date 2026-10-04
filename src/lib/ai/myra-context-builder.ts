import { supabase } from "@/lib/supabase";

export type MyraFeatureContext =
  | "ask_myra"
  | "resume_tailor"
  | "interview_generate"
  | "interview_score"
  | "proactive_suggestion"
  | "birthday_wish";

export interface MyraScopedUserContext {
  userId: string;
  featureContext: MyraFeatureContext;
  profileSnapshot?: {
    name: string;
    targetRole: string;
    careerStage: string;
    headline?: string;
    college?: string;
    company?: string;
    skills: string[];
    primaryGoal?: string;
    currentStreak?: number;
    totalXp?: number;
  };
  resumeSnapshot?: {
    title: string;
    skills: string[];
    projectCount: number;
    experienceCount: number;
    lastUpdated?: string;
  };
  interviewSnapshot?: {
    totalSessions: number;
    averageScore: number;
    recentScores: number[];
    commonStruggles: string[];
    lastInterviewDate?: string;
  };
  projectsSnapshot?: {
    count: number;
    titles: string[];
    technologies: string[];
  };
  longitudinalSignals?: {
    daysSinceLastResumeUpdate?: number;
    daysSinceLastInterview?: number;
    hasUnlistedProjects?: boolean;
    scoreTrend?: "improving" | "stable" | "dipping";
  };
}

/**
 * Myra Context Builder (Retrieval, Not Guessing)
 * 
 * Hard Privacy Boundary:
 * 1. NEVER includes raw DOB.
 * 2. NEVER includes data belonging to another user.
 * 3. Strictly follows Least Privilege — scopes retrieval to what the current feature template needs.
 */
export async function buildMyraUserContext(
  userId: string,
  featureContext: MyraFeatureContext
): Promise<MyraScopedUserContext> {
  const result: MyraScopedUserContext = {
    userId,
    featureContext,
  };

  if (!userId || userId === "guest" || userId === "learner-user") {
    return result;
  }

  try {
    // 1. Fetch Profile (Strictly excluding raw DOB)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, target_role, career_stage, headline, college, company, skills, interests, primary_goal, points, current_streak")
      .eq("id", userId)
      .maybeSingle();

    if (profile) {
      const skillsArray = Array.isArray(profile.skills)
        ? profile.skills
        : Array.isArray(profile.interests)
        ? profile.interests.map((i: any) => (typeof i === "string" ? i : i.name || ""))
        : [];

      result.profileSnapshot = {
        name: profile.name || "Learner",
        targetRole: profile.target_role || "Software Engineer",
        careerStage: profile.career_stage || "PROFESSIONAL",
        headline: profile.headline || undefined,
        college: profile.college || undefined,
        company: profile.company || undefined,
        skills: skillsArray.filter(Boolean).slice(0, 15),
        primaryGoal: profile.primary_goal || undefined,
        currentStreak: profile.current_streak || 0,
        totalXp: profile.points || 0,
      };
    }

    // 2. Scoped Retrieval: Resume Snapshot (Needed for ask_myra, resume_tailor, interview_generate, proactive_suggestion)
    if (["ask_myra", "resume_tailor", "interview_generate", "proactive_suggestion"].includes(featureContext)) {
      const { data: latestResume } = await supabase
        .from("resumes")
        .select("title, content, updated_at, created_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestResume && latestResume.content) {
        const c = latestResume.content;
        const rSkills = Array.isArray(c.skills) ? c.skills : [];
        const rProjects = Array.isArray(c.projects) ? c.projects : [];
        const rExp = Array.isArray(c.experience) ? c.experience : [];

        result.resumeSnapshot = {
          title: latestResume.title || "Primary Resume",
          skills: rSkills.slice(0, 15),
          projectCount: rProjects.length,
          experienceCount: rExp.length,
          lastUpdated: latestResume.updated_at || latestResume.created_at,
        };
      }
    }

    // 3. Scoped Retrieval: Interview Snapshot (Needed for ask_myra, interview_generate, proactive_suggestion)
    if (["ask_myra", "interview_generate", "proactive_suggestion"].includes(featureContext)) {
      const { data: recentSessions } = await supabase
        .from("interview_sessions")
        .select("score, overall_score, feedback, weak_points, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentSessions && recentSessions.length > 0) {
        const scores = recentSessions
          .map((s) => s.overall_score ?? s.score)
          .filter((s): s is number => typeof s === "number" && !isNaN(s));

        const avg = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 70;

        const allWeakPoints: string[] = [];
        recentSessions.forEach((s) => {
          if (Array.isArray(s.weak_points)) allWeakPoints.push(...s.weak_points);
        });

        result.interviewSnapshot = {
          totalSessions: recentSessions.length,
          averageScore: avg,
          recentScores: scores.slice(0, 3),
          commonStruggles: Array.from(new Set(allWeakPoints)).slice(0, 5),
          lastInterviewDate: recentSessions[0]?.created_at,
        };
      }
    }

    // 4. Scoped Retrieval: Projects Snapshot (Needed for ask_myra, interview_generate, proactive_suggestion)
    if (["ask_myra", "interview_generate", "proactive_suggestion"].includes(featureContext)) {
      const { data: userProjects } = await supabase
        .from("projects")
        .select("title, skills, technologies, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (userProjects && userProjects.length > 0) {
        const allTech: string[] = [];
        userProjects.forEach((p) => {
          if (Array.isArray(p.technologies)) allTech.push(...p.technologies);
          if (Array.isArray(p.skills)) allTech.push(...p.skills);
        });

        result.projectsSnapshot = {
          count: userProjects.length,
          titles: userProjects.map((p) => p.title).slice(0, 4),
          technologies: Array.from(new Set(allTech)).slice(0, 10),
        };
      }
    }

    // 5. Scoped Retrieval: Longitudinal Signals (Needed for proactive_suggestion)
    if (featureContext === "proactive_suggestion") {
      const now = Date.now();
      let daysSinceResume = 999;
      if (result.resumeSnapshot?.lastUpdated) {
        daysSinceResume = Math.floor((now - new Date(result.resumeSnapshot.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      }

      let daysSinceInterview = 999;
      if (result.interviewSnapshot?.lastInterviewDate) {
        daysSinceInterview = Math.floor((now - new Date(result.interviewSnapshot.lastInterviewDate).getTime()) / (1000 * 60 * 60 * 24));
      }

      const scores = result.interviewSnapshot?.recentScores || [];
      let trend: "improving" | "stable" | "dipping" = "stable";
      if (scores.length >= 2) {
        if (scores[0] < scores[1] - 5) trend = "dipping";
        else if (scores[0] > scores[1] + 5) trend = "improving";
      }

      const projCount = result.projectsSnapshot?.count || 0;
      const resumeProjCount = result.resumeSnapshot?.projectCount || 0;
      const hasUnlisted = projCount > resumeProjCount;

      result.longitudinalSignals = {
        daysSinceLastResumeUpdate: daysSinceResume,
        daysSinceLastInterview: daysSinceInterview,
        hasUnlistedProjects: hasUnlisted,
        scoreTrend: trend,
      };
    }
  } catch (err) {
    console.warn("[Myra Context Builder Warning]:", err);
  }

  return result;
}

/**
 * Format scoped context into a concise prompt block for LLM injection
 */
export function formatContextPromptBlock(context: MyraScopedUserContext): string {
  const parts: string[] = [];

  if (context.profileSnapshot) {
    const p = context.profileSnapshot;
    parts.push(`Candidate: ${p.name} | Target Role: ${p.targetRole} | Stage: ${p.careerStage}`);
    if (p.skills.length > 0) parts.push(`Core Skills: ${p.skills.join(", ")}`);
    if (p.primaryGoal) parts.push(`Primary Goal: ${p.primaryGoal}`);
  }

  if (context.resumeSnapshot) {
    const r = context.resumeSnapshot;
    parts.push(`Resume: "${r.title}" with ${r.skills.length} skills, ${r.projectCount} projects.`);
  }

  if (context.interviewSnapshot) {
    const i = context.interviewSnapshot;
    parts.push(`Recent Interview Avg: ${i.averageScore}% across ${i.totalSessions} sessions.`);
    if (i.commonStruggles.length > 0) {
      parts.push(`Recent Interview Growth Areas: ${i.commonStruggles.join(", ")}`);
    }
  }

  if (context.projectsSnapshot && context.projectsSnapshot.count > 0) {
    const pr = context.projectsSnapshot;
    parts.push(`Verified Projects: ${pr.count} repos (${pr.titles.join(", ")}), Tech: ${pr.technologies.slice(0, 6).join(", ")}`);
  }

  return parts.length > 0 ? `\n[VERIFIED CANDIDATE CONTEXT]\n${parts.join("\n")}\n` : "";
}

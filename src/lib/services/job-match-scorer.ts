import { ResumeContent, UserProfile } from "@/lib/types";

export interface JobMatchInput {
  id?: string;
  title: string;
  description?: string;
  skillsRequired: string[];
  experienceLevel?: string;
  category?: string;
}

export interface JobMatchAnalysis {
  score: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  personalizationBonus: number;
  explanation: string;
  tier: "strong" | "moderate" | "low";
}

/**
 * Normalizes text tokens for reliable keyword overlap detection
 */
function extractTokens(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Shared production match-scoring engine for Edworld Job Board.
 * Reuses the Resume Maker (Feature 16) keyword breakdown algorithm and layers in
 * personalized profile nudges (career stage, target dream job, effective skill level).
 */
export function calculateJobMatch(
  job: JobMatchInput,
  resumeContent?: Partial<ResumeContent> | null,
  profile?: Partial<UserProfile> | null
): JobMatchAnalysis {
  const jdText = `${job.title} ${job.description || ""} ${job.skillsRequired.join(" ")}`.toLowerCase();
  
  // 1. Gather all resume skills & text
  const resumeTextParts: string[] = [];
  const candidateSkills: Set<string> = new Set();

  if (resumeContent) {
    if (resumeContent.summary) resumeTextParts.push(resumeContent.summary);
    if (resumeContent.skills) {
      if (Array.isArray(resumeContent.skills.technical)) {
        resumeContent.skills.technical.forEach((s) => {
          resumeTextParts.push(s);
          candidateSkills.add(s.toLowerCase().trim());
        });
      }
      if (Array.isArray(resumeContent.skills.tools)) {
        resumeContent.skills.tools.forEach((s) => {
          resumeTextParts.push(s);
          candidateSkills.add(s.toLowerCase().trim());
        });
      }
      if (Array.isArray(resumeContent.skills.soft)) {
        resumeContent.skills.soft.forEach((s) => {
          resumeTextParts.push(s);
          candidateSkills.add(s.toLowerCase().trim());
        });
      }
    }
    if (Array.isArray(resumeContent.experience)) {
      resumeContent.experience.forEach((exp: any) => {
        if (exp.role) resumeTextParts.push(exp.role);
        if (exp.company) resumeTextParts.push(exp.company);
        if (Array.isArray(exp.bullets)) resumeTextParts.push(...exp.bullets);
      });
    }
    if (Array.isArray(resumeContent.projects)) {
      resumeContent.projects.forEach((proj: any) => {
        if (proj.title) resumeTextParts.push(proj.title);
        if (proj.description) resumeTextParts.push(proj.description);
        if (Array.isArray(proj.techStack)) {
          proj.techStack.forEach((t: string) => {
            resumeTextParts.push(t);
            candidateSkills.add(t.toLowerCase().trim());
          });
        }
      });
    }
  }

  // Also include profile interests / skills if available
  if (profile?.interests && Array.isArray(profile.interests)) {
    profile.interests.forEach((item: any) => {
      const name = typeof item === "string" ? item : item.name;
      if (name) {
        resumeTextParts.push(name);
        candidateSkills.add(name.toLowerCase().trim());
      }
    });
  }

  const fullCandidateText = resumeTextParts.join(" ").toLowerCase();

  // 2. Compute Skill Keyword Match (0 - 60 points)
  const requiredSkills = job.skillsRequired && job.skillsRequired.length > 0 
    ? job.skillsRequired 
    : ["General Software Engineering", "Problem Solving"];
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    // Direct match or substring match in candidate skills/text
    const isDirectMatch = candidateSkills.has(sLower);
    const isTextMatch = fullCandidateText.includes(sLower);
    
    if (isDirectMatch || isTextMatch) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchRatio = requiredSkills.length > 0 
    ? matchedSkills.length / requiredSkills.length 
    : 0.5;
  const skillPoints = Math.round(skillMatchRatio * 60);

  // 3. Compute Profile Personalization Nudge (0 - 25 points)
  let personalizationBonus = 0;
  const candidateTargetRole = (
    (profile as any)?.dreamJob || 
    (profile as any)?.targetRole || 
    (profile as any)?.careerGoal || 
    ""
  ).toLowerCase();

  const jobTitleLower = job.title.toLowerCase();
  const jobCategoryLower = (job.category || "").toLowerCase();

  // A. Role & Career Title Alignment (up to 12 points)
  if (candidateTargetRole) {
    if (jobTitleLower.includes(candidateTargetRole) || candidateTargetRole.includes(jobTitleLower)) {
      personalizationBonus += 12;
    } else {
      // Check word overlap
      const roleTokens = extractTokens(candidateTargetRole);
      const titleTokens = extractTokens(jobTitleLower);
      const hasOverlap = roleTokens.some((t) => titleTokens.includes(t));
      if (hasOverlap) personalizationBonus += 8;
    }
  } else {
    // Neutral bonus if no explicit target role set
    personalizationBonus += 5;
  }

  // B. Experience Level Alignment (up to 8 points)
  const candidateLevel = (profile as any)?.interests?.[0]?.effectiveLevel ?? 1; // 0: entry, 1: mid, 2: senior
  const reqLevel = (job.experienceLevel || "mid").toLowerCase();

  if (reqLevel.includes("entry") || reqLevel.includes("junior")) {
    if (candidateLevel <= 1) personalizationBonus += 8;
    else personalizationBonus += 5;
  } else if (reqLevel.includes("senior") || reqLevel.includes("lead")) {
    if (candidateLevel >= 2) personalizationBonus += 8;
    else personalizationBonus += 3;
  } else {
    // Mid level
    personalizationBonus += 7;
  }

  // C. Domain & Category Interest (up to 5 points)
  if (profile?.interests && profile.interests.length > 0) {
    const hasCategoryMatch = profile.interests.some((i: any) => {
      const name = (typeof i === "string" ? i : i.name).toLowerCase();
      return jdText.includes(name) || jobCategoryLower.includes(name);
    });
    if (hasCategoryMatch) personalizationBonus += 5;
  }

  // 4. Baseline Foundation Points (10 - 15 points based on resume completeness)
  let foundationPoints = 10;
  if (resumeContent && (resumeContent.experience?.length || 0) > 0) foundationPoints += 3;
  if (resumeContent && (resumeContent.projects?.length || 0) > 0) foundationPoints += 2;

  // Final aggregate score clamped between 15 and 99
  const rawScore = skillPoints + personalizationBonus + foundationPoints;
  const score = Math.min(98, Math.max(25, rawScore));

  const tier: "strong" | "moderate" | "low" = 
    score >= 80 ? "strong" : score >= 60 ? "moderate" : "low";

  // Build transparent explanation
  let explanation = "";
  if (tier === "strong") {
    explanation = `Strong ${score}% alignment. You match ${matchedSkills.length} of ${requiredSkills.length} core skills (${matchedSkills.slice(0, 3).join(", ")}) and your target career trajectory directly matches this role.`;
  } else if (tier === "moderate") {
    explanation = `Moderate ${score}% alignment. Your foundational background is aligned, but closing gaps in ${missingSkills.slice(0, 2).join(" & ") || "specialized tools"} will make your resume standout.`;
  } else {
    explanation = `Noticeable skill divergence (${score}%). This role requires specialized experience in ${missingSkills.slice(0, 3).join(", ") || "additional technologies"}.`;
  }

  return {
    score,
    matchedSkills,
    missingSkills,
    personalizationBonus,
    explanation,
    tier,
  };
}

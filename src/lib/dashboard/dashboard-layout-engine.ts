/**
 * Dashboard Layout Engine
 * Provides smart default widget prioritization based on user role (college vs working_professional),
 * target role, interests, and recent activity, alongside custom user layout preferences.
 */

export interface DashboardSectionConfig {
  id: string;
  label: string;
  description: string;
  category: "core" | "career" | "insights" | "schedule";
  defaultVisible: boolean;
  minRole?: "college" | "working_professional" | "all";
}

export const ALL_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  {
    id: "personalized_timetable",
    label: "Study & Focus Timetable",
    description: "Weekly academic and interview preparation timetable calibrated to your schedule.",
    category: "schedule",
    defaultVisible: true,
  },
  {
    id: "my_career_plan",
    label: "Career Plan & Skill Milestones",
    description: "Goal milestones, skill radar, and actionable progress checkpoints.",
    category: "career",
    defaultVisible: true,
  },
  {
    id: "continue_learning",
    label: "Active Drill & Continue Learning",
    description: "Your most recent mock interview evaluation or active practice drill.",
    category: "core",
    defaultVisible: true,
  },
  {
    id: "score_readiness_matrix",
    label: "Score & Readiness Matrix",
    description: "Telemetry across mock interview mastery, aptitude agility, and ATS resume scoring.",
    category: "insights",
    defaultVisible: true,
  },
  {
    id: "recommended_curriculum",
    label: "Recommended Curriculum",
    description: "Curated modules and challenges tailored to your target engineering track.",
    category: "core",
    defaultVisible: true,
  },
  {
    id: "daily_practice_sprint",
    label: "Daily Practice Sprint",
    description: "Quick 10-minute speed questions for quantitative and logical reasoning.",
    category: "core",
    defaultVisible: true,
  },
  {
    id: "connection_birthdays",
    label: "Connection Birthdays",
    description: "Upcoming birthdays of your opted-in connections with 1-click one-way wishes.",
    category: "insights",
    defaultVisible: true,
  },
  {
    id: "verified_identity",
    label: "Verified Identity Badge",
    description: "Digital verified profile ID, target role, and public portfolio status.",
    category: "career",
    defaultVisible: true,
  },
  {
    id: "skill_calibration",
    label: "Skill Telemetry & Levels",
    description: "Concept growth rings and verified skill benchmarks.",
    category: "insights",
    defaultVisible: true,
  },
];

export interface DashboardLayoutPreference {
  order: string[];
  hidden: string[];
}

/**
 * Computes the smart default section ordering based on role and profile signals.
 */
export function getSmartDefaultLayout(
  careerStage: "college" | "working_professional" | string,
  targetRole?: string,
  interests?: string[]
): DashboardLayoutPreference {
  const isProfessional = 
    careerStage === "working_professional" || 
    careerStage === "PROFESSIONAL";

  let prioritizedOrder: string[];

  if (isProfessional) {
    // Working professionals: Prioritize Career Plan, Score/Readiness Matrix, Continue Learning, followed by Timetable & Curriculum
    prioritizedOrder = [
      "my_career_plan",
      "continue_learning",
      "score_readiness_matrix",
      "personalized_timetable",
      "recommended_curriculum",
      "daily_practice_sprint",
      "connection_birthdays",
      "verified_identity",
      "skill_calibration",
    ];
  } else {
    // College / Students: Prioritize Study Timetable, Continue Learning, Daily Sprints, Career Plan & Matrix
    prioritizedOrder = [
      "personalized_timetable",
      "continue_learning",
      "my_career_plan",
      "recommended_curriculum",
      "daily_practice_sprint",
      "score_readiness_matrix",
      "connection_birthdays",
      "verified_identity",
      "skill_calibration",
    ];
  }

  // Ensure all known sections are accounted for
  const allIds = ALL_DASHBOARD_SECTIONS.map((s) => s.id);
  const remainingIds = allIds.filter((id) => !prioritizedOrder.includes(id));
  const finalOrder = [...prioritizedOrder, ...remainingIds];

  return {
    order: finalOrder,
    hidden: [],
  };
}

/**
 * Resolves the active layout order by applying user customizations or smart defaults.
 */
export function resolveDashboardLayout(
  careerStage: string = "college",
  targetRole?: string,
  interests?: string[],
  customPreference?: DashboardLayoutPreference | null
): { orderedSections: DashboardSectionConfig[]; hiddenIds: string[] } {
  const smartDefault = getSmartDefaultLayout(careerStage, targetRole, interests);

  const activeOrder = (customPreference?.order && customPreference.order.length > 0)
    ? customPreference.order
    : smartDefault.order;

  const hiddenIds = customPreference?.hidden || [];

  // Map IDs to section configs while retaining ordering
  const sectionMap = new Map(ALL_DASHBOARD_SECTIONS.map((s) => [s.id, s]));
  const orderedSections: DashboardSectionConfig[] = [];

  for (const id of activeOrder) {
    const config = sectionMap.get(id);
    if (config) {
      orderedSections.push(config);
      sectionMap.delete(id);
    }
  }

  // Append any missing sections
  sectionMap.forEach((config) => {
    orderedSections.push(config);
  });

  return {
    orderedSections,
    hiddenIds,
  };
}

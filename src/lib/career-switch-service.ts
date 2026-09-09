export interface TargetRoleProfile {
  id: string;
  title: string;
  requiredSkills: Record<string, number>; // skill name -> target level (0=Novice, 1=Intermediate, 2=Advanced)
  description: string;
  recommendedQuests: string[];
}

export const TARGET_ROLE_PROFILES: TargetRoleProfile[] = [
  {
    id: "fullstack_engineer",
    title: "Senior Full Stack Engineer",
    requiredSkills: {
      "React / Frontend Architecture": 2,
      "Node.js / API Design": 2,
      "PostgreSQL / Database Optimization": 2,
      "Cloud Infrastructure & CI/CD": 1
    },
    description: "End-to-end web architecture and system reliability.",
    recommendedQuests: ["Building Scalable APIs", "Relational Database Indexing Strategies"]
  },
  {
    id: "ai_engineer",
    title: "AI / ML Solutions Engineer",
    requiredSkills: {
      "Python / Data Science": 2,
      "LLM Tooling & Prompt Engineering": 2,
      "Vector Search & Embeddings": 1,
      "API Deployment": 1
    },
    description: "Generative AI applications and retrieval-augmented systems.",
    recommendedQuests: ["Retrieval-Augmented Generation Architecture", "AI Safety & Guardrails"]
  },
  {
    id: "product_manager",
    title: "Technical Product Manager",
    requiredSkills: {
      "Product Strategy & Roadmapping": 2,
      "System Architecture Fundamentals": 1,
      "Data Analytics & Metrics": 2,
      "Stakeholder Communication": 2
    },
    description: "Technical vision, cross-functional execution, and product telemetry.",
    recommendedQuests: ["Product Metric North Stars", "User Research & PRD Structuring"]
  }
];

export function computeCareerGapSummary(
  targetRoleId: string,
  userSkillLevels: Record<string, number>
) {
  const role = TARGET_ROLE_PROFILES.find(r => r.id === targetRoleId) || TARGET_ROLE_PROFILES[0];
  const gaps: Array<{ skill: string; currentLevel: number; expectedLevel: number; status: "met" | "needs_upskilling" }> = [];

  Object.entries(role.requiredSkills).forEach(([skill, expectedLevel]) => {
    const current = userSkillLevels[skill] !== undefined ? userSkillLevels[skill] : 0;
    gaps.push({
      skill,
      currentLevel: current,
      expectedLevel,
      status: current >= expectedLevel ? "met" : "needs_upskilling"
    });
  });

  return {
    targetRole: role.title,
    description: role.description,
    gaps,
    recommendedQuests: role.recommendedQuests,
    disclaimer: "Guidance and suggestion tool only. Edworld Co does not guarantee hiring or employment outcomes. Skill gaps represent industry reference benchmarks."
  };
}

import { SupabaseClient } from "@supabase/supabase-js";
import { 
  SkillLevel, 
  UserDomainItem, 
  UserDomainPriority,
  UserCareerGoal, 
  LearningRoadmap, 
  RoadmapPhase, 
  RoadmapMilestone,
  DailyPlanTask,
  CareerPlanOverview,
  CurriculumAdaptationProposal,
  RoadmapTaskType
} from "@/lib/types";

// ==============================================================================
// 1. CANONICAL DOMAIN CATALOG & SKILL DEFINITIONS
// ==============================================================================

export interface DomainMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  color: string;
  popularRoles: string[];
  coreSkills: Array<{ id: string; name: string; level: SkillLevel }>;
}

export const DOMAIN_CATALOG: DomainMeta[] = [
  {
    id: "swe",
    name: "Software Engineering & Full Stack",
    category: "Engineering",
    description: "Modern web architecture, scalable backend systems, data structures, algorithms, and distributed services.",
    iconName: "Code2",
    color: "#7B57FF",
    popularRoles: ["Full Stack Developer", "Backend Engineer", "Frontend Specialist", "Systems Architect"],
    coreSkills: [
      { id: "dsa", name: "Data Structures & Algorithms", level: 1 },
      { id: "system_design", name: "System Design & Distributed Systems", level: 1 },
      { id: "clean_code", name: "Clean Architecture & Design Patterns", level: 1 },
      { id: "api_design", name: "RESTful & GraphQL API Architecture", level: 1 }
    ]
  },
  {
    id: "ai_ml",
    name: "Artificial Intelligence & Machine Learning",
    category: "AI & Data",
    description: "Deep learning, LLMs, RAG architectures, neural networks, PyTorch, and generative AI agents.",
    iconName: "Brain",
    color: "#00D2B4",
    popularRoles: ["AI Engineer", "ML Engineer", "LLM Systems Architect", "Data Scientist"],
    coreSkills: [
      { id: "ml_fundamentals", name: "Machine Learning Math & Algorithms", level: 0 },
      { id: "llm_engineering", name: "LLM Orchestration & Prompt Chains", level: 1 },
      { id: "rag_systems", name: "Vector Databases & Production RAG", level: 1 },
      { id: "model_deployment", name: "MLOps & Fast Inference APIs", level: 2 }
    ]
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & Information Security",
    category: "Security",
    description: "Threat modeling, penetration testing, network defense, cryptography, and secure code audits.",
    iconName: "ShieldCheck",
    color: "#FF7A50",
    popularRoles: ["Security Analyst", "AppSec Engineer", "Penetration Tester", "SOC Analyst"],
    coreSkills: [
      { id: "app_security", name: "OWASP Top 10 & AppSec Auditing", level: 1 },
      { id: "cryptography", name: "Applied Cryptography & Zero-Trust", level: 1 },
      { id: "network_security", name: "Network Forensics & Packet Analysis", level: 0 },
      { id: "cloud_security", name: "Cloud Security & IAM Governance", level: 2 }
    ]
  },
  {
    id: "devops_cloud",
    name: "Cloud Architecture & DevOps",
    category: "Infrastructure",
    description: "CI/CD pipelines, Kubernetes, Docker containers, AWS/GCP infrastructure as code, and observability.",
    iconName: "Layers",
    color: "#3B82F6",
    popularRoles: ["DevOps Engineer", "Cloud Solutions Architect", "SRE", "Platform Engineer"],
    coreSkills: [
      { id: "containers", name: "Docker & Container Orchestration", level: 1 },
      { id: "k8s", name: "Kubernetes Clusters & Ingress", level: 2 },
      { id: "cicd", name: "GitHub Actions & Automated Pipelines", level: 1 },
      { id: "cloud_infra", name: "Terraform & AWS Cloud Architecture", level: 1 }
    ]
  },
  {
    id: "data_science",
    name: "Data Science & Analytics",
    category: "AI & Data",
    description: "Exploratory data analysis, SQL warehousing, business intelligence, predictive modeling, and statistical inference.",
    iconName: "BarChart3",
    color: "#EC4899",
    popularRoles: ["Data Scientist", "Data Analyst", "Analytics Engineer", "BI Consultant"],
    coreSkills: [
      { id: "sql_advanced", name: "Advanced SQL & Query Optimization", level: 1 },
      { id: "data_viz", name: "Data Visualization & Storytelling", level: 0 },
      { id: "stats", name: "Applied Statistics & Hypothesis Testing", level: 1 },
      { id: "data_pipelines", name: "ETL Pipelines & Data Warehousing", level: 2 }
    ]
  },
  {
    id: "mobile",
    name: "Mobile App Development",
    category: "Engineering",
    description: "Cross-platform and native mobile apps with Flutter, React Native, Swift, and Android Jetpack Compose.",
    iconName: "Smartphone",
    color: "#8B5CF6",
    popularRoles: ["Mobile Engineer", "Flutter Developer", "iOS Engineer", "Android Developer"],
    coreSkills: [
      { id: "mobile_ui", name: "Responsive Mobile UI & Gestures", level: 0 },
      { id: "state_mgmt", name: "Mobile State Management & Offline Cache", level: 1 },
      { id: "native_apis", name: "Native APIs, Camera & Bluetooth Interop", level: 2 }
    ]
  },
  {
    id: "behavioral",
    name: "Leadership & Behavioral Mastery",
    category: "Professional",
    description: "STAR structured responses, communication clarity, conflict resolution, and cross-functional leadership.",
    iconName: "Users",
    color: "#FFB800",
    popularRoles: ["Engineering Manager", "Tech Lead", "Senior Consultant", "Product Lead"],
    coreSkills: [
      { id: "star_technique", name: "STAR Method & Behavioral Storytelling", level: 0 },
      { id: "leadership", name: "Conflict Resolution & Team Mentorship", level: 1 },
      { id: "stakeholder_comm", name: "Executive & Stakeholder Communication", level: 2 }
    ]
  },
  {
    id: "aptitude",
    name: "Quantitative & Analytical Aptitude",
    category: "Foundations",
    description: "Mathematical problem-solving, logical deduction, data interpretation, and placement speed drills.",
    iconName: "Zap",
    color: "#10B981",
    popularRoles: ["Campus Placement Aspirant", "Consultant", "Competitive Candidate"],
    coreSkills: [
      { id: "quant_math", name: "Speed Math, Probability & Permutations", level: 0 },
      { id: "logical_reasoning", name: "Logical Deduction, Puzzles & Sequences", level: 1 },
      { id: "data_interpretation", name: "Charts, Tables & Data Sufficiency", level: 1 }
    ]
  }
];

// ==============================================================================
// 2. UNIFIED MULTI-DOMAIN ROADMAP BUILDER
// ==============================================================================

export function generateUnifiedRoadmap(
  userId: string,
  domains: UserDomainItem[],
  goal: UserCareerGoal
): LearningRoadmap {
  const primaryDomain = domains.find(d => d.priority === "primary") || domains[0] || {
    id: "swe",
    user_id: userId,
    domain_id: "swe",
    domain_name: "Software Engineering & Full Stack",
    priority: "primary" as UserDomainPriority,
    self_level: 1 as SkillLevel,
    effective_level: 1 as SkillLevel
  };

  const secondaryDomains = domains.filter(d => d.priority === "secondary");
  const supportingDomains = domains.filter(d => d.priority === "supporting");

  const targetRole = goal?.target_role || "Full Stack Software Engineer";
  const timeframe = goal?.target_timeframe_months || 6;
  const weeksPerPhase = Math.max(2, Math.round((timeframe * 4) / 4));

  // Phase 1: Foundations & Architecture
  const p1Milestones: RoadmapMilestone[] = [
    {
      id: `${primaryDomain.domain_id}-p1-m1`,
      title: `${primaryDomain.domain_name} — Core Foundations & Syntax`,
      description: "Master modern idioms, memory models, asynchronous execution, and data structures.",
      estimated_hours: 12,
      domain_id: primaryDomain.domain_id,
      skill_id: "dsa",
      task_type: "concept",
      practice_url: "/problems",
      resource_url: "https://github.com/trekhleb/javascript-algorithms",
      completed: false
    },
    {
      id: "shared-p1-algo",
      title: "Algorithmic Problem Solving & Complexity Analysis",
      description: "Practice Big-O time and space complexity with arrays, hashes, sliding window, and two-pointer patterns.",
      estimated_hours: 10,
      domain_id: "swe",
      skill_id: "dsa",
      task_type: "practice",
      practice_url: "/problems",
      completed: false
    },
    {
      id: "shared-p1-aptitude",
      title: "Analytical Foundations & Placement Speed Sprint",
      description: "Build rapid mental calculation, probability, and logical deduction instincts.",
      estimated_hours: 6,
      domain_id: "aptitude",
      skill_id: "quant_math",
      task_type: "aptitude",
      practice_url: "/aptitude",
      completed: false
    }
  ];

  // If secondary domain exists, add early cross-domain bridge milestone
  if (secondaryDomains.length > 0) {
    const sec = secondaryDomains[0];
    p1Milestones.push({
      id: `${sec.domain_id}-p1-bridge`,
      title: `${sec.domain_name} — Essential Prerequisite Concepts`,
      description: `Bridge foundational knowledge in ${sec.domain_name} alongside your primary domain.`,
      estimated_hours: 8,
      domain_id: sec.domain_id,
      skill_id: sec.domain_id === "ai_ml" ? "ml_fundamentals" : "app_security",
      task_type: "concept",
      resource_url: sec.domain_id === "ai_ml" ? "https://python.langchain.com/docs/tutorials/" : "https://owasp.org/www-project-top-ten/",
      completed: false
    });
  }

  // Phase 2: Core Engineering & Systems
  const p2Milestones: RoadmapMilestone[] = [
    {
      id: `${primaryDomain.domain_id}-p2-m1`,
      title: `${primaryDomain.domain_name} — Production Architecture & Patterns`,
      description: "Design modular services, database normalization, caching strategies, and robust error boundaries.",
      estimated_hours: 16,
      domain_id: primaryDomain.domain_id,
      skill_id: "clean_code",
      task_type: "concept",
      practice_url: "/problems",
      completed: false
    },
    {
      id: `${primaryDomain.domain_id}-p2-project`,
      title: "Full-Featured MVP Architecture Project",
      description: "Build an end-to-end service adhering to production standards with automated test suites.",
      estimated_hours: 18,
      domain_id: primaryDomain.domain_id,
      skill_id: "system_design",
      task_type: "project",
      practice_url: "/projects",
      project_id: "proj-core-mvp-1",
      completed: false
    },
    {
      id: "behavioral-p2-star",
      title: "STAR Behavioral Communication & Technical Articulation",
      description: "Practice answering complex behavioral and situational questions using the structured STAR framework.",
      estimated_hours: 6,
      domain_id: "behavioral",
      skill_id: "star_technique",
      task_type: "interview_drill",
      practice_url: "/interviews",
      completed: false
    }
  ];

  // Phase 3: Domain Specialization & Advanced Patterns
  const p3Milestones: RoadmapMilestone[] = [
    {
      id: `${primaryDomain.domain_id}-p3-adv`,
      title: `Advanced ${primaryDomain.domain_name} Distributed Systems & Scale`,
      description: "Handle high-throughput pipelines, concurrency, telemetry, rate limiting, and zero-downtime releases.",
      estimated_hours: 20,
      domain_id: primaryDomain.domain_id,
      skill_id: "system_design",
      task_type: "concept",
      resource_url: "https://github.com/donnemartin/system-design-primer",
      completed: false
    }
  ];

  // Integrate secondary and supporting domains into Phase 3
  secondaryDomains.forEach((sec, idx) => {
    p3Milestones.push({
      id: `${sec.domain_id}-p3-sec-${idx}`,
      title: `${sec.domain_name} — High-Impact Specialized Module`,
      description: `Apply deep ${sec.domain_name} capabilities directly integrated into real-world applications.`,
      estimated_hours: 14,
      domain_id: sec.domain_id,
      skill_id: sec.domain_id === "ai_ml" ? "rag_systems" : sec.domain_id === "cybersecurity" ? "app_security" : "containers",
      task_type: "practice",
      practice_url: "/projects",
      completed: false
    });
  });

  supportingDomains.forEach((sup, idx) => {
    p3Milestones.push({
      id: `${sup.domain_id}-p3-sup-${idx}`,
      title: `${sup.domain_name} — Professional Tooling & Best Practices`,
      description: `Adopt industry-standard pipelines, monitoring, and quality assurance for ${sup.domain_name}.`,
      estimated_hours: 8,
      domain_id: sup.domain_id,
      skill_id: "cicd",
      task_type: "concept",
      resource_url: "https://docs.docker.com/get-started/",
      completed: false
    });
  });

  // Phase 4: Capstone Production Project, ATS & Placement Readiness
  const p4Milestones: RoadmapMilestone[] = [
    {
      id: "p4-capstone-project",
      title: `Production Capstone: ${targetRole} Portfolio Anchor`,
      description: "Build and deploy a verifiable production-grade system with live CI/CD, documentation, and demo.",
      estimated_hours: 24,
      domain_id: primaryDomain.domain_id,
      skill_id: "system_design",
      task_type: "project",
      practice_url: "/projects",
      completed: false
    },
    {
      id: "p4-ats-resume-tuning",
      title: "ATS Resume Keyword Alignment & Impact Metrics",
      description: "Target your resume specifically for top employers with quantitative bullet points and ATS score > 85.",
      estimated_hours: 4,
      domain_id: "swe",
      skill_id: "clean_code",
      task_type: "resume_tuning",
      practice_url: "/resumes",
      completed: false
    },
    {
      id: "p4-mock-interview-simulation",
      title: "Full-Cycle Mock Technical & Behavioral Interview",
      description: "Complete an end-to-end timed simulation evaluating algorithmic reasoning, clarity, and system design.",
      estimated_hours: 6,
      domain_id: "behavioral",
      skill_id: "star_technique",
      task_type: "interview_drill",
      practice_url: "/interviews",
      completed: false
    }
  ];

  const phases: RoadmapPhase[] = [
    {
      id: "phase-1",
      phase_index: 0,
      title: "Phase 1: Foundations & Core Architecture",
      subtitle: "Language fluency, algorithms, and core fundamentals",
      objective: "Establish ironclad mental models in your primary domain and prerequisite algorithmic patterns.",
      estimated_weeks: weeksPerPhase,
      milestones: p1Milestones,
      is_active: true,
      is_completed: false,
      progress_percent: 0
    },
    {
      id: "phase-2",
      phase_index: 1,
      title: "Phase 2: Core Engineering & Systems",
      subtitle: "System design, clean architecture, and MVP construction",
      objective: "Translate fundamental concepts into robust, scalable architecture with hands-on projects.",
      estimated_weeks: weeksPerPhase,
      milestones: p2Milestones,
      is_active: false,
      is_completed: false,
      progress_percent: 0
    },
    {
      id: "phase-3",
      phase_index: 2,
      title: "Phase 3: Domain Specialization & Advanced Patterns",
      subtitle: "Multi-domain synergy, high scale, and advanced tooling",
      objective: `Deepen expertise in ${domains.map(d => d.domain_name).join(" + ")} and real-world scale.`,
      estimated_weeks: weeksPerPhase,
      milestones: p3Milestones,
      is_active: false,
      is_completed: false,
      progress_percent: 0
    },
    {
      id: "phase-4",
      phase_index: 3,
      title: "Phase 4: Capstone Project & Placement Readiness",
      subtitle: "Production portfolio, ATS resume, and mock interviews",
      objective: `Achieve complete readiness for ${targetRole} interviews and career placement.`,
      estimated_weeks: weeksPerPhase,
      milestones: p4Milestones,
      is_active: false,
      is_completed: false,
      progress_percent: 0
    }
  ];

  return {
    id: `roadmap-${userId}`,
    user_id: userId,
    title: `Personalized Career Track: ${targetRole}`,
    target_role: targetRole,
    total_phases: 4,
    current_phase_index: 0,
    progress_percent: 0,
    status: "active",
    phases,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// ==============================================================================
// 3. DYNAMIC DAILY TIMETABLE GENERATOR
// ==============================================================================

export function generateDailyTimetable(
  userId: string,
  dateStr: string,
  roadmap: LearningRoadmap,
  goal: UserCareerGoal
): DailyPlanTask[] {
  const activePhase = roadmap.phases[roadmap.current_phase_index] || roadmap.phases[0];
  const pendingMilestones = activePhase?.milestones.filter(m => !m.completed) || [];
  const primaryMilestone = pendingMilestones[0] || activePhase?.milestones[0];

  const availableHours = Number(goal?.available_hours_per_day || 2);
  const preferredBlocks = goal?.preferred_schedule_blocks || ["morning", "evening"];

  const tasks: DailyPlanTask[] = [];

  // Morning Block: Deep Concept / Core Milestone
  if (preferredBlocks.includes("morning") || availableHours >= 1) {
    tasks.push({
      id: `task-${dateStr}-morning-1`,
      user_id: userId,
      plan_date: dateStr,
      title: primaryMilestone 
        ? `Core Concept: ${primaryMilestone.title}`
        : "Morning Architecture & Algorithmic Concept Review",
      time_block: "morning",
      estimated_minutes: Math.min(60, Math.round(availableHours * 30)),
      task_type: primaryMilestone?.task_type || "concept",
      status: "pending",
      domain_id: primaryMilestone?.domain_id || "swe",
      skill_id: primaryMilestone?.skill_id || "dsa",
      resource_url: primaryMilestone?.resource_url || "https://github.com/trekhleb/javascript-algorithms",
      practice_url: primaryMilestone?.practice_url || "/problems",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Afternoon / Midday Block: Interactive Practice / Coding Sprint
  if (preferredBlocks.includes("afternoon") || availableHours >= 2) {
    tasks.push({
      id: `task-${dateStr}-afternoon-1`,
      user_id: userId,
      plan_date: dateStr,
      title: "Interactive Coding Drill: Patterns & Data Structures",
      time_block: "afternoon",
      estimated_minutes: 45,
      task_type: "practice",
      status: "pending",
      domain_id: "swe",
      skill_id: "dsa",
      practice_url: "/problems",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Evening Block: Interview Drill, Aptitude Sprint, or Project Work
  if (preferredBlocks.includes("evening") || availableHours >= 1.5) {
    const isInterviewDay = new Date(dateStr).getDay() % 2 === 0;
    tasks.push({
      id: `task-${dateStr}-evening-1`,
      user_id: userId,
      plan_date: dateStr,
      title: isInterviewDay 
        ? "STAR Behavioral & Communication Drill" 
        : "Daily Placement Aptitude & Logic Sprint",
      time_block: "evening",
      estimated_minutes: 30,
      task_type: isInterviewDay ? "interview_drill" : "aptitude",
      status: "pending",
      domain_id: isInterviewDay ? "behavioral" : "aptitude",
      skill_id: isInterviewDay ? "star_technique" : "quant_math",
      practice_url: isInterviewDay ? "/interviews" : "/aptitude",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return tasks;
}

// ==============================================================================
// 4. PERFORMANCE TELEMETRY & ADAPTIVITY CALIBRATOR
// ==============================================================================

export async function calibrateUserCareerEvidence(
  userId: string,
  supabase: SupabaseClient
): Promise<{
  effectiveLevels: Record<string, { selfLevel: SkillLevel; effectiveLevel: SkillLevel; evidenceCount: number; label: string }>;
  adaptationProposals: CurriculumAdaptationProposal[];
}> {
  const [
    domainsRes,
    interviewsRes,
    resumesRes,
    problemsRes,
    projectsRes,
    accountsRes
  ] = await Promise.all([
    supabase.from("user_domains").select("*").eq("user_id", userId),
    supabase.from("interview_sessions").select("id, overall_score, clarity_score, created_at").eq("user_id", userId).limit(10),
    supabase.from("resumes").select("id, ats_score, updated_at").eq("user_id", userId).limit(5),
    supabase.from("problem_solutions").select("id, is_correct, created_at").eq("user_id", userId).limit(30),
    supabase.from("projects").select("id, title, status").eq("user_id", userId).limit(10),
    supabase.from("connected_accounts").select("provider, sync_status, metadata").eq("user_id", userId)
  ]);

  const userDomains: UserDomainItem[] = domainsRes.data || [];
  const interviews = interviewsRes.data || [];
  const resumes = resumesRes.data || [];
  const problems = problemsRes.data || [];
  const projects = projectsRes.data || [];
  const accounts = accountsRes.data || [];

  const effectiveLevels: Record<string, { selfLevel: SkillLevel; effectiveLevel: SkillLevel; evidenceCount: number; label: string }> = {};
  const adaptationProposals: CurriculumAdaptationProposal[] = [];

  userDomains.forEach(domain => {
    let evidenceCount = 0;
    let earnedPoints = 0;

    // Evaluate domain evidence
    if (domain.domain_id === "swe") {
      const correctProblems = problems.filter(p => p.is_correct).length;
      evidenceCount += correctProblems + projects.length;
      earnedPoints += correctProblems * 10 + projects.length * 25;
      
      const gh = accounts.find(a => a.provider === "github");
      if (gh) {
        evidenceCount += 5;
        earnedPoints += 30;
      }
    } else if (domain.domain_id === "behavioral") {
      const scoredInterviews = interviews.filter(i => (i.overall_score || 0) > 0);
      evidenceCount += scoredInterviews.length;
      scoredInterviews.forEach(i => earnedPoints += Number(i.overall_score || 0));
    } else if (domain.domain_id === "aptitude") {
      evidenceCount += problems.length;
      earnedPoints += problems.length * 5;
    } else {
      evidenceCount += projects.length;
      earnedPoints += projects.length * 20;
    }

    // Calibrate effective level based on verifiable evidence
    let computedLevel: SkillLevel = domain.self_level;
    let label = "Calibrated from Self-Declaration";

    if (evidenceCount >= 5) {
      if (earnedPoints >= 150) {
        computedLevel = 2; // Advanced
        label = `Advanced (${evidenceCount} verified submissions)`;
      } else if (earnedPoints >= 50) {
        computedLevel = 1; // Intermediate
        label = `Intermediate (${evidenceCount} verified drills)`;
      } else {
        computedLevel = 0; // Foundational
        label = `Foundational (${evidenceCount} items completed)`;
      }
    } else if (evidenceCount > 0) {
      label = `Calibrating (${evidenceCount} data points)`;
    } else {
      label = "Not enough evidence yet";
    }

    effectiveLevels[domain.domain_id] = {
      selfLevel: domain.self_level,
      effectiveLevel: computedLevel,
      evidenceCount,
      label
    };
  });

  // Check if user has demonstrated rapid mastery to propose acceleration
  const highScoringInterviews = interviews.filter(i => Number(i.overall_score || 0) >= 85).length;
  const correctProblemCount = problems.filter(p => p.is_correct).length;

  if (highScoringInterviews >= 3 && correctProblemCount >= 10) {
    adaptationProposals.push({
      user_id: userId,
      previous_phase_index: 0,
      new_phase_index: 1,
      change_reason: `Demonstrated high proficiency across ${correctProblemCount} verified coding challenges and ${highScoringInterviews} high-score mock interviews.`,
      triggered_by: "code_assessment",
      proposed_changes: {
        action: "accelerate_phase",
        recommended_phase: "Phase 2: Core Engineering & Systems",
        skip_redundant_foundations: true
      },
      accepted_by_user: false
    });
  }

  return { effectiveLevels, adaptationProposals };
}

// ==============================================================================
// 5. FETCH OR INITIALIZE FULL CAREER PLAN OVERVIEW
// ==============================================================================

export async function getOrInitializeCareerPlan(
  userId: string,
  supabase: SupabaseClient
): Promise<CareerPlanOverview> {
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Fetch User Domains
  let { data: domains } = await supabase
    .from("user_domains")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  // 2. Fetch User Career Goals
  let { data: goal } = await supabase
    .from("user_career_goals")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // 3. Fetch Active Learning Roadmap
  let { data: roadmap } = await supabase
    .from("learning_roadmaps")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // Default initialization if new user or no records found
  if (!domains || domains.length === 0) {
    const defaultDomains: Partial<UserDomainItem>[] = [
      {
        user_id: userId,
        domain_id: "swe",
        domain_name: "Software Engineering & Full Stack",
        priority: "primary",
        self_level: 1,
        effective_level: 1
      },
      {
        user_id: userId,
        domain_id: "ai_ml",
        domain_name: "Artificial Intelligence & Machine Learning",
        priority: "secondary",
        self_level: 1,
        effective_level: 1
      },
      {
        user_id: userId,
        domain_id: "behavioral",
        domain_name: "Leadership & Behavioral Mastery",
        priority: "supporting",
        self_level: 0,
        effective_level: 0
      }
    ];

    try {
      const { data: insertedDomains } = await supabase
        .from("user_domains")
        .upsert(defaultDomains, { onConflict: "user_id,domain_id" })
        .select("*");
      if (insertedDomains) {
        domains = insertedDomains;
      }
    } catch (err) {
      console.warn("Domain seed note:", err);
      domains = defaultDomains as UserDomainItem[];
    }
  }

  if (!goal) {
    const defaultGoal: Partial<UserCareerGoal> = {
      user_id: userId,
      target_role: "Full Stack Software Engineer",
      target_industry: "Technology & High Growth Startups",
      target_timeframe_months: 6,
      available_hours_per_day: 2,
      weekly_target_hours: 14,
      preferred_schedule_blocks: ["morning", "evening"],
      current_experience_level: "early_career"
    };

    try {
      const { data: insertedGoal } = await supabase
        .from("user_career_goals")
        .upsert(defaultGoal, { onConflict: "user_id" })
        .select("*")
        .single();
      if (insertedGoal) {
        goal = insertedGoal;
      }
    } catch (err) {
      console.warn("Goal seed note:", err);
      goal = defaultGoal as UserCareerGoal;
    }
  }

  if (!roadmap && domains && goal) {
    const generatedRoadmap = generateUnifiedRoadmap(userId, domains, goal);
    try {
      const { data: insertedRoadmap } = await supabase
        .from("learning_roadmaps")
        .insert({
          user_id: userId,
          title: generatedRoadmap.title,
          target_role: generatedRoadmap.target_role,
          total_phases: generatedRoadmap.total_phases,
          current_phase_index: generatedRoadmap.current_phase_index,
          progress_percent: generatedRoadmap.progress_percent,
          status: "active",
          phases: generatedRoadmap.phases,
          version: 1
        })
        .select("*")
        .single();
      if (insertedRoadmap) {
        roadmap = insertedRoadmap;
      }
    } catch (err) {
      console.warn("Roadmap seed note:", err);
      roadmap = generatedRoadmap;
    }
  }

  // 4. Fetch Today's Daily Timetable Tasks
  let { data: todayTasks } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_date", todayStr)
    .order("created_at", { ascending: true });

  if ((!todayTasks || todayTasks.length === 0) && roadmap && goal) {
    const generatedTasks = generateDailyTimetable(userId, todayStr, roadmap, goal);
    try {
      const { data: insertedTasks } = await supabase
        .from("daily_plans")
        .insert(generatedTasks.map(t => ({
          user_id: t.user_id,
          plan_date: t.plan_date,
          title: t.title,
          time_block: t.time_block,
          estimated_minutes: t.estimated_minutes,
          task_type: t.task_type,
          status: t.status,
          domain_id: t.domain_id,
          skill_id: t.skill_id,
          resource_url: t.resource_url,
          practice_url: t.practice_url,
          project_id: t.project_id
        })))
        .select("*");
      if (insertedTasks && insertedTasks.length > 0) {
        todayTasks = insertedTasks;
      } else {
        todayTasks = generatedTasks;
      }
    } catch (err) {
      console.warn("Daily plans seed note:", err);
      todayTasks = generatedTasks;
    }
  }

  // 5. Calibrate Evidence and Check Adaptations
  const { effectiveLevels, adaptationProposals } = await calibrateUserCareerEvidence(userId, supabase);

  return {
    domains: domains || [],
    goal: goal || null,
    roadmap: roadmap || null,
    todayTasks: todayTasks || [],
    adaptationProposals,
    effectiveLevels
  };
}

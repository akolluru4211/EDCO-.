import { SupabaseClient } from "@supabase/supabase-js";
import {
  SkillEvidenceItem,
  SkillIntelligenceItem,
  SkillIntelligenceState,
  PersonalCareerGraph,
  CareerGraphNode,
  CareerGraphEdge,
  TargetRoleProfile,
  RoleRequirementItem,
  CareerGapAnalysis,
  SkillGapItem,
  CareerReadinessOverview,
  ReadinessDimension,
  BrandingPostDraft
} from "@/lib/types/career-intelligence";
import { SkillLevel } from "@/lib/types";

// ==============================================================================
// 1. CANONICAL TARGET ROLE KNOWLEDGE REPOSITORY
// ==============================================================================

export const CANONICAL_ROLE_REQUIREMENTS: Record<string, {
  industry: string;
  requiredSkills: Array<{ id: string; name: string; category: "core_tech" | "architecture" | "tools" | "behavioral" | "domain"; importance: "must_have" | "preferred" | "bonus"; level: SkillLevel }>;
}> = {
  "Full Stack Software Engineer": {
    industry: "Technology & Web Platforms",
    requiredSkills: [
      { id: "react", name: "React & Next.js Frontend Architecture", category: "core_tech", importance: "must_have", level: 2 },
      { id: "typescript", name: "TypeScript & Static Type Safety", category: "core_tech", importance: "must_have", level: 2 },
      { id: "node_backend", name: "Node.js & REST/GraphQL API Design", category: "core_tech", importance: "must_have", level: 2 },
      { id: "postgres", name: "Relational Databases & SQL Optimization", category: "core_tech", importance: "must_have", level: 1 },
      { id: "system_design", name: "System Design & Distributed Systems", category: "architecture", importance: "preferred", level: 1 },
      { id: "cicd", name: "CI/CD & Automated Testing Pipelines", category: "tools", importance: "preferred", level: 1 },
      { id: "communication", name: "Technical Communication & STAR Structure", category: "behavioral", importance: "must_have", level: 1 }
    ]
  },
  "Backend Engineer": {
    industry: "High-Scale Distributed Systems",
    requiredSkills: [
      { id: "python_go_java", name: "Python / Go / Java Core Systems", category: "core_tech", importance: "must_have", level: 2 },
      { id: "api_design", name: "Microservices & gRPC/REST Architecture", category: "core_tech", importance: "must_have", level: 2 },
      { id: "databases", name: "PostgreSQL / Redis Caching & Indexing", category: "core_tech", importance: "must_have", level: 2 },
      { id: "system_design", name: "Distributed Concurrency & Fault Tolerance", category: "architecture", importance: "must_have", level: 2 },
      { id: "docker_k8s", name: "Docker Containers & Kubernetes Deployment", category: "tools", importance: "preferred", level: 1 },
      { id: "problem_solving", name: "Data Structures & Complex Algorithms", category: "core_tech", importance: "must_have", level: 2 }
    ]
  },
  "AI / Machine Learning Engineer": {
    industry: "Artificial Intelligence & Generative Models",
    requiredSkills: [
      { id: "python", name: "Python, NumPy & Scientific Computing", category: "core_tech", importance: "must_have", level: 2 },
      { id: "llm_rag", name: "LLM Orchestration, Embeddings & Vector DBs", category: "core_tech", importance: "must_have", level: 2 },
      { id: "pytorch", name: "PyTorch & Deep Learning Fundamentals", category: "core_tech", importance: "must_have", level: 1 },
      { id: "mlops", name: "Model Deployment & Fast API Inference", category: "architecture", importance: "preferred", level: 1 },
      { id: "evals", name: "AI Benchmarking & Model Evaluation", category: "tools", importance: "preferred", level: 1 }
    ]
  },
  "Cybersecurity Analyst / AppSec Engineer": {
    industry: "Security Operations & AppSec",
    requiredSkills: [
      { id: "owasp", name: "OWASP Top 10 & AppSec Auditing", category: "core_tech", importance: "must_have", level: 2 },
      { id: "auth_sec", name: "OAuth2, JWT & Zero-Trust Architecture", category: "core_tech", importance: "must_have", level: 2 },
      { id: "network_sec", name: "Network Defense & Traffic Forensics", category: "domain", importance: "must_have", level: 1 },
      { id: "threat_modeling", name: "STRIDE Threat Modeling & Code Auditing", category: "architecture", importance: "preferred", level: 1 }
    ]
  }
};

// ==============================================================================
// 2. CAREER GRAPH SYNTHESIS ENGINE
// ==============================================================================

export async function synthesizePersonalCareerGraph(
  userId: string,
  supabase: SupabaseClient
): Promise<PersonalCareerGraph> {
  const nodes: CareerGraphNode[] = [];
  const edges: CareerGraphEdge[] = [];

  // Root User Node
  nodes.push({
    id: `user_${userId}`,
    type: "user",
    label: "Professional Profile",
    subtitle: "Verified Career Node"
  });

  // 1. Fetch Resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, target_role, ats_score, updated_at")
    .eq("user_id", userId)
    .limit(5);

  if (resumes && resumes.length > 0) {
    resumes.forEach((r) => {
      const resumeNodeId = `resume_${r.id}`;
      nodes.push({
        id: resumeNodeId,
        type: "resume_bullet",
        label: r.title || "Target Resume",
        subtitle: `ATS Score: ${r.ats_score ?? 85}/100`,
        metadata: { atsScore: r.ats_score, targetRole: r.target_role }
      });
      edges.push({
        id: `edge_user_${resumeNodeId}`,
        source: `user_${userId}`,
        target: resumeNodeId,
        relationship: "authored",
        confidence: 1.0
      });
    });
  }

  // 2. Fetch Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, technologies, github_url, live_url")
    .eq("user_id", userId)
    .limit(10);

  if (projects && projects.length > 0) {
    projects.forEach((p) => {
      const projNodeId = `project_${p.id}`;
      nodes.push({
        id: projNodeId,
        type: "project",
        label: p.title,
        subtitle: (p.technologies || []).slice(0, 3).join(", "),
        metadata: { githubUrl: p.github_url, liveUrl: p.live_url }
      });
      edges.push({
        id: `edge_user_${projNodeId}`,
        source: `user_${userId}`,
        target: projNodeId,
        relationship: "built",
        confidence: 1.0
      });

      // Connect project technologies to skills
      (p.technologies || []).forEach((tech: string) => {
        const skillSlug = tech.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const skillNodeId = `skill_${skillSlug}`;
        if (!nodes.some((n) => n.id === skillNodeId)) {
          nodes.push({
            id: skillNodeId,
            type: "skill",
            label: tech,
            subtitle: "Demonstrated in Projects"
          });
        }
        edges.push({
          id: `edge_${projNodeId}_${skillNodeId}`,
          source: projNodeId,
          target: skillNodeId,
          relationship: "demonstrates",
          confidence: 0.9
        });
      });
    });
  }

  // 3. Fetch Skill Evidence
  const { data: evidence } = await supabase
    .from("skill_evidence")
    .select("*")
    .eq("user_id", userId)
    .limit(30);

  if (evidence && evidence.length > 0) {
    evidence.forEach((ev: any) => {
      const skillNodeId = `skill_${ev.skill_id}`;
      if (!nodes.some((n) => n.id === skillNodeId)) {
        nodes.push({
          id: skillNodeId,
          type: "skill",
          label: ev.skill_name,
          subtitle: `Verified via ${ev.source}`,
          strength: ev.strength
        });
      }
      const evNodeId = `evidence_${ev.id}`;
      nodes.push({
        id: evNodeId,
        type: ev.source === "github" ? "github_repo" : ev.source === "leetcode" ? "leetcode_problem" : "certification",
        label: ev.evidence_title,
        subtitle: `Source: ${ev.source.toUpperCase()}`,
        strength: ev.strength,
        metadata: ev.evidence_details
      });
      edges.push({
        id: `edge_${evNodeId}_${skillNodeId}`,
        source: evNodeId,
        target: skillNodeId,
        relationship: "proves",
        confidence: ev.confidence ?? 0.85
      });
    });
  }

  // 4. Fetch Interview Sessions
  const { data: interviews } = await supabase
    .from("interview_sessions")
    .select("id, role, score, target_company, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (interviews && interviews.length > 0) {
    interviews.forEach((inv) => {
      const invNodeId = `interview_${inv.id}`;
      nodes.push({
        id: invNodeId,
        type: "interview_answer",
        label: `${inv.role || "Technical"} Mock Interview`,
        subtitle: `Performance: ${inv.score ?? 80}%`,
        metadata: { score: inv.score, company: inv.target_company }
      });
      edges.push({
        id: `edge_user_${invNodeId}`,
        source: `user_${userId}`,
        target: invNodeId,
        relationship: "completed_assessment",
        confidence: 0.95
      });
    });
  }

  const totalEvidenceNodes = nodes.filter((n) => n.type !== "user").length;
  const totalSkillsVerified = nodes.filter((n) => n.type === "skill").length;
  const graphDensity = nodes.length > 1 ? Number((edges.length / (nodes.length * 1.5)).toFixed(2)) : 0;

  return {
    nodes,
    edges,
    totalEvidenceNodes,
    totalSkillsVerified,
    graphDensity
  };
}

// ==============================================================================
// 3. SKILL INTELLIGENCE ENGINE
// ==============================================================================

export async function computeSkillIntelligence(
  userId: string,
  supabase: SupabaseClient
): Promise<SkillIntelligenceItem[]> {
  // 1. Fetch User Interests / Skills
  const { data: interests } = await supabase
    .from("user_interests")
    .select("*")
    .eq("user_id", userId);

  // 2. Fetch Evidence
  const { data: evidence } = await supabase
    .from("skill_evidence")
    .select("*")
    .eq("user_id", userId);

  // 3. Fetch Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, technologies")
    .eq("user_id", userId);

  // 4. Fetch Interviews
  const { data: interviews } = await supabase
    .from("interview_sessions")
    .select("id, score, role")
    .eq("user_id", userId);

  const avgInterviewScore = interviews && interviews.length > 0
    ? Math.round(interviews.reduce((acc, i) => acc + (i.score || 70), 0) / interviews.length)
    : undefined;

  const rawSkillsMap = new Map<string, { name: string; selfLevel: SkillLevel }>();

  (interests || []).forEach((i) => {
    rawSkillsMap.set(i.id || i.name.toLowerCase().replace(/\s+/g, "_"), {
      name: i.name,
      selfLevel: i.selfLevel ?? i.self_level ?? 1
    });
  });

  // Ensure default core domains are represented if empty
  if (rawSkillsMap.size === 0) {
    rawSkillsMap.set("react", { name: "React & Next.js", selfLevel: 1 });
    rawSkillsMap.set("typescript", { name: "TypeScript", selfLevel: 1 });
    rawSkillsMap.set("python", { name: "Python & Algorithms", selfLevel: 1 });
    rawSkillsMap.set("system_design", { name: "System Design", selfLevel: 0 });
  }

  const skillItems: SkillIntelligenceItem[] = [];

  for (const [skillId, skillMeta] of Array.from(rawSkillsMap.entries())) {
    const matchingEvidence = (evidence || []).filter(
      (e) => e.skill_id === skillId || e.skill_name.toLowerCase().includes(skillMeta.name.toLowerCase())
    );

    const matchingProjects = (projects || []).filter((p) =>
      (p.technologies || []).some((t: string) => t.toLowerCase().includes(skillMeta.name.toLowerCase()))
    );

    const strongEvidenceCount = matchingEvidence.filter((e) => e.strength === "strong").length;
    const totalEvidenceCount = matchingEvidence.length + matchingProjects.length;

    let state: SkillIntelligenceState = "insufficient_evidence";
    let stateReason = "No external proof or code repositories linked yet.";
    let observedLevel: SkillLevel = 0;
    let confidenceLevel = 0.3;

    if (totalEvidenceCount >= 3 || (strongEvidenceCount >= 1 && totalEvidenceCount >= 2)) {
      state = "strong";
      stateReason = `Verified by ${matchingEvidence.length} external evidence item(s) and ${matchingProjects.length} real project(s).`;
      observedLevel = 2;
      confidenceLevel = 0.95;
    } else if (totalEvidenceCount >= 1) {
      state = "developing";
      stateReason = `Found ${totalEvidenceCount} verified source(s). Continued practice recommended to cement mastery.`;
      observedLevel = 1;
      confidenceLevel = 0.75;
    } else if (skillMeta.selfLevel > 0) {
      state = "needs_practice";
      stateReason = "Self-rated skill pending real project or interview code proof.";
      observedLevel = 0;
      confidenceLevel = 0.45;
    }

    // Adjust effectiveLevel for training
    const effectiveLevel = observedLevel >= skillMeta.selfLevel ? observedLevel : skillMeta.selfLevel;

    skillItems.push({
      skillId,
      skillName: skillMeta.name,
      state,
      stateReason,
      selfLevel: skillMeta.selfLevel,
      observedLevel,
      effectiveLevel,
      targetLevel: 2,
      confidenceLevel,
      evidenceCount: totalEvidenceCount,
      evidenceList: matchingEvidence,
      interviewScoreAvg: avgInterviewScore,
      practiceTasksCompleted: matchingEvidence.length * 2,
      projectCount: matchingProjects.length,
      lastVerifiedAt: matchingEvidence[0]?.last_verified_at || new Date().toISOString()
    });
  }

  return skillItems;
}

// ==============================================================================
// 4. CAREER GAP ANALYSIS & TARGET ROLE ENGINE
// ==============================================================================

export async function computeCareerGapAnalysis(
  userId: string,
  targetRoleTitle: string = "Full Stack Software Engineer",
  supabase: SupabaseClient
): Promise<CareerGapAnalysis> {
  const roleConfig = CANONICAL_ROLE_REQUIREMENTS[targetRoleTitle] || CANONICAL_ROLE_REQUIREMENTS["Full Stack Software Engineer"];
  const skillIntelligence = await computeSkillIntelligence(userId, supabase);

  const skillGaps: SkillGapItem[] = [];
  let strongCount = 0;
  let developingCount = 0;
  let gapCount = 0;
  let insufficientCount = 0;

  roleConfig.requiredSkills.forEach((req) => {
    const matchedSkill = skillIntelligence.find(
      (s) => s.skillId === req.id || s.skillName.toLowerCase().includes(req.name.toLowerCase().split(" ")[0])
    );

    const currentState: SkillIntelligenceState = matchedSkill ? matchedSkill.state : "insufficient_evidence";
    const observedLevel: SkillLevel = matchedSkill ? matchedSkill.observedLevel : 0;

    if (currentState === "strong") strongCount++;
    else if (currentState === "developing") developingCount++;
    else if (currentState === "needs_practice") gapCount++;
    else insufficientCount++;

    let gapReason = "Verified competency aligns with target role requirements.";
    let recommendedAction = "Maintain freshness with weekly drills.";
    let suggestedProjectIdea: string | undefined;
    let suggestedInterviewTopic = `Mock questions on ${req.name}`;
    let suggestedPracticeTopic = `${req.name} architecture practice`;

    if (currentState === "insufficient_evidence") {
      gapReason = `Role requires level ${req.level} proficiency, but zero code repositories or test evidence are linked.`;
      recommendedAction = `Build a proof project demonstrating ${req.name} and link GitHub repository.`;
      suggestedProjectIdea = `Build a focused micro-service highlighting ${req.name}.`;
    } else if (currentState === "needs_practice" || observedLevel < req.level) {
      gapReason = `Current evidence indicates level ${observedLevel}, while target role seeks level ${req.level}.`;
      recommendedAction = `Run 2 mock interview sessions targeting ${req.name} fundamentals.`;
      suggestedProjectIdea = `Implement advanced caching or indexing in your existing projects.`;
    }

    skillGaps.push({
      skillId: req.id,
      skillName: req.name,
      importance: req.importance,
      currentState,
      targetLevel: req.level,
      observedLevel,
      gapReason,
      recommendedAction,
      suggestedProjectIdea,
      suggestedInterviewTopic,
      suggestedPracticeTopic
    });
  });

  const topPriorityActions = [
    {
      title: "Build High-Signal Project Evidence",
      description: "Link GitHub repositories or deploy a live demo for your primary tech stack.",
      actionType: "project" as const,
      href: "/projects"
    },
    {
      title: "Practice Targeted Technical Interview Drills",
      description: "Complete a voice or video simulation with live STAR and technical feedback.",
      actionType: "interview" as const,
      href: "/interviews"
    },
    {
      title: "Align ATS Resume Bullets with Target Role",
      description: "Tailor your resume bullets to highlight quantified project outcomes.",
      actionType: "resume" as const,
      href: "/resumes"
    }
  ];

  return {
    targetRoleTitle,
    strongSkillsCount: strongCount,
    developingSkillsCount: developingCount,
    gapsCount: gapCount,
    insufficientEvidenceCount: insufficientCount,
    skillGaps,
    topPriorityActions
  };
}

// ==============================================================================
// 5. MULTIDIMENSIONAL CAREER READINESS
// ==============================================================================

export async function computeMultidimensionalReadiness(
  userId: string,
  targetRoleTitle: string = "Full Stack Software Engineer",
  supabase: SupabaseClient
): Promise<CareerReadinessOverview> {
  const [graph, gapAnalysis] = await Promise.all([
    synthesizePersonalCareerGraph(userId, supabase),
    computeCareerGapAnalysis(userId, targetRoleTitle, supabase)
  ]);

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const { data: applications } = await supabase.from("job_applications_pipeline").select("*").eq("user_id", userId);

  const dimensions: ReadinessDimension[] = [
    {
      key: "skills",
      title: "Core Technical Skills",
      status: gapAnalysis.strongSkillsCount >= 3 ? "verified_strong" : gapAnalysis.developingSkillsCount >= 2 ? "progressing" : "needs_attention",
      statusExplanation: `${gapAnalysis.strongSkillsCount} skills fully verified, ${gapAnalysis.developingSkillsCount} in active development.`,
      evidenceItems: gapAnalysis.skillGaps.filter(g => g.currentState === "strong").map(g => g.skillName),
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "View Skill Gaps", href: "/career/skills-gap" }
    },
    {
      key: "evidence",
      title: "Verifiable Evidence Base",
      status: graph.totalEvidenceNodes >= 4 ? "verified_strong" : graph.totalEvidenceNodes >= 1 ? "progressing" : "insufficient_data",
      statusExplanation: `${graph.totalEvidenceNodes} verified evidence connections in your Career Graph.`,
      evidenceItems: [`${graph.totalSkillsVerified} skills mapped across ${graph.edges.length} connections`],
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Manage Evidence", href: "/career/evidence" }
    },
    {
      key: "resume",
      title: "ATS Resume Strength",
      status: graph.nodes.some(n => n.type === "resume_bullet") ? "verified_strong" : "needs_attention",
      statusExplanation: graph.nodes.some(n => n.type === "resume_bullet") 
        ? "Active tailored resume created with verified bullet points." 
        : "No active ATS resume tailored to your target role yet.",
      evidenceItems: graph.nodes.filter(n => n.type === "resume_bullet").map(n => n.label),
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Tailor Resume", href: "/resumes" }
    },
    {
      key: "projects",
      title: "Portfolio & Project Depth",
      status: graph.nodes.some(n => n.type === "project") ? "verified_strong" : "needs_attention",
      statusExplanation: `${graph.nodes.filter(n => n.type === "project").length} projects linked with architectural technologies.`,
      evidenceItems: graph.nodes.filter(n => n.type === "project").map(n => n.label),
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Add Project", href: "/projects" }
    },
    {
      key: "interview",
      title: "Mock Interview Performance",
      status: graph.nodes.some(n => n.type === "interview_answer") ? "progressing" : "needs_attention",
      statusExplanation: graph.nodes.some(n => n.type === "interview_answer")
        ? "Completed simulations with communication and STAR metrics."
        : "Zero completed interview simulations recorded.",
      evidenceItems: graph.nodes.filter(n => n.type === "interview_answer").map(n => n.label),
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Start Simulation", href: "/interviews" }
    },
    {
      key: "presence",
      title: "Professional Presence",
      status: profile?.linkedin_url || profile?.github_url ? "verified_strong" : "progressing",
      statusExplanation: profile?.linkedin_url ? "LinkedIn profile linked and public presence active." : "Add professional social links to boost recruiter signal.",
      evidenceItems: [profile?.github_url ? "GitHub connected" : "GitHub pending", profile?.linkedin_url ? "LinkedIn connected" : "LinkedIn pending"],
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Branding Assistant", href: "/career/branding" }
    },
    {
      key: "applications",
      title: "Active Job Pipeline",
      status: (applications || []).length > 0 ? "progressing" : "insufficient_data",
      statusExplanation: `${(applications || []).length} active application(s) tracked in your pipeline.`,
      evidenceItems: (applications || []).map(a => `${a.company_name} (${a.status})`),
      lastUpdated: new Date().toISOString(),
      recommendedNextAction: { label: "Application Center", href: "/career/applications" }
    }
  ];

  const overallHealth = gapAnalysis.strongSkillsCount >= 3 && graph.totalEvidenceNodes >= 3 
    ? "on_track" 
    : graph.totalEvidenceNodes >= 1 ? "building_momentum" : "needs_focus";

  const summaryNarrative = overallHealth === "on_track"
    ? `Your profile demonstrates solid, multi-source evidence for ${targetRoleTitle}. Continue focusing on high-signal interview practice and targeted applications.`
    : `You are building valuable momentum toward ${targetRoleTitle}. Focus on publishing project code to GitHub and running mock interview simulations to convert unverified skills into strong evidence.`;

  return {
    targetRole: targetRoleTitle,
    overallHealth,
    dimensions,
    summaryNarrative
  };
}

// ==============================================================================
// 6. PERSONAL BRANDING ENGINE (EVIDENCE-GROUNDED POST GENERATOR)
// ==============================================================================

export async function generateEvidenceBasedBrandingPosts(
  userId: string,
  supabase: SupabaseClient
): Promise<BrandingPostDraft[]> {
  const [projectsRes, interviewsRes, milestonesRes] = await Promise.all([
    supabase.from("projects").select("title, description, technologies, github_url").eq("user_id", userId).limit(3),
    supabase.from("interview_sessions").select("role, score, created_at").eq("user_id", userId).order("score", { ascending: false }).limit(2),
    supabase.from("career_milestones").select("title, description, category").eq("user_id", userId).limit(3)
  ]);

  const projects = projectsRes.data || [];
  const interviews = interviewsRes.data || [];
  const milestones = milestonesRes.data || [];

  const drafts: BrandingPostDraft[] = [];

  if (projects.length > 0) {
    const topProj = projects[0];
    const techStr = (topProj.technologies || []).join(", ");
    drafts.push({
      id: "post_proj_1",
      title: `Project Launch: ${topProj.title}`,
      category: "project_launch",
      content: `🚀 Excited to share what I've been building: ${topProj.title}!\n\n${topProj.description || "A scalable, production-ready application."}\n\n💡 Key Tech Stack: ${techStr || "Next.js, TypeScript, PostgreSQL"}\n🛠️ Architecture Highlights: Clean separation of concerns, robust API design, and automated testing.\n\nCheck out the code here: ${topProj.github_url || "[GitHub Repository Link]"}\n\nFeedback and thoughts are always welcome! 👇`,
      basedOnEvidence: [`Project: ${topProj.title}`, `Technologies: ${techStr}`],
      suggestedHashtags: ["#FullStack", "#WebDevelopment", "#SoftwareEngineering", "#BuildInPublic", "#Coding"],
      createdAt: new Date().toISOString()
    });
  }

  if (interviews.length > 0) {
    const topInv = interviews[0];
    drafts.push({
      id: "post_intel_1",
      title: `Technical Reflections: ${topInv.role || "Software Engineering"} Prep`,
      category: "technical_insight",
      content: `🧠 Key takeaway from my recent deep dive into ${topInv.role || "System Design & Algorithms"}:\n\nCommunicating the trade-offs is just as critical as writing the algorithm. Structuring responses using the STAR method helped articulate technical decisions under pressure.\n\nWhat is your favorite framework for breaking down complex technical interviews?`,
      basedOnEvidence: [`Mock Simulation: ${topInv.role} (${topInv.score ?? 80}%)`],
      suggestedHashtags: ["#CareerGrowth", "#TechInterviews", "#SystemDesign", "#ContinuousLearning"],
      createdAt: new Date().toISOString()
    });
  }

  if (milestones.length > 0) {
    const milestone = milestones[0];
    drafts.push({
      id: "post_mile_1",
      title: `Milestone Achieved: ${milestone.title}`,
      category: "milestone_share",
      content: `🎉 Milestone unlocked: ${milestone.title}!\n\n${milestone.description}\n\nEvery step in this journey compounds. On to the next chapter of building and shipping!`,
      basedOnEvidence: [`Milestone: ${milestone.title}`],
      suggestedHashtags: ["#Milestone", "#CareerJourney", "#Consistency", "#EdWorldCo"],
      createdAt: new Date().toISOString()
    });
  }

  // Fallback template if minimal evidence exists
  if (drafts.length === 0) {
    drafts.push({
      id: "post_init_1",
      title: "Building in Public: Engineering Journey",
      category: "career_update",
      content: `💡 Committing to continuous growth in software engineering!\n\nCurrently sharpening my skills in full-stack architecture, clean code principles, and scalable system design.\n\nExcited to share upcoming projects and technical write-ups soon. Stay tuned!`,
      basedOnEvidence: ["Profile Initiation"],
      suggestedHashtags: ["#SoftwareEngineering", "#CodingJourney", "#GrowthMindset"],
      createdAt: new Date().toISOString()
    });
  }

  return drafts;
}

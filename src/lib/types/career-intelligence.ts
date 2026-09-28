import { SkillLevel } from "../types";

// ==============================================================================
// 1. EVIDENCE ENGINE 2.0 TYPES
// ==============================================================================

export type EvidenceSource = 
  | "github" 
  | "leetcode" 
  | "linkedin" 
  | "resume" 
  | "project" 
  | "interview" 
  | "certification" 
  | "user";

export type EvidenceStrength = "strong" | "moderate" | "supporting";

export interface SkillEvidenceItem {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  source: EvidenceSource;
  sourceId?: string;
  evidenceTitle: string;
  evidenceDetails: Record<string, any>;
  confidence: number; // 0.0 - 1.0
  strength: EvidenceStrength;
  userVisibility: boolean;
  lastVerifiedAt: string;
  createdAt: string;
}

export type SkillIntelligenceState = 
  | "strong" 
  | "developing" 
  | "needs_practice" 
  | "insufficient_evidence";

export interface SkillIntelligenceItem {
  skillId: string;
  skillName: string;
  state: SkillIntelligenceState;
  stateReason: string;
  selfLevel: SkillLevel;
  observedLevel: SkillLevel;
  effectiveLevel: SkillLevel;
  targetLevel: SkillLevel;
  confidenceLevel: number; // 0.0 - 1.0
  evidenceCount: number;
  evidenceList: SkillEvidenceItem[];
  recentActivity?: string;
  interviewScoreAvg?: number;
  practiceTasksCompleted: number;
  projectCount: number;
  lastVerifiedAt?: string;
}

// ==============================================================================
// 2. PERSONAL CAREER GRAPH
// ==============================================================================

export type CareerGraphNodeType = 
  | "user"
  | "skill"
  | "project"
  | "github_repo"
  | "resume_bullet"
  | "job"
  | "interview_question"
  | "interview_answer"
  | "leetcode_problem"
  | "certification"
  | "target_role";

export interface CareerGraphNode {
  id: string;
  type: CareerGraphNodeType;
  label: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  strength?: EvidenceStrength;
}

export interface CareerGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string; // e.g., 'demonstrates', 'references', 'tested_by', 'required_for', 'implemented_in'
  confidence: number;
}

export interface PersonalCareerGraph {
  nodes: CareerGraphNode[];
  edges: CareerGraphEdge[];
  totalEvidenceNodes: number;
  totalSkillsVerified: number;
  graphDensity: number;
}

// ==============================================================================
// 3. TARGET ROLE & CAREER GAP ANALYSIS
// ==============================================================================

export interface RoleRequirementItem {
  id: string;
  skillId: string;
  skillName: string;
  category: "core_tech" | "architecture" | "tools" | "behavioral" | "domain";
  importance: "must_have" | "preferred" | "bonus";
  requiredLevel: SkillLevel;
  matchingEvidenceCount: number;
  currentSkillState: SkillIntelligenceState;
}

export interface TargetRoleProfile {
  id: string;
  userId: string;
  roleTitle: string;
  industry: string;
  targetCompanies: string[];
  experienceLevel: string;
  requiredSkills: RoleRequirementItem[];
  preferredSkills: RoleRequirementItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  importance: "must_have" | "preferred" | "bonus";
  currentState: SkillIntelligenceState;
  targetLevel: SkillLevel;
  observedLevel: SkillLevel;
  gapReason: string;
  recommendedAction: string;
  suggestedProjectIdea?: string;
  suggestedInterviewTopic?: string;
  suggestedPracticeTopic?: string;
}

export interface CareerGapAnalysis {
  targetRoleTitle: string;
  strongSkillsCount: number;
  developingSkillsCount: number;
  gapsCount: number;
  insufficientEvidenceCount: number;
  skillGaps: SkillGapItem[];
  topPriorityActions: Array<{
    title: string;
    description: string;
    actionType: "project" | "interview" | "coding" | "resume";
    href: string;
  }>;
}

// ==============================================================================
// 4. MULTIDIMENSIONAL CAREER READINESS
// ==============================================================================

export type ReadinessDimensionKey = 
  | "skills" 
  | "evidence" 
  | "resume" 
  | "projects" 
  | "interview" 
  | "coding" 
  | "presence" 
  | "applications" 
  | "networking";

export interface ReadinessDimension {
  key: ReadinessDimensionKey;
  title: string;
  status: "verified_strong" | "progressing" | "needs_attention" | "insufficient_data";
  statusExplanation: string;
  evidenceItems: string[];
  lastUpdated: string;
  recommendedNextAction: {
    label: string;
    href: string;
  };
}

export interface CareerReadinessOverview {
  targetRole: string;
  overallHealth: "on_track" | "building_momentum" | "needs_focus";
  dimensions: ReadinessDimension[];
  summaryNarrative: string;
}

// ==============================================================================
// 5. APPLICATION COMMAND CENTER
// ==============================================================================

export type ApplicationStage = 
  | "saved" 
  | "applied" 
  | "viewed" 
  | "interview" 
  | "offer" 
  | "rejected" 
  | "withdrawn";

export interface JobApplicationItem {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobLocation?: string;
  salaryRange?: string;
  jobUrl?: string;
  source: string;
  status: ApplicationStage;
  appliedAt?: string;
  resumeId?: string;
  notes?: string;
  interviewPrepNotes?: string;
  nextActionDate?: string;
  nextActionLabel?: string;
  matchingEvidenceCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 6. CAREER MILESTONES & TIMELINE
// ==============================================================================

export interface CareerMilestoneItem {
  id: string;
  userId: string;
  milestoneKey: string;
  title: string;
  description: string;
  category: "resume" | "project" | "interview" | "github" | "application" | "milestone" | "branding";
  achievedAt: string;
  evidenceRef?: Record<string, any>;
}

// ==============================================================================
// 7. CAREER COPILOT & PERSONAL BRANDING
// ==============================================================================

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  evidenceCitations?: Array<{
    title: string;
    source: string;
    url?: string;
  }>;
  actionShortcuts?: Array<{
    label: string;
    actionType: string;
    href: string;
  }>;
  createdAt: string;
}

export interface BrandingPostDraft {
  id: string;
  title: string;
  category: "project_launch" | "technical_insight" | "milestone_share" | "career_update";
  content: string;
  basedOnEvidence: string[];
  suggestedHashtags: string[];
  createdAt: string;
}

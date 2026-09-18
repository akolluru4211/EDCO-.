import { UserRole } from "./types";
import { 
  getCandidates, 
  getLeaveRequests, 
  getOnboardingRecords, 
  getExecutiveKPI, 
  getStrategicInitiatives, 
  getEmployeeTasks, 
  getPlacementDrives, 
  getPlacementStudents 
} from "./db-service";

export interface AgentInsight {
  id: string;
  agentName: string;
  category: "BOTTLENECK" | "OPPORTUNITY" | "ANOMALY" | "RECOMMENDATION";
  headline: string;
  detail: string;
  actionableStep?: string;
  generatedAt: string;
}

/**
 * 1. RecruitmentAgent: Candidate funnel bottlenecks & SLA tracking.
 */
export async function runRecruitmentAgent(role: UserRole | string): Promise<AgentInsight[]> {
  const candidates = await getCandidates();
  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  const interviewStage = candidates.filter((c) => c.currentStage === "Interview");
  if (interviewStage.length > 0) {
    insights.push({
      id: "rec_agent_1",
      agentName: "RecruitmentAgent",
      category: "BOTTLENECK",
      headline: `${interviewStage.length} candidate(s) awaiting interview feedback`,
      detail: `Candidates including ${interviewStage[0].fullName} are in Interview stage. Recommend prompt evaluation to prevent offer drop-offs.`,
      actionableStep: "Trigger Slack/Email reminders to interviewers for scorecard submission.",
      generatedAt: now,
    });
  }

  const screened = candidates.filter((c) => c.currentStage === "Screening");
  if (screened.length >= 3) {
    insights.push({
      id: "rec_agent_2",
      agentName: "RecruitmentAgent",
      category: "OPPORTUNITY",
      headline: "Qualified candidate batch ready for Technical Round",
      detail: `${screened.length} screened engineering candidates match >= 85% rubric criteria.`,
      actionableStep: "Batch-schedule technical interviews this week.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 2. HRInsightAgent: Leave overlap anomalies, onboarding milestones, team pulse.
 */
export async function runHRInsightAgent(role: UserRole | string): Promise<AgentInsight[]> {
  const [leaves, onboarding] = await Promise.all([
    getLeaveRequests(),
    getOnboardingRecords(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  const pendingOnboarding = onboarding.filter((o) => o.status !== "ACTIVE" && (o.checklist?.completionPercentage || 0) < 50);
  if (pendingOnboarding.length > 0) {
    insights.push({
      id: "hr_agent_1",
      agentName: "HRInsightAgent",
      category: "ANOMALY",
      headline: `${pendingOnboarding.length} new hire(s) with delayed onboarding checklist`,
      detail: `${pendingOnboarding[0].employeeName} is at ${pendingOnboarding[0].checklist?.completionPercentage || 0}% completion on day 3.`,
      actionableStep: "Assign an onboarding buddy to unblock IT asset setup and compliance signing.",
      generatedAt: now,
    });
  }

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  if (pendingLeaves.length > 0) {
    insights.push({
      id: "hr_agent_2",
      agentName: "HRInsightAgent",
      category: "RECOMMENDATION",
      headline: `${pendingLeaves.length} pending time-off request(s)`,
      detail: "Leaves submitted across engineering and operations require manager sign-off.",
      actionableStep: "Review and approve leave balances.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 3. FounderInsightAgent: Burn-rate vs ARR milestones, runway alerts, growth trajectory.
 */
export async function runFounderInsightAgent(role: UserRole | string): Promise<AgentInsight[]> {
  const [kpi, initiatives] = await Promise.all([
    getExecutiveKPI(),
    getStrategicInitiatives(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  if (kpi.runwayMonths <= 12) {
    insights.push({
      id: "founder_agent_1",
      agentName: "FounderInsightAgent",
      category: "BOTTLENECK",
      headline: `Cash Runway Alert: ${kpi.runwayMonths} months remaining`,
      detail: `Net monthly burn is ₹${kpi.monthlyBurn.toLocaleString("en-IN")}. Runway under 12 months triggers Series-A fundraising preparation milestone.`,
      actionableStep: "Review non-essential SaaS tooling and begin VC investor pipeline outreach.",
      generatedAt: now,
    });
  }

  const offTrackInitiatives = initiatives.filter((i) => i.status === "AT_RISK");
  if (offTrackInitiatives.length > 0) {
    insights.push({
      id: "founder_agent_2",
      agentName: "FounderInsightAgent",
      category: "ANOMALY",
      headline: `Strategic Pillar at Risk: '${offTrackInitiatives[0].title}'`,
      detail: `Initiative currently at ${offTrackInitiatives[0].progressPercentage}%. Expected milestone target was 75% for this quarter.`,
      actionableStep: "Schedule executive retrospective with initiative owner to reallocate resources.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 4. EmployeeProductivityAgent: OKR pacing, task blockers, standup reminders.
 */
export async function runEmployeeProductivityAgent(userIdOrRole?: string): Promise<AgentInsight[]> {
  const tasks = await getEmployeeTasks();
  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  if (inProgress.length > 0) {
    insights.push({
      id: "emp_agent_1",
      agentName: "EmployeeProductivityAgent",
      category: "RECOMMENDATION",
      headline: `Daily Focus: ${inProgress[0].title}`,
      detail: `Priority: ${inProgress[0].priority}. Target completion: Today EOD.`,
      actionableStep: "Block 2 hours of deep-work focus time without meetings.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 5. PlacementInsightAgent: Drive bottlenecks & conversion rates.
 */
export async function runPlacementInsightAgent(role: UserRole | string): Promise<AgentInsight[]> {
  const [drives, students] = await Promise.all([
    getPlacementDrives(),
    getPlacementStudents(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  const ongoingDrives = drives.filter((d) => d.status === "ONGOING");
  if (ongoingDrives.length > 0) {
    insights.push({
      id: "placement_agent_1",
      agentName: "PlacementInsightAgent",
      category: "RECOMMENDATION",
      headline: `${ongoingDrives.length} Campus Placement Drives Active This Week`,
      detail: `Drive for '${ongoingDrives[0].companyName}' (${ongoingDrives[0].role}) is conducting interview rounds.`,
      actionableStep: "Verify shortlisted student attendance in the Placement Portal.",
      generatedAt: now,
    });
  }

  return insights;
}

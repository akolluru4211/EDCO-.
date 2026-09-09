import { UserRole } from "./types";
import { getCandidates, getLeaveRequests, getOnboardingRecords, getExecutiveKPI, getStrategicInitiatives, getEmployeeTasks, getTeacherClasses, getStudentsByClass, getPlacementDrives, getPlacementStudents } from "./db-service";

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
 * 1. HRInsightAgent: Analyzes recruitment, onboarding, and leave bottlenecks.
 */
export async function runHRInsightAgent(role: UserRole): Promise<AgentInsight[]> {
  if (role !== "HR" && role !== "FOUNDER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: HRInsightAgent requires HR or Executive privileges.");
  }

  const [candidates, onboardings, leaves] = await Promise.all([
    getCandidates(),
    getOnboardingRecords(),
    getLeaveRequests(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  // Check pending onboardings
  const incompleteOnboarding = onboardings.filter((o) => o.checklist.completionPercentage < 100);
  if (incompleteOnboarding.length > 0) {
    insights.push({
      id: "hr_agent_1",
      agentName: "HRInsightAgent",
      category: "BOTTLENECK",
      headline: `${incompleteOnboarding.length} Onboarding Trackers Awaiting Step Completion`,
      detail: `Staff members like ${incompleteOnboarding.map((o) => o.employeeName).slice(0, 2).join(", ")} are missing hardware or account setup confirmation.`,
      actionableStep: "Open HR Onboarding checklist to mark hardware/credentials as verified.",
      generatedAt: now,
    });
  }

  // Check pending leaves
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  if (pendingLeaves.length > 0) {
    insights.push({
      id: "hr_agent_2",
      agentName: "HRInsightAgent",
      category: "RECOMMENDATION",
      headline: `${pendingLeaves.length} Unresolved Leave Requests in Queue`,
      detail: `Staff members have submitted time-off requests spanning ${pendingLeaves.reduce((acc, l) => acc + l.daysCount, 0)} days.`,
      actionableStep: "Review and approve/reject pending leaves to prevent payroll batch discrepancies.",
      generatedAt: now,
    });
  }

  // Pipeline summary
  const inInterview = candidates.filter((c) => c.currentStage === "Interview");
  if (inInterview.length > 0) {
    insights.push({
      id: "hr_agent_3",
      agentName: "HRInsightAgent",
      category: "OPPORTUNITY",
      headline: `${inInterview.length} Candidates Active in Technical Interview Stage`,
      detail: `Fast turnaround time on feedback reduces offer drop-off by up to 34%.`,
      actionableStep: "Prompt hiring managers to submit structured scorecards.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 2. FounderInsightAgent: Strategic KPI, burn rate, and initiative health analysis.
 */
export async function runFounderInsightAgent(role: UserRole): Promise<AgentInsight[]> {
  if (role !== "FOUNDER" && role !== "EXECUTIVE" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: FounderInsightAgent requires Founder/Executive access.");
  }

  const [kpis, initiatives] = await Promise.all([
    getExecutiveKPI(),
    getStrategicInitiatives(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  // Runway health
  if (kpis.runwayMonths < 12) {
    insights.push({
      id: "founder_agent_1",
      agentName: "FounderInsightAgent",
      category: "BOTTLENECK",
      headline: `Cash Runway Warning: Estimated at ${kpis.runwayMonths} Months`,
      detail: `Monthly net burn is ₹${kpis.monthlyBurn.toLocaleString()} against ₹${kpis.cashPosition.toLocaleString()} cash reserves.`,
      actionableStep: "Accelerate institutional contracts or prepare investor memo.",
      generatedAt: now,
    });
  } else {
    insights.push({
      id: "founder_agent_1",
      agentName: "FounderInsightAgent",
      category: "OPPORTUNITY",
      headline: `Strong Financial Runway: ${kpis.runwayMonths} Months of Buffer`,
      detail: `Current MRR of ₹${kpis.mrr.toLocaleString()} sustains operations with positive operating leverage.`,
      actionableStep: "Explore expansion into tier-1 college placement partnerships.",
      generatedAt: now,
    });
  }

  // Strategic initiative progress
  const atRisk = initiatives.filter((i) => i.status === "AT_RISK");
  if (atRisk.length > 0) {
    insights.push({
      id: "founder_agent_2",
      agentName: "FounderInsightAgent",
      category: "ANOMALY",
      headline: `${atRisk.length} Strategic Initiatives Flagged as AT_RISK`,
      detail: `Initiatives like '${atRisk[0].title}' require executive unblocking on budget or cross-functional resources.`,
      actionableStep: "Schedule a sync with the initiative owner.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 3. RecruitmentAgent: Candidate profiling and interview scheduling assistance.
 */
export async function runRecruitmentAgent(role: UserRole): Promise<AgentInsight[]> {
  if (role !== "HR" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: RecruitmentAgent is restricted to HR.");
  }

  const candidates = await getCandidates();
  const applied = candidates.filter((c) => c.currentStage === "Applied");
  const now = new Date().toISOString();

  const insights: AgentInsight[] = [];
  if (applied.length > 0) {
    insights.push({
      id: "rec_agent_1",
      agentName: "RecruitmentAgent",
      category: "RECOMMENDATION",
      headline: `${applied.length} New Inbound Applications Pending Screening`,
      detail: `Screening inbound resumes within 48 hours maximizes candidate engagement.`,
      actionableStep: "Batch review applications and move qualified talent to Screening.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 4. EmployeeProductivityAgent: Daily check-in prep, overdue task radar, OKR pacing.
 */
export async function runEmployeeProductivityAgent(employeeId: string): Promise<AgentInsight[]> {
  const tasks = await getEmployeeTasks(employeeId);
  const now = new Date().toISOString();
  const insights: AgentInsight[] = [];

  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const blocked = tasks.filter((t) => t.status === "BLOCKED");

  if (blocked.length > 0) {
    insights.push({
      id: "prod_agent_1",
      agentName: "EmployeeProductivityAgent",
      category: "BOTTLENECK",
      headline: `${blocked.length} Active Task(s) Marked as Blocked`,
      detail: `Task '${blocked[0].title}' is waiting on cross-team dependencies.`,
      actionableStep: "Log the specific blocker in your Daily Check-In to notify your manager.",
      generatedAt: now,
    });
  }

  if (inProgress.length > 0) {
    insights.push({
      id: "prod_agent_2",
      agentName: "EmployeeProductivityAgent",
      category: "RECOMMENDATION",
      headline: `Focus Priority: ${inProgress.length} Tasks In Progress`,
      detail: `Complete current work-in-progress before taking on new backlog items.`,
      actionableStep: "Update status to IN_REVIEW once deliverables are ready for feedback.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 5. SchoolOperationsAgent: Attendance radar anomalies & missing grades.
 */
export async function runSchoolOperationsAgent(role: UserRole): Promise<AgentInsight[]> {
  if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: SchoolOperationsAgent is restricted to Teachers.");
  }

  const [classes, students] = await Promise.all([
    getTeacherClasses(),
    getStudentsByClass(),
  ]);

  const insights: AgentInsight[] = [];
  const now = new Date().toISOString();

  const lowAttendance = students.filter((s) => s.attendancePercentage < 80);
  if (lowAttendance.length > 0) {
    insights.push({
      id: "school_agent_1",
      agentName: "SchoolOperationsAgent",
      category: "ANOMALY",
      headline: `${lowAttendance.length} Students Below 80% Attendance Threshold`,
      detail: `Students like ${lowAttendance.map((s) => s.name).slice(0, 2).join(", ")} show irregular attendance trends.`,
      actionableStep: "Send an automated attendance digest via Parent Communication.",
      generatedAt: now,
    });
  }

  return insights;
}

/**
 * 6. PlacementInsightAgent: Drive bottlenecks & conversion rates.
 */
export async function runPlacementInsightAgent(role: UserRole): Promise<AgentInsight[]> {
  if (role !== "COLLEGE_ADMIN" && role !== "PLACEMENT_OFFICER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: PlacementInsightAgent is restricted to College Officers.");
  }

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
      actionableStep: "Verify shortlisted student attendance in the Auditorium/Virtual room.",
      generatedAt: now,
    });
  }

  return insights;
}

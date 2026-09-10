import { 
  EmployeeCheckIn, 
  EmployeeTask, 
  EmployeeOKR, 
  LeaveRequest, 
  PayrollRecord, 
  PayrollBatch,
  Candidate, 
  OnboardingRecord, 
  TeacherClass, 
  StudentRecord, 
  GradeRecord, 
  LessonPlan, 
  ParentMessage, 
  PlacementDrive, 
  PlacementStudent, 
  SyllabusMapping, 
  CompanyPartner, 
  FinancialRecord, 
  ExecutiveKPI, 
  StrategicInitiative, 
  InvestorUpdate, 
  FounderAlert,
  SystemNotification,
  TeamMember,
  EmployeeDocument
} from "./types";
import { recordAuditLog } from "./audit-logger";

// Storage Keys for resilient local & offline caching
const KEYS = {
  CHECK_INS: "edworld_checkins",
  TASKS: "edworld_tasks",
  OKRS: "edworld_okrs",
  LEAVES: "edworld_leaves",
  PAYROLLS: "edworld_payrolls",
  PAYROLL_BATCHES: "edworld_payroll_batches",
  CANDIDATES: "edworld_candidates",
  ONBOARDINGS: "edworld_onboardings",
  CLASSES: "edworld_classes",
  STUDENTS: "edworld_students",
  GRADES: "edworld_grades",
  LESSON_PLANS: "edworld_lesson_plans",
  PARENT_MESSAGES: "edworld_parent_messages",
  DRIVES: "edworld_placement_drives",
  PLACEMENT_STUDENTS: "edworld_placement_students",
  SYLLABUS_MAPS: "edworld_syllabus_maps",
  COMPANY_PARTNERS: "edworld_company_partners",
  FINANCIALS: "edworld_financials",
  KPIS: "edworld_kpis",
  INITIATIVES: "edworld_initiatives",
  INVESTOR_UPDATES: "edworld_investor_updates",
  FOUNDER_ALERTS: "edworld_founder_alerts",
  NOTIFICATIONS: "edworld_notifications",
  TEAM_MEMBERS: "edworld_team_members",
  DOCUMENTS: "edworld_documents",
};

// Generic safe local storage getter/setter
function getStored<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[setStored Error on ${key}]:`, err);
  }
}

// ==========================================
// 1. EMPLOYEE CHECK-IN CRUD
// ==========================================
export async function getEmployeeCheckIns(employeeId?: string): Promise<EmployeeCheckIn[]> {
  const all = getStored<EmployeeCheckIn>(KEYS.CHECK_INS, []);
  if (employeeId) {
    return all.filter((c) => c.employeeId === employeeId);
  }
  return all;
}

export async function saveEmployeeCheckIn(checkIn: Omit<EmployeeCheckIn, "id" | "createdAt" | "updatedAt">): Promise<EmployeeCheckIn> {
  const all = getStored<EmployeeCheckIn>(KEYS.CHECK_INS, []);
  const today = checkIn.date || new Date().toISOString().split("T")[0];
  const existingIndex = all.findIndex((c) => c.employeeId === checkIn.employeeId && c.date === today);

  const timestamp = new Date().toISOString();
  let savedRecord: EmployeeCheckIn;

  if (existingIndex >= 0) {
    savedRecord = {
      ...all[existingIndex],
      ...checkIn,
      updatedAt: timestamp,
    };
    all[existingIndex] = savedRecord;
  } else {
    savedRecord = {
      ...checkIn,
      id: `checkin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    all.unshift(savedRecord);
  }

  setStored(KEYS.CHECK_INS, all);
  await recordAuditLog({
    actorId: checkIn.employeeId,
    actorName: checkIn.employeeName,
    actorRole: "EMPLOYEE",
    action: "employee.daily_checkin_submitted",
    resource: "check_in",
    resourceId: savedRecord.id,
    result: "SUCCESS",
    metadata: { mood: checkIn.mood, hours: checkIn.hoursWorked, status: checkIn.status },
  });

  return savedRecord;
}

// ==========================================
// 2. TASK MANAGEMENT CRUD
// ==========================================
export async function getEmployeeTasks(assigneeId?: string): Promise<EmployeeTask[]> {
  const all = getStored<EmployeeTask>(KEYS.TASKS, []);
  if (assigneeId) {
    return all.filter((t) => t.assigneeId === assigneeId);
  }
  return all;
}

export async function saveEmployeeTask(task: Omit<EmployeeTask, "id" | "createdAt" | "updatedAt">): Promise<EmployeeTask> {
  const all = getStored<EmployeeTask>(KEYS.TASKS, []);
  const newTask: EmployeeTask = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newTask);
  setStored(KEYS.TASKS, all);

  await recordAuditLog({
    actorId: task.assignedById || "system",
    actorName: "Task Manager",
    actorRole: "EMPLOYEE",
    action: "task.created",
    resource: "task",
    resourceId: newTask.id,
    result: "SUCCESS",
    metadata: { title: task.title, priority: task.priority, assignee: task.assigneeName },
  });

  return newTask;
}

export async function updateTaskStatus(taskId: string, newStatus: EmployeeTask["status"], updaterName: string = "Employee"): Promise<EmployeeTask | null> {
  const all = getStored<EmployeeTask>(KEYS.TASKS, []);
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;

  all[idx].status = newStatus;
  all[idx].updatedAt = new Date().toISOString();
  setStored(KEYS.TASKS, all);

  await recordAuditLog({
    actorId: all[idx].assigneeId,
    actorName: updaterName,
    actorRole: "EMPLOYEE",
    action: "task.status_changed",
    resource: "task",
    resourceId: taskId,
    result: "SUCCESS",
    metadata: { newStatus },
  });

  return all[idx];
}

// ==========================================
// 3. OKR SYSTEM CRUD
// ==========================================
export async function getEmployeeOKRs(ownerId?: string): Promise<EmployeeOKR[]> {
  const all = getStored<EmployeeOKR>(KEYS.OKRS, []);
  if (ownerId) {
    return all.filter((o) => o.ownerId === ownerId);
  }
  return all;
}

export async function saveEmployeeOKR(okr: Omit<EmployeeOKR, "id" | "createdAt" | "updatedAt">): Promise<EmployeeOKR> {
  const all = getStored<EmployeeOKR>(KEYS.OKRS, []);
  const newOKR: EmployeeOKR = {
    ...okr,
    id: `okr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newOKR);
  setStored(KEYS.OKRS, all);

  await recordAuditLog({
    actorId: okr.ownerId,
    actorName: okr.ownerName,
    actorRole: "EMPLOYEE",
    action: "okr.created",
    resource: "okr",
    resourceId: newOKR.id,
    result: "SUCCESS",
    metadata: { objective: okr.objective, quarter: okr.quarter },
  });

  return newOKR;
}

export async function updateOKRProgress(okrId: string, newProgress: number, updatedBy: string = "Employee"): Promise<EmployeeOKR | null> {
  const all = getStored<EmployeeOKR>(KEYS.OKRS, []);
  const idx = all.findIndex((o) => o.id === okrId);
  if (idx < 0) return null;

  all[idx].overallProgress = Math.min(100, Math.max(0, newProgress));
  all[idx].status = all[idx].overallProgress >= 100 ? "COMPLETED" : all[idx].overallProgress >= 60 ? "ON_TRACK" : "AT_RISK";
  all[idx].updatedAt = new Date().toISOString();
  setStored(KEYS.OKRS, all);

  await recordAuditLog({
    actorId: all[idx].ownerId,
    actorName: updatedBy,
    actorRole: "EMPLOYEE",
    action: "okr.progress_updated",
    resource: "okr",
    resourceId: okrId,
    result: "SUCCESS",
    metadata: { overallProgress: all[idx].overallProgress, status: all[idx].status },
  });

  return all[idx];
}

// ==========================================
// 4. LEAVE MANAGEMENT CRUD
// ==========================================
export async function getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
  const all = getStored<LeaveRequest>(KEYS.LEAVES, []);
  if (employeeId) {
    return all.filter((l) => l.employeeId === employeeId);
  }
  return all;
}

export async function submitLeaveRequest(leave: Omit<LeaveRequest, "id" | "createdAt" | "status">): Promise<LeaveRequest> {
  const all = getStored<LeaveRequest>(KEYS.LEAVES, []);
  const newLeave: LeaveRequest = {
    ...leave,
    id: `leave_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  all.unshift(newLeave);
  setStored(KEYS.LEAVES, all);

  await recordAuditLog({
    actorId: leave.employeeId,
    actorName: leave.employeeName,
    actorRole: "EMPLOYEE",
    action: "leave.requested",
    resource: "leave_request",
    resourceId: newLeave.id,
    result: "SUCCESS",
    metadata: { leaveType: leave.leaveType, daysCount: leave.daysCount, startDate: leave.startDate },
  });

  return newLeave;
}

export async function processLeaveDecision(leaveId: string, status: "APPROVED" | "REJECTED", reviewerName: string, reviewerNotes?: string): Promise<LeaveRequest | null> {
  const all = getStored<LeaveRequest>(KEYS.LEAVES, []);
  const idx = all.findIndex((l) => l.id === leaveId);
  if (idx < 0) return null;

  all[idx].status = status;
  all[idx].reviewedBy = reviewerName;
  all[idx].reviewerNotes = reviewerNotes || "";
  all[idx].reviewedAt = new Date().toISOString();
  setStored(KEYS.LEAVES, all);

  await recordAuditLog({
    actorId: "hr_admin",
    actorName: reviewerName,
    actorRole: "HR",
    action: `leave.${status.toLowerCase()}`,
    resource: "leave_request",
    resourceId: leaveId,
    result: "SUCCESS",
    metadata: { status, employee: all[idx].employeeName, days: all[idx].daysCount },
  });

  return all[idx];
}

// ==========================================
// 5. PAYROLL RECORDS (STRICT PERSONAL ISOLATION)
// ==========================================
export async function getEmployeePayrollRecords(employeeId: string, isHRorAdmin: boolean = false): Promise<PayrollRecord[]> {
  const all = getStored<PayrollRecord>(KEYS.PAYROLLS, []);
  // If HR/Admin, allow viewing all or filtering; if normal employee, strictly filter to own records
  if (!isHRorAdmin) {
    return all.filter((p) => p.employeeId === employeeId);
  }
  return all;
}

export async function savePayrollBatch(batch: Omit<PayrollBatch, "id" | "createdAt">, records: PayrollRecord[], approvedBy: string): Promise<PayrollBatch> {
  const batches = getStored<PayrollBatch>(KEYS.PAYROLL_BATCHES, []);
  const newBatch: PayrollBatch = {
    ...batch,
    id: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: "APPROVED",
    approvedBy,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  batches.unshift(newBatch);
  setStored(KEYS.PAYROLL_BATCHES, batches);

  // Update or insert payroll records
  const existingPayrolls = getStored<PayrollRecord>(KEYS.PAYROLLS, []);
  const updatedPayrolls = [...records, ...existingPayrolls.filter(p => !records.some(r => r.id === p.id))];
  setStored(KEYS.PAYROLLS, updatedPayrolls);

  await recordAuditLog({
    actorId: "hr_admin",
    actorName: approvedBy,
    actorRole: "HR",
    action: "payroll.batch_processed",
    resource: "payroll_batch",
    resourceId: newBatch.id,
    result: "SUCCESS",
    metadata: { period: batch.period, totalNet: batch.totalNet, employeesCount: batch.totalEmployees },
  });

  return newBatch;
}

// ==========================================
// 6. RECRUITMENT PIPELINE CRUD
// ==========================================
export async function getCandidates(): Promise<Candidate[]> {
  return getStored<Candidate>(KEYS.CANDIDATES, []);
}

export async function saveCandidate(candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">): Promise<Candidate> {
  const all = getStored<Candidate>(KEYS.CANDIDATES, []);
  const newCandidate: Candidate = {
    ...candidate,
    id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newCandidate);
  setStored(KEYS.CANDIDATES, all);

  await recordAuditLog({
    actorId: "hr_recruiter",
    actorName: "HR Team",
    actorRole: "HR",
    action: "recruitment.candidate_created",
    resource: "candidate",
    resourceId: newCandidate.id,
    result: "SUCCESS",
    metadata: { fullName: candidate.fullName, appliedRole: candidate.appliedRole },
  });

  return newCandidate;
}

export async function moveCandidateStage(candidateId: string, newStage: Candidate["currentStage"], actorName: string = "HR Operations"): Promise<Candidate | null> {
  const all = getStored<Candidate>(KEYS.CANDIDATES, []);
  const idx = all.findIndex((c) => c.id === candidateId);
  if (idx < 0) return null;

  const previousStage = all[idx].currentStage;
  all[idx].currentStage = newStage;
  all[idx].updatedAt = new Date().toISOString();
  setStored(KEYS.CANDIDATES, all);

  await recordAuditLog({
    actorId: "hr_recruiter",
    actorName,
    actorRole: "HR",
    action: "recruitment.stage_progressed",
    resource: "candidate",
    resourceId: candidateId,
    result: "SUCCESS",
    metadata: { candidate: all[idx].fullName, from: previousStage, to: newStage },
  });

  return all[idx];
}

// ==========================================
// 7. ONBOARDING CHECKLIST CRUD
// ==========================================
export async function getOnboardingRecords(): Promise<OnboardingRecord[]> {
  return getStored<OnboardingRecord>(KEYS.ONBOARDINGS, []);
}

export async function saveOnboardingRecord(record: Omit<OnboardingRecord, "id" | "createdAt" | "updatedAt">): Promise<OnboardingRecord> {
  const all = getStored<OnboardingRecord>(KEYS.ONBOARDINGS, []);
  const newRecord: OnboardingRecord = {
    ...record,
    id: `onboard_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newRecord);
  setStored(KEYS.ONBOARDINGS, all);

  await recordAuditLog({
    actorId: "hr_manager",
    actorName: "HR Operations",
    actorRole: "HR",
    action: "onboarding.record_initialized",
    resource: "onboarding",
    resourceId: newRecord.id,
    result: "SUCCESS",
    metadata: { employee: record.employeeName, email: record.corporateEmail },
  });

  return newRecord;
}

export async function updateOnboardingChecklist(recordId: string, checklist: OnboardingRecord["checklist"]): Promise<OnboardingRecord | null> {
  const all = getStored<OnboardingRecord>(KEYS.ONBOARDINGS, []);
  const idx = all.findIndex((o) => o.id === recordId);
  if (idx < 0) return null;

  // Calculate percentage
  const totalKeys = 11;
  let trueCount = 0;
  if (checklist.personalDetails) trueCount++;
  if (checklist.documents) trueCount++;
  if (checklist.offer) trueCount++;
  if (checklist.contract) trueCount++;
  if (checklist.bankDetails) trueCount++;
  if (checklist.departmentAssigned) trueCount++;
  if (checklist.managerAssigned) trueCount++;
  if (checklist.equipmentDispatched) trueCount++;
  if (checklist.emailAccountCreated) trueCount++;
  if (checklist.accessPermissionsSet) trueCount++;
  if (checklist.orientationCompleted) trueCount++;

  const pct = Math.round((trueCount / totalKeys) * 100);
  checklist.completionPercentage = pct;

  all[idx].checklist = checklist;
  all[idx].status = pct === 100 ? "ACTIVE" : pct >= 50 ? "ACCOUNT_ACTIVATED" : "INVITATION_SENT";
  all[idx].updatedAt = new Date().toISOString();
  setStored(KEYS.ONBOARDINGS, all);

  return all[idx];
}

// ==========================================
// 8. SCHOOL TEACHER STUDIO CRUD
// ==========================================
export async function getTeacherClasses(): Promise<TeacherClass[]> {
  return getStored<TeacherClass>(KEYS.CLASSES, []);
}

export async function getStudentsByClass(classId?: string): Promise<StudentRecord[]> {
  const all = getStored<StudentRecord>(KEYS.STUDENTS, []);
  if (classId) {
    return all.filter((s) => s.classId === classId);
  }
  return all;
}

export async function getGradeRecords(classId?: string): Promise<GradeRecord[]> {
  const all = getStored<GradeRecord>(KEYS.GRADES, []);
  if (classId) {
    return all.filter((g) => g.classId === classId);
  }
  return all;
}

export async function saveGradeRecord(grade: Omit<GradeRecord, "id">): Promise<GradeRecord> {
  const all = getStored<GradeRecord>(KEYS.GRADES, []);
  const newGrade: GradeRecord = {
    ...grade,
    id: `grade_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  all.unshift(newGrade);
  setStored(KEYS.GRADES, all);

  await recordAuditLog({
    actorId: "teacher_faculty",
    actorName: "Faculty",
    actorRole: "TEACHER",
    action: "academic.grade_recorded",
    resource: "grade_record",
    resourceId: newGrade.id,
    result: "SUCCESS",
    metadata: { student: grade.studentName, assessment: grade.assessmentTitle, marks: grade.marksObtained },
  });

  return newGrade;
}

export async function getLessonPlans(): Promise<LessonPlan[]> {
  return getStored<LessonPlan>(KEYS.LESSON_PLANS, []);
}

export async function saveLessonPlan(plan: Omit<LessonPlan, "id" | "createdAt">): Promise<LessonPlan> {
  const all = getStored<LessonPlan>(KEYS.LESSON_PLANS, []);
  const newPlan: LessonPlan = {
    ...plan,
    id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newPlan);
  setStored(KEYS.LESSON_PLANS, all);
  return newPlan;
}

export async function getParentMessages(): Promise<ParentMessage[]> {
  return getStored<ParentMessage>(KEYS.PARENT_MESSAGES, []);
}

export async function sendParentMessage(msg: Omit<ParentMessage, "id" | "sentAt">): Promise<ParentMessage> {
  const all = getStored<ParentMessage>(KEYS.PARENT_MESSAGES, []);
  const newMsg: ParentMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sentAt: new Date().toISOString(),
  };
  all.unshift(newMsg);
  setStored(KEYS.PARENT_MESSAGES, all);
  return newMsg;
}

// ==========================================
// 9. COLLEGE & PLACEMENT HUB CRUD
// ==========================================
export async function getPlacementDrives(): Promise<PlacementDrive[]> {
  return getStored<PlacementDrive>(KEYS.DRIVES, []);
}

export async function savePlacementDrive(drive: Omit<PlacementDrive, "id" | "createdAt">): Promise<PlacementDrive> {
  const all = getStored<PlacementDrive>(KEYS.DRIVES, []);
  const newDrive: PlacementDrive = {
    ...drive,
    id: `drive_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newDrive);
  setStored(KEYS.DRIVES, all);

  await recordAuditLog({
    actorId: "placement_officer",
    actorName: drive.coordinatorName || "Placement Coordinator",
    actorRole: "PLACEMENT_OFFICER",
    action: "placement.drive_scheduled",
    resource: "placement_drive",
    resourceId: newDrive.id,
    result: "SUCCESS",
    metadata: { company: drive.companyName, role: drive.role, packageLpa: drive.packageLpa },
  });

  return newDrive;
}

export async function getPlacementStudents(): Promise<PlacementStudent[]> {
  return getStored<PlacementStudent>(KEYS.PLACEMENT_STUDENTS, []);
}

export async function getSyllabusMappings(): Promise<SyllabusMapping[]> {
  return getStored<SyllabusMapping>(KEYS.SYLLABUS_MAPS, []);
}

export async function saveSyllabusMapping(item: Omit<SyllabusMapping, "id" | "updatedAt">): Promise<SyllabusMapping> {
  const all = getStored<SyllabusMapping>(KEYS.SYLLABUS_MAPS, []);
  const newMap: SyllabusMapping = {
    ...item,
    id: `map_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newMap);
  setStored(KEYS.SYLLABUS_MAPS, all);
  return newMap;
}

export async function getCompanyPartners(): Promise<CompanyPartner[]> {
  return getStored<CompanyPartner>(KEYS.COMPANY_PARTNERS, []);
}

// ==========================================
// 10. FOUNDER & EXECUTIVE STUDIO CRUD
// ==========================================
export async function getExecutiveKPI(): Promise<ExecutiveKPI> {
  const stored = getStored<ExecutiveKPI>(KEYS.KPIS, []);
  if (stored.length > 0) return stored[0];

  const initialKpi: ExecutiveKPI = {
    revenue: 1485000,
    mrr: 124000,
    expenses: 48000,
    monthlyBurn: 48000,
    runwayMonths: 18.5,
    cashPosition: 890000,
    activeClients: 42,
    employeeCount: 18,
    projectCount: 9,
    schoolPartnerships: 14,
    collegePartnerships: 8,
    pipelineValue: 3500000,
    updatedAt: new Date().toISOString(),
  };
  setStored(KEYS.KPIS, [initialKpi]);
  return initialKpi;
}

export async function getExecutiveKPIs(): Promise<ExecutiveKPI> {
  return getExecutiveKPI();
}

export async function getFinancialRecords(): Promise<FinancialRecord[]> {
  return getStored<FinancialRecord>(KEYS.FINANCIALS, []);
}

export async function saveFinancialRecord(rec: Omit<FinancialRecord, "id">): Promise<FinancialRecord> {
  const all = getStored<FinancialRecord>(KEYS.FINANCIALS, []);
  const newRec: FinancialRecord = {
    ...rec,
    id: `fin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  all.unshift(newRec);
  setStored(KEYS.FINANCIALS, all);
  return newRec;
}

export async function getStrategicInitiatives(): Promise<StrategicInitiative[]> {
  return getStored<StrategicInitiative>(KEYS.INITIATIVES, []);
}

export async function saveStrategicInitiative(init: Omit<StrategicInitiative, "id" | "createdAt">): Promise<StrategicInitiative> {
  const all = getStored<StrategicInitiative>(KEYS.INITIATIVES, []);
  const newInit: StrategicInitiative = {
    ...init,
    id: `init_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newInit);
  setStored(KEYS.INITIATIVES, all);

  await recordAuditLog({
    actorId: "founder_exec",
    actorName: "Executive Team",
    actorRole: "FOUNDER",
    action: "strategy.initiative_created",
    resource: "strategic_initiative",
    resourceId: newInit.id,
    result: "SUCCESS",
    metadata: { title: init.title, owner: init.owner, priority: init.priority },
  });

  return newInit;
}

export async function getInvestorUpdates(): Promise<InvestorUpdate[]> {
  return getStored<InvestorUpdate>(KEYS.INVESTOR_UPDATES, []);
}

export async function saveInvestorUpdate(update: Omit<InvestorUpdate, "id" | "createdAt" | "updatedAt">): Promise<InvestorUpdate> {
  const all = getStored<InvestorUpdate>(KEYS.INVESTOR_UPDATES, []);
  const newUpdate: InvestorUpdate = {
    ...update,
    id: `investor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.unshift(newUpdate);
  setStored(KEYS.INVESTOR_UPDATES, all);

  await recordAuditLog({
    actorId: "founder_exec",
    actorName: "Founder",
    actorRole: "FOUNDER",
    action: "investor.update_drafted",
    resource: "investor_update",
    resourceId: newUpdate.id,
    result: "SUCCESS",
    metadata: { title: update.title, quarter: update.quarter, status: update.status },
  });

  return newUpdate;
}

export async function getFounderAlerts(): Promise<FounderAlert[]> {
  return getStored<FounderAlert>(KEYS.FOUNDER_ALERTS, []);
}

// ==========================================
// 11. TEAM DIRECTORY (PRIVACY PROTECTED)
// ==========================================
export async function getTeamDirectory(): Promise<TeamMember[]> {
  return getStored<TeamMember>(KEYS.TEAM_MEMBERS, []);
}

export async function getEmployeeDocuments(ownerId?: string): Promise<EmployeeDocument[]> {
  const all = getStored<EmployeeDocument>(KEYS.DOCUMENTS, []);
  if (ownerId) {
    return all.filter((d) => d.ownerId === ownerId || d.visibility === "COMPANY_WIDE");
  }
  return all;
}

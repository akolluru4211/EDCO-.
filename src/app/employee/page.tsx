"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  getEmployeeTasks, 
  saveEmployeeTask, 
  updateTaskStatus,
  getEmployeeOKRs, 
  getEmployeeCheckIns, 
  getLeaveRequests, 
  submitLeaveRequest,
  getEmployeePayrollRecords, 
  getEmployeeDocuments,
  getTeamDirectory
} from "@/lib/db-service";
import { runEmployeeProductivityAgent, AgentInsight } from "@/lib/ai-agents";
import { logInternalAction } from "@/lib/services/internal-audit-service";
import { 
  EmployeeTask, 
  EmployeeOKR, 
  EmployeeCheckIn, 
  LeaveRequest, 
  PayrollRecord, 
  EmployeeDocument, 
  TeamMember,
  LeaveType
} from "@/lib/types";
import { 
  CheckSquare, 
  Target, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  RefreshCw,
  Users
} from "lucide-react";

type EmployeeTab = "my_work" | "my_performance" | "my_hr" | "company" | "ai_assistant";

export default function EmployeeWorkspacePage() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<EmployeeTab>("my_work");
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [okrs, setOkrs] = useState<EmployeeOKR[]>([]);
  const [checkIns, setCheckIns] = useState<EmployeeCheckIn[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Forms / Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("EdWorld Co.");
  const [newTaskPriority, setNewTaskPriority] = useState<EmployeeTask["priority"]>("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState<LeaveType>("CASUAL");
  const [newLeaveStart, setNewLeaveStart] = useState("");
  const [newLeaveEnd, setNewLeaveEnd] = useState("");
  const [newLeaveDays, setNewLeaveDays] = useState(1);
  const [newLeaveReason, setNewLeaveReason] = useState("");

  const isAuthorized = 
    role === "EMPLOYEE" || 
    role === "HR" || 
    role === "FOUNDER" || 
    role === "SUPER_ADMIN" || 
    role === "ADMIN" ||
    user?.role === "EMPLOYEE" ||
    user?.role === "HR" ||
    user?.role === "FOUNDER";

  const effectiveRole = (role === "EMPLOYEE" || role === "HR" || role === "FOUNDER" || role === "ADMIN" || role === "SUPER_ADMIN") ? role : "EMPLOYEE";

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace("/login");
    }
  }, [authLoading, isAuthorized, router]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [taskData, okrData, checkInData, leaveData, payrollData, docData, teamData] = await Promise.all([
        getEmployeeTasks(user.uid),
        getEmployeeOKRs(user.uid),
        getEmployeeCheckIns(user.uid),
        getLeaveRequests(user.uid),
        getEmployeePayrollRecords(user.uid),
        getEmployeeDocuments(user.uid),
        getTeamDirectory()
      ]);
      setTasks(taskData);
      setOkrs(okrData);
      setCheckIns(checkInData);
      setLeaves(leaveData);
      setPayroll(payrollData);
      setDocuments(docData);
      setTeam(teamData);
    } catch (err) {
      console.error("Failed to load employee workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized && user) {
      loadData();
    }
  }, [isAuthorized, user]);

  const handleRunAiProductivity = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const insights = await runEmployeeProductivityAgent(user.uid);
      setAiInsights(insights);
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "AI_PRODUCTIVITY_COPILOT_RUN",
        resourceType: "ai_insight",
        metadata: { count: insights.length }
      });
    } catch (err) {
      console.error("Failed to run employee productivity AI:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    try {
      const created = await saveEmployeeTask({
        title: newTaskTitle.trim(),
        description: "",
        project: newTaskProject,
        priority: newTaskPriority,
        assigneeId: user.uid,
        assigneeName: user.name,
        assigneeEmail: user.email,
        assignedById: user.uid,
        dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
        status: "TODO",
        comments: []
      });
      setTasks(prev => [created, ...prev]);
      setShowTaskModal(false);
      setNewTaskTitle("");
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "TASK_CREATE",
        resourceType: "task",
        resourceId: created.id,
        metadata: { title: created.title, priority: created.priority }
      });
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: EmployeeTask["status"]) => {
    if (!user) return;
    const nextStatus: EmployeeTask["status"] = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const updated = await updateTaskStatus(taskId, nextStatus, user.name);
      if (updated) {
        setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleCreateLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveStart || !newLeaveEnd || !newLeaveReason.trim() || !user) return;
    try {
      const created = await submitLeaveRequest({
        employeeId: user.uid,
        employeeName: user.name,
        employeeEmail: user.email,
        department: "Operations",
        leaveType: newLeaveType,
        startDate: newLeaveStart,
        endDate: newLeaveEnd,
        daysCount: Number(newLeaveDays) || 1,
        reason: newLeaveReason.trim()
      });
      setLeaves(prev => [created, ...prev]);
      setShowLeaveModal(false);
      setNewLeaveReason("");
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "LEAVE_REQUEST_SUBMIT",
        resourceType: "leave_request",
        resourceId: created.id,
        metadata: { days: created.daysCount, type: created.leaveType }
      });
    } catch (err) {
      console.error("Error submitting leave request:", err);
    }
  };

  if (authLoading || (!isAuthorized && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
          <span>Verifying Employee Workplace Authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/10">
              <CheckSquare className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Employee Workplace</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ACTIVE SESSION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                EdWorld Co. Team Member Workspace • {profile?.name || user?.name || user?.email} ({role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRunAiProductivity}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aiLoading ? "Analyzing..." : "Claude Work Copilot"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              Main Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 scrollbar-none border-t border-slate-800/60 pt-2">
          {[
            { id: "my_work", label: "My Work & Tasks", icon: CheckSquare },
            { id: "my_performance", label: "OKRs & Performance", icon: Target },
            { id: "my_hr", label: "Leaves & HR", icon: Calendar },
            { id: "company", label: "Team Directory", icon: Users },
            { id: "ai_assistant", label: "AI Work Copilot", icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as EmployeeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  active 
                    ? "border-cyan-500 text-cyan-400 bg-cyan-500/10 rounded-t-lg" 
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-cyan-500" />
            <p className="text-sm">Loading your workplace dashboard...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: MY WORK */}
            {activeTab === "my_work" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">My Assigned Tasks</h2>
                      <p className="text-xs text-slate-400">
                        {tasks.filter(t => t.status === "COMPLETED").length} of {tasks.length} tasks completed
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Task
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No tasks assigned or created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => {
                        const isDone = task.status === "COMPLETED";
                        return (
                          <div 
                            key={task.id} 
                            className={`p-3.5 rounded-lg border transition flex items-center justify-between gap-3 ${
                              isDone ? "bg-slate-950/60 border-slate-800/60 opacity-70" : "bg-slate-950 border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                className={`w-5 h-5 rounded border flex items-center justify-center transition shrink-0 ${
                                  isDone 
                                    ? "bg-cyan-600 border-cyan-500 text-white" 
                                    : "border-slate-700 hover:border-slate-500"
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <h3 className={`text-xs font-semibold truncate ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                                  {task.title}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Project: {task.project} • Due: {task.dueDate}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${
                              task.priority === "URGENT" ? "bg-rose-500/20 text-rose-300" :
                              task.priority === "HIGH" ? "bg-amber-500/20 text-amber-300" :
                              "bg-slate-800 text-slate-300"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MY PERFORMANCE */}
            {activeTab === "my_performance" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">My Quarterly Objectives & Key Results (OKRs)</h2>
                  <p className="text-xs text-slate-400 mb-4">Track progress against your personal quarterly deliverables</p>

                  {okrs.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Target className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No OKRs defined for current quarter</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {okrs.map(okr => (
                        <div key={okr.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-white">{okr.objective}</h3>
                              <p className="text-xs text-slate-400 mt-0.5">Quarter: {okr.quarter} • Due: {okr.deadline}</p>
                            </div>
                            <span className="text-xs font-bold text-cyan-400">{okr.overallProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" 
                              style={{ width: `${okr.overallProgress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MY HR & LEAVES */}
            {activeTab === "my_hr" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Leave Balance & Time Off</h2>
                      <p className="text-xs text-slate-400">Submit and track your annual and sick leave requests</p>
                    </div>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Request Time Off
                    </button>
                  </div>

                  {leaves.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No leave requests logged</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaves.map(req => (
                        <div key={req.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-semibold text-white">{req.leaveType}</h3>
                              <span className="text-[10px] text-slate-400">({req.daysCount} Days)</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {req.startDate} to {req.endDate} • "{req.reason}"
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" :
                            req.status === "REJECTED" ? "bg-rose-500/20 text-rose-300" :
                            "bg-amber-500/20 text-amber-300"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payslips Snapshot */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">My Disbursed Payslips</h2>
                  <p className="text-xs text-slate-400 mb-4">Official monthly compensation summaries</p>

                  {payroll.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <DollarSign className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                      <p className="text-xs text-slate-400">No payslips generated for this account</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payroll.map(pay => (
                        <div key={pay.id} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-white">{pay.payPeriod}</span>
                            <span className="text-slate-400 ml-2">Net: ₹{pay.netPay.toLocaleString("en-IN")}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold">{pay.paymentStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: COMPANY */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">Team Directory</h2>
                  <p className="text-xs text-slate-400 mb-4">Colleagues and leadership at EdWorld Co.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs border border-slate-700 shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-semibold text-white truncate">{member.name}</h3>
                          <p className="text-xs text-cyan-400 truncate">{member.designation}</p>
                          <p className="text-[11px] text-slate-500 truncate">{member.workEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI WORK COPILOT */}
            {activeTab === "ai_assistant" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        Claude AI Productivity Copilot
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Personal work insights, blocker detection, and sprint task prioritization.
                      </p>
                    </div>
                    <button
                      onClick={handleRunAiProductivity}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition disabled:opacity-50 self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                      {aiLoading ? "Analyzing..." : "Analyze Work & Priorities"}
                    </button>
                  </div>

                  {aiInsights.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No productivity insights generated</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Click above to analyze your tasks and deadlines.</p>
                      <button
                        onClick={handleRunAiProductivity}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        Run Personal Work Radar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights.map((insight, idx) => (
                        <div key={insight.id || idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                insight.category === "BOTTLENECK" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                                insight.category === "OPPORTUNITY" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                                "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              }`}>
                                {insight.category}
                              </span>
                              <h3 className="text-sm font-semibold text-white">{insight.headline}</h3>
                            </div>
                            <span className="text-[10px] text-slate-500">{insight.agentName}</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-3">{insight.detail}</p>
                          {insight.actionableStep && (
                            <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span><strong>Action Item:</strong> {insight.actionableStep}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: Create Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Create Personal Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Finalize mock interview grading rubric"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Project</label>
                  <input
                    type="text"
                    value={newTaskProject}
                    onChange={e => setNewTaskProject(e.target.value)}
                    placeholder="EdWorld Co."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as EmployeeTask["priority"])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Request Leave */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Request Time Off</h3>
            <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Leave Type</label>
                  <select
                    value={newLeaveType}
                    onChange={e => setNewLeaveType(e.target.value as LeaveType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PAID_VACATION">Paid Vacation</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Days Count</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newLeaveDays}
                    onChange={e => setNewLeaveDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newLeaveStart}
                    onChange={e => setNewLeaveStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newLeaveEnd}
                    onChange={e => setNewLeaveEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Notes</label>
                <textarea
                  value={newLeaveReason}
                  onChange={e => setNewLeaveReason(e.target.value)}
                  placeholder="Provide context for HR review..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

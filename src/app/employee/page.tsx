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
  Users,
  LifeBuoy,
  MessageSquare,
  Flag,
  AlertCircle,
  XCircle,
  Clock,
  Check,
  ChevronRight
} from "lucide-react";
import { AdminTicket } from "@/app/api/admin/tickets/route";

type EmployeeTab = "my_work" | "tickets" | "my_performance" | "my_hr" | "company" | "ai_assistant";

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
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

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

      // Also load support tickets for issue resolution triage
      const ticketRes = await fetch("/api/admin/tickets", {
        headers: { "x-user-id": user.uid }
      });
      if (ticketRes.ok) {
        const tData = await ticketRes.json();
        if (tData.success) {
          setTickets(tData.tickets || []);
        }
      }
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

  const handleUpdateTicketStatus = async (ticket: AdminTicket, newStatus: string) => {
    setUpdatingTicketId(ticket.id);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.uid || "",
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          ticketType: ticket.type,
          status: newStatus,
          resolutionNotes: resolutionNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTickets(prev =>
          prev.map(t =>
            t.id === ticket.id
              ? { ...t, status: newStatus as any, resolutionNotes: resolutionNotes || t.resolutionNotes }
              : t
          )
        );
        setNotification(`Ticket ${ticket.id.substring(0, 8)} updated to ${newStatus}. Resolution email dispatched.`);
        setResolvingTicketId(null);
        setResolutionNotes("");
        setTimeout(() => setNotification(null), 4000);
      } else {
        alert(data.error || "Failed to update ticket");
      }
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  if (authLoading || (!isAuthorized && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] flex items-center justify-center text-[#5E6573]">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-[#EBECEF] shadow-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-600" />
          <span className="text-sm font-semibold text-[#13141B]">Verifying Employee Workplace Authentication...</span>
        </div>
      </div>
    );
  }

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "OPEN") return t.status === "NEW" || t.status === "IN_PROGRESS";
    if (ticketFilter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "APPROVED";
    return true;
  });

  const openTicketsCount = tickets.filter(t => t.status === "NEW" || t.status === "IN_PROGRESS").length;

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1536px] mx-auto font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#13141B] text-white flex items-center gap-1.5 font-mono">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>STAFF WORKPLACE &amp; OPERATIONS</span>
            </span>
            <span className="text-xs text-[#5E6573] font-mono">
              Real DB Telemetry &bull; Active Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13141B] tracking-tight">
            Employee Operations &amp; Issue Resolution
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Personal task queue, user support ticket triage, quarterly OKRs, and time-off tracking.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={handleRunAiProductivity}
            disabled={aiLoading}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? "Analyzing..." : "Claude Work Copilot"}</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] border border-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5E6573] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Stats Row (Real Postgres Data Only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Assigned Tasks</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{tasks.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {tasks.filter(t => t.status === "COMPLETED").length} Completed
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Open Support Tickets</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-1">{openTicketsCount}</div>
          <span className="text-[11px] text-cyan-800 font-semibold mt-1 block">User Inquiries &amp; Triage</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Quarterly OKRs</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{okrs.length}</div>
          <span className="text-[11px] text-[#5E6573] font-semibold mt-1 block">Performance Targets</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Team Colleagues</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{team.length}</div>
          <span className="text-[11px] text-[#5E6573] font-semibold mt-1 block">Internal Directory</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#EBECEF] gap-2 overflow-x-auto pb-px">
        {[
          { id: "my_work", label: "My Work & Tasks", icon: CheckSquare, count: tasks.length },
          { id: "tickets", label: "Support Tickets & Issue Resolution", icon: LifeBuoy, count: openTicketsCount },
          { id: "my_performance", label: "OKRs & Goals", icon: Target, count: okrs.length },
          { id: "my_hr", label: "Leaves & Payslips", icon: Calendar, count: leaves.length },
          { id: "company", label: "Team Directory", icon: Users, count: team.length },
          { id: "ai_assistant", label: "AI Work Copilot", icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EmployeeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer rounded-t-xl ${
                active 
                  ? "border-[#13141B] text-[#13141B] bg-white shadow-xs" 
                  : "border-transparent text-[#5E6573] hover:text-[#13141B] hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  active ? "bg-[#13141B] text-white" : "bg-[#F4F6FB] text-[#5E6573]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main>
        {loading ? (
          <div className="py-24 text-center text-[#5E6573] bg-white rounded-3xl border border-[#EBECEF]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-600" />
            <p className="text-sm font-bold text-[#13141B]">Loading workplace data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: MY WORK */}
            {activeTab === "my_work" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B]">My Assigned Tasks</h2>
                      <p className="text-xs text-[#5E6573]">
                        {tasks.filter(t => t.status === "COMPLETED").length} of {tasks.length} tasks completed
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Task
                    </button>
                  </div>

                  {tasks.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No tasks assigned or created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => {
                        const isDone = task.status === "COMPLETED";
                        return (
                          <div 
                            key={task.id} 
                            className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                              isDone ? "bg-[#FCFCFB] border-[#EBECEF] opacity-70" : "bg-white border-[#EBECEF] shadow-2xs"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 cursor-pointer ${
                                  isDone 
                                    ? "bg-cyan-600 border-cyan-600 text-white" 
                                    : "border-[#EBECEF] hover:border-slate-400 bg-[#F4F6FB]"
                                }`}
                              >
                                {isDone && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <div className="min-w-0">
                                <h3 className={`text-xs font-bold truncate ${isDone ? "line-through text-[#8E95A5]" : "text-[#13141B]"}`}>
                                  {task.title}
                                </h3>
                                <p className="text-[11px] text-[#5E6573] mt-0.5">
                                  Project: <strong className="text-[#13141B]">{task.project}</strong> &bull; Due: {task.dueDate}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                              task.priority === "URGENT" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                              task.priority === "HIGH" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-[#F4F6FB] text-[#5E6573] border border-[#E8ECF2]"
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

            {/* TAB 2: SUPPORT TICKETS & ISSUE RESOLUTION */}
            {activeTab === "tickets" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B] flex items-center gap-2">
                        <LifeBuoy className="w-5 h-5 text-cyan-600" />
                        <span>User Support Tickets &amp; Issue Resolution Queue</span>
                      </h2>
                      <p className="text-xs text-[#5E6573] mt-0.5">
                        Triage user contact inquiries, platform issues, and user review tickets. Closing an issue sends an automated email to the user.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs font-bold text-[#13141B] focus:outline-none"
                      >
                        <option value="ALL">All Inquiries ({tickets.length})</option>
                        <option value="OPEN">Open &amp; In Progress</option>
                        <option value="RESOLVED">Resolved &amp; Closed</option>
                      </select>
                    </div>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <LifeBuoy className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-sm font-bold text-[#13141B]">No support tickets found</p>
                      <p className="text-xs text-[#5E6573] mt-1">Inbound support inquiries and reported issues will show here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTickets.map((ticket) => {
                        const isResolving = resolvingTicketId === ticket.id;
                        return (
                          <div
                            key={ticket.id}
                            className="p-5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  ticket.status === "NEW" ? "bg-cyan-50 text-cyan-800 border border-cyan-200" :
                                  ticket.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                                  "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                }`}>
                                  {ticket.status}
                                </span>
                                <span className="text-xs font-bold text-[#13141B]">{ticket.title}</span>
                                <span className="text-[10px] text-[#5E6573] font-mono">#{ticket.id.substring(0, 8)}</span>
                              </div>

                              <span className="text-xs text-[#5E6573] font-mono">
                                {new Date(ticket.createdAt).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <p className="text-xs text-[#13141B] bg-white p-3 rounded-xl border border-[#EBECEF]">
                              {ticket.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-[#5E6573] flex-wrap gap-2 pt-1">
                              <div>
                                <span>Requester: <strong className="text-[#13141B]">{ticket.authorName || "Anonymous"}</strong> ({ticket.sourceEmail || "No email"})</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateTicketStatus(ticket, "IN_PROGRESS")}
                                      disabled={updatingTicketId === ticket.id}
                                      className="px-3 py-1.5 rounded-lg bg-[#F4F6FB] hover:bg-[#EBECEF] text-[#13141B] text-xs font-bold border border-[#E8ECF2] transition cursor-pointer"
                                    >
                                      Mark In Progress
                                    </button>
                                    <button
                                      onClick={() => setResolvingTicketId(isResolving ? null : ticket.id)}
                                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Resolve &amp; Close Issue</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Inline Resolution Box */}
                            {isResolving && (
                              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 mt-2">
                                <label className="block text-xs font-bold text-emerald-900">
                                  Resolution Summary (will be emailed to requester)
                                </label>
                                <textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Explain what steps were taken to resolve this ticket..."
                                  rows={2}
                                  className="w-full p-2.5 rounded-lg bg-white border border-emerald-200 text-xs text-[#13141B] focus:outline-none focus:border-emerald-600"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setResolvingTicketId(null)}
                                    className="px-3 py-1.5 rounded-lg bg-white text-[#5E6573] text-xs font-bold border border-[#EBECEF] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateTicketStatus(ticket, "RESOLVED")}
                                    disabled={updatingTicketId === ticket.id}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Confirm Resolution &amp; Send Email</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PERFORMANCE / OKRS */}
            {activeTab === "my_performance" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#13141B]">My Objectives &amp; Key Results (OKRs)</h2>
                    <p className="text-xs text-[#5E6573]">Track progress against your personal deliverables</p>
                  </div>

                  {okrs.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <Target className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No OKRs assigned for current quarter</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {okrs.map(okr => (
                        <div key={okr.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF]">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-sm font-bold text-[#13141B]">{okr.objective}</h3>
                              <p className="text-xs text-[#5E6573] mt-0.5">Quarter: <strong className="text-[#13141B]">{okr.quarter}</strong> &bull; Due: {okr.deadline}</p>
                            </div>
                            <span className="text-xs font-bold text-cyan-700 font-mono">{okr.overallProgress}%</span>
                          </div>
                          <div className="w-full bg-[#EBECEF] rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-cyan-600 h-2 rounded-full transition-all duration-300" 
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

            {/* TAB 4: LEAVES & PAYROLL */}
            {activeTab === "my_hr" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B]">Leave Balance &amp; Time Off</h2>
                      <p className="text-xs text-[#5E6573]">Submit and track your annual and sick leave requests</p>
                    </div>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Request Time Off
                    </button>
                  </div>

                  {leaves.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No leave requests logged</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaves.map(req => (
                        <div key={req.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] flex items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-[#13141B]">{req.leaveType}</h3>
                              <span className="text-[10px] text-[#5E6573]">({req.daysCount} Days)</span>
                            </div>
                            <p className="text-[11px] text-[#5E6573] mt-0.5">
                              {req.startDate} to {req.endDate} &bull; "{req.reason}"
                            </p>
                          </div>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            req.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            req.status === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payslips Snapshot */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#13141B]">My Disbursed Payslips</h2>
                    <p className="text-xs text-[#5E6573]">Official monthly compensation summaries</p>
                  </div>

                  {payroll.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <DollarSign className="w-6 h-6 mx-auto mb-1 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No payslips generated for this account</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payroll.map(pay => (
                        <div key={pay.id} className="p-3.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#13141B]">{pay.payPeriod}</span>
                            <span className="text-[#5E6573] ml-2">Net: <strong className="text-emerald-700 font-mono">₹{pay.netPay.toLocaleString("en-IN")}</strong></span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{pay.paymentStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: COMPANY DIRECTORY */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#13141B]">Team &amp; Colleague Directory</h2>
                    <p className="text-xs text-[#5E6573]">Colleagues and leadership across EdWorld Organization</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] flex items-start gap-3 shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-[#13141B] flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-[#13141B] truncate">{member.name}</h3>
                          <p className="text-xs text-cyan-700 font-semibold truncate">{member.designation}</p>
                          <p className="text-[11px] text-[#5E6573] truncate font-mono mt-0.5">{member.workEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: AI WORK COPILOT */}
            {activeTab === "ai_assistant" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-600" />
                        Claude AI Productivity Copilot
                      </h2>
                      <p className="text-xs text-[#5E6573] mt-1">
                        Personal work insights, blocker detection, and sprint task prioritization.
                      </p>
                    </div>
                    <button
                      onClick={handleRunAiProductivity}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                      <span>{aiLoading ? "Analyzing..." : "Analyze Work & Priorities"}</span>
                    </button>
                  </div>

                  {aiInsights.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-sm font-bold text-[#13141B]">No productivity insights generated</p>
                      <p className="text-xs text-[#5E6573] mt-1 mb-4">Click below to analyze your tasks and deadlines.</p>
                      <button
                        onClick={handleRunAiProductivity}
                        className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Run Personal Work Radar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights.map((insight, idx) => (
                        <div key={insight.id || idx} className="p-5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] shadow-2xs">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase ${
                                insight.category === "BOTTLENECK" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                insight.category === "OPPORTUNITY" ? "bg-cyan-50 text-cyan-700 border border-cyan-200" :
                                "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              }`}>
                                {insight.category}
                              </span>
                              <h3 className="text-sm font-bold text-[#13141B]">{insight.headline}</h3>
                            </div>
                            <span className="text-[10px] text-[#5E6573] font-mono">{insight.agentName}</span>
                          </div>
                          <p className="text-xs text-[#5E6573] mb-3">{insight.detail}</p>
                          {insight.actionableStep && (
                            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs text-cyan-900 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBECEF] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#13141B] mb-4">Create Personal Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Ticket Resolution Webhook"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Project Name</label>
                <input
                  type="text"
                  value={newTaskProject}
                  onChange={e => setNewTaskProject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-semibold focus:outline-none focus:border-[#13141B]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-mono focus:outline-none focus:border-[#13141B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] text-[#5E6573] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBECEF] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#13141B] mb-4">Submit Time-Off Request</h3>
            <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Leave Type</label>
                <select
                  value={newLeaveType}
                  onChange={e => setNewLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-semibold focus:outline-none focus:border-[#13141B]"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned / Annual Leave</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeaveStart}
                    onChange={e => setNewLeaveStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-mono focus:outline-none focus:border-[#13141B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeaveEnd}
                    onChange={e => setNewLeaveEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-mono focus:outline-none focus:border-[#13141B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Number of Days</label>
                <input
                  type="number"
                  min={1}
                  value={newLeaveDays}
                  onChange={e => setNewLeaveDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  value={newLeaveReason}
                  onChange={e => setNewLeaveReason(e.target.value)}
                  placeholder="Provide context for this time-off request..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] text-[#5E6573] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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

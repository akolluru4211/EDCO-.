"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Target, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  ArrowRight,
  Smile,
  Shield,
  Layers,
  Send,
  Building,
  Check,
  X,
  Filter,
  TrendingUp,
  Download
} from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  EmployeeCheckIn, 
  EmployeeTask, 
  EmployeeOKR, 
  LeaveRequest, 
  PayrollRecord, 
  TeamMember,
  EmployeeDocument
} from "@/lib/types";
import { 
  getEmployeeCheckIns, 
  saveEmployeeCheckIn, 
  getEmployeeTasks, 
  saveEmployeeTask, 
  updateTaskStatus, 
  getEmployeeOKRs, 
  saveEmployeeOKR, 
  updateOKRProgress, 
  getLeaveRequests, 
  submitLeaveRequest, 
  getEmployeePayrollRecords, 
  getTeamDirectory, 
  getEmployeeDocuments 
} from "@/lib/db-service";
import { runEmployeeProductivityAgent, AgentInsight } from "@/lib/ai-agents";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import AuthGuard from "@/components/auth/AuthGuard";

export default function EmployeeWorkspacePage() {
  const { user, profile, role, isEmployee, isHR, isFounder, isAdmin } = useAuth();

  if (user && !isEmployee && !isHR && !isFounder && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Employee Workspace"
        requiredRole="Corporate Employee / Staff"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"today" | "my_work" | "people" | "hr">("today");

  // State
  const [checkIns, setCheckIns] = useState<EmployeeCheckIn[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [okrs, setOkrs] = useState<EmployeeOKR[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [taskFilter, setTaskFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Daily Check-in Form
  const [checkInPriorities, setCheckInPriorities] = useState("");
  const [checkInProgress, setCheckInProgress] = useState("");
  const [checkInBlockers, setCheckInBlockers] = useState("");
  const [checkInMood, setCheckInMood] = useState<"Great" | "Good" | "Okay" | "Stressed" | "Blocked">("Great");
  const [checkInHours, setCheckInHours] = useState(8);
  const [checkInSubmitted, setCheckInSubmitted] = useState(false);

  // New Task Modal / Form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("EdWorld Core Platform");
  const [newTaskPriority, setNewTaskPriority] = useState<EmployeeTask["priority"]>("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-03-20");

  // Leave Form
  const [leaveType, setLeaveType] = useState<LeaveRequest["leaveType"]>("CASUAL");
  const [leaveStart, setLeaveStart] = useState("2026-03-25");
  const [leaveEnd, setLeaveEnd] = useState("2026-03-26");
  const [leaveReason, setLeaveReason] = useState("");

  const currentEmployeeId = user?.uid || "emp_demo_1";
  const currentEmployeeName = user?.name || "Staff Member";
  const currentEmployeeEmail = user?.email || "staff@edworld.co.in";

  const loadData = async () => {
    const [c, t, o, l, p, tm, d] = await Promise.all([
      getEmployeeCheckIns(currentEmployeeId),
      getEmployeeTasks(currentEmployeeId),
      getEmployeeOKRs(currentEmployeeId),
      getLeaveRequests(currentEmployeeId),
      getEmployeePayrollRecords(currentEmployeeId, false),
      getTeamDirectory(),
      getEmployeeDocuments(currentEmployeeId),
    ]);

    setTasks(t || []);
    setOkrs(o || []);
    setPayrolls(p || []);
    setCheckIns(c || []);
    setLeaves(l || []);
    setTeamMembers(tm || []);
    setDocuments(d || []);

    const insights = await runEmployeeProductivityAgent(currentEmployeeId);
    setAiInsights(insights);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInPriorities.trim()) return;

    await saveEmployeeCheckIn({
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      date: new Date().toISOString().split("T")[0],
      priorities: checkInPriorities.split("\n").filter(Boolean),
      yesterdayProgress: checkInProgress,
      blockers: checkInBlockers,
      mood: checkInMood,
      hoursWorked: Number(checkInHours),
      status: "COMPLETED",
    });

    setCheckInSubmitted(true);
    setNotification("Daily Check-In saved successfully to database!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await saveEmployeeTask({
      title: newTaskTitle,
      description: newTaskDesc,
      project: newTaskProject,
      priority: newTaskPriority,
      assigneeId: currentEmployeeId,
      assigneeName: currentEmployeeName,
      assigneeEmail: currentEmployeeEmail,
      assignedById: currentEmployeeId,
      dueDate: newTaskDueDate,
      status: "TODO",
      comments: [],
    });

    setShowTaskModal(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNotification("Task created & synced to workspace!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleStatusChange = async (taskId: string, newStatus: EmployeeTask["status"]) => {
    await updateTaskStatus(taskId, newStatus, currentEmployeeName);
    loadData();
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    await submitLeaveRequest({
      employeeId: currentEmployeeId,
      employeeName: currentEmployeeName,
      employeeEmail: currentEmployeeEmail,
      department: "Engineering",
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: 2,
      reason: leaveReason,
    });

    setLeaveReason("");
    setNotification("Leave request submitted for HR approval.");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const filteredTasks = taskFilter === "ALL" ? tasks : tasks.filter(t => t.status === taskFilter);

  return (
    <AuthGuard allowedRoles={["EMPLOYEE", "HR", "FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D7FC51]/10 text-[#D7FC51] border border-[#D7FC51]/30">
              Employee Workspace
            </span>
            <span className="text-xs text-[#8E95A5]">🏢 EdWorld Organization OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Welcome back, {currentEmployeeName}!
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Corporate Account: <span className="font-mono text-white">{currentEmployeeEmail}</span> &bull; Engineering &amp; Platform Team
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/employee/performance"
            className="px-4 py-2.5 rounded-2xl bg-[#1C1D26] hover:bg-[#282937] border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Performance &amp; Reviews</span>
          </Link>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "today", label: "Today & Daily Check-in", icon: Clock },
          { id: "my_work", label: "My Work & OKRs", icon: Target },
          { id: "people", label: "Team & Directory", icon: Users },
          { id: "hr", label: "Leave & Personal Payroll", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#D7FC51] text-[#13141B] shadow-md font-black"
                  : "bg-[#1C1D26] text-[#8E95A5] hover:text-white hover:bg-[#252633]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TODAY & DAILY CHECK-IN */}
      {activeTab === "today" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Daily Check-In Interactive Card */}
          <div className="lg:col-span-2 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D7FC51]" />
                  <span>Daily Standup Check-In</span>
                </h2>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  Synchronize your daily focus with your manager &amp; agile squad.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white font-mono">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                  Today&apos;s Top Priorities (One per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={checkInPriorities}
                  onChange={(e) => setCheckInPriorities(e.target.value)}
                  placeholder="1. Complete RBAC server verification middleware&#10;2. Review pull requests for attendance radar"
                  className="w-full p-3.5 rounded-2xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                    Yesterday&apos;s Progress / Shipped
                  </label>
                  <textarea
                    rows={2}
                    value={checkInProgress}
                    onChange={(e) => setCheckInProgress(e.target.value)}
                    placeholder="Closed bug #402 and tested gradebook calculations"
                    className="w-full p-3 rounded-2xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                    Blockers / Dependencies
                  </label>
                  <textarea
                    rows={2}
                    value={checkInBlockers}
                    onChange={(e) => setCheckInBlockers(e.target.value)}
                    placeholder="Waiting on Firebase security rules signoff (or None)"
                    className="w-full p-3 rounded-2xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                    Mood / Energy Level
                  </label>
                  <div className="flex gap-2">
                    {(["Great", "Good", "Okay", "Stressed", "Blocked"] as const).map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setCheckInMood(m)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          checkInMood === m
                            ? "bg-[#D7FC51] text-[#13141B] font-black"
                            : "bg-[#1C1D26] text-[#8E95A5] hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                    Hours Planned Today
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={checkInHours}
                    onChange={(e) => setCheckInHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white focus:outline-none focus:border-[#D7FC51]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Today&apos;s Standup Check-In</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: AI Productivity Agent & Today's Schedule */}
          <div className="space-y-6">
            
            {/* AI Agent Box */}
            <div className="bg-[#13141B] p-6 rounded-3xl border border-[#D7FC51]/20 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[#D7FC51]">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">EmployeeProductivityAgent</h3>
              </div>
              <p className="text-xs text-[#8E95A5] leading-relaxed">
                Autonomous daily work assistant checking task blockers, OKR alignment, and schedule pacing.
              </p>

              <div className="space-y-2.5">
                {aiInsights.length > 0 ? (
                  aiInsights.map((insight) => (
                    <div key={insight.id} className="p-3.5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D7FC51]/10 text-[#D7FC51]">
                        {insight.category}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{insight.headline}</h4>
                      <p className="text-[11px] text-[#8E95A5]">{insight.detail}</p>
                      {insight.actionableStep && (
                        <p className="text-[10px] text-[#00D2B4] font-semibold pt-1">
                          &rarr; {insight.actionableStep}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-[#1C1D26] text-xs text-[#8E95A5] text-center">
                    All tasks on track. No blockers detected today.
                  </div>
                )}
              </div>
            </div>

            {/* Today's Meetings */}
            <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8E95A5]">Today&apos;s Meetings</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-[#1C1D26] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Engineering Sprint Sync</span>
                    <span className="text-[10px] text-[#8E95A5]">10:30 AM &bull; Google Meet</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Upcoming</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#1C1D26] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Phase 19 Architecture Review</span>
                    <span className="text-[10px] text-[#8E95A5]">3:00 PM &bull; Conf Room 2</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold">Design</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MY WORK & OKRS */}
      {activeTab === "my_work" && (
        <div className="space-y-6">
          
          {/* OKR Progress Card */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Q1 2026 Objectives &amp; Key Results (OKRs)</span>
                </h2>
                <p className="text-xs text-[#8E95A5]">Strategic goals aligned with EdWorld business objectives.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Quarterly Target
              </span>
            </div>

            <div className="space-y-4">
              {okrs.map((okr) => (
                <div key={okr.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{okr.objective}</h3>
                      <span className="text-[10px] text-[#8E95A5]">Deadline: {okr.deadline} &bull; Owner: {okr.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-[#D7FC51] font-mono">{okr.overallProgress}%</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${okr.status === "ON_TRACK" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {okr.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Slider */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full bg-[#13141B] overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-[#D7FC51] transition-all duration-300"
                        style={{ width: `${okr.overallProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#8E95A5]">
                      <span>Adjust progress:</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={okr.overallProgress} 
                        onChange={(e) => updateOKRProgress(okr.id, Number(e.target.value), currentEmployeeName).then(loadData)}
                        className="w-48 accent-[#D7FC51] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Key Results */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Key Results Breakdown:</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {okr.keyResults.map((kr) => (
                        <div key={kr.id} className="p-2.5 rounded-xl bg-[#13141B] text-xs space-y-1">
                          <span className="text-white font-medium block truncate">{kr.title}</span>
                          <span className="text-[10px] text-[#D7FC51] font-mono">{kr.current} / {kr.target} {kr.unit} ({kr.progressPercentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Management Board */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#D7FC51]" />
                  <span>Project Task Board</span>
                </h2>
                <p className="text-xs text-[#8E95A5]">Manage and update your active engineering assignments.</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#1C1D26] p-1 rounded-2xl border border-white/5">
                {(["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskFilter(st)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      taskFilter === st ? "bg-[#D7FC51] text-[#13141B] font-black" : "text-[#8E95A5] hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider">{task.project}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${task.priority === "HIGH" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {task.priority}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white leading-snug">{task.title}</h3>
                    <p className="text-[11px] text-[#8E95A5] leading-relaxed line-clamp-2">{task.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-[#8E95A5]">
                      <span>Due: {task.dueDate}</span>
                      <span className="font-bold text-white font-mono">{task.status}</span>
                    </div>
                    
                    {/* Status Dropdown / Action */}
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                        className={`py-1 rounded-lg text-[9px] font-bold ${task.status === "IN_PROGRESS" ? "bg-[#D7FC51] text-[#13141B]" : "bg-[#13141B] text-[#8E95A5] hover:text-white"}`}
                      >
                        Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, "IN_REVIEW")}
                        className={`py-1 rounded-lg text-[9px] font-bold ${task.status === "IN_REVIEW" ? "bg-purple-500 text-white" : "bg-[#13141B] text-[#8E95A5] hover:text-white"}`}
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, "COMPLETED")}
                        className={`py-1 rounded-lg text-[9px] font-bold ${task.status === "COMPLETED" ? "bg-emerald-500 text-white" : "bg-[#13141B] text-[#8E95A5] hover:text-white"}`}
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PEOPLE & DIRECTORY */}
      {activeTab === "people" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00D2B4]" />
                <span>EdWorld Team Directory</span>
              </h2>
              <p className="text-xs text-[#8E95A5]">
                Authorized organization directory with privacy filtering (personal phone &amp; private salary data strictly isolated).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00D2B4]/10 text-[#00D2B4] border border-[#00D2B4]/30 font-mono">
              {teamMembers.length} Colleagues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D7FC51] to-[#00D2B4] text-[#13141B] font-black text-sm flex items-center justify-center shadow-md">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{member.name}</h3>
                    <span className="text-[10px] text-[#8E95A5] block truncate max-w-[140px]">{member.designation}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-[#8E95A5] pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="font-semibold text-white">{member.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Work Email:</span>
                    <span className="font-mono text-white text-[10px]">{member.workEmail}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>Status:</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400">
                      {member.availabilityStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HR & PERSONAL PAYROLL */}
      {activeTab === "hr" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Personal Payroll Statement (Strictly Isolated) */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>My Salary Statement</span>
                </h2>
                <p className="text-xs text-[#8E95A5]">Confidential &amp; strictly isolated personal pay records.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                {payrolls[0]?.payPeriod || "March 2026"}
              </span>
            </div>

            {payrolls.length > 0 ? (
              <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Net Take-Home Pay</span>
                    <div className="text-2xl font-black text-white font-mono mt-0.5">
                      ₹{payrolls[0].netPay.toLocaleString()}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    DISBURSED ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 p-3 rounded-xl bg-[#13141B]">
                    <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Earnings &amp; Allowances</span>
                    <div className="text-white">Base: ₹{payrolls[0].baseSalary.toLocaleString()}</div>
                    <div className="text-[#8E95A5] text-[11px]">HRA: ₹{payrolls[0].allowances.hra.toLocaleString()}</div>
                    <div className="text-[#8E95A5] text-[11px]">Special: ₹{payrolls[0].allowances.special.toLocaleString()}</div>
                  </div>

                  <div className="space-y-1 p-3 rounded-xl bg-[#13141B]">
                    <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Deductions</span>
                    <div className="text-rose-400">PF: ₹{payrolls[0].deductions.pf.toLocaleString()}</div>
                    <div className="text-rose-400">Tax: ₹{payrolls[0].deductions.tax.toLocaleString()}</div>
                    <div className="text-[#8E95A5] text-[11px]">Total Deductions: ₹{(payrolls[0].deductions.pf + payrolls[0].deductions.tax).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8E95A5] pt-1">
                  <span>Bank Account: <strong className="text-white font-mono">{payrolls[0].bankAccountMasked}</strong></span>
                  <button className="text-[#D7FC51] font-bold hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Payslip PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#1C1D26] text-xs text-[#8E95A5] text-center">
                No payroll record generated for this cycle yet.
              </div>
            )}
          </div>

          {/* Right: Leave Management */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>Leave Management</span>
                </h2>
                <p className="text-xs text-[#8E95A5]">Apply for time off and track approval status.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-xl bg-[#1C1D26] text-white font-mono">14 Casual</span>
                <span className="px-2.5 py-1 rounded-xl bg-[#1C1D26] text-white font-mono">8 Sick</span>
              </div>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3 p-4 rounded-2xl bg-[#1C1D26] border border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A5] uppercase">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#13141B] border border-white/10 text-xs text-white"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="PAID_VACATION">Paid Vacation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A5] uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#13141B] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A5] uppercase">Reason for Leave</label>
                <input
                  type="text"
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Family commitment / Personal appointment"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#13141B] border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all"
              >
                Submit Leave Application
              </button>
            </form>

            {/* Leave History */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Recent Leave History</span>
              {leaves.map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-[#1C1D26] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{l.leaveType} ({l.daysCount} days)</span>
                    <span className="text-[10px] text-[#8E95A5]">{l.startDate} to {l.endDate} &bull; {l.reason}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : l.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#13141B] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Create New Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-[#8E95A5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Implement API endpoint..."
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Task details & acceptance criteria"
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all mt-2"
              >
                Save Task to Workspace
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}

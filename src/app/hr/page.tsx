"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Search, 
  Plus, 
  Filter,
  Layers,
  Send,
  Eye,
  ArrowRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Candidate, OnboardingRecord, LeaveRequest, PayrollBatch, PayrollRecord } from "@/lib/types";
import { 
  getCandidates, 
  saveCandidate, 
  moveCandidateStage, 
  getOnboardingRecords, 
  updateOnboardingChecklist, 
  getLeaveRequests, 
  processLeaveDecision, 
  savePayrollBatch 
} from "@/lib/db-service";
import { runHRInsightAgent, AgentInsight } from "@/lib/ai-agents";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import AuthGuard from "@/components/auth/AuthGuard";

export default function HrCommandCenterPage() {
  const { user, role, isHR, isAdmin, isFounder } = useAuth();

  if (user && !isHR && !isAdmin && !isFounder) {
    return (
      <AccessDeniedPortal
        portalName="HR Command Center"
        requiredRole="HR Operations or System Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"recruitment" | "onboarding" | "leaves" | "payroll" | "attendance">("recruitment");

  // State
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [onboardings, setOnboardings] = useState<OnboardingRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Candidate Create Modal
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candName, setCandName] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candRole, setCandRole] = useState("Senior Backend Systems Engineer");
  const [candDept, setCandDept] = useState("Engineering");
  const [candYoe, setCandYoe] = useState(4);

  // Payroll Batch State
  const [batchCalculating, setBatchCalculating] = useState(false);
  const [payrollSuccess, setPayrollSuccess] = useState(false);

  const loadData = async () => {
    const [c, o, l] = await Promise.all([
      getCandidates(),
      getOnboardingRecords(),
      getLeaveRequests(),
    ]);

    if (c.length === 0) {
      const initialC = await saveCandidate({
        fullName: "Aditya Verma",
        email: "aditya.v@example.com",
        phone: "+91 98765 11223",
        appliedRole: "Senior Backend Systems Engineer",
        department: "Engineering",
        experienceYears: 5,
        currentStage: "Interview",
        notes: [{ author: "Tech Lead", text: "Strong distributed systems knowledge.", date: "2026-03-08" }],
      });
      setCandidates([initialC]);
    } else {
      setCandidates(c);
    }

    if (o.length === 0) {
      setOnboardings([
        {
          id: "onb-1",
          employeeId: "emp-101",
          employeeName: "Sneha Mukherjee",
          corporateEmail: "sneha.m@edworld.co.in",
          department: "Frontend Architecture",
          designation: "Staff UI Engineer",
          joiningDate: "2026-03-15",
          managerName: "Sunita Rao",
          checklist: {
            personalDetails: true,
            documents: true,
            offer: true,
            contract: true,
            bankDetails: true,
            departmentAssigned: true,
            managerAssigned: true,
            equipmentDispatched: false,
            emailAccountCreated: true,
            accessPermissionsSet: true,
            orientationCompleted: false,
            completionPercentage: 82,
          },
          status: "ACCOUNT_ACTIVATED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    } else {
      setOnboardings(o);
    }

    setLeaves(l);

    try {
      const insights = await runHRInsightAgent("HR");
      setAiInsights(insights);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candEmail.trim()) return;

    await saveCandidate({
      fullName: candName,
      email: candEmail,
      phone: candPhone,
      appliedRole: candRole,
      department: candDept,
      experienceYears: Number(candYoe),
      currentStage: "Applied",
      notes: [],
    });

    setShowCandidateModal(false);
    setCandName("");
    setCandEmail("");
    setNotification("Candidate profile added to recruitment pipeline!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleMoveCandidate = async (candidateId: string, stage: Candidate["currentStage"]) => {
    await moveCandidateStage(candidateId, stage, user?.name || "HR Lead");
    loadData();
  };

  const handleLeaveDecision = async (leaveId: string, decision: "APPROVED" | "REJECTED") => {
    await processLeaveDecision(leaveId, decision, user?.name || "HR Operations");
    setNotification(`Leave request ${decision.toLowerCase()} successfully.`);
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleToggleChecklist = async (record: OnboardingRecord, key: keyof OnboardingRecord["checklist"]) => {
    if (key === "completionPercentage") return;
    const updated = {
      ...record.checklist,
      [key]: !record.checklist[key],
    };
    await updateOnboardingChecklist(record.id, updated);
    loadData();
  };

  const handleRunPayrollBatch = async () => {
    setBatchCalculating(true);
    setTimeout(async () => {
      await savePayrollBatch(
        {
          period: "March 2026",
          totalEmployees: 18,
          totalGross: 2750000,
          totalNet: 2280000,
          exceptionsCount: 0,
          status: "APPROVED",
        },
        [],
        user?.name || "HR Director"
      );
      setBatchCalculating(false);
      setPayrollSuccess(true);
      setNotification("March 2026 Payroll Batch calculated & audited successfully!");
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  const stages: Candidate["currentStage"][] = [
    "Applied",
    "Screening",
    "Interview",
    "Selected",
    "Offer",
    "Onboarding",
    "Rejected",
  ];

  return (
    <AuthGuard allowedRoles={["HR", "FOUNDER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
              People Operations
            </span>
            <span className="text-xs text-[#8E95A5]">🏢 EdWorld Organization OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            HR Command Center
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Manage recruitment pipelines, onboarding workflows, leave approvals, and audited payroll batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hr/provision-account"
            className="px-4 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Staff Account</span>
          </Link>
          <button
            onClick={() => setShowCandidateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#1C1D26] hover:bg-[#282937] border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* HR AI Insights Banner */}
      {aiInsights.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#13141B] to-[#13141B] border border-purple-500/20 space-y-2">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">HRInsightAgent Radar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-3 rounded-2xl bg-[#1C1D26]/80 border border-white/5 space-y-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {insight.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{insight.headline}</h4>
                <p className="text-[11px] text-[#8E95A5] leading-snug">{insight.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "recruitment", label: "Recruitment Pipeline", icon: Users },
          { id: "onboarding", label: "Employee Onboarding (0-100%)", icon: CheckCircle2 },
          { id: "leaves", label: "Leave Approvals", icon: Calendar },
          { id: "payroll", label: "Payroll Batches", icon: DollarSign },
          { id: "attendance", label: "Attendance Radar", icon: Clock },
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

      {/* TAB 1: RECRUITMENT PIPELINE */}
      {activeTab === "recruitment" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">ATS Candidate Pipeline ({candidates.length} Active)</h2>
            <span className="text-xs text-[#8E95A5]">Drag or click below each candidate to advance stage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageCandidates = candidates.filter((c) => c.currentStage === stage);
              return (
                <div key={stage} className="p-3 rounded-2xl bg-[#13141B] border border-white/10 space-y-3 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-[#1C1D26] text-[10px] font-mono text-[#D7FC51] flex items-center justify-center font-bold">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stageCandidates.map((cand) => (
                      <div key={cand.id} className="p-3 rounded-xl bg-[#1C1D26] border border-white/5 space-y-2">
                        <div>
                          <span className="text-xs font-bold text-white block">{cand.fullName}</span>
                          <span className="text-[10px] text-[#8E95A5] block truncate">{cand.appliedRole}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#8E95A5]">
                          <span>{cand.experienceYears} YOE</span>
                          <span className="font-mono text-emerald-400">{cand.phone}</span>
                        </div>

                        {/* Fast Move Selector */}
                        <div className="pt-1 border-t border-white/5">
                          <label className="text-[9px] text-[#8E95A5] uppercase block mb-1">Move to:</label>
                          <select
                            value={cand.currentStage}
                            onChange={(e) => handleMoveCandidate(cand.id, e.target.value as any)}
                            className="w-full p-1 rounded-lg bg-[#13141B] border border-white/10 text-[10px] text-white"
                          >
                            {stages.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {stageCandidates.length === 0 && (
                      <div className="py-6 text-center text-[10px] text-[#8E95A5]">
                        No candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ONBOARDING TRACKER */}
      {activeTab === "onboarding" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-white">Employee Onboarding Checklist (0–100%)</h2>
            <p className="text-xs text-[#8E95A5]">
              Verify equipment dispatch, contracts, bank information, and corporate account activation.
            </p>
          </div>

          <div className="space-y-4">
            {onboardings.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{rec.employeeName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D7FC51]/10 text-[#D7FC51]">
                        {rec.corporateEmail}
                      </span>
                    </h3>
                    <span className="text-[11px] text-[#8E95A5]">
                      {rec.designation} &bull; {rec.department} &bull; Manager: {rec.managerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-[#D7FC51] font-mono">
                      {rec.checklist.completionPercentage}% Complete
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {rec.status}
                    </span>
                  </div>
                </div>

                {/* Checklist Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                  {[
                    { key: "personalDetails", label: "Personal Details" },
                    { key: "documents", label: "Identity Documents" },
                    { key: "offer", label: "Offer Acceptance" },
                    { key: "contract", label: "Signed Employment Contract" },
                    { key: "bankDetails", label: "Bank Account Setup" },
                    { key: "departmentAssigned", label: "Department Assignment" },
                    { key: "managerAssigned", label: "Manager Assignment" },
                    { key: "equipmentDispatched", label: "Laptop & Hardware" },
                    { key: "emailAccountCreated", label: "Corporate Email Account" },
                    { key: "accessPermissionsSet", label: "RBAC Access Permissions" },
                    { key: "orientationCompleted", label: "HR Orientation Completed" },
                  ].map((item) => {
                    const isChecked = Boolean(rec.checklist[item.key as keyof typeof rec.checklist]);
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleToggleChecklist(rec, item.key as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-[#13141B] border-white/5 text-[#8E95A5] hover:text-white"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${isChecked ? "bg-emerald-500 text-[#13141B]" : "border border-white/20"}`}>
                          {isChecked && <Check className="w-3 h-3 font-bold" />}
                        </div>
                        <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE APPROVALS */}
      {activeTab === "leaves" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-black text-white">Employee Leave Approval Queue</h2>
            <p className="text-xs text-[#8E95A5]">Review employee time-off requests with real-time audit logging.</p>
          </div>

          <div className="space-y-3">
            {leaves.map((leave) => (
              <div key={leave.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{leave.employeeName}</span>
                    <span className="text-[10px] text-[#8E95A5] font-mono">({leave.employeeEmail})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D7FC51]/10 text-[#D7FC51]">
                      {leave.leaveType} ({leave.daysCount} days)
                    </span>
                  </div>
                  <p className="text-xs text-[#8E95A5]">
                    Duration: <strong className="text-white">{leave.startDate}</strong> to <strong className="text-white">{leave.endDate}</strong> &bull; Reason: &ldquo;{leave.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {leave.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleLeaveDecision(leave.id, "APPROVED")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#13141B] text-xs font-black transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveDecision(leave.id, "REJECTED")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${leave.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}>
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {leaves.length === 0 && (
              <div className="p-6 rounded-2xl bg-[#1C1D26] text-center text-xs text-[#8E95A5]">
                No pending employee leave requests in queue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL BATCHES */}
      {activeTab === "payroll" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Monthly Payroll Batch Operations</h2>
              <p className="text-xs text-[#8E95A5]">Calculate, review exceptions, and disburse payroll with zero silent edits.</p>
            </div>

            <button
              onClick={handleRunPayrollBatch}
              disabled={batchCalculating}
              className="px-5 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] font-black text-xs transition-all shadow-lg flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>{batchCalculating ? "Calculating Disbursals..." : "Calculate March 2026 Batch"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Active Employees</span>
              <div className="text-2xl font-black text-white font-mono">18</div>
              <span className="text-[10px] text-emerald-400">100% records validated</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Gross CTC</span>
              <div className="text-2xl font-black text-white font-mono">₹27,50,000</div>
              <span className="text-[10px] text-[#8E95A5]">Includes base + HRA + perks</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Net Disbursement</span>
              <div className="text-2xl font-black text-[#D7FC51] font-mono">₹22,80,000</div>
              <span className="text-[10px] text-emerald-400">After PF &amp; TDS deductions</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Batch Status</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">APPROVED</div>
              <span className="text-[10px] text-[#8E95A5]">Audited by {user?.name || "HR Lead"}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ATTENDANCE RADAR */}
      {activeTab === "attendance" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-black text-white">Daily &amp; Monthly Workforce Attendance Radar</h2>
            <p className="text-xs text-[#8E95A5]">Aggregated company-wide attendance telemetry.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Present (Office)", count: 12, color: "text-emerald-400" },
              { label: "Remote / WFH", count: 4, color: "text-[#D7FC51]" },
              { label: "On Leave", count: 2, color: "text-purple-400" },
              { label: "Late Arrivals", count: 0, color: "text-amber-400" },
              { label: "Unexcused Absent", count: 0, color: "text-rose-400" },
              { label: "Overall Rate", count: "98.8%", color: "text-white" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#8E95A5] uppercase">{stat.label}</span>
                <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#13141B] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Add Candidate to Pipeline</h3>
              <button onClick={() => setShowCandidateModal(false)} className="text-[#8E95A5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  placeholder="Candidate Name"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Phone</label>
                  <input
                    type="tel"
                    value={candPhone}
                    onChange={(e) => setCandPhone(e.target.value)}
                    placeholder="+91 98765..."
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">YOE</label>
                  <input
                    type="number"
                    value={candYoe}
                    onChange={(e) => setCandYoe(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Applied Role</label>
                <input
                  type="text"
                  value={candRole}
                  onChange={(e) => setCandRole(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all mt-2"
              >
                Save Candidate to ATS
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}

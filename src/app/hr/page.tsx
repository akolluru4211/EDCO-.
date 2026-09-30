"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  getCandidates, 
  saveCandidate,
  moveCandidateStage, 
  getTeamDirectory, 
  getLeaveRequests, 
  processLeaveDecision,
  getEmployeePayrollRecords,
  getEmployeeDocuments
} from "@/lib/db-service";
import { runHRInsightAgent, runRecruitmentAgent, AgentInsight } from "@/lib/ai-agents";
import { logInternalAction } from "@/lib/services/internal-audit-service";
import { 
  Candidate, 
  CandidateStage,
  TeamMember, 
  LeaveRequest, 
  PayrollRecord, 
  EmployeeDocument 
} from "@/lib/types";
import { 
  Users, 
  UserPlus, 
  FileCheck, 
  DollarSign, 
  FolderLock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronRight,
  ExternalLink,
  Briefcase
} from "lucide-react";

type HRTab = "recruitment" | "people" | "compensation" | "documents" | "ai_assistant";

const PIPELINE_STAGES: CandidateStage[] = [
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Offer",
  "Onboarding",
  "Rejected"
];

export default function HRWorkspacePage() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<HRTab>("recruitment");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [newCandPhone, setNewCandPhone] = useState("");
  const [newCandRole, setNewCandRole] = useState("");
  const [newCandDept, setNewCandDept] = useState("Engineering");
  const [newCandExp, setNewCandExp] = useState(2);

  const isAuthorized = 
    role === "HR" || 
    role === "FOUNDER" || 
    role === "SUPER_ADMIN" || 
    role === "ADMIN" ||
    user?.role === "HR" ||
    user?.role === "FOUNDER";

  const effectiveRole = (role === "HR" || role === "FOUNDER" || role === "ADMIN" || role === "SUPER_ADMIN") ? role : "HR";

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace("/login");
    }
  }, [authLoading, isAuthorized, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candData, teamData, leaveData, payrollData, docData] = await Promise.all([
        getCandidates(),
        getTeamDirectory(),
        getLeaveRequests(),
        getEmployeePayrollRecords(user?.uid || "", true),
        getEmployeeDocuments()
      ]);
      setCandidates(candData);
      setTeam(teamData);
      setLeaves(leaveData);
      setPayroll(payrollData);
      setDocuments(docData);
    } catch (err) {
      console.error("Failed to load HR workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const [hrInsights, recInsights] = await Promise.all([
        runHRInsightAgent(role || "HR"),
        runRecruitmentAgent(role || "HR")
      ]);
      const combined = [...hrInsights, ...recInsights];
      setAiInsights(combined);
      if (user) {
        await logInternalAction({
          actorUserId: user.uid,
          actorRole: effectiveRole,
          action: "AI_HR_SCREENING_RUN",
          resourceType: "candidate",
          metadata: { generatedCount: combined.length }
        });
      }
    } catch (err) {
      console.error("Failed to run HR AI:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandEmail.trim() || !user) return;
    try {
      const created = await saveCandidate({
        fullName: newCandName.trim(),
        email: newCandEmail.trim(),
        phone: newCandPhone.trim(),
        appliedRole: newCandRole.trim() || "Software Engineer",
        department: newCandDept,
        experienceYears: Number(newCandExp) || 0,
        currentStage: "Applied",
        notes: []
      });
      setCandidates(prev => [created, ...prev]);
      setShowAddCandidate(false);
      setNewCandName("");
      setNewCandEmail("");
      setNewCandPhone("");
      setNewCandRole("");
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "CANDIDATE_CREATE",
        resourceType: "candidate",
        resourceId: created.id,
        metadata: { fullName: created.fullName, appliedRole: created.appliedRole }
      });
    } catch (err) {
      console.error("Error creating candidate:", err);
    }
  };

  const handleMoveStage = async (candidateId: string, newStage: CandidateStage) => {
    try {
      const updated = await moveCandidateStage(candidateId, newStage, user?.name || "HR Operations");
      if (updated) {
        setCandidates(prev => prev.map(c => (c.id === candidateId ? updated : c)));
      }
      if (user) {
        await logInternalAction({
          actorUserId: user.uid,
          actorRole: effectiveRole,
          action: "CANDIDATE_STAGE_MOVE",
          resourceType: "candidate",
          resourceId: candidateId,
          metadata: { newStage }
        });
      }
    } catch (err) {
      console.error("Error moving candidate stage:", err);
    }
  };

  const handleLeaveDecision = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const updated = await processLeaveDecision(leaveId, status, user?.name || "HR Operations");
      if (updated) {
        setLeaves(prev => prev.map(l => (l.id === leaveId ? updated : l)));
      }
      if (user) {
        await logInternalAction({
          actorUserId: user.uid,
          actorRole: effectiveRole,
          action: status === "APPROVED" ? "LEAVE_APPROVE" : "LEAVE_REJECT",
          resourceType: "leave_request",
          resourceId: leaveId,
          metadata: { status }
        });
      }
    } catch (err) {
      console.error("Error updating leave request:", err);
    }
  };

  if (authLoading || (!isAuthorized && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] flex items-center justify-center text-[#5E6573]">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-[#EBECEF] shadow-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold text-[#13141B]">Verifying HR Authentication &amp; RBAC Permissions...</span>
        </div>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(c => {
    const matchesStage = filterStage === "ALL" || c.currentStage === filterStage;
    const matchesQuery = 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1536px] mx-auto font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#13141B] text-white flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HR TALENT &amp; PEOPLE OPERATIONS</span>
            </span>
            <span className="text-xs text-[#5E6573] font-mono">
              Strict RBAC Verified &bull; Real Database Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13141B] tracking-tight">
            Human Resources Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Candidate pipelines, team roster, leave approvals, payroll disbursals, and staff provisioning.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button 
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? "Analyzing..." : "Claude HR Radar"}</span>
          </button>
          <Link
            href="/hr/provision-account"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Provision Staff Account</span>
          </Link>
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

      {/* KPI Stats Row (Real Postgres Records Only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Active Candidates</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{candidates.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Live Inbound Pipeline</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Staff Headcount</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{team.length}</div>
          <span className="text-[11px] text-[#5E6573] font-semibold mt-1 block">Verified Directory</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Pending Leaves</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {leaves.filter(l => l.status === "PENDING").length}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Requires Decision</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#EBECEF] shadow-xs">
          <span className="text-xs font-bold text-[#5E6573] uppercase tracking-wider block">Payroll Records</span>
          <div className="text-2xl sm:text-3xl font-black text-[#13141B] mt-1">{payroll.length}</div>
          <span className="text-[11px] text-[#5E6573] font-semibold mt-1 block">Current Pay Cycle</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#EBECEF] gap-2 overflow-x-auto pb-px">
        {[
          { id: "recruitment", label: "Recruitment Pipeline", icon: UserPlus, count: candidates.length },
          { id: "people", label: "Staff & Leaves", icon: Users, count: leaves.filter(l => l.status === "PENDING").length },
          { id: "compensation", label: "Payroll & Compensation", icon: DollarSign, count: payroll.length },
          { id: "documents", label: "Policy & Documents", icon: FolderLock, count: documents.length },
          { id: "ai_assistant", label: "Claude AI Talent Copilot", icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HRTab)}
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

      {/* Main Tab Content */}
      <main>
        {loading ? (
          <div className="py-24 text-center text-[#5E6573] bg-white rounded-3xl border border-[#EBECEF]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
            <p className="text-sm font-bold text-[#13141B]">Loading verified HR data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: RECRUITMENT PIPELINE */}
            {activeTab === "recruitment" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-[#5E6573] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search candidates by name, role, email..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-[#13141B] placeholder:text-[#8E95A5] text-xs focus:outline-none focus:border-[#13141B]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={filterStage}
                        onChange={e => setFilterStage(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-[#13141B] text-xs font-semibold focus:outline-none focus:border-[#13141B]"
                      >
                        <option value="ALL">All Stages ({candidates.length})</option>
                        {PIPELINE_STAGES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => setShowAddCandidate(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Candidate
                      </button>
                    </div>
                  </div>

                  {filteredCandidates.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <UserPlus className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-sm font-bold text-[#13141B]">No candidate applications found</p>
                      <p className="text-xs text-[#5E6573] mt-1">Inbound applicants and scheduled candidates will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {filteredCandidates.map(cand => (
                        <div key={cand.id} className="p-5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="text-sm font-bold text-[#13141B]">{cand.fullName}</h3>
                                <p className="text-xs text-indigo-700 font-semibold">{cand.appliedRole}</p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white text-[#13141B] border border-[#EBECEF] font-bold">
                                {cand.experienceYears}y exp
                              </span>
                            </div>
                            <p className="text-xs text-[#5E6573] mb-1 font-mono">{cand.email} • {cand.phone}</p>
                            <p className="text-xs text-[#5E6573] mb-4">Department: <strong className="text-[#13141B]">{cand.department}</strong></p>
                          </div>

                          <div className="pt-3 border-t border-[#EBECEF]">
                            <label className="block text-[10px] uppercase font-bold text-[#5E6573] mb-1.5">
                              Stage Progression
                            </label>
                            <select
                              value={cand.currentStage}
                              onChange={e => handleMoveStage(cand.id, e.target.value as CandidateStage)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E8ECF2] text-xs font-bold text-[#13141B] focus:outline-none focus:border-[#13141B]"
                            >
                              {PIPELINE_STAGES.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: STAFF & LEAVES */}
            {activeTab === "people" && (
              <div className="space-y-6">
                {/* Pending Leaves Radar */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B]">Pending Leave Requests</h2>
                      <p className="text-xs text-[#5E6573]">Review time-off requests submitted by team members</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {leaves.filter(l => l.status === "PENDING").length} Pending
                    </span>
                  </div>

                  {leaves.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No leave requests in queue</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaves.map(req => (
                        <div key={req.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-[#13141B]">{req.employeeName}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#EBECEF] text-[#13141B] font-bold">
                                {req.leaveType} ({req.daysCount} Days)
                              </span>
                            </div>
                            <p className="text-xs text-[#5E6573] mt-1">
                              Duration: <strong className="text-[#13141B]">{req.startDate}</strong> to <strong className="text-[#13141B]">{req.endDate}</strong> • Department: {req.department}
                            </p>
                            <p className="text-xs text-[#13141B] mt-1.5 italic">"{req.reason}"</p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {req.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleLeaveDecision(req.id, "APPROVED")}
                                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleLeaveDecision(req.id, "REJECTED")}
                                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            ) : (
                              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                                req.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team Directory */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B]">Employee &amp; Staff Directory</h2>
                      <p className="text-xs text-[#5E6573]">Total headcount: {team.length} active staff accounts</p>
                    </div>
                    <Link
                      href="/hr/provision-account"
                      className="px-3.5 py-1.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] border border-[#E8ECF2] text-xs font-bold text-[#13141B] transition flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Provision Staff</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] flex items-start gap-3 shadow-2xs">
                        <div className="w-10 h-10 rounded-xl bg-[#13141B] flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold text-[#13141B] truncate">{member.name}</h3>
                          <p className="text-xs text-indigo-700 font-semibold truncate">{member.designation}</p>
                          <p className="text-[11px] text-[#5E6573] truncate font-mono mt-0.5">{member.workEmail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COMPENSATION */}
            {activeTab === "compensation" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#13141B]">Payroll &amp; Disbursal Records</h2>
                    <p className="text-xs text-[#5E6573]">Salary disbursement records with internal audit logging</p>
                  </div>

                  {payroll.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No payroll records logged in current cycle</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-[#EBECEF]">
                      <table className="w-full text-xs text-left text-[#13141B]">
                        <thead className="bg-[#F4F6FB] text-[#5E6573] uppercase text-[10px] border-b border-[#EBECEF] font-bold">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Pay Period</th>
                            <th className="py-3 px-4">Net Pay</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBECEF] bg-white">
                          {payroll.map(rec => (
                            <tr key={rec.id} className="hover:bg-[#FCFCFB]">
                              <td className="py-3 px-4 font-bold text-[#13141B]">{rec.employeeName}</td>
                              <td className="py-3 px-4 text-[#5E6573]">{rec.department}</td>
                              <td className="py-3 px-4 text-[#5E6573]">{rec.payPeriod}</td>
                              <td className="py-3 px-4 text-emerald-700 font-bold font-mono">₹{rec.netPay.toLocaleString("en-IN")}</td>
                              <td className="py-3 px-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                  rec.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {rec.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#13141B]">HR Documents &amp; Company Policies</h2>
                    <p className="text-xs text-[#5E6573]">Official contracts, compliance guidelines, and staff handbooks</p>
                  </div>

                  {documents.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <FolderLock className="w-8 h-8 mx-auto mb-2 text-[#8E95A5]" />
                      <p className="text-xs font-semibold text-[#5E6573]">No company documents uploaded</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map(doc => (
                        <div key={doc.id} className="p-4 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] flex items-start gap-3 shadow-2xs">
                          <FileCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-bold text-[#13141B] truncate">{doc.title}</h3>
                            <p className="text-[11px] text-indigo-700 font-semibold">{doc.documentType}</p>
                            <p className="text-[10px] text-[#5E6573] mt-1 font-mono">{doc.fileSize} &bull; {doc.visibility}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: AI RADAR */}
            {activeTab === "ai_assistant" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBECEF] shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold text-[#13141B] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Claude AI Talent &amp; Pipeline Radar
                      </h2>
                      <p className="text-xs text-[#5E6573] mt-1">
                        Automated recruitment screening, onboarding checklist anomaly detection, and leave queue analysis.
                      </p>
                    </div>
                    <button
                      onClick={handleRunAiAnalysis}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 self-start sm:self-auto cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                      <span>{aiLoading ? "Analyzing..." : "Run AI Pipeline Analysis"}</span>
                    </button>
                  </div>

                  {aiInsights.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#EBECEF] rounded-2xl bg-[#FCFCFB] text-[#5E6573]">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                      <p className="text-sm font-bold text-[#13141B]">No HR AI insights generated in current session</p>
                      <p className="text-xs text-[#5E6573] mt-1 mb-4">Run the talent radar agent to review applicant pipeline bottlenecks and time-off distributions.</p>
                      <button
                        onClick={handleRunAiAnalysis}
                        className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Analyze Pipeline Now
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
                                insight.category === "OPPORTUNITY" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
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
                            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
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

      {/* MODAL: Add Candidate */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#EBECEF] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-extrabold text-[#13141B] mb-4">Add New Candidate</h3>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newCandName}
                  onChange={e => setNewCandName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newCandEmail}
                  onChange={e => setNewCandEmail(e.target.value)}
                  placeholder="priya@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCandPhone}
                    onChange={e => setNewCandPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Exp (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCandExp}
                    onChange={e => setNewCandExp(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Applied Role</label>
                  <input
                    type="text"
                    value={newCandRole}
                    onChange={e => setNewCandRole(e.target.value)}
                    placeholder="Full Stack Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">Department</label>
                  <select
                    value={newCandDept}
                    onChange={e => setNewCandDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] font-semibold focus:outline-none focus:border-[#13141B]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] text-[#5E6573] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

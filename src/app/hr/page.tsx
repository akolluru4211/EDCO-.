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
  RefreshCw
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Verifying HR Authentication & RBAC Permissions...</span>
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/10 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">HR Command Center</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STRICT RBAC VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                EdWorld Co. People & Talent Operations • Signed in as {profile?.name || user?.name || user?.email} ({role})
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button 
              onClick={handleRunAiAnalysis}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? "Analyzing..." : "Claude HR Radar"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium border border-slate-700 transition"
            >
              Main Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex overflow-x-auto gap-2 scrollbar-none border-t border-slate-800/60 pt-2">
          {[
            { id: "recruitment", label: "Recruitment Pipeline", icon: UserPlus },
            { id: "people", label: "Staff & Leaves", icon: Users },
            { id: "compensation", label: "Payroll & Compensation", icon: DollarSign },
            { id: "documents", label: "Policy & Documents", icon: FolderLock },
            { id: "ai_assistant", label: "Claude AI Talent Copilot", icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as HRTab)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-xl" 
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
            <p className="text-sm sm:text-base">Loading verified HR data & telemetry...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: RECRUITMENT PIPELINE */}
            {activeTab === "recruitment" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative w-full">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search candidates by name, role, email..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterStage}
                      onChange={e => setFilterStage(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">All Stages ({candidates.length})</option>
                      {PIPELINE_STAGES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setShowAddCandidate(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Candidate
                    </button>
                  </div>
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40 text-slate-400">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">No candidate applications found</p>
                    <p className="text-xs text-slate-500 mt-1">Inbound applicants and scheduled interview candidates will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidates.map(cand => (
                      <div key={cand.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-sm font-semibold text-white">{cand.fullName}</h3>
                              <p className="text-xs text-indigo-400 font-medium">{cand.appliedRole}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {cand.experienceYears}y exp
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">{cand.email} • {cand.phone}</p>
                          <p className="text-xs text-slate-500 mb-4">Department: {cand.department}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80">
                          <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1.5">
                            Stage Progression
                          </label>
                          <select
                            value={cand.currentStage}
                            onChange={e => handleMoveStage(cand.id, e.target.value as CandidateStage)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            )}

            {/* TAB 2: STAFF & LEAVES */}
            {activeTab === "people" && (
              <div className="space-y-6">
                {/* Pending Leaves Radar */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Pending Leave Requests</h2>
                      <p className="text-xs text-slate-400">Review time-off requests submitted by team members</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {leaves.filter(l => l.status === "PENDING").length} Pending
                    </span>
                  </div>

                  {leaves.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No leave requests in queue</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaves.map(req => (
                        <div key={req.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">{req.employeeName}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {req.leaveType} ({req.daysCount} Days)
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Duration: {req.startDate} to {req.endDate} • Department: {req.department}
                            </p>
                            <p className="text-xs text-slate-300 mt-1.5 italic">"{req.reason}"</p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {req.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleLeaveDecision(req.id, "APPROVED")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleLeaveDecision(req.id, "REJECTED")}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            ) : (
                              <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
                                req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
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
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">Employee Directory</h2>
                  <p className="text-xs text-slate-400 mb-4">Total headcount: {team.length} active personnel</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs border border-slate-700 shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-semibold text-white truncate">{member.name}</h3>
                          <p className="text-xs text-indigo-400 truncate">{member.designation}</p>
                          <p className="text-[11px] text-slate-500 truncate">{member.workEmail}</p>
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
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">Payroll & Disbursal Records</h2>
                  <p className="text-xs text-slate-400 mb-4">Verified salary disbursement records with audit logging</p>

                  {payroll.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No payroll records logged in current cycle</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Employee</th>
                            <th className="py-2.5 px-3">Department</th>
                            <th className="py-2.5 px-3">Pay Period</th>
                            <th className="py-2.5 px-3">Net Pay</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {payroll.map(rec => (
                            <tr key={rec.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-medium text-white">{rec.employeeName}</td>
                              <td className="py-2.5 px-3 text-slate-400">{rec.department}</td>
                              <td className="py-2.5 px-3 text-slate-400">{rec.payPeriod}</td>
                              <td className="py-2.5 px-3 text-emerald-400 font-semibold">₹{rec.netPay.toLocaleString("en-IN")}</td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  rec.paymentStatus === "PAID" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
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
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <h2 className="text-base font-semibold text-white mb-1">HR Documents & Company Policies</h2>
                  <p className="text-xs text-slate-400 mb-4">Official contracts, policies, and employee handbooks</p>

                  {documents.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <FolderLock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs text-slate-400">No company documents available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {documents.map(doc => (
                        <div key={doc.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                          <FileCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs font-semibold text-white truncate">{doc.title}</h3>
                            <p className="text-[11px] text-indigo-400">{doc.documentType}</p>
                            <p className="text-[10px] text-slate-500 mt-1">{doc.fileSize} • {doc.visibility}</p>
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
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Claude AI Talent & Pipeline Radar
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Automated recruitment screening, onboarding checklist anomaly detection, and leave queue analysis.
                      </p>
                    </div>
                    <button
                      onClick={handleRunAiAnalysis}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                      {aiLoading ? "Analyzing..." : "Run AI Pipeline Analysis"}
                    </button>
                  </div>

                  {aiInsights.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No HR AI insights generated in current session</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Click above to run real-time candidate and operational checks.</p>
                      <button
                        onClick={handleRunAiAnalysis}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        Run HR Intelligence Scan
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
                                insight.category === "OPPORTUNITY" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                                "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              }`}>
                                {insight.category}
                              </span>
                              <h3 className="text-sm font-semibold text-white">{insight.headline}</h3>
                            </div>
                            <span className="text-[10px] text-slate-500">{insight.agentName}</span>
                          </div>
                          <p className="text-xs text-slate-300 mb-3">{insight.detail}</p>
                          {insight.actionableStep && (
                            <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span><strong>Recommended Action:</strong> {insight.actionableStep}</span>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Pipeline Candidate</h3>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newCandName}
                  onChange={e => setNewCandName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCandEmail}
                    onChange={e => setNewCandEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCandPhone}
                    onChange={e => setNewCandPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Applied Role</label>
                  <input
                    type="text"
                    value={newCandRole}
                    onChange={e => setNewCandRole(e.target.value)}
                    placeholder="e.g., Frontend Engineer"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                  <select
                    value={newCandDept}
                    onChange={e => setNewCandDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Growth">Growth</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCandidate(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

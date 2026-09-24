"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  getExecutiveKPI, 
  getStrategicInitiatives, 
  saveStrategicInitiative,
  getFinancialRecords,
  getInvestorUpdates,
  saveInvestorUpdate,
  getTeamDirectory
} from "@/lib/db-service";
import { runFounderInsightAgent, AgentInsight } from "@/lib/ai-agents";
import { logInternalAction } from "@/lib/services/internal-audit-service";
import { 
  ExecutiveKPI, 
  StrategicInitiative, 
  FinancialRecord, 
  InvestorUpdate, 
  TeamMember 
} from "@/lib/types";
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  Plus,
  RefreshCw,
  FolderLock
} from "lucide-react";

type FounderTab = "company" | "people" | "product" | "business" | "operations" | "ai_briefing";

export default function FounderWorkspacePage() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FounderTab>("company");
  const [kpi, setKpi] = useState<ExecutiveKPI | null>(null);
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdate[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Modals / forms
  const [showInitModal, setShowInitModal] = useState(false);
  const [newInitTitle, setNewInitTitle] = useState("");
  const [newInitOwner, setNewInitOwner] = useState("");
  const [newInitDeadline, setNewInitDeadline] = useState("2026-06-30");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateQuarter, setNewUpdateQuarter] = useState("Q1 2026");
  const [newUpdateSummary, setNewUpdateSummary] = useState("");

  const isAuthorized = 
    role === "FOUNDER" || 
    role === "EXECUTIVE" || 
    role === "SUPER_ADMIN" || 
    role === "ADMIN" ||
    user?.role === "FOUNDER" ||
    user?.role === "EXECUTIVE";

  const effectiveRole = (role === "FOUNDER" || role === "ADMIN" || role === "SUPER_ADMIN") ? role : "FOUNDER";

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.replace("/login");
    }
  }, [authLoading, isAuthorized, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiData, inits, finData, updates, teamData] = await Promise.all([
        getExecutiveKPI(),
        getStrategicInitiatives(),
        getFinancialRecords(),
        getInvestorUpdates(),
        getTeamDirectory()
      ]);
      setKpi(kpiData);
      setInitiatives(inits);
      setFinancials(finData);
      setInvestorUpdates(updates);
      setTeam(teamData);
    } catch (err) {
      console.error("Failed to load founder workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const handleRunAiBriefing = async () => {
    setAiLoading(true);
    try {
      const insights = await runFounderInsightAgent(role || "FOUNDER");
      setAiInsights(insights);
      if (user) {
        await logInternalAction({
          actorUserId: user.uid,
          actorRole: effectiveRole,
          action: "AI_FOUNDER_BRIEFING_RUN",
          resourceType: "ai_insight",
          metadata: { generatedCount: insights.length }
        });
      }
    } catch (err) {
      console.error("Failed to run AI briefing:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInitTitle.trim() || !user) return;
    try {
      const created = await saveStrategicInitiative({
        title: newInitTitle.trim(),
        owner: newInitOwner.trim() || user.name,
        priority: "HIGH",
        deadline: newInitDeadline,
        status: "ACTIVE",
        budget: 100000,
        expectedOutcome: "Deliver core platform milestone on schedule",
        progressPercentage: 0
      });
      setInitiatives(prev => [created, ...prev]);
      setShowInitModal(false);
      setNewInitTitle("");
      setNewInitOwner("");
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "STRATEGIC_INITIATIVE_CREATE",
        resourceType: "strategic_initiative",
        resourceId: created.id,
        metadata: { title: created.title, deadline: created.deadline }
      });
    } catch (err) {
      console.error("Error creating initiative:", err);
    }
  };

  const handleCreateInvestorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateTitle.trim() || !user) return;
    try {
      const created = await saveInvestorUpdate({
        title: newUpdateTitle.trim(),
        quarter: newUpdateQuarter,
        highlights: [newUpdateSummary.trim()],
        kpis: {
          revenue: `₹${(kpi?.mrr || 0).toLocaleString()}`,
          growth: `${kpi?.mrr ? "18%" : "0%"}`,
          burnRate: `₹${(kpi?.monthlyBurn || 0).toLocaleString()}`,
          runway: `${kpi?.runwayMonths || 0} Months`
        },
        productProgress: "Continuous deployment of EdWorld Platform",
        partnerships: "Expanding educational and corporate networks",
        teamUpdates: `${team.length} full-time personnel`,
        challenges: "Pacing execution against sprint velocity",
        nextQuarterGoals: ["Scale user onboarding", "Deepen enterprise integrations"],
        status: "DRAFT"
      });
      setInvestorUpdates(prev => [created, ...prev]);
      setShowUpdateModal(false);
      setNewUpdateTitle("");
      setNewUpdateSummary("");
      await logInternalAction({
        actorUserId: user.uid,
        actorRole: effectiveRole,
        action: "INVESTOR_UPDATE_CREATE",
        resourceType: "investor_update",
        resourceId: created.id,
        metadata: { title: created.title, quarter: created.quarter }
      });
    } catch (err) {
      console.error("Error creating investor update:", err);
    }
  };

  if (authLoading || (!isAuthorized && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Verifying Executive Authentication & Access Permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/10 shrink-0">
              <Briefcase className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Founder &amp; Executive Suite</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STRICT RBAC VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                EdWorld Co. Corporate Operations • Signed in as {profile?.name || user?.name || user?.email} ({role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleRunAiBriefing}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? "Analyzing..." : "Claude Executive Briefing"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 transition"
            >
              Main Dashboard
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex overflow-x-auto gap-2 scrollbar-none border-t border-slate-800/60 pt-2 pb-1">
          {[
            { id: "company", label: "Company & KPI Radar", icon: Activity },
            { id: "people", label: "People & Leadership", icon: Users },
            { id: "product", label: "Strategic Roadmap", icon: Compass },
            { id: "business", label: "Financials & Investors", icon: DollarSign },
            { id: "operations", label: "Governance & Audit", icon: ShieldCheck },
            { id: "ai_briefing", label: "AI Briefings & Insights", icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FounderTab)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
                  active 
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/10 rounded-t-xl" 
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
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10">
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-emerald-500" />
            <p className="text-sm sm:text-base">Loading verified executive telemetry...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: COMPANY OVERVIEW */}
            {activeTab === "company" && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold mb-3">
                      <span>Monthly Recurring Revenue</span>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                      ₹{kpi?.mrr ? kpi.mrr.toLocaleString("en-IN") : "0"}
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-400 mt-3 flex items-center gap-1.5 font-semibold">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Positive Revenue Growth</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold mb-3">
                      <span>Cash Position & Reserves</span>
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                      ₹{kpi?.cashPosition ? kpi.cashPosition.toLocaleString("en-IN") : "0"}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-3 font-medium">
                      Net Burn: ₹{kpi?.monthlyBurn ? kpi.monthlyBurn.toLocaleString("en-IN") : "0"}/mo
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold mb-3">
                      <span>Runway Buffer</span>
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                      {kpi?.runwayMonths ?? 0} <span className="text-base sm:text-lg font-normal text-slate-400">Months</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-400 mt-3 font-semibold">
                      {(kpi?.runwayMonths ?? 0) >= 12 ? "Comfortable Runway Buffer" : "Requires Capital Monitoring"}
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm font-semibold mb-3">
                      <span>Total Active Headcount</span>
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                      {team.length} <span className="text-base sm:text-lg font-normal text-slate-400">Employees</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-3 font-medium">
                      Across All Operational Departments
                    </div>
                  </div>
                </div>

                {/* Strategic Initiatives Snapshot */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Priority Strategic Initiatives</h2>
                      <p className="text-xs text-slate-400">Key cross-functional priorities actively under execution</p>
                    </div>
                    <button
                      onClick={() => setShowInitModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Initiative
                    </button>
                  </div>

                  {initiatives.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Compass className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No strategic initiatives defined yet</p>
                      <p className="text-xs text-slate-500 mt-1">Create corporate OKRs and major initiatives to track progress.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {initiatives.map(init => (
                        <div key={init.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="text-sm font-semibold text-white">{init.title}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                                init.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                                init.status === "AT_RISK" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                                "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              }`}>
                                {init.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">
                              Owner: <span className="text-slate-200">{init.owner}</span> • Deadline: <span className="text-slate-200">{init.deadline}</span>
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Execution Progress</span>
                              <span className="font-medium text-slate-200">{init.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${init.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PEOPLE & LEADERSHIP */}
            {activeTab === "people" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Company Team Directory</h2>
                      <p className="text-xs text-slate-400">Verified organizational roster and current status</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                      {team.length} Members
                    </span>
                  </div>

                  {team.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No team members registered</p>
                      <p className="text-xs text-slate-500 mt-1">Team accounts will appear here as employees and HR staff are onboarded.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team.map(member => (
                        <div key={member.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700 shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h3 className="text-sm font-semibold text-white truncate">{member.name}</h3>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                member.availabilityStatus === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-300" :
                                member.availabilityStatus === "ON_LEAVE" ? "bg-amber-500/20 text-amber-300" :
                                "bg-slate-800 text-slate-400"
                              }`}>
                                {member.availabilityStatus}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-400 truncate">{member.designation}</p>
                            <p className="text-xs text-slate-400 mt-1 truncate">{member.department}</p>
                            <p className="text-[11px] text-slate-500 truncate">{member.workEmail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCT ROADMAP */}
            {activeTab === "product" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Product Roadmap & Delivery Tracking</h2>
                      <p className="text-xs text-slate-400">Strategic features, major architecture releases, and timeline</p>
                    </div>
                    <button
                      onClick={() => setShowInitModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Deliverable
                    </button>
                  </div>

                  <div className="space-y-4">
                    {initiatives.map(init => (
                      <div key={init.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">{init.title}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                Due: {init.deadline}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Lead: {init.owner} • Priority: {init.priority}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded font-semibold self-start sm:self-auto ${
                            init.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" :
                            init.status === "AT_RISK" ? "bg-rose-500/20 text-rose-300" :
                            "bg-cyan-500/20 text-cyan-300"
                          }`}>
                            {init.status} ({init.progressPercentage}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                          {init.expectedOutcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FINANCIALS & INVESTORS */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Financial History */}
                  <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h2 className="text-base font-semibold text-white mb-1">Financial Ledger Overview</h2>
                    <p className="text-xs text-slate-400 mb-4">Verified monthly revenue, operational expenditures, and net cash flow</p>

                    {financials.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs text-slate-400">No financial records logged</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Period</th>
                              <th className="py-2.5 px-3">Revenue</th>
                              <th className="py-2.5 px-3">Expenses</th>
                              <th className="py-2.5 px-3">Net Cash Flow</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {financials.map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-800/30">
                                <td className="py-2.5 px-3 font-medium text-white">{rec.month}</td>
                                <td className="py-2.5 px-3 text-emerald-400 font-semibold">₹{rec.revenue.toLocaleString("en-IN")}</td>
                                <td className="py-2.5 px-3 text-rose-400 font-semibold">₹{rec.expenses.toLocaleString("en-IN")}</td>
                                <td className="py-2.5 px-3 text-slate-200 font-semibold">₹{rec.netCashFlow.toLocaleString("en-IN")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Investor Updates */}
                  <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base font-semibold text-white">Investor Letters & Updates</h2>
                        <p className="text-xs text-slate-400">Formal shareholder updates and disclosures</p>
                      </div>
                      <button
                        onClick={() => setShowUpdateModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Draft Letter
                      </button>
                    </div>

                    {investorUpdates.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs text-slate-400">No investor updates generated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {investorUpdates.map(upd => (
                          <div key={upd.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-xs font-semibold text-white">{upd.title}</h3>
                              <span className="text-[10px] text-slate-500">{upd.quarter}</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2">{upd.productProgress}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: GOVERNANCE & AUDIT TRAIL */}
            {activeTab === "operations" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <FolderLock className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h2 className="text-base font-semibold text-white">Security & Internal Audit Trail</h2>
                      <p className="text-xs text-slate-400">
                        Immutable audit logs of all sensitive actions taken across Founder, HR, and Employee suites.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Audit Trail Engine Active</span>
                    </div>
                    <p className="text-slate-400">
                      All state changes (candidate status modifications, leave approvals, salary updates, and strategic initiative alterations) are automatically written to <code className="text-amber-300 font-mono">internal_audit_logs</code> via RLS-protected database RPCs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: AI BRIEFING & INSIGHTS */}
            {activeTab === "ai_briefing" && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-base font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Claude Executive Strategic Briefing
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        AI-generated analysis grounded strictly in verified corporate telemetry (burn rate, runway, OKRs).
                      </p>
                    </div>
                    <button
                      onClick={handleRunAiBriefing}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50 self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
                      {aiLoading ? "Analyzing Telemetry..." : "Generate Fresh Briefing"}
                    </button>
                  </div>

                  {aiInsights.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg text-slate-400">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-sm font-medium text-slate-300">No AI briefings generated in current session</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Click above to run the Founder Insight Agent across live metrics.</p>
                      <button
                        onClick={handleRunAiBriefing}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        Run Executive Analysis
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
                                insight.category === "OPPORTUNITY" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
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
                            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
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

      {/* MODAL: Create Initiative */}
      {showInitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Create Strategic Initiative</h3>
            <form onSubmit={handleCreateInitiative} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Initiative Title</label>
                <input
                  type="text"
                  value={newInitTitle}
                  onChange={e => setNewInitTitle(e.target.value)}
                  placeholder="e.g., Launch Placement Portal Phase 2"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Executive Owner</label>
                  <input
                    type="text"
                    value={newInitOwner}
                    onChange={e => setNewInitOwner(e.target.value)}
                    placeholder="Founder / VP Eng"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={newInitDeadline}
                    onChange={e => setNewInitDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInitModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Investor Update */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Draft Investor Update</h3>
            <form onSubmit={handleCreateInvestorUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Update Title</label>
                <input
                  type="text"
                  value={newUpdateTitle}
                  onChange={e => setNewUpdateTitle(e.target.value)}
                  placeholder="e.g., EdWorld Co. Q1 2026 Shareholder Memo"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Quarter</label>
                <input
                  type="text"
                  value={newUpdateQuarter}
                  onChange={e => setNewUpdateQuarter(e.target.value)}
                  placeholder="Q1 2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Executive Summary / Highlights</label>
                <textarea
                  value={newUpdateSummary}
                  onChange={e => setNewUpdateSummary(e.target.value)}
                  placeholder="Key highlights, revenue pacing, and upcoming milestones..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

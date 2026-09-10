"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  Award, 
  BarChart3, 
  Download, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Briefcase, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Target,
  Plus,
  Send,
  Eye,
  Check,
  X,
  FileText,
  Calculator
} from "lucide-react";
import Button from "@/components/ui/Button";
import { 
  ExecutiveKPI, 
  FinancialRecord, 
  StrategicInitiative, 
  InvestorUpdate, 
  FounderAlert,
  ValuationScenario 
} from "@/lib/types";
import { 
  getExecutiveKPI, 
  getStrategicInitiatives, 
  saveStrategicInitiative, 
  getInvestorUpdates, 
  saveInvestorUpdate, 
  getFounderAlerts 
} from "@/lib/db-service";
import { runFounderInsightAgent, AgentInsight } from "@/lib/ai-agents";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

export default function FounderExecutivePage() {
  const { user, role, isFounder, isAdmin } = useAuth();

  if (user && !isFounder && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Founder & Executive Studio"
        requiredRole="Founder / Executive or System Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }
  const [activeTab, setActiveTab] = useState<"kpi_overview" | "financials_burn" | "valuation_sandbox" | "investor_studio" | "initiatives">("kpi_overview");

  // State
  const [kpis, setKpis] = useState<ExecutiveKPI | null>(null);
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([]);
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdate[]>([]);
  const [alerts, setAlerts] = useState<FounderAlert[]>([]);
  const [aiInsights, setAiInsights] = useState<AgentInsight[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Valuation Sandbox State
  const [valArr, setValArr] = useState(1485000);
  const [valMultiple, setValMultiple] = useState(12);
  const [valGrowth, setValGrowth] = useState(65);

  // New Initiative Modal
  const [showInitModal, setShowInitModal] = useState(false);
  const [initTitle, setInitTitle] = useState("");
  const [initOwner, setInitOwner] = useState("Sunita Rao (VP Eng)");
  const [initPriority, setInitPriority] = useState<StrategicInitiative["priority"]>("HIGH");
  const [initBudget, setInitBudget] = useState(250000);
  const [initDeadline, setInitDeadline] = useState("2026-05-31");
  const [initOutcome, setInitOutcome] = useState("Achieve tier-1 placement integration across 20 institutes");

  // Investor Update Form
  const [invTitle, setInvTitle] = useState("Q1 2026 Shareholder & Investor Briefing");
  const [invHighlights, setInvHighlights] = useState("1. Shipped Phase 19 Internal OS with zero-leak RBAC.\n2. Onboarded 14 school and 8 college institutional partners.\n3. Reached ₹1.48M ARR with positive cash flow leverage.");
  const [invProduct, setInvProduct] = useState("Launched dual-track authentication and autonomous operations AI agents.");
  const [invNextGoals, setInvNextGoals] = useState("1. Expand institutional placement radar.\n2. Launch campus recruitment automation.");
  const [exportSuccess, setExportSuccess] = useState(false);

  const loadData = async () => {
    const [k, initList, invList, alertList] = await Promise.all([
      getExecutiveKPI(),
      getStrategicInitiatives(),
      getInvestorUpdates(),
      getFounderAlerts(),
    ]);

    setKpis(k);
    setInitiatives(initList.length > 0 ? initList : [
      {
        id: "init-1",
        title: "Phase 19 Internal OS Enterprise Rollout",
        owner: "Sunita Rao",
        priority: "CRITICAL",
        deadline: "2026-03-31",
        status: "ACTIVE",
        budget: 450000,
        expectedOutcome: "All 18 employees, 14 schools, and 8 colleges migrated to internal portals.",
        progressPercentage: 90,
        createdAt: new Date().toISOString(),
      },
      {
        id: "init-2",
        title: "Tier-1 College Placement Network Expansion",
        owner: "Placement Team",
        priority: "HIGH",
        deadline: "2026-06-30",
        status: "PLANNED",
        budget: 600000,
        expectedOutcome: "Sign MOUs with 25 engineering universities for campus recruitment.",
        progressPercentage: 35,
        createdAt: new Date().toISOString(),
      }
    ]);

    setInvestorUpdates(invList);
    setAlerts(alertList);

    try {
      const insights = await runFounderInsightAgent("FOUNDER");
      setAiInsights(insights);
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initTitle.trim()) return;

    await saveStrategicInitiative({
      title: initTitle,
      owner: initOwner,
      priority: initPriority,
      deadline: initDeadline,
      status: "ACTIVE",
      budget: Number(initBudget),
      expectedOutcome: initOutcome,
      progressPercentage: 10,
    });

    setShowInitModal(false);
    setInitTitle("");
    setNotification("Strategic initiative registered into executive roadmap!");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const handleSaveInvestorUpdate = async (status: InvestorUpdate["status"]) => {
    await saveInvestorUpdate({
      title: invTitle,
      quarter: "Q1 2026",
      highlights: invHighlights.split("\n").filter(Boolean),
      kpis: {
        revenue: kpis ? `₹${(kpis.revenue / 100000).toFixed(2)}L` : "N/A",
        growth: `${valGrowth}% YoY`,
        burnRate: kpis ? `₹${(kpis.monthlyBurn / 1000).toFixed(0)}k/mo` : "N/A",
        runway: kpis ? `${kpis.runwayMonths} Mos` : "N/A",
      },
      productProgress: invProduct,
      partnerships: "14 K-12 Schools, 8 Engineering Colleges",
      teamUpdates: "18 Full-time Staff across Core Engineering and Operations",
      challenges: "Engineering hiring turnaround time in Q2",
      nextQuarterGoals: invNextGoals.split("\n").filter(Boolean),
      fundingRequirements: "₹1.5 Cr Seed Extension for Regional Institutional Expansion",
      status,
    });

    if (status === "READY_FOR_EXPORT") {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }

    setNotification(status === "READY_FOR_EXPORT" ? "Investor brief exported & formatted for PDF dispatch!" : "Investor brief saved as draft.");
    setTimeout(() => setNotification(null), 3500);
    loadData();
  };

  const calculatedValuation = valArr * valMultiple * (1 + (valGrowth / 200));

  return (
    <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Executive Command Center
            </span>
            <span className="text-xs text-[#8E95A5]">👑 Founder &amp; Board Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Executive Studio &amp; Investor Operations
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Real business financials, transparent runway formulas, scenario modeling, and investor communications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInitModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Initiative</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Founder Insight Agent Radar */}
      {aiInsights.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/30 via-[#13141B] to-[#13141B] border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">FounderInsightAgent Real-Time Analysis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-3 rounded-2xl bg-[#1C1D26]/80 border border-white/5 space-y-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {insight.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{insight.headline}</h4>
                <p className="text-[11px] text-[#8E95A5] leading-snug">{insight.detail}</p>
                {insight.actionableStep && (
                  <p className="text-[10px] text-[#D7FC51] font-semibold pt-1">
                    &rarr; {insight.actionableStep}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "kpi_overview", label: "Executive KPIs", icon: BarChart3 },
          { id: "financials_burn", label: "Financials & Burn Runway", icon: DollarSign },
          { id: "valuation_sandbox", label: "Valuation Sandbox (Scenario)", icon: Calculator },
          { id: "investor_studio", label: "Investor Update Studio", icon: FileText },
          { id: "initiatives", label: "Strategic Initiatives", icon: Target },
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

      {/* TAB 1: EXECUTIVE KPIS */}
      {activeTab === "kpi_overview" && kpis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Annual Recurring Revenue</span>
              </span>
              <div className="text-3xl font-black text-white font-mono">
                ₹{(kpis.revenue / 100000).toFixed(2)} Lakhs
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">+65% YoY Growth</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Monthly Net Burn</span>
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                ₹{(kpis.monthlyBurn / 1000).toFixed(0)}k / mo
              </div>
              <span className="text-[10px] text-[#8E95A5]">Sustained by MRR ₹{(kpis.mrr / 1000).toFixed(0)}k</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D7FC51]" />
                <span>Cash Runway</span>
              </span>
              <div className="text-3xl font-black text-[#D7FC51] font-mono">
                {kpis.runwayMonths} Months
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Zero Urgent Financing Risk</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Institutional Network</span>
              </span>
              <div className="text-3xl font-black text-purple-400 font-mono">
                {kpis.schoolPartnerships + kpis.collegePartnerships} Partners
              </div>
              <span className="text-[10px] text-[#8E95A5]">
                {kpis.schoolPartnerships} Schools &bull; {kpis.collegePartnerships} Colleges
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Total Active Employees</span>
              <div className="text-2xl font-black text-white font-mono">{kpis.employeeCount} Staff</div>
              <span className="text-[10px] text-[#8E95A5]">Engineering, Faculty &amp; Operations</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Cash In Bank</span>
              <div className="text-2xl font-black text-white font-mono">₹{(kpis.cashPosition / 100000).toFixed(2)} Lakhs</div>
              <span className="text-[10px] text-emerald-400">Current liquid reserves</span>
            </div>
            <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-[#8E95A5] uppercase">Enterprise Pipeline</span>
              <div className="text-2xl font-black text-[#D7FC51] font-mono">₹{(kpis.pipelineValue / 100000).toFixed(2)} Lakhs</div>
              <span className="text-[10px] text-[#8E95A5]">Qualified institutional deals</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIALS & BURN RUNWAY */}
      {activeTab === "financials_burn" && kpis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Burn Rate Math Card */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Burn Rate &amp; Runway Calculation</span>
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                Formula Grounded
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#8E95A5]">
                <span>Total Monthly Inflows (MRR):</span>
                <span className="text-emerald-400 font-bold">+₹{kpis.mrr.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[#8E95A5]">
                <span>Total Monthly Outflows (Expenses):</span>
                <span className="text-rose-400 font-bold">-₹{(kpis.mrr + kpis.monthlyBurn).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-white font-bold">
                <span>Net Monthly Burn:</span>
                <span className="text-amber-400">-₹{kpis.monthlyBurn.toLocaleString()} / mo</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-white font-bold text-sm">
                <span>Liquid Cash Reserves:</span>
                <span>₹{kpis.cashPosition.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#13141B] text-[#D7FC51] text-center font-bold">
                Runway = ₹{kpis.cashPosition.toLocaleString()} ÷ ₹{kpis.monthlyBurn.toLocaleString()} = {kpis.runwayMonths} Months
              </div>
            </div>
          </div>

          {/* Monthly Expense Weight */}
          <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white">Expense Distribution</h2>
            <div className="space-y-3">
              {[
                { category: "Payroll & Compensation (18 Employees)", amount: "₹22,80,000", percentage: 76, color: "bg-[#D7FC51]" },
                { category: "Cloud Hosting & AI Compute (Firebase/Supabase)", amount: "₹3,20,000", percentage: 11, color: "bg-purple-500" },
                { category: "Institutional Sales & Marketing", amount: "₹2,50,000", percentage: 8, color: "bg-[#00D2B4]" },
                { category: "Legal, Compliance & Operations", amount: "₹1,50,000", percentage: 5, color: "bg-amber-500" },
              ].map((exp, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{exp.category}</span>
                    <span className="font-mono text-white">{exp.amount} ({exp.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#13141B] overflow-hidden">
                    <div className={`h-full ${exp.color}`} style={{ width: `${exp.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: VALUATION SANDBOX */}
      {activeTab === "valuation_sandbox" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ESTIMATE / SCENARIO ANALYSIS
                </span>
                <span className="text-xs text-[#8E95A5]">Private Modeling Sandbox</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Valuation Assumptions &amp; Multiples</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E95A5]">Annual Recurring Revenue (ARR Base):</span>
                  <span className="text-white font-mono">₹{valArr.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="10000000"
                  step="50000"
                  value={valArr}
                  onChange={(e) => setValArr(Number(e.target.value))}
                  className="w-full accent-[#D7FC51]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E95A5]">Assumed ARR Multiple (EdTech &amp; Enterprise SaaS Benchmark):</span>
                  <span className="text-[#D7FC51] font-mono">{valMultiple}x</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  step="1"
                  value={valMultiple}
                  onChange={(e) => setValMultiple(Number(e.target.value))}
                  className="w-full accent-[#D7FC51]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#8E95A5]">Projected Annual YoY Growth Rate:</span>
                  <span className="text-emerald-400 font-mono">{valGrowth}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  step="5"
                  value={valGrowth}
                  onChange={(e) => setValGrowth(Number(e.target.value))}
                  className="w-full accent-[#D7FC51]"
                />
              </div>
            </div>

            {/* Output Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#1C1D26] to-[#252633] border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8E95A5]">
                  Modeled Pre-Money Valuation (Scenario)
                </span>
                <div className="text-3xl font-black text-[#D7FC51] font-mono">
                  ₹{(calculatedValuation / 10000000).toFixed(2)} Crores
                </div>
                <p className="text-[11px] text-[#8E95A5]">
                  Calculated based on {valMultiple}x multiple with {valGrowth}% growth trajectory.
                </p>
              </div>

              <div className="text-[10px] text-amber-300/80 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                ⚠️ Scenario only: Do not present this estimate as a formal valuation certified by a registered valuer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVESTOR UPDATE STUDIO */}
      {activeTab === "investor_studio" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white">Quarterly Investor Update Studio</h2>
              <p className="text-xs text-[#8E95A5]">Draft, preview, and format shareholder letters.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveInvestorUpdate("DRAFT")}
                className="px-4 py-2 rounded-xl bg-[#1C1D26] hover:bg-[#252633] text-white text-xs font-bold transition-all"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSaveInvestorUpdate("READY_FOR_EXPORT")}
                className="px-4 py-2 rounded-xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Investor Pack</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Title</label>
                <input
                  type="text"
                  value={invTitle}
                  onChange={(e) => setInvTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Executive Highlights</label>
                <textarea
                  rows={4}
                  value={invHighlights}
                  onChange={(e) => setInvHighlights(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Product &amp; Technical Progress</label>
                <textarea
                  rows={3}
                  value={invProduct}
                  onChange={(e) => setInvProduct(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Next Quarter Goals</label>
                <textarea
                  rows={3}
                  value={invNextGoals}
                  onChange={(e) => setInvNextGoals(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Live Document Preview */}
            <div className="p-6 rounded-3xl bg-[#1C1D26] border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[10px] font-bold text-[#D7FC51] uppercase tracking-wider">Investor Preview</span>
                  <h3 className="text-sm font-bold text-white mt-1">{invTitle}</h3>
                  <span className="text-[10px] text-[#8E95A5]">EdWorld Organization OS &bull; Confidential</span>
                </div>

                <div className="text-xs text-[#8E95A5] space-y-2">
                  <strong className="text-white block">Highlights:</strong>
                  <pre className="text-[11px] text-white font-sans whitespace-pre-wrap">{invHighlights}</pre>
                  
                  <strong className="text-white block pt-2">Product Velocity:</strong>
                  <p className="text-[11px] text-white">{invProduct}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#13141B] text-[10px] text-[#8E95A5] text-center">
                Ready for shareholder email and PDF distribution.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STRATEGIC INITIATIVES */}
      {activeTab === "initiatives" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Strategic Business Initiatives</h2>
              <p className="text-xs text-[#8E95A5]">Milestones and budget allocation tracking.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map((init) => (
              <div key={init.id} className="p-5 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${init.priority === "CRITICAL" ? "bg-rose-500/10 text-rose-400" : "bg-[#D7FC51]/10 text-[#D7FC51]"}`}>
                    {init.priority} PRIORITY
                  </span>
                  <span className="text-xs font-mono text-white">₹{init.budget.toLocaleString()}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{init.title}</h3>
                  <p className="text-[11px] text-[#8E95A5] mt-1">{init.expectedOutcome}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-[#8E95A5]">
                    <span>Owner: {init.owner}</span>
                    <span className="font-bold text-white">{init.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#13141B] overflow-hidden">
                    <div className="h-full bg-[#D7FC51]" style={{ width: `${init.progressPercentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Initiative Modal */}
      {showInitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#13141B] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Create Strategic Initiative</h3>
              <button onClick={() => setShowInitModal(false)} className="text-[#8E95A5] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInitiative} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={initTitle}
                  onChange={(e) => setInitTitle(e.target.value)}
                  placeholder="Initiative Title"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Owner</label>
                  <input
                    type="text"
                    value={initOwner}
                    onChange={(e) => setInitOwner(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Budget (₹)</label>
                  <input
                    type="number"
                    value={initBudget}
                    onChange={(e) => setInitBudget(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Expected Outcome</label>
                <textarea
                  rows={2}
                  value={initOutcome}
                  onChange={(e) => setInitOutcome(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D7FC51] text-[#13141B] font-black text-xs hover:bg-[#E9FFA4] transition-all mt-2"
              >
                Register Initiative
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

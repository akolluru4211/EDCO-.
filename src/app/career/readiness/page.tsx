"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ShieldCheck, 
  Target, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Code2, 
  FileText, 
  Video, 
  Briefcase, 
  TrendingUp, 
  Loader2,
  ChevronRight,
  Layers,
  Award
} from "lucide-react";
import { CareerReadinessOverview, CareerGapAnalysis } from "@/lib/types/career-intelligence";

const TARGET_ROLES = [
  "Full Stack Software Engineer",
  "Backend Engineer",
  "AI / Machine Learning Engineer",
  "Cybersecurity Analyst / AppSec Engineer"
];

export default function CareerReadinessPage() {
  const { user, profile } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Full Stack Software Engineer");
  const [readiness, setReadiness] = useState<CareerReadinessOverview | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<CareerGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReadiness = async (roleToFetch: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/career/readiness?role=${encodeURIComponent(roleToFetch)}`);
      if (res.ok) {
        const data = await res.json();
        setReadiness(data.readiness);
        setGapAnalysis(data.gapAnalysis);
      }
    } catch (e) {
      console.error("Failed to load readiness:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReadiness(selectedRole);
    }
  }, [user, selectedRole]);

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8ECF2] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0FAF6] text-[#00D2B4] text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MULTIDIMENSIONAL READINESS ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
              Career Readiness & Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573]">
              Evidence-based status across 9 professional dimensions with zero fake scores or arbitrary percentages.
            </p>
          </div>

          {/* Target Role Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#8E95A5] whitespace-nowrap">Target Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs font-bold text-[#13141B] focus:outline-none"
            >
              {TARGET_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {loading || !readiness ? (
          <div className="bg-white rounded-3xl p-16 border border-[#E8ECF2] text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#7B57FF] animate-spin mx-auto" />
            <p className="text-xs text-[#5E6573] font-bold">Evaluating multi-source evidence & readiness dimensions...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Overview Banner Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    readiness.overallHealth === "on_track"
                      ? "bg-[#E0FAF6] text-[#00D2B4]"
                      : "bg-[#FFF3E8] text-[#FF7A50]"
                  }`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#13141B]">
                      {selectedRole} Readiness
                    </h3>
                    <p className="text-xs text-[#5E6573]">
                      Status: <span className="font-bold text-[#13141B] uppercase">{readiness.overallHealth.replace("_", " ")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/career/copilot">
                    <button className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white text-xs font-bold transition-all flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#D7FC51]" />
                      <span>Ask Copilot</span>
                    </button>
                  </Link>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5E6573] leading-relaxed bg-[#F4F6FB] p-4 rounded-2xl border border-[#E8ECF2]">
                {readiness.summaryNarrative}
              </p>
            </div>

            {/* 9 Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readiness.dimensions.map((dim) => {
                const isStrong = dim.status === "verified_strong";
                const isProgressing = dim.status === "progressing";
                return (
                  <div
                    key={dim.key}
                    className="bg-white rounded-3xl p-6 border border-[#E8ECF2] hover:border-[#13141B]/20 shadow-sm flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8E95A5]">
                          {dim.title}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStrong
                            ? "bg-emerald-50 text-emerald-700"
                            : isProgressing
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {dim.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-[#13141B] font-medium leading-relaxed">
                        {dim.statusExplanation}
                      </p>

                      {dim.evidenceItems.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {dim.evidenceItems.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-[#F4F6FB] border border-[#E8ECF2] text-[10px] text-[#5E6573] font-mono"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E8ECF2]">
                      <Link
                        href={dim.recommendedNextAction.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7B57FF] hover:text-[#13141B] transition-colors"
                      >
                        <span>{dim.recommendedNextAction.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Skill Gap Analysis */}
            {gapAnalysis && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8ECF2] shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#13141B]">Target Skill Gap Deep-Dive</h3>
                  <p className="text-xs text-[#5E6573]">
                    Granular breakdown of verified competencies vs role requirements.
                  </p>
                </div>

                <div className="space-y-3">
                  {gapAnalysis.skillGaps.map((gap) => (
                    <div
                      key={gap.skillId}
                      className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-[#13141B]">{gap.skillName}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            gap.currentState === "strong"
                              ? "bg-emerald-100 text-emerald-800"
                              : gap.currentState === "developing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {gap.currentState.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5E6573]">{gap.gapReason}</p>
                      </div>

                      <div className="shrink-0">
                        <span className="text-[11px] font-bold text-[#7B57FF] bg-white px-3 py-1.5 rounded-xl border border-[#E8ECF2] block text-center">
                          Action: {gap.recommendedAction.slice(0, 38)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

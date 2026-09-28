"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Target, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Code2, 
  Brain,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

const TARGET_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "AI / ML Engineer",
  "DevOps / SRE",
  "Engineering Manager"
];

export default function SkillsGapPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async (role: string) => {
    if (!user) return;
    setSelectedRole(role);
    setLoading(true);
    try {
      const res = await fetch("/api/career/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, targetRole: role })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user && isAdult) {
      handleAnalyze(selectedRole);
    }
  }, [user, isAdult]);

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Skills Gap Planner is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181920]">Skills Gap Planner</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/career/readiness" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Readiness View
            </Link>
            <Link href="/career/applications" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Applications
            </Link>
            <Link href="/career/copilot" className="px-3.5 py-2 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#EDE8FD] text-xs font-bold text-[#181920] transition-colors">
              Copilot
            </Link>
          </div>
        </div>

        {/* Role Selector */}
        <div className="card-quixel p-5 space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-[#767E94]">Select Target Career Role</label>
          <div className="flex flex-wrap gap-2">
            {TARGET_ROLES.map(role => (
              <button
                key={role}
                onClick={() => handleAnalyze(role)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                  selectedRole === role
                    ? "bg-[#5C38FF] text-white shadow-md scale-105"
                    : "bg-[#F4F6FB] text-[#181920] hover:bg-slate-200 border border-[#E8ECF2]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Analyzing verified skills and evidence...</div>
        ) : analysisResult ? (
          <div className="space-y-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-quixel p-5 space-y-1">
                <span className="text-xs font-bold text-[#767E94]">Total Required Skills</span>
                <div className="text-2xl font-black text-[#181920]">{analysisResult.totalRequired}</div>
              </div>
              <div className="card-quixel p-5 space-y-1 bg-[#E8F8F0] border-[#00C48C]/30">
                <span className="text-xs font-bold text-[#00C48C]">Verified in Evidence</span>
                <div className="text-2xl font-black text-[#00C48C]">{analysisResult.verifiedCount}</div>
              </div>
              <div className="card-quixel p-5 space-y-1 bg-[#FFF8E7] border-[#FFB800]/30">
                <span className="text-xs font-bold text-[#D97706]">Observed Gaps</span>
                <div className="text-2xl font-black text-[#D97706]">{analysisResult.gapCount}</div>
              </div>
            </div>

            {/* Verified Skills */}
            <div className="card-quixel p-6 space-y-4">
              <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00C48C]" />
                <span>Verified Skills (Found in Evidence Vault &amp; Projects)</span>
              </h3>
              {analysisResult.verifiedSkills && analysisResult.verifiedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.verifiedSkills.map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-[#E8F8F0] text-[#00C48C] text-xs font-bold border border-[#00C48C]/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#767E94] italic">No verified evidence found matching this role yet. Add projects or certifications in the Evidence Vault.</p>
              )}
            </div>

            {/* Observed Gaps & Actionable Steps */}
            <div className="card-quixel p-6 space-y-4">
              <h3 className="text-base font-black text-[#181920] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF7A50]" />
                <span>Actionable Practice Suggestions to Bridge Gaps</span>
              </h3>
              <div className="space-y-3">
                {analysisResult.missingGaps && analysisResult.missingGaps.map((gap: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-[#181920] bg-white px-2.5 py-1 rounded-lg border border-[#E8ECF2]">
                        {gap.skill}
                      </span>
                      <p className="text-xs text-[#767E94] pt-1">{gap.suggestion}</p>
                    </div>
                    <Link
                      href={gap.practiceUrl}
                      className="px-4 py-2 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                    >
                      <span>Start Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Mic,
  ShieldCheck,
  Check,
  ArrowRight,
  LineChart,
  Zap,
  Target,
  Award
} from "lucide-react";
import { SkillLevel, UserInterest } from "@/lib/types";

const PRO_OBJECTIVES = [
  { id: "senior_ic", title: "Senior / Staff IC Promotion", desc: "System architecture, cross-team impact, and code review governance." },
  { id: "role_switch", title: "Tier-1 / FAANG Role Transition", desc: "Hard algorithmic rigor, distributed systems, and leadership interviews." },
  { id: "remote_global", title: "Global Remote Career Track", desc: "US/EU remote compensation benchmarks, async communication, and high-agency delivery." },
  { id: "lead_management", title: "Engineering Management / Lead", desc: "Product roadmap delivery, people leadership, and team velocity optimization." },
];

const PRO_BENCHMARKS = [
  { id: "sys_design", name: "Distributed Systems & Architecture", desc: "Microservices, event-driven systems, caching, replication, and CAP trade-offs" },
  { id: "backend_scale", name: "High-Throughput Backend Engineering", desc: "Go, Rust, Node.js, SQL index tuning, Kafka, and low-latency APIs" },
  { id: "frontend_arch", name: "Modern Frontend Architecture", desc: "Next.js SSR/RSC, micro-frontends, core web vitals, and design systems" },
  { id: "cloud_infra", name: "Cloud Native & DevOps Infrastructure", desc: "Kubernetes, Terraform, AWS multi-region setups, and observability" },
];

export default function ProfessionalOnboardingPage() {
  const router = useRouter();
  const { user, profile, updateUserProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedObjective, setSelectedObjective] = useState<string>("senior_ic");
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<Record<string, SkillLevel>>({
    sys_design: 2,
    backend_scale: 2,
  });
  const [atsScanEnabled, setAtsScanEnabled] = useState(true);
  const [starMockEnabled, setStarMockEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("edworld_pending_stage_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.stage === "pro") {
            // Profile data available
          }
        }
      } catch {}
    }
  }, []);

  const toggleBenchmark = (id: string) => {
    setSelectedBenchmarks((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        if (Object.keys(next).length > 1) {
          delete next[id];
        }
      } else {
        next[id] = 2;
      }
      return next;
    });
  };

  const setBenchmarkLevel = (id: string, lvl: SkillLevel) => {
    setSelectedBenchmarks((prev) => ({
      ...prev,
      [id]: lvl,
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      const interests: UserInterest[] = Object.entries(selectedBenchmarks).map(([id, selfLevel]) => {
        const b = PRO_BENCHMARKS.find((x) => x.id === id);
        return {
          id,
          name: b ? b.name : id,
          category: "Professional Career OS",
          selfLevel,
          effectiveLevel: selfLevel,
        };
      });

      const obj = PRO_OBJECTIVES.find((x) => x.id === selectedObjective);

      await updateUserProfile({
        careerStage: "PROFESSIONAL",
        primaryGoal: obj ? `${obj.title} - ${obj.desc}` : "Senior Career Advancement & System Architecture",
        interests,
        onboarding_completed: true,
      });

      router.push("/dashboard");
    } catch (err: any) {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-amber-900/40">
        <div className="flex items-center gap-3">
          <EdworldLogo size="sm" showText={false} />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Working Professional (Ages 18+ • Career)</span>
            </div>
            <div className="text-sm font-bold text-white">Career OS Calibration</div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
          Step {step} of 3
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto w-full my-8 bg-slate-900/90 border border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Career OS Objective */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
                <Target className="w-3.5 h-3.5" />
                <span>Strategic Career Objective</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">What is your next career move?</h2>
              <p className="text-xs text-slate-400">
                Edworld Co dynamically configures your architecture challenges, interview scenarios, and market compensation tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_OBJECTIVES.map((obj) => {
                const active = selectedObjective === obj.id;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setSelectedObjective(obj.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      active
                        ? "bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500"
                        : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-900/50 border border-amber-700/40 text-amber-300 flex items-center justify-center">
                        <LineChart className="w-5 h-5" />
                      </div>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{obj.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{obj.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="primary"
                size="md"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Senior Benchmarks</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: High-Yield Senior Competency Benchmarks */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
                <Zap className="w-3.5 h-3.5" />
                <span>Domain Competencies &amp; Seniority</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Calibrate your production mastery</h2>
              <p className="text-xs text-slate-400">
                Rate your existing comfort level across senior engineering pillars.
              </p>
            </div>

            <div className="space-y-3">
              {PRO_BENCHMARKS.map((bm) => {
                const isSelected = selectedBenchmarks[bm.id] !== undefined;
                const currentLevel = selectedBenchmarks[bm.id] ?? 1;

                return (
                  <div
                    key={bm.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-slate-800/90 border-amber-500/70"
                        : "bg-slate-800/40 border-slate-700/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBenchmark(bm.id)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-bold text-sm text-white">{bm.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{bm.desc}</p>

                    {isSelected && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
                        {[
                          { lvl: 0 as SkillLevel, label: "Practitioner", sub: "1-3 yrs experience" },
                          { lvl: 1 as SkillLevel, label: "Senior", sub: "3-6 yrs production" },
                          { lvl: 2 as SkillLevel, label: "Staff / Lead", sub: "System owner / 7+ yrs" },
                        ].map((btn) => (
                          <button
                            key={btn.lvl}
                            type="button"
                            onClick={() => setBenchmarkLevel(bm.id, btn.lvl)}
                            className={`p-2 rounded-xl text-center border text-xs transition-all ${
                              currentLevel === btn.lvl
                                ? "bg-amber-600 border-amber-400 text-white font-bold"
                                : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                            }`}
                          >
                            <div className="font-semibold">{btn.label}</div>
                            <div className="text-[9px] opacity-70 mt-0.5">{btn.sub}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                size="md"
                className="border-slate-700 text-slate-300"
              >
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                variant="primary"
                size="md"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Career OS Tools</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: ATS Resume & Mock Interview Setup */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Executive Career Acceleration</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Activate Your Career OS Modules</h2>
              <p className="text-xs text-slate-400">
                Get real-time resume keyword calibration and dynamic AI mock interviews.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-amber-950/40 border border-amber-900/60 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={atsScanEnabled}
                  onChange={(e) => setAtsScanEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Automated ATS Resume Gap Analysis</strong>
                  <span className="text-slate-400">Scan your resume against live senior JD benchmarks to identify missing technical keywords and architectural highlights.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-amber-900/40">
                <input
                  type="checkbox"
                  checked={starMockEnabled}
                  onChange={(e) => setStarMockEnabled(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">STAR Method Behavioral &amp; System Design AI Mocks</strong>
                  <span className="text-slate-400">Practice real-time speech and technical responses calibrated to FAANG interview rubrics.</span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="outline"
                size="md"
                className="border-slate-700 text-slate-300"
              >
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                variant="primary"
                size="md"
                className="bg-amber-600 hover:bg-amber-500 text-white"
                icon={<Sparkles className="w-4 h-4" />}
              >
                <span>{saving ? "Deploying Career OS..." : "Launch Career OS →"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        Edworld Co • Skills &amp; Career OS • Verified Senior Engineering Tracks
      </div>
    </div>
  );
}

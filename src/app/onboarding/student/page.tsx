"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";
import {
  GraduationCap,
  Sparkles,
  Target,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Check,
  ArrowRight,
  FolderGit2,
  FileCode,
  Briefcase,
  Trophy
} from "lucide-react";
import { SkillLevel, UserInterest } from "@/lib/types";

const TARGET_GOALS = [
  { id: "product", title: "Product / FAANG Placements", desc: "Top-tier DSA, system design, and competitive coding." },
  { id: "campus", title: "Campus Recruitment Drives", desc: "Aptitude tests, core CS fundamentals, and technical interviews." },
  { id: "startups", title: "Startup & High-Growth SWE", desc: "Full-stack project building, modern frameworks, and rapid shipping." },
  { id: "gate", title: "Higher Studies / GATE", desc: "Deep CS theoretical foundations, algorithms, and academic research." },
];

const TECH_TRACKS = [
  { id: "swe", name: "Full-Stack Software Engineering", desc: "React, Next.js, Node.js, REST & GraphQL, PostgreSQL" },
  { id: "dsa", name: "Data Structures & Algorithms", desc: "Trees, Graphs, Dynamic Programming, Complexity" },
  { id: "ai_ml", name: "AI & Machine Learning", desc: "Python, PyTorch, Transformers, LLM orchestration" },
  { id: "cloud", name: "Cloud & DevOps Engineering", desc: "Docker, Kubernetes, AWS, CI/CD pipelines" },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, profile, updateUserProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>("product");
  const [selectedTracks, setSelectedTracks] = useState<Record<string, SkillLevel>>({
    swe: 1,
    dsa: 1,
  });
  const [githubSync, setGithubSync] = useState(true);
  const [hackathonTeamReady, setHackathonTeamReady] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("edworld_pending_stage_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.stage === "student") {
            // Profile data available
          }
        }
      } catch {}
    }
  }, []);

  const toggleTrack = (id: string) => {
    setSelectedTracks((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        if (Object.keys(next).length > 1) {
          delete next[id];
        }
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const setTrackLevel = (id: string, lvl: SkillLevel) => {
    setSelectedTracks((prev) => ({
      ...prev,
      [id]: lvl,
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      const interests: UserInterest[] = Object.entries(selectedTracks).map(([id, selfLevel]) => {
        const trk = TECH_TRACKS.find((t) => t.id === id);
        return {
          id,
          name: trk ? trk.name : id,
          category: "Student Career Track",
          selfLevel,
          effectiveLevel: selfLevel,
        };
      });

      const goalObj = TARGET_GOALS.find((g) => g.id === selectedGoal);

      await updateUserProfile({
        careerStage: "STUDENT",
        primaryGoal: goalObj ? `${goalObj.title} - ${goalObj.desc}` : "Campus Placements & Technical Mastery",
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
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-emerald-900/40">
        <div className="flex items-center gap-3">
          <EdworldLogo size="sm" showText={false} />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student &amp; Campus (Ages 16–18 • College)</span>
            </div>
            <div className="text-sm font-bold text-white">Career Readiness Calibration</div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
          Step {step} of 3
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto w-full my-8 bg-slate-900/90 border border-emerald-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Placement & Career Targets */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                <Target className="w-3.5 h-3.5" />
                <span>Placement Target</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">What is your primary milestone?</h2>
              <p className="text-xs text-slate-400">
                We calibrate your daily problems, mock interviews, and project milestones to match this goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TARGET_GOALS.map((g) => {
                const active = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      active
                        ? "bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500"
                        : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{g.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{g.desc}</p>
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Technical Tracks</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Technical Focus & Baseline Calibration */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                <Code2 className="w-3.5 h-3.5" />
                <span>Technical Domains &amp; Baseline</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Calibrate your skill level</h2>
              <p className="text-xs text-slate-400">
                Select your focus areas and self-rate your baseline level.
              </p>
            </div>

            <div className="space-y-3">
              {TECH_TRACKS.map((trk) => {
                const isSelected = selectedTracks[trk.id] !== undefined;
                const currentLevel = selectedTracks[trk.id] ?? 0;

                return (
                  <div
                    key={trk.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-slate-800/90 border-emerald-500/70"
                        : "bg-slate-800/40 border-slate-700/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTrack(trk.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-sm text-white">{trk.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{trk.desc}</p>

                    {isSelected && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
                        {[
                          { lvl: 0 as SkillLevel, label: "Beginner", sub: "Syntax / Basics" },
                          { lvl: 1 as SkillLevel, label: "Intermediate", sub: "Projects & DSA" },
                          { lvl: 2 as SkillLevel, label: "Advanced", sub: "Production-ready" },
                        ].map((btn) => (
                          <button
                            key={btn.lvl}
                            type="button"
                            onClick={() => setTrackLevel(trk.id, btn.lvl)}
                            className={`p-2 rounded-xl text-center border text-xs transition-all ${
                              currentLevel === btn.lvl
                                ? "bg-emerald-600 border-emerald-400 text-white font-bold"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Project Studio</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Project Studio & Profile Launch */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Project Studio &amp; Recruiter Readiness</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Activate Your Engineering Portfolio</h2>
              <p className="text-xs text-slate-400">
                Edworld Co turns verified code commits into ATS-calibrated resume bullet points.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={githubSync}
                  onChange={(e) => setGithubSync(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <strong className="text-white block">Auto-Sync GitHub Projects &amp; Repositories</strong>
                  <span className="text-slate-400">Automatically generate live interactive demos and verified skill badges from your public repositories.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-emerald-900/40">
                <input
                  type="checkbox"
                  checked={hackathonTeamReady}
                  onChange={(e) => setHackathonTeamReady(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <strong className="text-white block">Hackathon &amp; Peer Pairing Arena</strong>
                  <span className="text-slate-400">Join campus engineering cohorts to build collaborative projects for your portfolio.</span>
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                icon={<Sparkles className="w-4 h-4" />}
              >
                <span>{saving ? "Configuring Profile..." : "Enter Student Workspace →"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        Edworld Co • Skills &amp; Career OS • Verified Campus Placement Tracks
      </div>
    </div>
  );
}

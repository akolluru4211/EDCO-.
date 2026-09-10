"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";
import {
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Atom,
  Binary,
  Bot,
  Flame,
  Check,
  Lock,
  Clock,
  Award
} from "lucide-react";

const JUNIOR_QUESTS = [
  { id: "space-code", title: "Space Explorer Code", icon: Bot, desc: "Solve visual algorithms to steer orbit probes." },
  { id: "ai-detective", title: "AI Detective", icon: Sparkles, desc: "Discover how neural nets recognize patterns." },
  { id: "math-puzzle", title: "Logic & Math Mysteries", icon: Binary, desc: "Level up mental reasoning with gamified math puzzles." },
  { id: "science-lab", title: "Virtual Science Lab", icon: Atom, desc: "Interactive experiments in physics & chemistry." },
];

const TIME_BUDGETS = [
  { label: "15 Mins / Day", desc: "Light curiosity habit" },
  { label: "30 Mins / Day", desc: "Recommended balanced pace" },
  { label: "45 Mins / Day", desc: "Super quest explorer" },
];

export default function JuniorOnboardingPage() {
  const router = useRouter();
  const { user, profile, updateUserProfile, submitGuardianConsent } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedQuests, setSelectedQuests] = useState<string[]>(["space-code", "ai-detective"]);
  const [selectedPace, setSelectedPace] = useState("30 Mins / Day");
  const [learningGoal, setLearningGoal] = useState("Build fun coding games and explore science puzzles.");
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("edworld_pending_stage_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.stage === "junior") {
            // Available if prefilled
          }
        }
      } catch {}
    }
  }, []);

  const toggleQuest = (id: string) => {
    setSelectedQuests((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((q) => q !== id) : prev) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      if (guardianName && guardianEmail) {
        await submitGuardianConsent(guardianName, guardianEmail, "parent");
      }

      await updateUserProfile({
        careerStage: "JUNIOR",
        ageBand: "13-15",
        primaryGoal: learningGoal,
        interests: selectedQuests.map((q) => ({
          id: q,
          name: JUNIOR_QUESTS.find((x) => x.id === q)?.title || q,
          category: "Junior Lab Quests",
          selfLevel: 0,
          effectiveLevel: 0,
        })),
        isPublic: false,
        isMentor: false,
      });

      router.push("/student/junior/dashboard");
    } catch (err: any) {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-violet-900/40">
        <div className="flex items-center gap-3">
          <EdworldLogo size="sm" showText={false} />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Junior School Lab (Ages 13–15)</span>
            </div>
            <div className="text-sm font-bold text-white">Curiosity Onboarding</div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-3 py-1 rounded-full border border-violet-800/60">
          Step {step} of 3
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl mx-auto w-full my-8 bg-slate-900/90 border border-violet-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-violet-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Starter Quests */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-950/80 px-2.5 py-1 rounded-full border border-violet-800/60">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Choose Your Starter Quests</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">What sparks your curiosity?</h2>
              <p className="text-xs text-slate-400">
                Pick the quest paths you would like to explore first in your lab.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {JUNIOR_QUESTS.map((q) => {
                const Icon = q.icon;
                const active = selectedQuests.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => toggleQuest(q.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      active
                        ? "bg-violet-950/70 border-violet-500 shadow-lg shadow-violet-950/50 ring-1 ring-violet-500"
                        : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div className="w-9 h-9 rounded-xl bg-violet-900/50 border border-violet-700/40 text-violet-300 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{q.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{q.desc}</p>
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
                className="bg-violet-600 hover:bg-violet-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Learning Habit</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Pace & Goal */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-950/80 px-2.5 py-1 rounded-full border border-violet-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>Daily Quest Routine</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">How much time do you want to spend?</h2>
              <p className="text-xs text-slate-400">
                Consistent small steps build massive digital confidence without school stress.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIME_BUDGETS.map((tb) => {
                const active = selectedPace === tb.label;
                return (
                  <button
                    key={tb.label}
                    type="button"
                    onClick={() => setSelectedPace(tb.label)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-violet-950/80 border-violet-500 text-white ring-1 ring-violet-500"
                        : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{tb.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{tb.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                What is your main learning goal?
              </label>
              <textarea
                rows={2}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Build simple interactive games, learn how AI works, prepare for school science fairs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
              />
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
                className="bg-violet-600 hover:bg-violet-500 text-white"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Next: Safety Guarantee</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Safety Guarantee & Launch */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 bg-violet-950/80 px-2.5 py-1 rounded-full border border-violet-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DPDP Act Minor Safety Guarantee</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Your Lab is 100% Protected</h2>
              <p className="text-xs text-slate-400">
                Edworld Co Junior mode is customized specifically for teenagers (13–15) with zero public tracking.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-violet-950/40 border border-violet-900/60 text-xs">
              <div className="flex items-start gap-2.5 text-violet-300">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Private &amp; Closed Space:</strong> No recruiters, no employer messaging, no public profile indexed on search engines.
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-violet-300">
                <Award className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Skill Badges &amp; Certificates:</strong> Earn verifiable Junior Explorer credentials to showcase on school projects.
                </div>
              </div>
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
                className="bg-violet-600 hover:bg-violet-500 text-white"
                icon={<Sparkles className="w-4 h-4" />}
              >
                <span>{saving ? "Launching Lab..." : "Launch Junior Lab →"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        Edworld Co • Calibrated Junior Lab Platform • India DPDP Act & COPPA Compliant
      </div>
    </div>
  );
}

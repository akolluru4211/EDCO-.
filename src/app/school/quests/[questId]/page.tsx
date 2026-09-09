"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Award, 
  BookOpen,
  HelpCircle,
  Pencil
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function QuestRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;
  const { user } = useAuth();

  const [quest, setQuest] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [creativeAnswer, setCreativeAnswer] = useState("");
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuest() {
      if (!questId) return;
      const { data: q } = await supabase.from("quests").select("*").eq("id", questId).single();
      if (q) setQuest(q);

      const { data: s } = await supabase.from("quest_steps").select("*").eq("quest_id", questId).order("step_order", { ascending: true });
      if (s && s.length > 0) {
        setSteps(s);
      } else {
        // Fallback default steps for demo/exploration
        setSteps([
          {
            id: "step-1",
            step_order: 1,
            step_type: "read",
            prompt: "Every great invention begins with a clear mental model. As you explore technology and creative problem-solving, breaking big ideas into smaller manageable steps is your superpower."
          },
          {
            id: "step-2",
            step_order: 2,
            step_type: "quiz",
            prompt: "What is the primary benefit of decomposing a complex system into modular parts?",
            options: ["It makes the system harder to test", "It isolates bugs and allows independent development", "It removes all need for planning"],
            answer: "It isolates bugs and allows independent development"
          },
          {
            id: "step-3",
            step_order: 3,
            step_type: "creative",
            prompt: "Describe one small tool or app you would build to help your school classmates learn faster."
          }
        ]);
      }
      setLoading(false);
    }

    loadQuest();
  }, [questId]);

  const currentStep = steps[currentStepIdx];

  const handleNextStep = async () => {
    setQuizError(null);

    // Validation for quiz step
    if (currentStep.step_type === "quiz") {
      if (!selectedQuizAnswer) {
        setQuizError("Please select an answer to proceed.");
        return;
      }
      if (currentStep.answer && selectedQuizAnswer !== currentStep.answer) {
        setQuizError("Not quite! Think about how modular code simplifies debugging.");
        return;
      }
    }

    // Validation for creative step
    if (currentStep.step_type === "creative" && !creativeAnswer.trim()) {
      setQuizError("Please write a short response to complete your quest.");
      return;
    }

    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setSelectedQuizAnswer(null);
    } else {
      // Complete Quest
      if (user && quest) {
        try {
          await supabase.from("user_quest_progress").insert({
            user_id: user.uid,
            quest_id: quest.id,
            points_earned: quest.points || 50,
            completed_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Quest progress save note:", e);
        }
      }
      setIsCompleted(true);
    }
  };

  if (loading || !currentStep) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-amber-50/30">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-amber-50/50 to-indigo-50/40">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-600">Quest Completed!</span>
            <h1 className="text-2xl font-black text-slate-900">{quest?.title || "Curiosity Quest"}</h1>
            <p className="text-xs text-slate-600">
              You earned <strong>+{quest?.points || 100} XP</strong> and unlocked a new concept mastery badge!
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link
              href="/school"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              Return to School Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50/50 to-indigo-50/40 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link href="/school" className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to School Hub</span>
          </Link>
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Step {currentStepIdx + 1} of {steps.length}
          </span>
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              {currentStep.step_type === "read" && <BookOpen className="w-5 h-5" />}
              {currentStep.step_type === "quiz" && <HelpCircle className="w-5 h-5" />}
              {currentStep.step_type === "creative" && <Pencil className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                {currentStep.step_type.toUpperCase()} CHALLENGE
              </span>
              <h2 className="text-lg font-black text-slate-900">{quest?.title}</h2>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
            {currentStep.prompt}
          </div>

          {/* Quiz Options */}
          {currentStep.step_type === "quiz" && currentStep.options && (
            <div className="space-y-2.5">
              {currentStep.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setSelectedQuizAnswer(opt)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    selectedQuizAnswer === opt
                      ? "bg-amber-50 border-amber-500 text-amber-900 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Creative Input */}
          {currentStep.step_type === "creative" && (
            <div className="space-y-2">
              <textarea
                rows={4}
                value={creativeAnswer}
                onChange={(e) => setCreativeAnswer(e.target.value)}
                placeholder="Type your creative thoughts and solution here..."
                className="w-full p-4 rounded-2xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>
          )}

          {quizError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {quizError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleNextStep}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>{currentStepIdx < steps.length - 1 ? "Next Step" : "Complete Quest"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

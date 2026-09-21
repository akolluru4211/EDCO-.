"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  BarChart3,
  RefreshCw
} from "lucide-react";

export default function LeadershipAssessmentPage() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);

  const questions = [
    {
      id: "q1",
      topic: "Delegation & Empowerment",
      prompt: "When leading a critical milestone, how do you balance giving engineers autonomy vs ensuring code quality?"
    },
    {
      id: "q2",
      topic: "Navigating Technical Disagreements",
      prompt: "Describe how you build consensus when two senior engineers strongly advocate for conflicting database architectures."
    },
    {
      id: "q3",
      topic: "Mentorship & Growth",
      prompt: "How do you identify growth opportunities for engineers who are performing well in their current scope?"
    },
    {
      id: "q4",
      topic: "Handling Pressure & Uncertainty",
      prompt: "When executive priorities pivot unexpectedly mid-quarter, how do you communicate the context to shield team morale?"
    }
  ];

  const handleGenerateReflection = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setReflection(
        "Reflective Insights Summary:\n\n" +
        "• Strengths Demonstrated: You demonstrate strong consultative leadership and an instinct for psychological safety. Your responses show a healthy balance of technical guardrails with individual engineer ownership.\n\n" +
        "• Development Opportunities: Consider formalizing your decision-making frameworks (e.g. DACI or RFC reviews) to accelerate consensus during high-velocity architectural pivots.\n\n" +
        "• Recommendation: You are well-positioned for Tech Lead / Engineering Manager responsibilities. Continuing to mentor junior engineers on architecture reviews will further amplify your leadership impact."
      );
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6 text-[#D7FC51]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">Manager &amp; Leadership Self-Assessment</h1>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
            💡 <strong>Reflective Tool Notice:</strong> This exercise provides qualitative reflection and self-coaching prompts rather than a psychometric score or certification claim.
          </div>
        </div>

        {reflection ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 space-y-5 animate-in fade-in">
            <h2 className="text-sm font-black text-[#D7FC51] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Your Qualitative Leadership Reflection</span>
            </h2>
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {reflection}
            </div>
            <button
              onClick={() => setReflection(null)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold"
            >
              Retake Reflection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-3xl bg-[#151621] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">Prompt {idx + 1} &bull; {q.topic}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">{q.prompt}</p>
                <textarea
                  rows={3}
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Share your approach and past experiences..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white leading-relaxed"
                />
              </div>
            ))}

            <button
              onClick={handleGenerateReflection}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-[#D7FC51] text-slate-950 font-black text-xs hover:bg-[#cbf13f] shadow-lg transition-all"
            >
              {isGenerating ? "Synthesizing Reflection..." : "Generate Leadership Self-Reflection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

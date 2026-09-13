"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import MediaRecorderStudio from "@/components/interview/MediaRecorderStudio";
import TryAgainComparisonModal from "@/components/interview/TryAgainComparisonModal";
import AuthGuard from "@/components/auth/AuthGuard";
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Activity, 
  Volume2, 
  FileText, 
  Zap, 
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Layers,
  Award
} from "lucide-react";
import { LanguageAnalysisResult, AttemptComparison } from "@/lib/interview/language-analysis-service";

interface PracticeQuestion {
  id: string;
  title: string;
  question: string;
  category: string;
  focusTip: string;
}

const PRACTICE_DRILL_QUESTIONS: PracticeQuestion[] = [
  {
    id: "drill-intro",
    title: "Self-Introduction",
    question: "Tell me about yourself, your technical background, and what drives your passion for software engineering.",
    category: "Software Engineering",
    focusTip: "Keep under 60 seconds. Mention 2 core skills and 1 proud achievement."
  },
  {
    id: "drill-project",
    title: "Project Breakdown",
    question: "Walk me through your most important technical project and the core architectural challenges you solved.",
    category: "Software Engineering",
    focusTip: "Use the 3-step arc: Context → Personal Build Contribution → Quantified Outcome."
  },
  {
    id: "drill-why-hire",
    title: "Why Hire You",
    question: "Why should we hire you for this engineering role over other candidates?",
    category: "Software Engineering",
    focusTip: "Focus on problem-solving speed, continuous learning, and teamwork."
  },
  {
    id: "drill-challenge",
    title: "Overcoming a Challenge",
    question: "Describe a significant challenge or production bug you faced in a project and how you resolved it.",
    category: "Software Engineering",
    focusTip: "Emphasize methodical root-cause debugging without defensive language."
  },
  {
    id: "drill-nontech",
    title: "Explain to Non-Technical Audience",
    question: "Explain a complex technical concept (such as Redis caching or asynchronous API queues) to a non-technical stakeholder.",
    category: "Software Engineering",
    focusTip: "Use an intuitive real-world analogy rather than low-level code jargon."
  }
];

export default function LanguageTrainingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion>(PRACTICE_DRILL_QUESTIONS[0]);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [firstAttemptAnalysis, setFirstAttemptAnalysis] = useState<LanguageAnalysisResult | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<LanguageAnalysisResult | null>(null);
  const [comparison, setComparison] = useState<AttemptComparison | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const handleSelectQuestion = (q: PracticeQuestion) => {
    setSelectedQuestion(q);
    setAttemptNumber(1);
    setFirstAttemptAnalysis(null);
    setCurrentAnalysis(null);
    setComparison(null);
  };

  const handleSessionSubmit = async (sessionData: {
    transcript: string;
    durationSeconds: number;
  }) => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/interview/language-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "guest_user",
          questionId: selectedQuestion.id,
          questionText: selectedQuestion.question,
          roleCategory: selectedQuestion.category,
          transcript: sessionData.transcript,
          durationSeconds: sessionData.durationSeconds,
          previousAttemptAnalysis: attemptNumber > 1 ? firstAttemptAnalysis : null,
          attemptNumber
        })
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setCurrentAnalysis(data.analysis);
        if (attemptNumber === 1) {
          setFirstAttemptAnalysis(data.analysis);
        } else if (data.comparison) {
          setComparison(data.comparison);
          setShowComparisonModal(true);
        }
      }
    } catch (e) {
      console.warn("Language training submission error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    setAttemptNumber(prev => prev + 1);
    setCurrentAnalysis(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1280px] mx-auto">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="space-y-1">
            <Link
              href="/interviews"
              className="text-xs text-[#8E95A5] hover:text-white flex items-center gap-1.5 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Interviews Hub</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D7FC51]/20 text-[#D7FC51] border border-[#D7FC51]/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D7FC51]" />
                <span>Personalized Language &amp; Communication Trainer</span>
              </span>
              <span className="text-xs text-[#8E95A5] font-mono">Attempt #{attemptNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Rapid Spoken Communication Drills</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8E95A5] bg-[#1C1D26] px-3.5 py-2 rounded-2xl border border-white/5">
              Mic Speech Recognition Active
            </span>
          </div>
        </div>

        {/* Question Selector Carousel / Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {PRACTICE_DRILL_QUESTIONS.map((q) => {
            const isSelected = selectedQuestion.id === q.id;
            return (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? "bg-[#D7FC51] text-slate-950 border-[#D7FC51] shadow-lg scale-102"
                    : "bg-[#13141B] text-[#8E95A5] border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                {q.title}
              </button>
            );
          })}
        </div>

        {/* Main Split Studio & Analysis Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Media Studio (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <MediaRecorderStudio
              questionText={selectedQuestion.question}
              category={selectedQuestion.category}
              difficultyLevel={0}
              suggestedDurationSeconds={60}
              userId={user?.uid}
              currentQuestionIndex={1}
              totalQuestions={1}
              adaptiveFocus={selectedQuestion.focusTip}
              onSubmitSession={handleSessionSubmit}
            />

            <div className="p-4 rounded-2xl bg-[#13141B] border border-white/5 space-y-1 text-xs text-[#8E95A5]">
              <span className="font-bold text-white block uppercase tracking-wider text-[10px]">
                Coach Focus Tip:
              </span>
              <p>{selectedQuestion.focusTip}</p>
            </div>
          </div>

          {/* Right Column: Real-time Language Feedback & "What you said" vs "Better Way" (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {currentAnalysis ? (
              <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-in fade-in">
                
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#8E95A5] uppercase">Communication Score</span>
                    <div className="text-3xl font-black text-[#D7FC51]">
                      {currentAnalysis.overallLanguageScore}<span className="text-xs text-[#8E95A5]">/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#1C1D26] p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-[#8E95A5] uppercase block font-mono">Grammar</span>
                      <strong className="text-xs text-white">{currentAnalysis.grammarScore}</strong>
                    </div>
                    <div className="bg-[#1C1D26] p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-[#8E95A5] uppercase block font-mono">Clarity</span>
                      <strong className="text-xs text-white">{currentAnalysis.clarityScore}</strong>
                    </div>
                    <div className="bg-[#1C1D26] p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-[#8E95A5] uppercase block font-mono">Fillers</span>
                      <strong className="text-xs text-rose-400">{currentAnalysis.fillerWordCount}</strong>
                    </div>
                  </div>
                </div>

                {/* "What You Said" vs "Better Way to Say It" */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-[#8E95A5] uppercase tracking-wider block">
                    What You Said vs. Better Way to Say It
                  </span>

                  <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-[#8E95A5] uppercase block font-bold">What You Said:</span>
                    <p className="text-slate-300 italic leading-relaxed">
                      "{currentAnalysis.whatYouSaid}"
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">Improved Version (Natural &amp; Professional):</span>
                    <p className="text-emerald-100 font-medium leading-relaxed">
                      "{currentAnalysis.improvedVersion}"
                    </p>
                    <div className="text-[11px] text-emerald-300/80 pt-1.5 border-t border-emerald-500/20">
                      Why: {currentAnalysis.improvementRationale.join(" • ")}
                    </div>
                  </div>
                </div>

                {/* AI Language Coach Tips */}
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase block font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Language Coach Suggestion:</span>
                  </span>
                  <p className="text-indigo-100 leading-relaxed font-medium">
                    {currentAnalysis.coachSuggestions[0] || "Clear answer structure. Continue supporting your decisions with quantified benchmarks."}
                  </p>
                </div>

                {/* Actions: Try Again & Comparison */}
                <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                  <button
                    onClick={handleTryAgain}
                    className="btn-shine flex-1 py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again (Attempt #{attemptNumber + 1})</span>
                  </button>

                  {comparison && (
                    <button
                      onClick={() => setShowComparisonModal(true)}
                      className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                    >
                      Compare Attempts
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-[#13141B] p-8 rounded-3xl border border-white/10 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <Volume2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Awaiting Spoken Answer</h3>
                  <p className="text-xs text-[#8E95A5] max-w-sm mx-auto leading-relaxed">
                    Click <strong>"Begin Spoken Answer"</strong> on the left. The AI Language Coach will evaluate your sentence construction, filler words, and STAR structure in real-time.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Comparative Modal */}
        <TryAgainComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          comparison={comparison}
          questionText={selectedQuestion.question}
        />

      </div>
    </AuthGuard>
  );
}

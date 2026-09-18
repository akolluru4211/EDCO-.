"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Brain, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Flame, 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle,
  BarChart3,
  Check
} from "lucide-react";

interface Question {
  index: number;
  id: string;
  category: string;
  question: string;
  options: { id: string; text: string }[];
  difficulty: number;
}

export default function AptitudeStudioPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch("/api/aptitude/daily");
        const data = await res.json();
        if (data.success && data.questions) {
          setQuestions(data.questions);
          setTimerActive(true);
        }
      } catch (err) {
        console.error("Failed to load daily aptitude:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, []);

  useEffect(() => {
    if (!timerActive || result || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, result, timeRemaining]);

  const handleSelectOption = (qId: string, optId: string) => {
    if (result) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    setSubmitting(true);
    setTimerActive(false);

    try {
      const res = await fetch("/api/aptitude/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || null,
          answers: userAnswers,
          timeSpentSeconds: 600 - timeRemaining,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const currentQ = questions[currentIdx];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0F15] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-spin mb-4">
          <Brain className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold">Calibrating Daily Aptitude Pool...</h2>
        <p className="text-xs text-slate-400 mt-1">Generating 10 cross-domain questions for today</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#151621] border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
              <Brain className="w-5 h-5 text-[#D7FC51]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">Daily Aptitude Sprint</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D7FC51]/20 text-[#D7FC51] font-bold border border-[#D7FC51]/30">
                  +50 XP
                </span>
              </div>
              <p className="text-xs text-slate-400">10 Daily rotating questions across Quant, Logic, Verbal &amp; CS</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!result && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono font-bold text-amber-400">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {result ? (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#181926] via-[#1B1D2C] to-[#141520] border border-white/10 shadow-2xl space-y-6 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Award className="w-8 h-8 text-[#D7FC51]" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#D7FC51] tracking-widest uppercase">Assessment Complete</span>
                <h2 className="text-3xl font-black text-white mt-1">
                  You Scored {result.score} / {result.totalQuestions} ({result.percentage}%)
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {result.percentage >= 80
                    ? "Outstanding mastery! You demonstrated top-tier problem solving and accuracy."
                    : result.percentage >= 60
                    ? "Solid performance! Review explanations below to turn gaps into strengths."
                    : "Good effort! Daily practice compounds rapidly. Review the detailed breakdowns."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#D7FC51]" />
                <span>+{result.pointsAwarded || 50} Gamification XP Awarded &bull; Streak Updated!</span>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setResult(null);
                    setUserAnswers({});
                    setTimeRemaining(600);
                    setTimerActive(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Sprint</span>
                </button>
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-xl bg-[#D7FC51] text-slate-950 text-xs font-black flex items-center gap-2 hover:bg-[#cbf13f] transition-all"
                >
                  <span>Return to Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Question Breakdown &amp; Explanations</span>
              </h3>

              {result.reviewDetails?.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className={"p-5 rounded-2xl border space-y-3 " + (item.isCorrect ? "bg-[#151621] border-emerald-500/30" : "bg-[#151621] border-rose-500/30")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Q{idx + 1} &bull; {item.category}
                    </span>
                    {item.isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold flex items-center gap-1 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">{item.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.options?.map((opt: any) => {
                      const isCorrectOpt = opt.id === item.correctOptionId;
                      const isSelectedOpt = opt.id === item.selectedOption;
                      return (
                        <div
                          key={opt.id}
                          className={"p-2.5 rounded-xl border flex items-center gap-2 " + (
                            isCorrectOpt
                              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold"
                              : isSelectedOpt
                              ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                              : "bg-slate-900/50 border-white/5 text-slate-400"
                          )}
                        >
                          <span className="w-5 h-5 rounded-md bg-white/10 text-center font-mono text-[10px] leading-5 shrink-0">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300">
                    <span className="font-bold text-[#D7FC51] block mb-1">💡 Solution &amp; Explanation:</span>
                    <p className="text-slate-300 leading-relaxed font-sans">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = Boolean(userAnswers[q.id]);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={"w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all shrink-0 " + (
                      isCurrent
                        ? "bg-[#D7FC51] text-slate-950 shadow-md ring-2 ring-[#D7FC51]/50"
                        : isAnswered
                        ? "bg-indigo-600 text-white"
                        : "bg-[#1C1D2B] text-slate-400 hover:bg-[#25273A]"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentQ && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                      {currentQ.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {answeredCount} / {questions.length} Answered
                  </span>
                </div>

                <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQ.question}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={"p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer " + (
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-white font-bold ring-1 ring-indigo-500"
                            : "bg-[#1C1D2B]/80 hover:bg-[#232537] border-white/5 text-slate-300 hover:text-white"
                        )}
                      >
                        <div
                          className={"w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 " + (
                            isSelected ? "bg-[#D7FC51] text-slate-950" : "bg-white/10 text-slate-400"
                          )}
                        >
                          {opt.id}
                        </div>
                        <span className="text-xs sm:text-sm">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((p) => p - 1)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIdx((p) => p + 1)}
                      className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-[#D7FC51] hover:bg-[#cbf13f] text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg transition-all"
                    >
                      {submitting ? (
                        <span>Evaluating...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Submit &amp; View Results</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

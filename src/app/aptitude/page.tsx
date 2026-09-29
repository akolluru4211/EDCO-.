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
      <div className="min-h-screen bg-[#FCFCFB] flex flex-col items-center justify-center p-6 text-[#13141B]">
        <div className="w-12 h-12 rounded-2xl bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20 flex items-center justify-center animate-spin mb-4">
          <Brain className="w-6 h-6 text-[#00D2B4]" />
        </div>
        <h2 className="text-sm font-extrabold font-sans">Calibrating Daily Aptitude Pool...</h2>
        <p className="text-xs text-[#5E6573] mt-1">Generating 10 cross-domain questions for today</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] p-4 sm:p-8 lg:p-10 font-sans">
      <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Header Capsule */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#EBECEF] shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#13141B] text-white flex items-center justify-center shadow-2xs">
              <Brain className="w-6 h-6 text-[#00D2B4]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#13141B]">EdAptitude</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-[#00D2B4]/10 text-[#0A5245] font-bold border border-[#00D2B4]/20">
                  +50 XP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs font-mono font-bold text-[#13141B]">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#EBECEF] text-xs font-bold text-[#5E6573] hover:text-[#13141B] transition-all shadow-2xs"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {result ? (
          <div className="space-y-6 lg:space-y-8">
            <div className="p-6 sm:p-10 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-6 text-center">
              <div className="inline-flex p-3.5 rounded-2xl bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20">
                <Award className="w-9 h-9 text-[#00D2B4]" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#0A5245] bg-[#00D2B4]/10 border border-[#00D2B4]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  Assessment Complete
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#13141B] mt-4">
                  You Scored {result.score} / {result.totalQuestions} ({result.percentage}%)
                </h2>
                <p className="text-xs sm:text-sm text-[#5E6573] mt-2 max-w-lg mx-auto">
                  {result.percentage >= 80
                    ? "Outstanding mastery! You demonstrated top-tier problem solving and accuracy."
                    : result.percentage >= 60
                    ? "Solid performance! Review explanations below to turn gaps into strengths."
                    : "Good effort! Daily practice compounds rapidly. Review the detailed breakdowns."}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
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
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#EBECEF] text-[#13141B] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Sprint</span>
                </button>
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-xl bg-[#13141B] text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-2xs"
                >
                  <span>Return to Hub</span>
                  <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#13141B] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00D2B4]" />
                <span>Question Breakdown &amp; Explanations</span>
              </h3>

              {result.reviewDetails?.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className={"p-5 rounded-2xl border space-y-3 shadow-xs " + (item.isCorrect ? "bg-white border-emerald-200" : "bg-white border-rose-200")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#5E6573]">
                      Q{idx + 1} &bull; {item.category}
                    </span>
                    {item.isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold flex items-center gap-1 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#13141B] leading-relaxed">{item.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.options?.map((opt: any) => {
                      const isCorrectOpt = opt.id === item.correctOptionId;
                      const isSelectedOpt = opt.id === item.selectedOption;
                      return (
                        <div
                          key={opt.id}
                          className={"p-3 rounded-xl border flex items-center gap-2.5 " + (
                            isCorrectOpt
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                              : isSelectedOpt
                              ? "bg-rose-50 border-rose-300 text-rose-900 line-through"
                              : "bg-[#FCFCFB] border-[#EBECEF] text-[#5E6573]"
                          )}
                        >
                          <span className="w-5 h-5 rounded-md font-mono text-[10px] font-bold flex items-center justify-center bg-white border border-[#EBECEF]">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs text-[#5E6573] space-y-1">
                      <span className="font-bold text-[#13141B] flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#00D2B4]" />
                        Explanation:
                      </span>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress indicators */}
            <div className="bg-white p-4 rounded-2xl border border-[#EBECEF] shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#5E6573]">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span>{answeredCount} of {questions.length} Answered</span>
              </div>

              <div className="grid grid-cols-10 gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center ${
                        isCurrent
                          ? "bg-[#13141B] text-white ring-2 ring-[#00D2B4]"
                          : isAnswered
                          ? "bg-[#00D2B4]/15 text-[#0A5245] border border-[#00D2B4]/30"
                          : "bg-[#FCFCFB] text-[#5E6573] border border-[#EBECEF] hover:bg-slate-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question card */}
            {currentQ && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EBECEF] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBECEF] pb-4">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FCFCFB] text-[#5E6573] border border-[#EBECEF] uppercase">
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#5E6573]">
                    Difficulty: {currentQ.difficulty}/5
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[#13141B] leading-relaxed">
                  {currentQ.question}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = userAnswers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? "bg-[#13141B] text-white border-[#13141B] shadow-xs"
                            : "bg-[#FCFCFB] hover:bg-slate-50 border-[#EBECEF] text-[#13141B]"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-white text-[#13141B] border-white"
                              : "bg-white text-[#5E6573] border-[#EBECEF]"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#00D2B4]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#EBECEF] flex items-center justify-between gap-3">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#EBECEF] text-xs font-bold text-[#13141B] disabled:opacity-40 flex items-center gap-1.5 shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {currentIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIdx((prev) => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4 text-[#00D2B4]" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#00D2B4]" />
                        <span>{submitting ? "Submitting..." : "Submit Sprint"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

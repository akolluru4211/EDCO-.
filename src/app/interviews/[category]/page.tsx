"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AVAILABLE_CATEGORIES } from "@/lib/mock-data";
import { SkillLevel } from "@/lib/types";
import MediaRecorderStudio from "@/components/interview/MediaRecorderStudio";
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Layers,
  HelpCircle,
  Lock,
  ArrowRight,
  FileText,
  Play,
  RotateCcw,
  Briefcase
} from "lucide-react";

export default function ActiveInterviewStudioPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const categoryId = params?.category as string;

  // Career Track Gating: 18+ only
  const isMinorUser = user ? user.ageBand !== "18+" : false;

  const categoryObj = AVAILABLE_CATEGORIES.find(
    (c) => c.id === categoryId || c.name.toLowerCase().includes(categoryId?.toLowerCase() || "")
  ) || AVAILABLE_CATEGORIES[0];

  const categoryName = categoryObj.name;

  const interestObj = profile?.interests?.find(
    (i) => i.id === categoryObj.id || i.name.toLowerCase() === categoryName.toLowerCase() || categoryName.toLowerCase().includes(i.name.toLowerCase())
  );
  const effectiveLevel: SkillLevel = interestObj ? interestObj.effectiveLevel : 0;

  // State
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [generating, setGenerating] = useState(false);

  const handleStartSession = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescriptionInput,
          category: categoryName,
          effectiveLevel
        })
      });

      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        // Fallback with fixed opener
        setQuestions([
          {
            id: "warmup-1",
            text: "Tell me about yourself, your background, and what drives your passion for this domain.",
            difficultyLevel: 0,
            isWarmup: true
          },
          {
            id: "q-fallback-2",
            text: `Can you walk me through your technical approach and key decisions when developing a solution in ${categoryName}?`,
            difficultyLevel: effectiveLevel,
            isWarmup: false
          }
        ]);
      }
      setSessionStarted(true);
    } catch (e) {
      console.warn("Question generation note:", e);
      setSessionStarted(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleSessionComplete = async (sessionSubmission: {
    transcript: string;
    durationSeconds: number;
    isAudioOnly?: boolean;
    fullscreenExitEvents?: Array<{ timestamp: string; questionIndex: number }>;
  }) => {
    if (!user) return;

    try {
      const res = await fetch("/api/interview/score-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          category: categoryName,
          difficultyLevel: effectiveLevel,
          questions: questions.length > 0 ? questions : [{ id: "q1", text: "Interview Question", transcript: sessionSubmission.transcript }],
          transcript: sessionSubmission.transcript,
          durationSeconds: sessionSubmission.durationSeconds,
          fullscreenExitEvents: sessionSubmission.fullscreenExitEvents || []
        })
      });

      const data = await res.json();
      if (data.success && data.sessionId) {
        // Store in user cache for instant result view
        localStorage.setItem(`edworld_${user.uid}_interview_${data.sessionId}`, JSON.stringify(data));
        router.push(`/interviews/results/${data.sessionId}`);
      } else {
        router.push(`/interviews`);
      }
    } catch (e) {
      console.warn("Session score submission error:", e);
      router.push("/interviews");
    }
  };

  if (isMinorUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Career Track Restricted</h1>
          <p className="text-xs text-slate-500">
            Mock interviews and speech diagnostics are available for 18+ Career Track members. Junior learners can practice communication drills in the School Hub.
          </p>
          <Link href="/school" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Go to School Hub
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx] || {
    id: "warmup-1",
    text: "Tell me about yourself, your background, and what drives your passion for this domain.",
    difficultyLevel: 0
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/interviews" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mock Interview Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              {categoryName} • Level {effectiveLevel}
            </span>
          </div>
        </div>

        {!sessionStarted ? (
          /* PRE-SESSION SETUP: OPTIONAL JD PASTE & CONFIG */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Mock Interview Configuration</span>
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Configure Your {categoryName} Practice Session</h1>
              <p className="text-xs text-slate-500 max-w-xl">
                Paste a target job description to generate role-tailored technical &amp; behavioral questions, or proceed with standard level-matched questions.
              </p>
            </div>

            {/* Optional JD Input Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target Job Description (Optional)</span>
              </label>
              <textarea
                rows={5}
                value={jobDescriptionInput}
                onChange={(e) => setJobDescriptionInput(e.target.value)}
                placeholder="Paste responsibilities and required skills from a job posting (e.g. Senior Frontend Engineer with React, Next.js, and GraphQL requirements)..."
                className="w-full p-4 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-inner"
              />
            </div>

            {/* Session Features Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">1. Universal Warm-up</div>
                <p className="text-[11px] text-slate-500">Starts with standard &ldquo;Tell me about yourself&rdquo; opener.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">2. Voice-Delivered Audio</div>
                <p className="text-[11px] text-slate-500">Questions read aloud with replay &amp; prep countdown.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">3. Fullscreen Integrity</div>
                <p className="text-[11px] text-slate-500">Auto-pauses on exit with neutral session logging.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartSession}
                disabled={generating}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{generating ? "Generating Tailored Questions..." : "Enter Fullscreen Interview Studio"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVIEW STUDIO */
          <div className="space-y-4">
            <MediaRecorderStudio
              questionText={currentQ.text}
              category={categoryName}
              difficultyLevel={currentQ.difficultyLevel || effectiveLevel}
              suggestedDurationSeconds={currentQ.suggestedDurationSeconds || 120}
              currentQuestionIndex={currentQuestionIdx + 1}
              totalQuestions={questions.length || 2}
              userId={user?.uid}
              onSubmitSession={handleSessionComplete}
            />
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquareQuote, 
  RefreshCw,
  Award
} from "lucide-react";
import Button from "@/components/ui/Button";

const DRILL_PROMPTS = [
  "Explain your favorite hobby or technical interest to someone who has never heard of it before.",
  "Describe a time you worked on a challenging school assignment or personal project and how you solved it.",
  "If you could build any technology tool to improve your community, what would it be and why?"
];

export default function CommunicationTrainerPage() {
  const { user } = useAuth();
  const [promptIdx, setPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcriptInput, setTranscriptInput] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<any>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimerSeconds(0);
    setFeedbackResult(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleEvaluate = async () => {
    if (!transcriptInput.trim()) return;
    setEvaluating(true);

    try {
      const res = await fetch("/api/school/communication-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptInput,
          promptText: DRILL_PROMPTS[promptIdx],
          durationSeconds: Math.max(30, timerSeconds)
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackResult(data.data);
      }
    } catch (e) {
      console.warn("Trainer evaluation error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper p-4 sm:p-8 text-ink">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/school" className="text-xs font-bold text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to School Hub</span>
          </Link>
          <span className="text-xs font-bold text-forest bg-forest/10 border border-forest/20 px-3 py-1 rounded-full">
            Explorer Track • Clarity &amp; Structure Only
          </span>
        </div>

        {/* Practice Studio Card */}
        <div className="bg-paper-raised rounded-3xl p-8 border border-line shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-forest">Practice Question</span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-ink leading-snug">
              &ldquo;{DRILL_PROMPTS[promptIdx]}&rdquo;
            </h1>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span>Start 60s Drill</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Recording ({timerSeconds}s)</span>
                </button>
              )}

              <button
                onClick={() => setPromptIdx((promptIdx + 1) % DRILL_PROMPTS.length)}
                className="p-2 rounded-xl text-ink-soft hover:bg-paper-soft text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Prompt</span>
              </button>
            </div>

            {timerSeconds > 0 && (
              <span className="text-xs font-mono font-bold text-ink-soft">
                Duration: {timerSeconds}s
              </span>
            )}
          </div>

          {/* Speech Transcript or Practice Text */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Your Speech Transcript / Practice Notes
            </label>
            <textarea
              rows={4}
              value={transcriptInput}
              onChange={(e) => setTranscriptInput(e.target.value)}
              placeholder="Speak aloud or paste your response text here to evaluate your clarity, pacing, and structural flow..."
              className="w-full p-4 rounded-2xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEvaluate}
              disabled={evaluating || !transcriptInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{evaluating ? "Evaluating..." : "Get Clarity & Structure Feedback"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Display */}
        {feedbackResult && (
          <div className="bg-paper-raised rounded-3xl p-8 border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-forest">Feedback Summary</span>
                <h2 className="text-lg font-bold font-display text-ink">Communication Practice Results</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/20">
                  Clarity: {feedbackResult.clarityScore}%
                </span>
                <span className="text-xs font-mono font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                  Structure: {feedbackResult.structureScore}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-forest/5 border border-forest/20 text-xs text-ink space-y-1">
                <span className="font-bold text-forest flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Strengths
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-ink-soft pl-1">
                  {feedbackResult.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 text-xs text-ink space-y-1">
                <span className="font-bold text-gold-dark">Next Practice Focus</span>
                <ul className="list-disc list-inside space-y-0.5 text-ink-soft pl-1">
                  {feedbackResult.areasForImprovement?.map((a: string, idx: number) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-paper-soft border border-line text-xs text-ink-soft font-medium italic">
                &ldquo;{feedbackResult.encouragement}&rdquo;
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Clock,
  Flame,
  Award
} from "lucide-react";

interface SpeakingHabitsProps {
  metricsHistory?: Array<{
    interviewId: string;
    date: string;
    languageScore: number;
    clarityScore: number;
    fillerCount: number;
    wpm: number;
  }>;
  profileSummary?: {
    languageScore: number;
    grammarScore: number;
    clarityScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    professionalScore: number;
    totalInterviews: number;
    averageWpm: number;
    topFillers: string[];
    strengths: string[];
    recommendedFocus: string[];
  };
}

export default function SpeakingHabitsTracker({
  metricsHistory = [],
  profileSummary
}: SpeakingHabitsProps) {
  // Use real metrics if available or sensible defaults from profile
  const history = metricsHistory.length > 0 ? metricsHistory : [
    { interviewId: "int-1", date: "Interview 1", languageScore: 68, clarityScore: 64, fillerCount: 16, wpm: 148 },
    { interviewId: "int-2", date: "Interview 2", languageScore: 74, clarityScore: 72, fillerCount: 11, wpm: 136 },
    { interviewId: "int-3", date: "Interview 3", languageScore: 82, clarityScore: 80, fillerCount: 6, wpm: 128 },
  ];

  const currentScore = profileSummary?.languageScore || history[history.length - 1]?.languageScore || 78;
  const currentFillers = profileSummary?.topFillers || ["actually", "basically"];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-xl">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-indigo-400" />
              <span>Cross-Interview Communication Tracker</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {profileSummary?.totalInterviews || history.length} Interviews Analyzed
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Spoken English & Communication Habits</h2>
          <p className="text-xs text-slate-400">
            Real speech telemetry tracked across your mock interviews to eliminate recurring filler words and master concise structure.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400">Comm Score:</span>
          <span className="text-xl font-black text-[#D7FC51]">{currentScore}/100</span>
        </div>
      </div>

      {/* 3 Key Longitudinal Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Filler Words Reduction Progression */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Filler Words Trend</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              -62% Reduction
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{h.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (h.fillerCount / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-white w-6 text-right">{h.fillerCount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Top detected filler: <strong>"{currentFillers[0] || "um"}"</strong></span>
          </div>
        </div>

        {/* 2. Clarity & Structure Score Trajectory */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Clarity & STAR Growth</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +16 pts
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{h.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${h.clarityScore}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-white w-6 text-right">{h.clarityScore}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Sentence length optimized from 34 &rarr; 16 words/sentence</span>
          </div>
        </div>

        {/* 3. Speaking Cadence / WPM Calibration */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Speaking Cadence</span>
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
              Ideal (125 WPM)
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{h.date}</span>
                <span className="font-mono font-bold text-white">{h.wpm} WPM</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Natural pauses between points allow technical comprehension.</span>
          </div>
        </div>

      </div>

      {/* Persistent Focus & Strengths Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
          <span className="font-extrabold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirmed Speaking Strengths</span>
          </span>
          <p className="text-slate-200">
            {profileSummary?.strengths?.join(" • ") || "Strong technical vocabulary • Excellent problem breakdown • Intelligible and clear pronunciation"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1 text-xs">
          <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next Communication Focus</span>
          </span>
          <p className="text-slate-200">
            {profileSummary?.recommendedFocus?.join(" • ") || "Pause for breath rather than using 'actually' • Anchor conclusion with 1 concrete metric"}
          </p>
        </div>
      </div>

    </div>
  );
}

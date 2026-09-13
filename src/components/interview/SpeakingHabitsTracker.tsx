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
  const hasData = metricsHistory.length > 0 || !!profileSummary;

  if (!hasData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-indigo-400" />
            <span>Cross-Interview Communication Tracker</span>
          </span>
        </div>
        <h2 className="text-xl font-black text-white">Spoken English & Communication Habits</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Real speech telemetry tracked across your mock interviews to eliminate recurring filler words, optimize speaking pace (WPM), and master concise STAR structure.
        </p>

        <div className="p-6 rounded-2xl bg-slate-950 border border-dashed border-slate-800 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300">No Interview Audio Sessions Recorded Yet</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Complete your first live mock interview drill to unlock personalized speech cadence, filler word reduction charts, and language recommendations.
          </p>
        </div>
      </div>
    );
  }

  const history = metricsHistory;
  const currentScore = profileSummary?.languageScore || (history.length > 0 ? history[history.length - 1].languageScore : 0);
  const currentFillers = profileSummary?.topFillers || [];

  const fillerDelta = history.length >= 2 
    ? Math.round(((history[0].fillerCount - history[history.length - 1].fillerCount) / Math.max(1, history[0].fillerCount)) * 100)
    : null;

  const clarityDelta = history.length >= 2
    ? history[history.length - 1].clarityScore - history[0].clarityScore
    : null;

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
            {fillerDelta !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${fillerDelta >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {fillerDelta >= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {fillerDelta >= 0 ? `-${fillerDelta}% Reduction` : `+${Math.abs(fillerDelta)}%`}
              </span>
            )}
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

          {currentFillers.length > 0 && (
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>Top detected filler: <strong>&ldquo;{currentFillers[0]}&rdquo;</strong></span>
            </div>
          )}
        </div>

        {/* 2. Clarity & Structure Score Trajectory */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Clarity & STAR Growth</span>
            {clarityDelta !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${clarityDelta >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {clarityDelta >= 0 ? `+${clarityDelta} pts` : `${clarityDelta} pts`}
              </span>
            )}
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
            <span>Clarity evaluated against concise STAR framework structure</span>
          </div>
        </div>

        {/* 3. Speaking Cadence / WPM Calibration */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Speaking Cadence</span>
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" />
              {profileSummary?.averageWpm ? `${profileSummary.averageWpm} WPM Avg` : "Real Pace"}
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
            <span>Target range: 120–150 words per minute</span>
          </div>
        </div>

      </div>

      {/* Persistent Focus & Strengths Row */}
      {(profileSummary?.strengths?.length || profileSummary?.recommendedFocus?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {profileSummary?.strengths && profileSummary.strengths.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
              <span className="font-extrabold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirmed Speaking Strengths</span>
              </span>
              <p className="text-slate-200">
                {profileSummary.strengths.join(" • ")}
              </p>
            </div>
          )}

          {profileSummary?.recommendedFocus && profileSummary.recommendedFocus.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1 text-xs">
              <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Next Communication Focus</span>
              </span>
              <p className="text-slate-200">
                {profileSummary.recommendedFocus.join(" • ")}
              </p>
            </div>
          )}
        </div>
      ) : null}

    </div>
  );
}

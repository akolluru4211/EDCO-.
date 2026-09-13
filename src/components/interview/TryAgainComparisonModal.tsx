"use client";

import React from "react";
import { 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  X, 
  ArrowRight, 
  RotateCcw,
  Zap,
  Activity
} from "lucide-react";
import { AttemptComparison } from "@/lib/interview/language-analysis-service";

interface TryAgainComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: AttemptComparison | null;
  questionText: string;
}

export default function TryAgainComparisonModal({
  isOpen,
  onClose,
  comparison,
  questionText,
}: TryAgainComparisonModalProps) {
  if (!isOpen || !comparison) return null;

  const { attempt1, attempt2, deltas, overallVerdict } = comparison;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Spoken Answer Iteration Comparison</span>
            </span>
            <h2 className="text-xl font-black text-white">First Attempt vs. Second Attempt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
          "{questionText}"
        </div>

        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* 1. Language Score */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Language Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white">{attempt2.languageScore}</span>
              <span className="text-xs text-slate-500 line-through">{attempt1.languageScore}</span>
            </div>
            <div className={`text-[10px] font-bold flex items-center gap-0.5 ${deltas.languageScoreDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {deltas.languageScoreDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{deltas.languageScoreDelta >= 0 ? `+${deltas.languageScoreDelta}` : deltas.languageScoreDelta} pts</span>
            </div>
          </div>

          {/* 2. Clarity Score */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Clarity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white">{attempt2.clarityScore}</span>
              <span className="text-xs text-slate-500 line-through">{attempt1.clarityScore}</span>
            </div>
            <div className={`text-[10px] font-bold flex items-center gap-0.5 ${deltas.clarityScoreDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {deltas.clarityScoreDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{deltas.clarityScoreDelta >= 0 ? `+${deltas.clarityScoreDelta}` : deltas.clarityScoreDelta} pts</span>
            </div>
          </div>

          {/* 3. Filler Words */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Filler Words</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white">{attempt2.fillerCount}</span>
              <span className="text-xs text-slate-500 line-through">{attempt1.fillerCount}</span>
            </div>
            <div className={`text-[10px] font-bold flex items-center gap-0.5 ${deltas.fillerReductionPercent >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
              <span>{deltas.fillerReductionPercent >= 0 ? `-${deltas.fillerReductionPercent}%` : `+${Math.abs(deltas.fillerReductionPercent)}%`}</span>
            </div>
          </div>

          {/* 4. Speaking Pace */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Speaking Pace</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white">{attempt2.wpm}</span>
              <span className="text-xs text-slate-500">WPM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Prev: {attempt1.wpm} WPM</span>
          </div>

        </div>

        {/* AI Honest Verdict */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>AI Coach Comparative Verdict</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {overallVerdict}
          </p>
          <div className="text-[11px] text-indigo-200/80 font-mono">
            Structure: {deltas.structureVerdict}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md"
          >
            Continue Practice
          </button>
        </div>

      </div>
    </div>
  );
}

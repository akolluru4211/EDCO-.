"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Volume2, 
  Mic,
  Zap,
  Target
} from "lucide-react";

interface DailyPracticeCardProps {
  focusArea?: string;
  task?: string;
  guidelines?: string[];
  roleCategory?: string;
}

export default function DailyPracticeCard({
  focusArea = "Reducing 'actually' filler words",
  task = 'Answer in 60 seconds: "Tell me about a key technical project you built and why you are proud of it."',
  guidelines = [
    "Avoid filler words ('actually', 'basically', 'like')",
    "Use 3 clear structured points (Context → Action → Metric)",
    "Conclude within 45–60 seconds with clear pace"
  ],
  roleCategory = "Software Engineering"
}: DailyPracticeCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl border border-indigo-500/30 p-6 sm:p-8 space-y-6 text-white shadow-2xl">
      
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Personalized Daily Practice Drill</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">1-Minute Challenge</span>
        </div>

        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
          Target: {roleCategory}
        </span>
      </div>

      {/* Focus & Task */}
      <div className="space-y-3 relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-indigo-300 font-bold block">
            Focus Opportunity: {focusArea}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {task}
          </h3>
        </div>

        {/* Guidelines Checklist */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Success Checklist:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
            {guidelines.map((g, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Trigger */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Mic className="w-4 h-4 text-indigo-400" />
          <span>Real-time speech recognition with instant "What You Said" vs "Better Way to Say It"</span>
        </div>

        <Link
          href={`/interviews/language-training?focus=${encodeURIComponent(focusArea)}`}
          className="btn-shine px-6 py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start 60s Practice Drill</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

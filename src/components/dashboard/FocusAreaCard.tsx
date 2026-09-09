"use client";

import React from "react";
import Link from "next/link";
import { SkillLevel, UserInterest } from "@/lib/types";
import { getDifficultyBadgeColor, getDifficultyLabel } from "@/lib/utils";
import { 
  Video, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Layers,
  PlusCircle
} from "lucide-react";

interface FocusAreaCardProps {
  interest: UserInterest;
  interviewCount?: number;
  lastActivityText?: string;
  hasActivity?: boolean;
}

export default function FocusAreaCard({
  interest,
  interviewCount = 0,
  lastActivityText = "No activity recorded yet",
  hasActivity = false,
}: FocusAreaCardProps) {
  const level = interest.effectiveLevel ?? 0;

  // Concentric Growth Ring SVG calculation
  const getRingStroke = (ringLevel: number) => {
    if (level > ringLevel) return "stroke-emerald-500 stroke-[4]"; // Fully mastered
    if (level === ringLevel) return "stroke-brand-500 stroke-[4] animate-pulse"; // Current active level
    return "stroke-slate-200 stroke-[2] stroke-dasharray-[2 2]"; // Locked
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group">
      {/* Top Header & Growth Ring */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {interest.category || "CAREER DOMAIN"}
            </span>
            <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors">
              {interest.name}
            </h3>
          </div>

          {/* Growth Ring Graphic */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
              {/* Outer Ring: Level 2 */}
              <circle cx="24" cy="24" r="20" fill="none" className={getRingStroke(2)} />
              {/* Middle Ring: Level 1 */}
              <circle cx="24" cy="24" r="14" fill="none" className={getRingStroke(1)} />
              {/* Inner Ring: Level 0 */}
              <circle cx="24" cy="24" r="8" fill="none" className={getRingStroke(0)} />
            </svg>
            <span className="absolute text-[10px] font-black font-mono text-slate-900">
              L{level}
            </span>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadgeColor(level)}`}>
            {getDifficultyLabel(level)}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {level === 0 ? "Foundational" : level === 1 ? "Intermediate" : "Advanced Mastery"}
          </span>
        </div>

        {/* Activity Summary / Empty State */}
        {hasActivity ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-700">
            <div className="flex items-center justify-between font-bold">
              <span>Recorded Performance</span>
              <span className="text-emerald-700 font-mono">{interviewCount} Sessions</span>
            </div>
            <p className="text-[11px] text-slate-500">{lastActivityText}</p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2.5">
            <PlusCircle className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-[11px]">
              Ready for calibration. Take your first Level {level} mock interview to set your baseline score.
            </span>
          </div>
        )}
      </div>

      {/* Action Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          Target Level: Level {Math.min(2, level + 1)}
        </span>
        <Link
          href={`/interviews/${interest.id || "swe"}`}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span>Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

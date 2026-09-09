"use client";

import React from "react";
import { PeerStudyCircle } from "@/lib/types";
import { getDifficultyBadgeColor, getDifficultyLabel } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Layers
} from "lucide-react";

interface StudyCircleCardProps {
  circle: PeerStudyCircle;
  isJoined?: boolean;
  onToggleJoin?: (circleId: string) => void;
}

export default function StudyCircleCard({
  circle,
  isJoined = false,
  onToggleJoin,
}: StudyCircleCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Domain Badge & Level */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {circle.domain}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getDifficultyBadgeColor(circle.difficultyLevel)}`}>
            Level {circle.difficultyLevel} &bull; {getDifficultyLabel(circle.difficultyLevel)}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 leading-snug">{circle.name}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {circle.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {circle.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-slate-600">
              #{t}
            </span>
          ))}
        </div>

        {/* Meta Row */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{circle.memberCount} / {circle.maxMembers} Members</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{circle.nextSessionAt}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">Lead: {circle.leadName}</span>
        <button
          onClick={() => onToggleJoin && onToggleJoin(circle.id)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
            isJoined
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          }`}
        >
          {isJoined ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Joined</span>
            </>
          ) : (
            <>
              <span>Join Circle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

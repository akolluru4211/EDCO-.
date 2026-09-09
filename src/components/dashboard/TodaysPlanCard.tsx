"use client";

import React from "react";
import Link from "next/link";
import { DailyTask, DailyPlan } from "@/lib/types";
import { getDifficultyBadgeColor, getDifficultyLabel } from "@/lib/utils";
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Zap,
  RotateCcw,
  SkipForward,
  Award
} from "lucide-react";

interface TodaysPlanCardProps {
  plan: DailyPlan;
  onCompleteTask: (taskId: string) => Promise<void>;
  onSkipTask?: (taskId: string, category: string) => void;
}

export default function TodaysPlanCard({
  plan,
  onCompleteTask,
  onSkipTask,
}: TodaysPlanCardProps) {
  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalCount = plan.tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Streak HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Adaptive Plan &bull; {plan.date}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Daily Practice Agenda
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{plan.streakDays} Day Streak</span>
          </div>

          {/* Points Earned Today */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>+{plan.pointsEarnedToday} pts today</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600">
          <span>
            {completedCount} of {totalCount} Tasks Complete ({progressPercent}%)
          </span>
          <span>Total Score: {plan.totalPoints} pts</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              allCompleted ? "bg-emerald-500" : "bg-slate-900"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* All Complete Celebration Banner */}
      {allCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">All Daily Tasks Completed!</p>
              <p className="opacity-90 text-[11px]">
                Your streak is locked in for today. Feel free to explore more practice modules.
              </p>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-800">Streak Maintained</span>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {plan.tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              task.completed
                ? "bg-slate-50 border-slate-200 opacity-80"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => !task.completed && onCompleteTask(task.id)}
                disabled={task.completed}
                className="mt-0.5 text-slate-400 hover:text-slate-900 transition-colors disabled:cursor-default"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      task.completed ? "line-through text-slate-500" : "text-slate-900"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getDifficultyBadgeColor(task.difficultyLevel)}`}>
                    Level {task.difficultyLevel}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    +{task.points} pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {task.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mr-1">
                <Clock className="w-3 h-3" />
                {task.estimatedMinutes}m
              </span>

              {onSkipTask && !task.completed && (
                <button
                  onClick={() => onSkipTask(task.id, task.category)}
                  title="Skip task (adapts future recommendations)"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xs"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}

              <Link
                href={task.actionUrl}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Start</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { WeeklyScheduleDay } from "@/lib/types";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock,
  Sparkles
} from "lucide-react";

interface WeeklyTimetableProps {
  days: WeeklyScheduleDay[];
  streakDays: number;
}

export default function WeeklyTimetable({ days, streakDays }: WeeklyScheduleDay[] | any) {
  const scheduleDays: WeeklyScheduleDay[] = days || [
    { dayName: "Mon", date: "2026-08-25", isToday: false, isCompleted: true, taskCount: 3, completedTaskCount: 3 },
    { dayName: "Tue", date: "2026-08-26", isToday: false, isCompleted: true, taskCount: 3, completedTaskCount: 3 },
    { dayName: "Wed", date: "2026-08-27", isToday: false, isCompleted: false, taskCount: 3, completedTaskCount: 0 },
    { dayName: "Thu", date: "2026-08-28", isToday: false, isCompleted: true, taskCount: 4, completedTaskCount: 4 },
    { dayName: "Fri", date: "2026-08-29", isToday: false, isCompleted: true, taskCount: 3, completedTaskCount: 3 },
    { dayName: "Sat", date: "2026-08-30", isToday: true, isCompleted: false, taskCount: 3, completedTaskCount: 1 },
    { dayName: "Sun", date: "2026-08-31", isToday: false, isCompleted: false, taskCount: 3, completedTaskCount: 0 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-black text-slate-900">Weekly Practice Timetable</h2>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Active Streak: {streakDays || 1} Days</span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {scheduleDays.map((d, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between space-y-2 ${
              d.isToday
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : d.isCompleted
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <span
              className={`text-[10px] font-mono font-bold uppercase ${
                d.isToday ? "text-brand-300" : d.isCompleted ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              {d.dayName}
            </span>

            <div>
              {d.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 mx-auto" />
              ) : d.isToday ? (
                <div className="w-5 h-5 rounded-full border-2 border-brand-400 flex items-center justify-center mx-auto">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 mx-auto" />
              )}
            </div>

            <span
              className={`text-[9px] font-mono ${
                d.isToday ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {d.isCompleted
                ? `${d.completedTaskCount} done`
                : d.isToday
                ? "Today"
                : "Rest"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 text-center font-mono">
        Lightweight pacing planner &bull; Daily tasks reset at midnight &bull; Build steady mastery without burnout
      </p>
    </div>
  );
}

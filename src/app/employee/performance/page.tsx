"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Award, 
  Calendar, 
  MessageSquare, 
  ChevronLeft, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Star
} from "lucide-react";
import Button from "@/components/ui/Button";
import { getEmployeeOKRs, getEmployeeTasks } from "@/lib/db-service";
import { EmployeeOKR, EmployeeTask } from "@/lib/types";

export default function EmployeePerformancePage() {
  const { user } = useAuth();
  const [okrs, setOkrs] = useState<EmployeeOKR[]>([]);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);

  useEffect(() => {
    const load = async () => {
      const [o, t] = await Promise.all([
        getEmployeeOKRs(user?.uid || "emp_demo_1"),
        getEmployeeTasks(user?.uid || "emp_demo_1"),
      ]);
      setOkrs(o);
      setTasks(t);
    };
    load();
  }, [user]);

  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const okrAvg = okrs.length > 0 ? Math.round(okrs.reduce((a, b) => a + b.overallProgress, 0) / okrs.length) : 85;

  return (
    <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1280px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <Link href="/employee" className="inline-flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-[#D7FC51] font-bold mb-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Employee Workspace</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Employee Performance &amp; Reviews</h1>
          <p className="text-xs text-[#8E95A5]">
            Evidence-backed performance telemetry, project contributions, and manager feedback.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-2xl bg-[#D7FC51]/10 text-[#D7FC51] border border-[#D7FC51]/30 text-xs font-black font-mono">
            H1 2026 Cycle
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
          <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-400" />
            <span>OKR Pacing</span>
          </span>
          <div className="text-3xl font-black text-white font-mono">{okrAvg}%</div>
          <span className="text-[10px] text-emerald-400 font-bold">On Track for Q1 Deliverables</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
          <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D7FC51]" />
            <span>Tasks Completed</span>
          </span>
          <div className="text-3xl font-black text-white font-mono">{completedTasks}</div>
          <span className="text-[10px] text-[#8E95A5] font-mono">{inProgressTasks} currently in progress</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
          <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Attendance Rate</span>
          </span>
          <div className="text-3xl font-black text-white font-mono">98.4%</div>
          <span className="text-[10px] text-emerald-400 font-bold">Zero Unexcused Absences</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#13141B] border border-white/10 space-y-2">
          <span className="text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Manager Rating</span>
          </span>
          <div className="text-3xl font-black text-white font-mono flex items-center gap-1">
            <span>4.8</span>
            <span className="text-xs text-[#8E95A5] font-normal">/ 5.0</span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">Exceeds Expectations</span>
        </div>
      </div>

      {/* Main Evidence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project Contributions & Code Impact */}
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Verified Project Contributions &amp; Impact</span>
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1.5">
              <span className="text-xs font-bold text-white block">Phase 19 Dual-Track RBAC Middleware</span>
              <p className="text-[11px] text-[#8E95A5]">
                Architected server-side role verification eliminating client-side privilege escalation across 55 internal routes.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Shipped &bull; 0 Regressions</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1.5">
              <span className="text-xs font-bold text-white block">Autonomous HR &amp; Placement AI Agents</span>
              <p className="text-[11px] text-[#8E95A5]">
                Integrated real-time bottleneck detection logic for recruitment workflows and campus placement drive coordination.
              </p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Shipped &bull; Production Verified</span>
            </div>
          </div>
        </div>

        {/* Manager Feedback & Review History */}
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Manager Feedback &amp; Review History</span>
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Sunita Rao (VP of Engineering)</span>
                <span className="text-[10px] text-[#8E95A5] font-mono">Feb 28, 2026</span>
              </div>
              <p className="text-[11px] text-[#8E95A5] italic">
                &ldquo;Exceptional velocity and ownership on the organization operating system upgrade. Clear architectural discipline and zero-leak security guardrails.&rdquo;
              </p>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">H2 2025 Annual Review Summary</span>
                <span className="text-[10px] text-[#8E95A5] font-mono">Jan 15, 2026</span>
              </div>
              <div className="text-[11px] text-[#8E95A5] space-y-1">
                <div><strong className="text-white">Strengths:</strong> System design, cross-functional execution, proactive unblocking.</div>
                <div><strong className="text-white">Growth Areas:</strong> Mentoring junior campus recruits joining in Q2.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

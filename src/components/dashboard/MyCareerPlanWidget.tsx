"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Target, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Code2, 
  Brain, 
  Award, 
  ExternalLink, 
  Check, 
  RotateCcw, 
  Flame, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  ShieldCheck, 
  Zap, 
  FileText,
  AlertCircle,
  Play
} from "lucide-react";
import { 
  CareerPlanOverview, 
  DailyPlanTask, 
  RoadmapPhase, 
  UserDomainItem 
} from "@/lib/types";
import BorderBeam from "@/components/ui/BorderBeam";

interface MyCareerPlanWidgetProps {
  userId?: string;
  userName?: string;
}

export default function MyCareerPlanWidget({ userId, userName = "Learner" }: MyCareerPlanWidgetProps) {
  const [activeTab, setActiveTab] = useState<"timetable" | "roadmap" | "advisor">("timetable");
  const [planOverview, setPlanOverview] = useState<CareerPlanOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [adaptingPhase, setAdaptingPhase] = useState(false);
  const [expandedPhaseIndex, setExpandedPhaseIndex] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchPlan = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/career-os?userId=${userId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlanOverview(data.plan);
        if (data.plan.roadmap?.current_phase_index !== undefined) {
          setExpandedPhaseIndex(data.plan.roadmap.current_phase_index);
        }
      }
    } catch (err) {
      console.warn("Error fetching Career Learning OS plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [userId]);

  const handleToggleTaskStatus = async (task: DailyPlanTask, newStatus: "completed" | "in_progress" | "pending" | "skipped") => {
    if (!userId) return;
    setUpdatingTaskId(task.id);
    try {
      // Optimistic update
      setPlanOverview(prev => {
        if (!prev) return prev;
        const updatedTasks = prev.todayTasks.map(t => 
          t.id === task.id ? { ...t, status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : undefined } : t
        );
        return { ...prev, todayTasks: updatedTasks };
      });

      const res = await fetch("/api/career-os/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          taskId: task.id,
          status: newStatus
        })
      });

      const resData = await res.json();
      if (resData.success) {
        if (newStatus === "completed") {
          setFeedbackMessage("Task completed! +15 XP added to your daily progress.");
          setTimeout(() => setFeedbackMessage(null), 3500);
        }
      }
    } catch (err) {
      console.warn("Failed to toggle task status:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAdaptCurriculum = async (proposalId?: string, newPhaseIndex: number = 1, action: "accept" | "dismiss" = "accept") => {
    if (!userId) return;
    setAdaptingPhase(true);
    try {
      const res = await fetch("/api/career-os/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action,
          proposalId,
          newPhaseIndex,
          changeReason: "Performance acceleration verified through recent coding and interview drills"
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setFeedbackMessage(action === "accept" ? ("Curriculum successfully adapted to Phase " + (newPhaseIndex + 1)) : "Adaptation dismissed.");
        setTimeout(() => setFeedbackMessage(null), 4000);
        await fetchPlan();
      }
    } catch (err) {
      console.warn("Failed to adapt curriculum:", err);
    } finally {
      setAdaptingPhase(false);
    }
  };

  if (loading) {
    return (
      <div className="card-quixel p-6 sm:p-7 space-y-4 animate-pulse bg-white border border-[#E8ECF2] rounded-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 rounded-xl" />
          <div className="h-6 w-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-20 bg-slate-100 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const domains = planOverview?.domains || [];
  const goal = planOverview?.goal;
  const roadmap = planOverview?.roadmap;
  const todayTasks = planOverview?.todayTasks || [];
  const adaptationProposals = planOverview?.adaptationProposals || [];
  const effectiveLevels = planOverview?.effectiveLevels || {};

  const currentPhase = roadmap?.phases[roadmap.current_phase_index] || roadmap?.phases[0];
  const completedTodayCount = todayTasks.filter(t => t.status === "completed").length;
  const totalTodayCount = todayTasks.length;
  const todayPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  return (
    <div className="card-quixel p-5 sm:p-7 relative overflow-hidden bg-white border border-[#E8ECF2] rounded-3xl shadow-sm space-y-6">
      <BorderBeam size={280} duration={14} colorFrom="#D7FC51" colorTo="#7B57FF" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F2F6] pb-5">
        <div className="space-y-2">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D7FC51]" />
              MY CAREER PLAN
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#767E94]">
              Personalized Career Learning OS
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#181920] tracking-tight leading-tight">
              {goal?.target_role || "Full Stack Software Engineer"}
            </h2>
            <div className="flex items-center flex-wrap gap-2 pt-2">
              {domains.map((d) => {
                const priorityBadge = 
                  d.priority === "primary" ? "bg-[#EDE8FD] text-[#7B57FF] border-[#7B57FF]/30" :
                  d.priority === "secondary" ? "bg-[#E0FAF6] text-[#008A77] border-[#00D2B4]/30" :
                  "bg-[#FFF6DC] text-[#B87A00] border-[#FFB800]/30";
                
                return (
                  <span
                    key={d.domain_id}
                    className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-xl border ${priorityBadge} flex items-center gap-1.5`}
                  >
                    <span className="capitalize">{d.priority}:</span>
                    <span>{d.domain_name.split("&")[0].trim()}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phase Progress Capsule */}
        <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E8ECF2] shadow-inner">
          <div className="space-y-1">
            <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#8E95A5]">
              Active Phase
            </div>
            <div className="text-sm sm:text-base font-black text-[#181920] leading-none">
              Phase {(roadmap?.current_phase_index || 0) + 1} of {roadmap?.total_phases || 4}
            </div>
            <div className="text-xs sm:text-sm text-[#767E94] font-medium truncate max-w-[200px]">
              {currentPhase?.title.replace(/^Phase \d+:\s*/, "") || "Foundations"}
            </div>
          </div>

          <div className="w-14 h-14 rounded-full border-4 border-[#EDE8FD] border-t-[#7B57FF] flex items-center justify-center font-black text-sm text-[#7B57FF] bg-white shadow-sm">
            {todayPercent}%
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST / BANNER */}
      {feedbackMessage && (
        <div className="p-3.5 bg-[#E0FAF6] border border-[#00D2B4]/40 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#008A77] animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00D2B4] flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* ACTIVE AI ADAPTATION PROPOSAL BANNER (If Available) */}
      {adaptationProposals.length > 0 && activeTab !== "advisor" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EDE8FD] via-[#F3E8FF] to-[#E0FAF6] border border-[#7B57FF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#7B57FF] text-white flex items-center justify-center shadow-md shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#D7FC51]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-black text-[#181920]">
                AI Curriculum Acceleration Proposal
              </div>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                {adaptationProposals[0].change_reason}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveTab("advisor")}
              className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#13141B] text-white text-xs sm:text-sm font-bold shadow hover:bg-[#252632] transition-all cursor-pointer whitespace-nowrap"
            >
              Review Adaptation &rarr;
            </button>
          </div>
        </div>
      )}

      {/* MODE TABS */}
      <div className="flex items-center gap-2 border-b border-[#F0F2F6] pb-3.5 overflow-x-auto touch-scroll-x">
        <button
          onClick={() => setActiveTab("timetable")}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "timetable"
              ? "bg-[#13141B] text-white shadow-sm"
              : "text-[#767E94] hover:text-[#181920] hover:bg-[#F4F6FB]"
          }`}
        >
          <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === "timetable" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
          <span>Today&apos;s Timetable ({completedTodayCount}/{totalTodayCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "roadmap"
              ? "bg-[#13141B] text-white shadow-sm"
              : "text-[#767E94] hover:text-[#181920] hover:bg-[#F4F6FB]"
          }`}
        >
          <Layers className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === "roadmap" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
          <span>Unified Roadmap ({roadmap?.phases.length || 4} Phases)</span>
        </button>

        <button
          onClick={() => setActiveTab("advisor")}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "advisor"
              ? "bg-[#13141B] text-white shadow-sm"
              : "text-[#767E94] hover:text-[#181920] hover:bg-[#F4F6FB]"
          }`}
        >
          <Brain className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === "advisor" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
          <span>Adaptive AI Advisor {adaptationProposals.length > 0 && <span className="w-2 h-2 rounded-full bg-[#7B57FF] animate-ping" />}</span>
        </button>
      </div>

      {/* TAB 1: TODAY'S TIMETABLE */}
      {activeTab === "timetable" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#767E94]">
            <span className="font-bold">
              Scheduled tasks for today ({new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })})
            </span>
            <span className="font-mono font-semibold">
              Target: {goal?.available_hours_per_day || 2} hrs/day
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#E8ECF2] space-y-2">
              <Calendar className="w-8 h-8 text-[#8E95A5] mx-auto opacity-60" />
              <p className="text-xs font-bold text-[#181920]">All scheduled tasks for today are completed!</p>
              <p className="text-[11px] text-[#767E94]">Great consistency. Explore projects or practice mock interviews to accelerate your track.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {todayTasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isUpdating = updatingTaskId === task.id;

                const blockBadge = 
                  task.time_block === "morning" ? "bg-[#FFF6DC] text-[#B87A00]" :
                  task.time_block === "afternoon" ? "bg-[#EDE8FD] text-[#7B57FF]" :
                  "bg-[#E0FAF6] text-[#008A77]";

                const actionHref = 
                  task.practice_url || 
                  (task.task_type === "practice" ? "/problems" :
                   task.task_type === "interview_drill" ? "/interviews" :
                   task.task_type === "aptitude" ? "/aptitude" :
                   task.task_type === "resume_tuning" ? "/resumes" :
                   task.task_type === "project" ? "/projects" :
                   task.resource_url || "/problems");

                return (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCompleted 
                        ? "bg-[#F8FAFC] border-[#E8ECF2] opacity-80" 
                        : "bg-white border-[#E8ECF2] shadow-sm hover:border-[#7B57FF]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Interactive checkbox */}
                      <button
                        onClick={() => handleToggleTaskStatus(task, isCompleted ? "pending" : "completed")}
                        disabled={isUpdating}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 ${
                          isCompleted
                            ? "bg-[#00D2B4] text-[#13141B] shadow-sm"
                            : "bg-[#F4F6FB] border-2 border-[#D1D5DB] hover:border-[#7B57FF] text-transparent"
                        }`}
                        title={isCompleted ? "Mark as pending" : "Mark as completed"}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${blockBadge}`}>
                            {task.time_block}
                          </span>
                          <span className="text-[11px] font-mono text-[#8E95A5] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimated_minutes} mins
                          </span>
                          <span className="text-[10px] font-bold text-[#767E94] uppercase">
                            • {task.task_type.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h4 className={`text-sm sm:text-base font-black text-[#181920] leading-snug ${isCompleted ? "line-through text-[#8E95A5]" : ""}`}>
                          {task.title}
                        </h4>

                        {task.notes && (
                          <p className="text-xs text-[#767E94]">{task.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {task.resource_url && !task.resource_url.startsWith("/") && (
                        <a
                          href={task.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#181920] text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Resource</span>
                        </a>
                      )}

                      <Link
                        href={actionHref}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          isCompleted
                            ? "bg-[#F4F6FB] text-[#767E94] hover:bg-[#E8ECF2]"
                            : "bg-[#13141B] hover:bg-[#252632] text-white hover:scale-105 active:scale-95"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Review Drill</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-[#D7FC51]" />
                            <span>Start Now</span>
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UNIFIED ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#767E94]">
            <span className="font-bold">
              Sequential Multi-Domain Path ({roadmap?.phases.length || 4} Total Phases)
            </span>
            <span className="text-[11px] font-bold text-[#7B57FF]">
              Target Timeframe: {goal?.target_timeframe_months || 6} Months
            </span>
          </div>

          <div className="space-y-3">
            {roadmap?.phases.map((phase, idx) => {
              const isActive = idx === (roadmap.current_phase_index || 0);
              const isPast = idx < (roadmap.current_phase_index || 0);
              const isFuture = idx > (roadmap.current_phase_index || 0);
              const isExpanded = expandedPhaseIndex === idx;

              return (
                <div
                  key={phase.id || idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isActive
                      ? "bg-white border-[#7B57FF] shadow-md ring-1 ring-[#7B57FF]/20"
                      : isPast
                      ? "bg-[#F8FAFC] border-[#E8ECF2]"
                      : "bg-white border-[#E8ECF2] opacity-80"
                  }`}
                >
                  {/* Phase Accordion Header */}
                  <button
                    onClick={() => setExpandedPhaseIndex(isExpanded ? -1 : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${
                        isPast ? "bg-[#00D2B4] text-[#13141B]" :
                        isActive ? "bg-[#7B57FF] text-white" :
                        "bg-[#F0F2F6] text-[#8E95A5]"
                      }`}>
                        {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-black text-[#181920]">
                            {phase.title}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[10px] font-black uppercase">
                              In Progress
                            </span>
                          )}
                          {isPast && (
                            <span className="px-2 py-0.5 rounded-full bg-[#E0FAF6] text-[#008A77] text-[10px] font-black uppercase">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#767E94]">
                          {phase.subtitle} • ~{phase.estimated_weeks} Weeks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#8E95A5] hidden sm:inline">
                        {phase.milestones.length} Milestones
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-[#8E95A5]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#8E95A5]" />
                      )}
                    </div>
                  </button>

                  {/* Phase Milestones Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-[#F0F2F6] space-y-3 bg-[#FCFCFD]">
                      <p className="text-xs text-[#5E6573] italic pt-3">
                        Objective: {phase.objective}
                      </p>

                      <div className="space-y-2 pt-1">
                        {phase.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="p-3.5 rounded-xl bg-white border border-[#E8ECF2] flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-[#181920]">
                                  {m.title}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  ~{m.estimated_hours} hrs
                                </span>
                              </div>
                              <p className="text-[11px] text-[#767E94] leading-relaxed">
                                {m.description}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              {m.practice_url ? (
                                <Link
                                  href={m.practice_url}
                                  className="px-3 py-1.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                                >
                                  <span>Practice</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              ) : m.resource_url ? (
                                <a
                                  href={m.resource_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#181920] text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                                >
                                  <span>Docs</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADAPTIVE AI ADVISOR */}
      {activeTab === "advisor" && (
        <div className="space-y-5">
          {/* Active Proposals */}
          {adaptationProposals.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#181920] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7B57FF]" />
                Curriculum Adaptation Proposal
              </h3>

              {adaptationProposals.map((prop, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-gradient-to-r from-[#EDE8FD] via-[#F4F0FF] to-[#E0FAF6] border border-[#7B57FF]/30 space-y-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-black text-[#7B57FF] uppercase tracking-wider">
                      Verified Competency Trigger
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#181920] leading-snug">
                      {prop.change_reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleAdaptCurriculum(prop.id, prop.new_phase_index, "accept")}
                      disabled={adaptingPhase}
                      className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {adaptingPhase ? "Adapting..." : ("Accept & Accelerate to Phase " + (prop.new_phase_index + 1))}
                    </button>
                    <button
                      onClick={() => handleAdaptCurriculum(prop.id, prop.new_phase_index, "dismiss")}
                      disabled={adaptingPhase}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#767E94] text-xs font-bold border border-[#E8ECF2] transition-all cursor-pointer"
                    >
                      Keep Current Pace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E8ECF2] text-xs text-[#767E94] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
              <span>Your curriculum is currently synchronized with your target pace. Complete today&apos;s drills to trigger further calibrations.</span>
            </div>
          )}

          {/* Domain Calibrated Radar / Telemetry */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[#181920] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D2B4]" />
              Domain Skill Telemetry (Self vs. Effective)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {domains.map((d) => {
                const telemetry = effectiveLevels[d.domain_id] || {
                  selfLevel: d.self_level,
                  effectiveLevel: d.effective_level,
                  evidenceCount: 0,
                  label: "Not enough evidence yet"
                };

                return (
                  <div
                    key={d.domain_id}
                    className="p-4 rounded-2xl bg-white border border-[#E8ECF2] shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#181920]">{d.domain_name}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {d.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E8ECF2] space-y-1">
                        <span className="text-[10px] text-[#8E95A5] font-bold block uppercase">Self-Declared</span>
                        <span className="font-bold text-[#181920]">
                          {telemetry.selfLevel === 2 ? "Advanced" : telemetry.selfLevel === 1 ? "Intermediate" : "Foundational"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#EDE8FD] border border-[#7B57FF]/20 space-y-1">
                        <span className="text-[10px] text-[#7B57FF] font-bold block uppercase">Effective Level</span>
                        <span className="font-bold text-[#7B57FF]">
                          {telemetry.effectiveLevel === 2 ? "Advanced" : telemetry.effectiveLevel === 1 ? "Intermediate" : "Foundational"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#8E95A5] font-medium">
                      Status: {telemetry.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

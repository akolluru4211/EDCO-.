"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Brain,
  Code2,
  FileText,
  Video,
  Target,
  RefreshCw
} from "lucide-react";
import {
  UserPerformanceOverview,
  PerformanceDimensionMetric,
  PerformanceStatusLabel,
  DailyAIRecommendation,
  DailyAISummary
} from "@/lib/services/performance-intelligence";

interface PerformanceIntelligenceWidgetProps {
  userId?: string;
  userName?: string;
  track?: "student" | "career";
}

export default function PerformanceIntelligenceWidget({
  userId,
  userName = "Student",
  track = "career",
}: PerformanceIntelligenceWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<UserPerformanceOverview | null>(null);
  const [dailyRec, setDailyRec] = useState<DailyAIRecommendation | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyAISummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [resOverview, resRec] = await Promise.all([
        fetch("/api/performance/overview"),
        fetch("/api/performance/daily-recommendation"),
      ]);

      if (resOverview.ok) {
        const data = await resOverview.json();
        setOverview(data.overview);
      } else {
        console.warn("Could not load performance overview");
      }

      if (resRec.ok) {
        const data = await resRec.json();
        setDailyRec(data.recommendation);
        setDailySummary(data.summary);
      }
    } catch (err: any) {
      console.error("Error fetching performance intelligence:", err);
      setError(err.message || "Failed to load performance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const getStatusBadge = (status: PerformanceStatusLabel) => {
    switch (status) {
      case "STRONG":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Strong
          </span>
        );
      case "DEVELOPING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Developing
          </span>
        );
      case "NEEDS_PRACTICE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Needs Practice
          </span>
        );
      case "NOT_ENOUGH_DATA":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 inline-flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Not Enough Data
          </span>
        );
    }
  };

  const getDimensionIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case "communication":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "technical":
      case "technical_skills":
        return <Brain className="w-4 h-4 text-blue-500" />;
      case "coding":
      case "problem_solving":
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case "resume":
        return <FileText className="w-4 h-4 text-amber-500" />;
      case "projects":
        return <Target className="w-4 h-4 text-indigo-500" />;
      case "interview":
      default:
        return <Sparkles className="w-4 h-4 text-teal-500" />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
          <div className="h-28 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const overallScoreCalculated = overview?.dimensions?.filter(d => d.score !== null);
  const averageScore = overallScoreCalculated && overallScoreCalculated.length > 0
    ? Math.round(overallScoreCalculated.reduce((acc, d) => acc + (d.score || 0), 0) / overallScoreCalculated.length)
    : null;

  return (
    <section className="space-y-6">
      {/* 1. Overall Intelligence & Action Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Performance Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {averageScore !== null ? (
                <>Overall Index: <span className="text-indigo-400">{averageScore}/100</span></>
              ) : (
                "Performance Radar Initializing"
              )}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {overview?.hasSufficientData
                ? `Calculated from ${overview.totalEventsAnalyzed} verified actions across mock interviews, code challenges, ATS scans, and project evaluations.`
                : "No simulated scores. Complete mock interviews, resume reviews, or coding challenges to generate verified performance data."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => fetchPerformanceData(true)}
              disabled={refreshing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
              title="Refresh intelligence from latest verified logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Recalculate Radar"}</span>
            </button>
            <Link
              href="/interview"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Take Mock Drill</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dimension Radar Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.dimensions &&
            overview.dimensions.map((dim: PerformanceDimensionMetric, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/10">
                      {getDimensionIcon(dim.dimension)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      {dim.title}
                    </span>
                  </div>
                  {getStatusBadge(dim.statusLabel)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-400">Score</span>
                    <span className="font-bold text-white">
                      {dim.score !== null ? `${dim.score}/100` : "—"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: dim.score !== null ? `${dim.score}%` : "0%" }}
                    ></div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Evidence Points:</span>
                  <span className="font-mono text-slate-200">{dim.evidencePoints.length} records</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 2. Today's AI Recommendation & Focus Module */}
      {dailyRec && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Today's AI Focus Recommendation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Targeted improvement derived from your lowest-performing verified skills
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              Focus: {dailyRec.focusArea}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {dailyRec.taskTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {dailyRec.reason}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <strong>Objective:</strong> {dailyRec.taskDescription}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Evidence: {dailyRec.evidenceSummary || "Verified platform metrics"}
              </span>
              {dailyRec.taskActionUrl && (
                <Link
                  href={dailyRec.taskActionUrl}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <span>Start Recommended Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Daily Summary / Activity Snapshot */}
      {dailySummary && dailySummary.hasActivity && (
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Daily Activity Summary:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {dailySummary.recommendedNext || "All daily goals in steady progression."}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span>Completed: <strong className="text-slate-900 dark:text-white">{dailySummary.completedItems.length}</strong></span>
            <span>Improved: <strong className="text-slate-900 dark:text-white">{dailySummary.improvedItems.length}</strong></span>
          </div>
        </div>
      )}
    </section>
  );
}

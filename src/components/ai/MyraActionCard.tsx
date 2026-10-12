"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Check, 
  X, 
  ExternalLink, 
  ArrowRight, 
  FileEdit, 
  Video, 
  Calendar, 
  Sliders, 
  Briefcase, 
  Target, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { ToolProposalResult } from "@/lib/ai/myra-tool-executor";

interface MyraActionCardProps {
  proposal: ToolProposalResult;
  userId?: string;
  onActionComplete?: (result: any) => void;
  onDismiss?: () => void;
}

export default function MyraActionCard({
  proposal,
  userId,
  onActionComplete,
  onDismiss,
}: MyraActionCardProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getToolIcon = () => {
    switch (proposal.tool) {
      case "update_resume_section":
        return <FileEdit className="w-4 h-4 text-emerald-600" />;
      case "start_mock_interview":
        return <Video className="w-4 h-4 text-teal-600" />;
      case "schedule_task":
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case "reorder_dashboard":
        return <Sliders className="w-4 h-4 text-indigo-600" />;
      case "search_jobs":
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case "update_dashboard_goal":
        return <Target className="w-4 h-4 text-teal-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleApply = async () => {
    if (!userId) {
      setErrorMsg("Please sign in to execute this change.");
      return;
    }

    // If it's launching an interview with an actionUrl, navigate directly
    if (proposal.tool === "start_mock_interview" && proposal.preview.actionUrl) {
      window.location.href = proposal.preview.actionUrl;
      return;
    }

    setIsApplying(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/myra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_confirmed",
          tool: proposal.tool,
          parameters: proposal.parameters,
          userId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsApplied(true);
        if (onActionComplete) onActionComplete(data);
      } else {
        setErrorMsg(data.message || data.error || "Action failed to execute.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error executing action.");
    } finally {
      setIsApplying(false);
    }
  };

  // 1. READ-ONLY TOOL: Search Jobs Results
  if (proposal.isReadOnly && proposal.preview.readOnlyData) {
    const jobs = proposal.preview.readOnlyData || [];
    return (
      <div className="mt-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              {getToolIcon()}
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">{proposal.preview.title}</h4>
              <p className="text-[10px] text-zinc-500">{proposal.preview.description}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {jobs.length} Found
          </span>
        </div>

        {jobs.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">No active jobs found matching these filters.</p>
        ) : (
          <div className="space-y-2 pt-1">
            {jobs.map((j: any) => (
              <div
                key={j.id}
                className="p-2.5 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">{j.title}</h5>
                  <p className="text-[10px] text-zinc-500">{j.company} &bull; {j.location || "Remote"} {j.salary_range ? `&bull; ${j.salary_range}` : ""}</p>
                </div>
                <Link
                  href={`/jobs`}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1"
                >
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. WRITE ACTIONS: Requires Explicit Confirmation Step
  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-emerald-50/20 border border-emerald-200/80 shadow-xs space-y-3 text-zinc-900">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
            {getToolIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                Confirmation Required
              </span>
            </div>
            <h4 className="text-xs font-black text-zinc-950 mt-0.5">{proposal.preview.title}</h4>
          </div>
        </div>

        {onDismiss && !isApplied && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Dismiss proposal"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-[11px] text-zinc-600 leading-snug">
        {proposal.preview.description}
      </p>

      {/* Visual Diff Preview for Resume Updates */}
      {proposal.tool === "update_resume_section" && proposal.preview.after && (
        <div className="space-y-1.5 text-xs rounded-xl bg-white p-3 border border-zinc-200/90 font-mono">
          {proposal.preview.before && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-900 text-[11px] line-through leading-relaxed">
              <span className="font-bold text-[9px] uppercase tracking-wider block text-rose-600 no-underline mb-0.5">Current (To Replace):</span>
              {typeof proposal.preview.before === "string" ? proposal.preview.before : JSON.stringify(proposal.preview.before, null, 2)}
            </div>
          )}
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-950 text-[11px] leading-relaxed">
            <span className="font-bold text-[9px] uppercase tracking-wider block text-emerald-700 mb-0.5">Proposed Replacement:</span>
            {typeof proposal.preview.after === "string" ? proposal.preview.after : JSON.stringify(proposal.preview.after, null, 2)}
          </div>
        </div>
      )}

      {/* Preview for Mock Interview Launch */}
      {proposal.tool === "start_mock_interview" && (
        <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Role:</span>
            <span className="font-bold text-zinc-900">{proposal.parameters.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[11px]">Difficulty:</span>
            <span className="font-bold text-zinc-900">{proposal.parameters.difficulty}</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <p className="text-[11px] font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          {errorMsg}
        </p>
      )}

      {/* Actions */}
      <div className="pt-1 flex items-center justify-end gap-2">
        {isApplied ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>Applied Successfully</span>
          </div>
        ) : (
          <>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                disabled={isApplying}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="px-4 py-1.5 rounded-xl text-xs font-black bg-zinc-950 text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{proposal.tool === "start_mock_interview" ? "Launch Interview" : "Apply Change"}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

    </div>
  );
}

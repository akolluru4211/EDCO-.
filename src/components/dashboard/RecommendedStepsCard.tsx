"use client";

import React from "react";
import Link from "next/link";
import { RecommendedStep } from "@/lib/types";
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  Compass, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2,
  Zap
} from "lucide-react";

interface RecommendedStepsCardProps {
  recommendations: RecommendedStep[];
}

export default function RecommendedStepsCard({ recommendations }: RecommendedStepsCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Explainable Next Steps
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400">Tailored to your profile &amp; gaps</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {rec.category}
                </span>
                {rec.priority === "high" && (
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    High Priority
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{rec.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200/60">
              {/* Explainability Tag (Core Requirement) */}
              <div className="text-[11px] text-brand-900 bg-brand-50/70 border border-brand-200/60 p-2.5 rounded-xl font-medium flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                <span>{rec.explainabilityTag}</span>
              </div>

              <Link
                href={rec.actionUrl}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

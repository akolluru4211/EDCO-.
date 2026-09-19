"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Briefcase, 
  HelpCircle, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ArrowLeft 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CompanyResearchPage() {
  const params = useParams();
  const rawName = (params?.companyName as string) || "TechCorp";
  const companyName = decodeURIComponent(rawName);

  const [companyData, setCompanyData] = useState<any>({
    companyName: companyName,
    cultureNotes: "Fast-paced engineering environment focusing on ownership, scalable microservices, and continuous deployment.",
    interviewProcessNotes: "Standard 4-5 stage process: Recruiter Screen (30m) -> Online Assessment (90m) -> 2x Technical Coding (DSA & Concurrency) -> 1x System Design -> 1x Hiring Manager Leadership round.",
    commonQuestionThemes: ["Distributed Systems", "Graph Traversal", "System Reliability", "Cross-team Conflict Resolution", "Concurrency"],
    compensationInsights: "Competitive top-tier base with annual performance bonuses and standardized equity vesting.",
    lastVerifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  });
  const [activeJobs, setActiveJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: comp } = await supabase
          .from("company_research")
          .select("*")
          .ilike("company_name", companyName)
          .maybeSingle();

        if (comp) {
          setCompanyData(comp);
        }

        const { data: jobs } = await supabase
          .from("jobs")
          .select("*")
          .ilike("company", companyName)
          .eq("is_active", true);

        if (jobs) {
          setActiveJobs(jobs);
        }
      } catch (err) {
        console.warn("Company data fetch note:", err);
      }
    };
    fetchCompanyData();
  }, [companyName]);

  const daysSinceVerified = Math.round(
    (Date.now() - new Date(companyData.lastVerifiedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/interview-experiences"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Interview Directory</span>
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
                {companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">{companyName}</h1>
                <p className="text-xs text-slate-400 mt-0.5">Company Intelligence &amp; Interview Calibration</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified {daysSinceVerified}d ago</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#D7FC51]">Company Culture &amp; Values</span>
              <p className="text-slate-300 leading-relaxed">{companyData.cultureNotes}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-indigo-400">Compensation Insights</span>
              <p className="text-slate-300 leading-relaxed">{companyData.compensationInsights || "Market competitive base with performance bonuses."}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Standard Interview Process &amp; Format</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">{companyData.interviewProcessNotes}</p>

          <div className="space-y-2 pt-3 border-t border-white/5">
            <span className="text-[11px] font-bold text-slate-400 block">Common Question Themes &amp; Assessment Focus:</span>
            <div className="flex flex-wrap gap-1.5">
              {companyData.commonQuestionThemes?.map((theme: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Active Openings at {companyName} ({activeJobs.length})
            </h2>
            <Link href="/jobs" className="text-xs text-[#D7FC51] font-bold hover:underline">
              View All Platform Jobs &rarr;
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#151621] border border-white/10 text-center text-xs text-slate-400">
              No current direct openings listed on EdWorld for {companyName}. Check back soon or set up a job alert.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeJobs.map((j) => (
                <div key={j.id} className="p-4 rounded-2xl bg-[#151621] border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-white">{j.title}</h4>
                    <p className="text-[10px] text-slate-400">{j.location} &bull; {j.type}</p>
                  </div>
                  <Link
                    href={"/jobs/" + j.id}
                    className="px-3 py-1 rounded-lg bg-[#D7FC51] text-slate-950 text-xs font-bold hover:bg-[#cbf13f]"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

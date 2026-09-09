"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import ApplyModal from "@/components/jobs/ApplyModal";
import ReportModal from "@/components/reports/ReportModal";
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Flag, 
  ShieldCheck, 
  TrendingUp,
  Share2
} from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobListing | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (data) {
          setJob({
            id: data.id,
            title: data.title,
            company: data.company,
            description: data.description,
            location: data.location,
            type: data.type,
            skillsRequired: data.skills_required || [],
            postedBy: data.posted_by,
            applicationDeadline: data.application_deadline,
            createdAt: data.created_at,
            isActive: data.is_active,
            moderationStatus: data.moderation_status,
            salaryRange: data.salary_range,
          });
          return;
        }
      } catch (err) {}

      const saved = localStorage.getItem("edworld_jobs");
      if (saved) {
        try {
          const list: JobListing[] = JSON.parse(saved);
          const found = list.find((j) => j.id === jobId) || list[0];
          setJob(found);
          return;
        } catch (e) {}
      }
    };

    loadJob();
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <p className="text-sm font-semibold text-slate-500">Loading Job Details...</p>
      </div>
    );
  }

  // Calculate detailed match score and skill breakdown
  const userSkills = (profile?.interests || []).map((i) => i.name.toLowerCase());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  job.skillsRequired.forEach((reqSkill) => {
    const lower = reqSkill.toLowerCase();
    if (
      userSkills.some(
        (s) => s.includes(lower) || lower.includes(s) || lower.includes("typescript") || lower.includes("react")
      )
    ) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const isAdult = user?.ageBand === "18+";
  const isExpired = new Date(job.applicationDeadline).getTime() <= Date.now() || !job.isActive;

  const sweInterest = (profile?.interests || []).find((i) => i.id === "swe");
  const userEffectiveLevel = sweInterest ? sweInterest.effectiveLevel : 0;
  const isLevelRecommended = job.recommendedMinLevel !== undefined && job.recommendedMinLevel <= userEffectiveLevel;

  const baseMatch = job.skillsRequired.length > 0 ? (matchedSkills.length / job.skillsRequired.length) * 85 : 80;
  const matchScore = Math.min(98, Math.max(60, Math.round(baseMatch + (userEffectiveLevel * 5) + 8)));

  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Job and internship applications are restricted to adult Career Track accounts.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Board</span>
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Posting</span>
          </button>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Job Listing Expired:</strong> The application deadline for this position has passed. Applications are closed.</span>
            </div>
            <span className="font-mono font-bold text-rose-700">Closed</span>
          </div>
        )}

        {/* Level Fit Informational Note */}
        {!isLevelRecommended && job.recommendedMinLevel !== undefined && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Skill Level Recommendation Note:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This role typically expects <strong>Level {job.recommendedMinLevel}</strong> mastery in {job.skillsRequired.slice(0, 2).join(", ")}. Your current demonstrated level is <strong>Level {userEffectiveLevel}</strong>. You are still welcome to apply, and can practice mock interviews in the Mock Studio to level up!
              </p>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                {job.company.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {job.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">&bull; Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {job.title}
                </h1>
                <p className="text-sm font-bold text-slate-600">{job.company}</p>
              </div>
            </div>

            <button
              onClick={() => setIsApplyOpen(true)}
              disabled={isExpired}
              className="w-full md:w-auto px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isExpired ? "Applications Closed" : "Apply with Edworld Resume"}</span>
            </button>
          </div>

          {/* Quick Meta Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Location
              </span>
              <p className="font-bold text-slate-900">{job.location}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Compensation
              </span>
              <p className="font-bold text-slate-900">{job.salaryRange || "Competitive"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Deadline
              </span>
              <p className="font-bold text-slate-900">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-0.5 text-emerald-950">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Match Score
              </span>
              <p className="font-black text-emerald-700 text-sm">{matchScore}% Match</p>
            </div>
          </div>
        </div>

        {/* Personalized Skill & Effective Level Alignment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-black text-slate-900">Your Skills & Level Compatibility</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Skills Aligned with Your Profile ({matchedSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchedSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing or Target Skills */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Additional Role Requirements ({missingSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[11px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Effective Level Guidance Note */}
          {job.recommendedMinLevel !== undefined && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
              <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  Target Effective Level: Level {job.recommendedMinLevel} (Your Current Level: Level {userEffectiveLevel})
                </span>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {userEffectiveLevel >= job.recommendedMinLevel
                    ? "Your demonstrated skill level meets or exceeds the recommended baseline for this opportunity."
                    : "This role targets advanced system architecture. We encourage you to apply and highlight coursework or project leadership!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Job Description & Requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-black text-slate-900">About the Role & Responsibilities</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Required Core Competencies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {job.skillsRequired.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={job}
        matchScore={matchScore}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="job"
        targetId={job.id}
        targetName={`${job.title} @ ${job.company}`}
      />
    </div>
  );
}

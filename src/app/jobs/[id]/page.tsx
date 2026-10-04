"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CURATED_JOB_LISTINGS } from "@/lib/data/curated-jobs";
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
  Share2,
  ExternalLink
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
            type: data.type === "full_time" ? "full-time" : data.type,
            skillsRequired: data.skills_required || [],
            postedBy: data.posted_by || "admin",
            applicationDeadline: data.application_deadline,
            createdAt: data.created_at,
            isActive: data.is_active,
            moderationStatus: data.moderation_status,
            salaryRange: data.salary_range,
            category: data.category,
            externalUrl: data.external_url,
            sourceNotes: data.source_notes,
            experienceLevel: data.experience_level,
          });
          return;
        }
      } catch (err) {}

      // Fallback 1: Local storage custom created jobs
      const saved = localStorage.getItem("edworld_jobs");
      if (saved) {
        try {
          const list: JobListing[] = JSON.parse(saved);
          const found = list.find((j) => j.id === jobId);
          if (found) {
            setJob(found);
            return;
          }
        } catch (e) {}
      }

      // Fallback 2: Curated opportunities catalog
      const curatedFound = CURATED_JOB_LISTINGS.find((j) => j.id === jobId);
      if (curatedFound) {
        setJob(curatedFound);
        return;
      }

      // Default fallback
      setJob(CURATED_JOB_LISTINGS[0]);
    };

    loadJob();
  }, [jobId]);

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-white text-black font-sans">
        <p className="text-sm font-semibold text-neutral-500">Loading Job Details...</p>
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

  const isAdult = user ? user.ageBand === "18+" : true;
  const isExpired = new Date(job.applicationDeadline).getTime() <= Date.now() || !job.isActive;

  const sweInterest = (profile?.interests || []).find((i) => i.id === "swe");
  const userEffectiveLevel = sweInterest ? sweInterest.effectiveLevel : 0;
  const isLevelRecommended = job.recommendedMinLevel !== undefined && job.recommendedMinLevel <= userEffectiveLevel;

  const baseMatch = job.skillsRequired.length > 0 ? (matchedSkills.length / job.skillsRequired.length) * 85 : 80;
  const matchScore = Math.min(98, Math.max(60, Math.round(baseMatch + (userEffectiveLevel * 5) + 8)));

  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-white font-sans text-black">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-black tracking-tight">Access Restricted</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Job and internship applications are restricted to adult Career Track accounts.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-8 px-4 sm:px-6 lg:px-8 xl:px-10 text-black font-sans">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Job Board</span>
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-black font-medium transition-colors"
          >
            <Flag className="w-4 h-4" />
            <span>Report Posting</span>
          </button>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100 border border-neutral-300 text-black text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-neutral-600 shrink-0" />
              <span><strong>Job Listing Expired:</strong> The application deadline for this position has passed. Applications are closed.</span>
            </div>
            <span className="font-mono font-bold text-neutral-600">Closed</span>
          </div>
        )}

        {/* Verification / Source Note Banner */}
        {job.sourceNotes && (
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs sm:text-sm flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-black shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Official Listing Notice: </span>
              <span>{job.sourceNotes}</span>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 lg:space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-sm shrink-0">
                {job.company.charAt(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {job.category && (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      job.category === "MNC"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : job.category === "Startup"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {job.category}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {job.type}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-400">&bull; Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight">
                  {job.title}
                </h1>
                <p className="text-sm sm:text-base font-bold text-neutral-600">{job.company}</p>
                {job.experienceLevel && (
                  <p className="text-xs font-medium text-neutral-500">Eligibility / Experience: {job.experienceLevel}</p>
                )}
              </div>
            </div>

            {/* Application Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {job.externalUrl && (
                <a
                  href={job.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 sm:py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setIsApplyOpen(true)}
                disabled={isExpired}
                className="px-6 py-3.5 sm:py-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                <span>{isExpired ? "Applications Closed" : "Apply with Edworld Resume"}</span>
              </button>
            </div>
          </div>

          {/* Quick Meta Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-neutral-100 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-black" /> Location
              </span>
              <p className="font-bold text-black text-sm sm:text-base">{job.location}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-black" /> Compensation
              </span>
              <p className="font-bold text-black text-sm sm:text-base">{job.salaryRange || "Competitive"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs uppercase font-bold text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-black" /> Deadline
              </span>
              <p className="font-bold text-black text-sm sm:text-base">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 space-y-1 text-black">
              <span className="text-xs uppercase font-bold text-neutral-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black" /> Match Score
              </span>
              <p className="font-black text-black text-base sm:text-lg">{matchScore}% Match</p>
            </div>
          </div>
        </div>

        {/* Personalized Skill & Effective Level Alignment Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-3.5">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-black">Your Skills & Level Compatibility</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            {/* Matched Skills */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
              <span className="font-bold text-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                <span>Skills Aligned with Your Profile ({matchedSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-200 text-black text-xs font-semibold">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500">Add technical skills to your profile to boost alignment.</span>
                )}
              </div>
            </div>

            {/* Missing or Target Skills */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
              <span className="font-bold text-neutral-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                <span>Role Requirements to Highlight ({missingSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {missingSkills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Description & Requirements */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-black">About the Role & Responsibilities</h2>
            <p className="text-xs sm:text-sm lg:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="space-y-3.5 pt-6 border-t border-neutral-100">
            <h3 className="text-sm sm:text-base font-bold text-black">Required Core Competencies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-800">
              {job.skillsRequired.map((skill, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
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

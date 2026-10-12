"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication, JobSourceType, ResumeContent } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CURATED_JOB_LISTINGS } from "@/lib/data/curated-jobs";
import { calculateJobMatch } from "@/lib/services/job-match-scorer";
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
  ExternalLink,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobListing | null>(null);
  const [activeResume, setActiveResume] = useState<ResumeContent | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Load saved resume
  useEffect(() => {
    try {
      const savedResumes = localStorage.getItem("edworld_resumes");
      if (savedResumes) {
        const parsed = JSON.parse(savedResumes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveResume(parsed[0].content || null);
        }
      }
    } catch (e) {}
  }, [user]);

  // Load job listing
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
            sourceType: (data.source_type || "admin_curated") as JobSourceType,
            sourceName: data.source_name || "Curated by Edworld",
            postedAt: data.posted_at || data.created_at,
            lastVerifiedAt: data.last_verified_at || data.created_at,
            isStale: data.is_stale ?? false,
            expiresAt: data.expires_at,
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FAF8F5] text-stone-900 font-sans">
        <p className="text-sm font-semibold text-stone-500">Loading Job Details...</p>
      </div>
    );
  }

  // Compute authoritative match score using shared JobMatchScorer
  const matchAnalysis = calculateJobMatch(
    {
      id: job.id,
      title: job.title,
      description: job.description,
      skillsRequired: job.skillsRequired,
      experienceLevel: job.experienceLevel,
      category: job.category,
    },
    activeResume,
    profile
  );

  const matchScore = matchAnalysis.score;
  const isAdult = user ? user.ageBand === "18+" : true;
  const isExpired = (job.applicationDeadline && new Date(job.applicationDeadline).getTime() <= Date.now()) || !job.isActive;

  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FAF8F5] font-sans text-stone-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Job and internship applications are restricted to adult Career Track accounts (18+).
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 xl:px-10 text-stone-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-emerald-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Job Board</span>
          </Link>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-400 hover:text-stone-900 font-medium transition-colors cursor-pointer"
          >
            <Flag className="w-4 h-4" />
            <span>Report Posting</span>
          </button>
        </div>

        {/* Expired Warning Banner */}
        {isExpired && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <span><strong>Listing Inactive:</strong> The application deadline for this position has passed or the listing has expired.</span>
            </div>
            <span className="font-mono font-bold text-amber-800">Closed</span>
          </div>
        )}

        {/* Provenance Banner */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 flex items-center justify-between flex-wrap gap-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            {job.sourceType === "employer_posted" ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : job.sourceType === "aggregated_api" ? (
              <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-stone-900">Provenance: </span>
              <span>{job.sourceName || "Curated by Edworld"} &bull; {job.sourceType}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Verified: {new Date(job.lastVerifiedAt || job.createdAt).toLocaleDateString()}</span>
            {job.isStale && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Stale</span>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-6 lg:space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-900 text-emerald-100 font-serif font-black text-2xl sm:text-3xl flex items-center justify-center shadow-sm shrink-0">
                {job.company.charAt(0)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {job.category && (
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                      {job.category}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {job.type}
                  </span>
                  <span className="text-xs font-semibold text-stone-400">
                    &bull; Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight font-serif">
                  {job.title}
                </h1>
                <p className="text-sm sm:text-base font-bold text-stone-600">{job.company}</p>
                {job.experienceLevel && (
                  <p className="text-xs font-medium text-stone-500">Experience / Level: {job.experienceLevel}</p>
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
                  className="px-6 py-3.5 sm:py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs sm:text-sm border border-stone-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>External Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setIsApplyOpen(true)}
                disabled={isExpired}
                className="px-6 py-3.5 sm:py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" />
                <span>{isExpired ? "Applications Closed" : "Apply with Saved Resume"}</span>
              </button>
            </div>
          </div>

          {/* Quick Meta Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-stone-100 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-xs uppercase font-bold text-stone-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" /> Location
              </span>
              <p className="font-bold text-stone-900 text-sm sm:text-base">{job.location}</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-xs uppercase font-bold text-stone-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-700" /> Compensation
              </span>
              <p className="font-bold text-stone-900 text-sm sm:text-base">{job.salaryRange || "Competitive"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-xs uppercase font-bold text-stone-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" /> Deadline
              </span>
              <p className="font-bold text-stone-900 text-sm sm:text-base">
                {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-emerald-950">
              <span className="text-xs uppercase font-bold text-emerald-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Match Score
              </span>
              <p className="font-black text-emerald-900 text-base sm:text-lg">{matchScore}% Match</p>
            </div>
          </div>
        </div>

        {/* Personalized Match Rationale Breakdown */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3.5">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              Why You Match {matchScore}% (Resume Maker Analysis)
            </h2>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {matchAnalysis.explanation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm pt-2">
            {/* Matched Skills */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matched Skills ({matchAnalysis.matchedSkills.length})</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700">Verified</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchAnalysis.matchedSkills.length > 0 ? (
                  matchAnalysis.matchedSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-emerald-800 text-xs font-mono font-medium">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-stone-400">No overlapping keywords found in saved resume.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Missing JD Keywords ({matchAnalysis.missingSkills.length})</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-700">Opportunity</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchAnalysis.missingSkills.length > 0 ? (
                  matchAnalysis.missingSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800 text-xs font-mono font-medium">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-stone-400">All required keywords present in your background!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 lg:p-10 space-y-5">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">Role Overview & Responsibilities</h2>
          <div className="prose max-w-none text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={job}
        matchScore={matchScore}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={job.id}
        targetType="job"
        targetName={`${job.title} at ${job.company}`}
      />
    </div>
  );
}

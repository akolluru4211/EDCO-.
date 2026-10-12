"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobType, JobSourceType, ResumeContent } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CURATED_JOB_LISTINGS } from "@/lib/data/curated-jobs";
import { calculateJobMatch, JobMatchAnalysis } from "@/lib/services/job-match-scorer";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  FileCheck,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import Input from "@/components/ui/Input";
import AuthGuard from "@/components/auth/AuthGuard";

export default function JobBoardPage() {
  const { user, profile, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(0);
  const [sortByMatch, setSortByMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // 1. Load active resume content for match calibration
  useEffect(() => {
    try {
      const savedResumes = localStorage.getItem("edworld_resumes");
      if (savedResumes) {
        const parsed = JSON.parse(savedResumes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveResume(parsed[0].content || null);
        }
      }
    } catch (e) {
      console.warn("Failed to load resume for job match:", e);
    }
  }, [user]);

  // 2. Load jobs from Supabase or verified fallback
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .eq("moderation_status", "approved");

        if (data && data.length > 0) {
          const mapped: JobListing[] = data.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            description: j.description,
            location: j.location,
            type: j.type === "full_time" ? "full-time" : (j.type as JobType),
            skillsRequired: j.skills_required || [],
            postedBy: j.posted_by || "admin",
            applicationDeadline: j.application_deadline,
            createdAt: j.created_at,
            isActive: j.is_active,
            moderationStatus: j.moderation_status,
            salaryRange: j.salary_range,
            category: j.category,
            externalUrl: j.external_url,
            sourceNotes: j.source_notes,
            experienceLevel: j.experience_level,
            sourceType: (j.source_type || "admin_curated") as JobSourceType,
            sourceName: j.source_name || "Curated by Edworld",
            postedAt: j.posted_at || j.created_at,
            lastVerifiedAt: j.last_verified_at || j.created_at,
            isStale: j.is_stale ?? false,
            expiresAt: j.expires_at,
          }));
          setJobs(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to load jobs from Supabase:", err);
      }

      // Fallback to verified curated listings
      setJobs(CURATED_JOB_LISTINGS);
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  const isAdult = user ? user.ageBand === "18+" : true;

  // 3. Compute authoritative match scores using shared JobMatchScorer
  const scoredJobs = useMemo(() => {
    return jobs.map((job) => {
      const match = calculateJobMatch(
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

      return {
        ...job,
        matchScore: match.score,
        matchAnalysis: match,
      };
    });
  }, [jobs, activeResume, profile]);

  // 4. Filter and sort
  const filteredJobs = useMemo(() => {
    return scoredJobs
      .filter((job) => {
        const isVisible = isAdult ? true : job.type === "internship";
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.category && job.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          job.skillsRequired.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === "all" || job.type === selectedType;
        const matchesCategory = selectedCategory === "all" || (job.category && job.category.toLowerCase() === selectedCategory.toLowerCase());
        const matchesSource = selectedSource === "all" || job.sourceType === selectedSource;
        const matchesThreshold = (job.matchScore || 0) >= minMatchThreshold;
        
        return isVisible && matchesSearch && matchesType && matchesCategory && matchesSource && matchesThreshold;
      })
      .sort((a, b) => {
        if (sortByMatch) return (b.matchScore || 0) - (a.matchScore || 0);
        const dateA = new Date(a.postedAt || a.createdAt).getTime();
        const dateB = new Date(b.postedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
  }, [scoredJobs, searchTerm, selectedType, selectedCategory, selectedSource, minMatchThreshold, sortByMatch, isAdult]);

  // Helper for source badge UI
  const renderSourceBadge = (job: JobListing) => {
    if (job.isStale) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Stale &bull; Verification Pending</span>
        </span>
      );
    }

    switch (job.sourceType) {
      case "employer_posted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Verified Employer</span>
          </span>
        );
      case "aggregated_api":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Building2 className="w-3 h-3 text-cyan-600" />
            <span>{job.sourceName || "Licensed Partner Feed"}</span>
          </span>
        );
      case "admin_curated":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50/70 text-amber-900 border border-amber-200/70">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Curated by Edworld</span>
          </span>
        );
    }
  };

  // Adult gate
  if (!isAdult && user) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FAF8F5] font-sans text-stone-900">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-mono font-medium">
                {user.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Job Placement Board is for Verified Adults (18+)
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                In compliance with labor safety regulations and child protection laws, minors are not permitted to view or apply for full-time jobs.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Return to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-stone-900 pb-16 font-sans">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 space-y-8 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-900 text-emerald-100 px-2.5 py-1 rounded-md">
                  Career Track 18+
                </span>
                <span className="text-xs text-stone-500 font-medium">Honestly Sourced &bull; Provenance Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900 font-serif">
                Edworld Job Board
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Explore hand-curated engineering roles, verified employer postings, and licensed career feeds. Reuses your calibrated Resume Maker match score.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              <Link
                href="/jobs/applications"
                className="px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-900 text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>My Applications</span>
              </Link>

              {isEmployer && (
                <Link
                  href="/employer/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-200" />
                  <span>Employer Studio</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role title, company, category, or skill (e.g. TypeScript, PwC, React, AI)..."
                  icon={<Search className="w-4 h-4 text-stone-400" />}
                  className="py-2.5 text-xs sm:text-sm bg-stone-50 border-stone-200 text-stone-900 rounded-xl focus:ring-emerald-600"
                />
              </div>

              {/* Sort Toggle & Filter Toggle Button */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSortByMatch(!sortByMatch)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    sortByMatch
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                      : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sort: {sortByMatch ? "Best Match" : "Most Recent"}</span>
                </button>

                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600" />
                  <span>Filters {filtersOpen ? "▲" : "▼"}</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Pills (Sector & Source) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
              {/* Source Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-1 sm:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">Source:</span>
                {[
                  { id: "all", label: "All Sourced" },
                  { id: "admin_curated", label: "Curated by Edworld" },
                  { id: "employer_posted", label: "Verified Employers" },
                  { id: "aggregated_api", label: "Partner Feeds" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSource(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedSource === s.id
                        ? "bg-emerald-900 text-white shadow-2xs"
                        : "bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Match Threshold Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 hidden sm:inline">Min Match:</span>
                {[0, 60, 75, 85].map((threshold) => (
                  <button
                    key={threshold}
                    onClick={() => setMinMatchThreshold(threshold)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      minMatchThreshold === threshold
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {threshold === 0 ? "All" : `${threshold}%+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Advanced Filters */}
            {filtersOpen && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Job / Work Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All Types" },
                      { id: "full-time", label: "Full-Time" },
                      { id: "internship", label: "Internships" },
                      { id: "contract", label: "Contract" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          selectedType === t.id
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Sector & Industry
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All Sectors" },
                      { id: "MNC", label: "🏢 MNCs" },
                      { id: "Startup", label: "🚀 Startups" },
                      { id: "Education", label: "🎓 Education" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                          selectedCategory === c.id
                            ? "bg-stone-900 text-white"
                            : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Job Listings Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-7 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100" />
                    <div className="w-20 h-6 rounded-md bg-stone-100" />
                  </div>
                  <div className="h-5 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-12 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const score = job.matchScore || 70;
                const matchAnalysis = job.matchAnalysis;

                return (
                  <div
                    key={job.id}
                    className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 hover:border-emerald-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Row: Avatar + Title + Match Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-stone-100 border border-stone-200 text-emerald-900 font-extrabold text-lg flex items-center justify-center shrink-0">
                            {job.company.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-stone-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-xs text-stone-500 font-medium">{job.company}</p>
                          </div>
                        </div>

                        {/* Match Score Badge (Resume Maker Visual Treatment) */}
                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                            score >= 80
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                              : score >= 60
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-stone-100 text-stone-700 border-stone-300"
                          }`}>
                            <Sparkles className={`w-3 h-3 ${score >= 80 ? "text-emerald-600" : "text-amber-600"}`} />
                            <span>{score}% Match</span>
                          </span>
                        </div>
                      </div>

                      {/* Source Provenance Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {renderSourceBadge(job)}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                          {job.type}
                        </span>
                        {job.category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-50 text-stone-600 border border-stone-200">
                            {job.category}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Match Analysis Breakdown Pill */}
                      {matchAnalysis && matchAnalysis.matchedSkills.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-stone-700 font-semibold">
                            <span>Matched Skills:</span>
                            <span className="text-emerald-700 font-mono text-[10px]">{matchAnalysis.matchedSkills.length} of {job.skillsRequired.length}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 truncate">
                            {matchAnalysis.matchedSkills.slice(0, 3).join(", ")}
                            {matchAnalysis.missingSkills.length > 0 && ` (Need: ${matchAnalysis.missingSkills[0]})`}
                          </p>
                        </div>
                      )}

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skillsRequired.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-stone-700 text-[10px] font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[10px]">
                            +{job.skillsRequired.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                      <div className="flex flex-col text-stone-500 gap-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate max-w-[110px] font-medium text-stone-800">{job.location}</span>
                        </span>
                        {job.salaryRange && (
                          <span className="text-[11px] text-stone-500 truncate max-w-[140px]">
                            {job.salaryRange}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {job.externalUrl && (
                          <a
                            href={job.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Apply on Official Portal"
                            className="p-2 rounded-xl border border-stone-200 hover:border-emerald-800 text-stone-700 hover:text-emerald-900 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <span>View Role</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3 shadow-sm">
              <Briefcase className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">No matching opportunities found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try lowering your match threshold, adjusting your source filters, or clearing search keywords.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedCategory("all");
                  setSelectedSource("all");
                  setMinMatchThreshold(0);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CURATED_JOB_LISTINGS } from "@/lib/data/curated-jobs";
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
  CheckCircle2
} from "lucide-react";
import Input from "@/components/ui/Input";
import AuthGuard from "@/components/auth/AuthGuard";

export default function JobBoardPage() {
  const { user, profile, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortByMatch, setSortByMatch] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await supabase
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
          }));
          setJobs(mapped);
          return;
        }
      } catch (err) {
        console.warn("Failed to load jobs from Supabase:", err);
      }

      const saved = localStorage.getItem("edworld_jobs");
      if (saved) {
        try {
          const list: JobListing[] = JSON.parse(saved);
          if (list.length > 0) {
            setJobs(list);
            return;
          }
        } catch (e) {}
      }

      // Default to curated verified listings
      setJobs(CURATED_JOB_LISTINGS);
    };

    loadJobs();
  }, []);

  const computeMatchScore = (job: JobListing): number => {
    if (!profile || !profile.interests) return 75;

    const userSkills = profile.interests.map((i) => i.name.toLowerCase());
    let matches = 0;

    job.skillsRequired.forEach((reqSkill) => {
      const lower = reqSkill.toLowerCase();
      if (
        userSkills.some(
          (s) => s.includes(lower) || lower.includes(s) || lower.includes("typescript") || lower.includes("react")
        )
      ) {
        matches++;
      }
    });

    if (job.skillsRequired.length === 0) return 80;
    return Math.min(98, Math.max(65, Math.round((matches / job.skillsRequired.length) * 100)));
  };

  const isAdult = user ? user.ageBand === "18+" : true;

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const isVisible = isAdult ? true : job.type === "internship";
        const matchesSearch =
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.category && job.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          job.skillsRequired.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === "all" || job.type === selectedType;
        const matchesCategory = selectedCategory === "all" || (job.category && job.category.toLowerCase() === selectedCategory.toLowerCase());
        
        return isVisible && matchesSearch && matchesType && matchesCategory;
      })
      .map((job) => ({
        ...job,
        matchScore: computeMatchScore(job),
      }))
      .sort((a, b) => {
        if (sortByMatch) return b.matchScore - a.matchScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [jobs, searchTerm, selectedType, selectedCategory, sortByMatch, profile, isAdult]);

  if (!isAdult && user) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-white font-sans text-black">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-xs font-mono font-medium">
                {user.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-black">
                Job Placement Board is for Verified Adults (18+)
              </h1>
              <p className="text-xs text-neutral-600 leading-relaxed">
                In compliance with labor safety regulations and child protection laws, minors are not permitted to view or apply for full-time jobs.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-[calc(100vh-5rem)] bg-white text-black pb-16 font-sans">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 space-y-8 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-md">
                  Verified Opportunities
                </span>
                <span className="text-xs font-mono text-neutral-500">MNCs &bull; High-Growth Startups &bull; EdTech</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black">
                EdJobs Board
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600">
                Explore hand-curated engineering internships, AI/ML roles, and full-time opportunities.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              <Link
                href="/jobs/applications"
                className="px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 text-black text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-black" />
                <span>My Applications</span>
              </Link>

              {isEmployer && (
                <Link
                  href="/jobs/employer"
                  className="px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>Employer Studio</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role title, company, category, or skill (e.g. Python, PwC, React, AI)..."
                  icon={<Search className="w-4 h-4 text-neutral-400" />}
                  className="py-2.5 text-xs sm:text-sm bg-neutral-50 border-neutral-200 text-black rounded-xl"
                />
              </div>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortByMatch(!sortByMatch)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  sortByMatch
                    ? "bg-black text-white border-black"
                    : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:text-black"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sort: {sortByMatch ? "Match Score" : "Recent"}</span>
              </button>
            </div>

            {/* Filter Pills: Type and Category */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100">
              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-1 sm:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1 hidden sm:inline">Sector:</span>
                {[
                  { id: "all", label: "All Sectors" },
                  { id: "MNC", label: "🏢 MNCs" },
                  { id: "Startup", label: "🚀 Startups" },
                  { id: "Education", label: "🎓 Education" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === c.id
                        ? "bg-black text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:text-black hover:bg-neutral-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Type Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto touch-scroll-x pb-1 sm:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1 hidden sm:inline">Type:</span>
                {[
                  { id: "all", label: "All Types" },
                  { id: "internship", label: "Internships" },
                  { id: "full-time", label: "Full-Time" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selectedType === t.id
                        ? "bg-black text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200 hover:text-black hover:bg-neutral-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Listings Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-neutral-200 hover:border-black shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 text-black font-extrabold text-lg flex items-center justify-center shrink-0">
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-base text-black line-clamp-1 group-hover:text-neutral-700 transition-colors">
                              {job.title}
                            </h3>
                          </div>
                          <p className="text-xs text-neutral-500 font-medium">{job.company}</p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-300">
                          <Sparkles className="w-3 h-3 text-black" />
                          <span>{job.matchScore}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Sector and Type Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.category && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          job.category === "MNC"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : job.category === "Startup"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {job.category}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {job.type}
                      </span>
                      {job.experienceLevel && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-200 truncate max-w-[160px]">
                          {job.experienceLevel}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skillsRequired.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-700 text-[10px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-500 text-[10px]">
                          +{job.skillsRequired.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
                    <div className="flex flex-col text-neutral-500 gap-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate max-w-[110px] font-medium text-black">{job.location}</span>
                      </span>
                      {job.salaryRange && (
                        <span className="text-[11px] text-neutral-500 truncate max-w-[140px]">
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
                          className="p-1.5 rounded-xl border border-neutral-200 hover:border-black text-neutral-700 hover:text-black transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>View Role</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-3 shadow-xs">
              <Briefcase className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-lg font-bold text-black">No matching opportunities found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try adjusting your search keywords, sector filter, or role type to explore more roles.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

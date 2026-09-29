"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  FileCheck,
  Lock
} from "lucide-react";
import Input from "@/components/ui/Input";
import AuthGuard from "@/components/auth/AuthGuard";

export default function JobBoardPage() {
  const { user, profile, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
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
            type: j.type as JobType,
            skillsRequired: j.skills_required || [],
            postedBy: j.posted_by,
            applicationDeadline: j.application_deadline,
            createdAt: j.created_at,
            isActive: j.is_active,
            moderationStatus: j.moderation_status,
            salaryRange: j.salary_range,
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
          setJobs(list);
          return;
        } catch (e) {}
      }

      setJobs([]);
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
          job.skillsRequired.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = selectedType === "all" || job.type === selectedType;
        return isVisible && matchesSearch && matchesType;
      })
      .map((job) => ({
        ...job,
        matchScore: computeMatchScore(job),
      }))
      .sort((a, b) => {
        if (sortByMatch) return b.matchScore - a.matchScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [jobs, searchTerm, selectedType, sortByMatch, profile]);

  if (!isAdult && user) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FCFCFB] font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#EBECEF] shadow-xs p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
              <Briefcase className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-medium">
                {user.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#13141B]">
                Job Placement Board is for Verified Adults (18+)
              </h1>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                In compliance with labor safety regulations and child protection laws, minors are not permitted to view or apply for full-time jobs.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors flex items-center justify-center gap-2"
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
      <div className="min-h-[calc(100vh-5rem)] bg-[#FCFCFB] text-[#13141B] pb-16 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 space-y-8 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                  Verified Listings
                </span>
                <span className="text-xs font-mono text-[#8E95A5]">Curated Opportunities &bull; Zero Spam</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#13141B]">
                EdJobs
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              <Link
                href="/jobs/applications"
                className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] hover:bg-[#EBECEF] text-[#13141B] text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4 text-[#13141B]" />
                <span>My Applications</span>
              </Link>

              {isEmployer && (
                <Link
                  href="/jobs/employer"
                  className="px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold shadow-2xs transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#00D2B4]" />
                  <span>Employer Studio</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by role title, company, or skill (e.g. TypeScript, React)..."
                icon={<Search className="w-4 h-4 text-[#8E95A5]" />}
                className="py-2.5 text-xs sm:text-sm bg-[#F4F6FB] border-[#E8ECF2] text-[#13141B] rounded-xl"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto touch-scroll-x pb-1 md:pb-0 max-w-full">
              {[
                { id: "all", label: "All Roles" },
                { id: "internship", label: "Internships" },
                { id: "full-time", label: "Full-Time" },
                { id: "part-time", label: "Part-Time" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedType === t.id
                      ? "bg-[#13141B] text-white shadow-2xs"
                      : "bg-[#F4F6FB] text-[#5E6573] border border-[#E8ECF2] hover:text-[#13141B]"
                  }`}
                >
                  {t.label}
                </button>
              ))}

              <button
                onClick={() => setSortByMatch(!sortByMatch)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  sortByMatch
                    ? "bg-[#00D2B4]/10 text-[#0A5245] border-[#00D2B4]/30"
                    : "bg-[#F4F6FB] text-[#5E6573] border-[#E8ECF2] hover:text-[#13141B]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00D2B4]" />
                <span>Sort: {sortByMatch ? "Match Score" : "Recent"}</span>
              </button>
            </div>
          </div>

          {/* Job Listings Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-6 sm:p-7 rounded-2xl bg-white border border-[#EBECEF] hover:border-[#13141B]/30 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-[#13141B] font-bold text-lg flex items-center justify-center shrink-0">
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[#13141B] line-clamp-1 group-hover:text-[#00D2B4] transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-[#5E6573] font-medium">{job.company}</p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/30">
                          <Sparkles className="w-3 h-3 text-[#00D2B4]" />
                          <span>{job.matchScore}%</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5E6573] line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                        {job.type}
                      </span>
                      {job.skillsRequired.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#F4F6FB] border border-[#E8ECF2] text-[#5E6573] text-[10px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F4F6FB] border border-[#E8ECF2] text-[#8E95A5] text-[10px]">
                          +{job.skillsRequired.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EBECEF] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#8E95A5]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[100px]">{job.location}</span>
                      </span>
                      {job.salaryRange && <span>&bull; {job.salaryRange}</span>}
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Role</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-[#EBECEF] text-center space-y-3 shadow-xs">
              <Briefcase className="w-10 h-10 text-[#8E95A5] mx-auto" />
              <h3 className="text-lg font-bold text-[#13141B]">No matching opportunities found</h3>
              <p className="text-xs text-[#5E6573] max-w-sm mx-auto">
                Try adjusting your search keywords or filter settings to explore more roles.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

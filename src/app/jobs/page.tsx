"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import { JobListing, JobType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Layers,
  FileCheck,
  Plus,
  ShieldCheck,
  Flag
} from "lucide-react";
import Input from "@/components/ui/Input";
import AuthGuard from "@/components/auth/AuthGuard";

export default function JobBoardPage() {
  const { user, profile, isEmployer, isPro } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortByMatch, setSortByMatch] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
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

  // Compute live match score for a job listing based on user's interests & effective levels
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

    // Check effective level alignment bonus
    const sweInterest = profile.interests.find((i) => i.id === "swe");
    const bonus = sweInterest ? sweInterest.effectiveLevel * 5 : 0;

    const baseScore = job.skillsRequired.length > 0 ? (matches / job.skillsRequired.length) * 85 : 80;
    return Math.min(98, Math.max(58, Math.round(baseScore + bonus + 10)));
  };

  const isAdult = user?.ageBand === "18+";

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Show only approved, active, and non-expired jobs for general users
        const isNotExpired = new Date(job.applicationDeadline).getTime() > Date.now();
        const isVisible = job.isActive && job.moderationStatus === "approved" && isNotExpired;
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper">
          <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center mx-auto shadow-sm">
              <Briefcase className="w-8 h-8 text-gold" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-gold-light text-gold-dark text-xs font-mono font-bold uppercase tracking-wider border border-gold/30">
                {user.ageBand === "13-15" ? "Junior Track" : "Explorer Track"}
              </span>
              <h1 className="text-3xl font-bold font-display text-ink tracking-tight">
                Job Placement Board is for Verified Adults (18+)
              </h1>
              <p className="text-sm text-ink-soft leading-relaxed">
                In compliance with labor safety regulations and child protection laws, minors are not permitted to view or apply for full-time jobs.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
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
      <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Bar */}
        <div className="card-quixel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-3 py-1 rounded-xl">
                Verified Listings
              </span>
              <span className="text-xs font-mono text-[#8E95A5]">Curated Jobs &bull; Zero Headhunter Spam</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#181920] tracking-tight">
              Opportunity &amp; Placement Board
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/jobs/applications"
              className="px-4 py-2.5 rounded-2xl bg-white border border-[#E8ECF2] hover:bg-[#F4F6FB] text-[#181920] text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-[#7B57FF]" />
              <span>My Applications</span>
            </Link>

            {isEmployer && (
              <Link
                href="/jobs/employer"
                className="px-5 py-2.5 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#D7FC51]" />
                <span>Employer Studio</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="card-quixel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role title, company, or skill (e.g. TypeScript, React)..."
              icon={<Search className="w-4 h-4 text-[#8E95A5]" />}
              className="py-2.5 text-xs bg-[#F4F6FB] border-[#E8ECF2] text-[#181920] rounded-2xl"
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedType === t.id
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-[#F4F6FB] text-[#767E94] border border-[#E8ECF2] hover:text-[#181920]"
                }`}
              >
                {t.label}
              </button>
            ))}

            <button
              onClick={() => setSortByMatch(!sortByMatch)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                sortByMatch
                  ? "bg-[#E0FAF6] text-[#00D2B4] border-[#00D2B4]/30 shadow-sm"
                  : "bg-[#F4F6FB] text-[#767E94] border-[#E8ECF2] hover:text-[#181920]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>Sort: {sortByMatch ? "Match Score" : "Recent"}</span>
            </button>
          </div>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="card-quixel card-quixel-interactive p-6 sm:p-8 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] font-black text-lg flex items-center justify-center group-hover:bg-[#7B57FF] group-hover:text-white transition-colors shadow-inner">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-[#181920] text-lg line-clamp-1 group-hover:text-[#7B57FF] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-[#767E94] font-bold">{job.company}</p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#E0FAF6] text-[#00D2B4] border border-[#00D2B4]/30">
                        <Sparkles className="w-3 h-3 text-[#00D2B4]" />
                        <span>{job.matchScore}% Match</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#767E94] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#13141B] text-[#D7FC51]">
                      {job.type}
                    </span>
                    {job.skillsRequired.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-[#F4F6FB] border border-[#E8ECF2] text-[#767E94] text-[10px] font-mono font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="px-2.5 py-1 rounded-full bg-[#F4F6FB] border border-[#E8ECF2] text-[#8E95A5] text-[10px]">
                        +{job.skillsRequired.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0F2F6] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[#8E95A5] text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{job.location}</span>
                    </span>
                    {job.salaryRange && <span>&bull; {job.salaryRange}</span>}
                  </div>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>View Role</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D7FC51]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 card-quixel text-center space-y-3">
            <Briefcase className="w-10 h-10 text-[#8E95A5] mx-auto" />
            <h3 className="text-lg font-black text-[#181920]">No matching opportunities found</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              Try adjusting your search keywords or filter settings to explore more roles.
            </p>
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}

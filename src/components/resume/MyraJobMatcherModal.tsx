"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  X, 
  Briefcase, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Video, 
  Flame, 
  Layers, 
  TrendingUp,
  Loader2
} from "lucide-react";
import { MatchedJobResult } from "@/app/api/resumes/match-jobs/route";

interface MyraJobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeSkills?: string[];
  targetRole?: string;
  targetSector?: string;
}

export default function MyraJobMatcherModal({
  isOpen,
  onClose,
  resumeSkills = [],
  targetRole = "Software Engineer",
  targetSector = "AI & Software Engineering",
}: MyraJobMatcherModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJobResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchMatches() {
      setLoading(true);
      try {
        const res = await fetch("/api/resumes/match-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skills: resumeSkills.length > 0 ? resumeSkills : ["TypeScript", "React", "Next.js", "SQL", "Node.js"],
            targetRole,
            sector: targetSector,
          }),
        });

        const data = await res.json();
        if (data.matchedJobs) {
          setMatchedJobs(data.matchedJobs);
        }
      } catch (e) {
        console.warn("Failed to load job matches:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [isOpen, resumeSkills, targetRole, targetSector]);

  if (!isOpen) return null;

  const handleStartInterviewForJob = (job: MatchedJobResult) => {
    onClose();
    const categorySlug = job.title.toLowerCase().includes("frontend")
      ? "frontend"
      : job.title.toLowerCase().includes("backend")
      ? "backend"
      : "software-engineering";
    router.push(`/interviews/${categorySlug}?jobTitle=${encodeURIComponent(job.title)}&sector=${encodeURIComponent(job.sector)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Top Header with 3D Myra Avatar */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#00D2B4]/60 bg-slate-950 shrink-0 shadow-lg">
              <Image
                src="/images/myra-avatar.png"
                alt="Myra AI"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00D2B4] bg-[#00D2B4]/10 border border-[#00D2B4]/30 px-2.5 py-0.5 rounded-full">
                  Myra Career Matcher
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {matchedJobs.length} Opportunities Found
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                Top Job Matches for Your Resume
              </h2>
              <p className="text-xs text-slate-300">
                Myra evaluated your verified skills against live market openings to find the best career fits.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Matched Job Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#00D2B4] animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Myra is scoring resume compatibility against open roles...</p>
            </div>
          ) : matchedJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching jobs found. Try adding more skills to your resume!
            </div>
          ) : (
            matchedJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#00D2B4]/50 transition-all space-y-3.5 shadow-lg group"
              >
                {/* Job Header & Match Score Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white group-hover:text-[#00D2B4] transition-colors">
                        {job.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {job.sector}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="text-[#D7FC51] font-mono font-bold">
                          {job.salaryRange}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Meter */}
                  <div className="flex items-center gap-2 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Match Fit</span>
                    <span className={`text-base font-black font-mono ${
                      job.matchScore >= 85 ? "text-[#00D2B4]" : "text-amber-400"
                    }`}>
                      {job.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Myra's Verdict & Fit Reasoning */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-[#00D2B4] flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" /> Myra's Assessment:
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {job.myraFitVerdict}
                  </p>
                </div>

                {/* Overlapping Skills & Missing Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Overlapping Skills You Have:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matchedSkills.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Keywords to Add to Resume:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missingKeywords.map((k, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 italic">
                    💡 Prep Focus: {job.interviewPrepFocus}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartInterviewForJob(job)}
                      className="px-4 py-2 rounded-xl bg-[#00D2B4] hover:bg-[#00BF9F] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:scale-105"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Practice Mock Interview with Myra</span>
                    </button>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Need help improving your score? Ask Myra in the chatbot.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

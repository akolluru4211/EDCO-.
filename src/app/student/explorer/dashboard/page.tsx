"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  FileText,
  Video,
  Layers,
  Calendar,
  Briefcase,
  Lightbulb,
  Users
} from "lucide-react";

export default function ExplorerDashboardPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Banner */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-[#13141B] text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explorer Track &bull; Ages 16–18 (Classes 11–12)</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
              Welcome back, {user?.name || "Explorer"}! 🎓
            </h1>
            <p className="text-xs sm:text-sm text-[#989BAA] leading-relaxed">
              Entrance exam trackers, neutral college comparisons, verified scholarships, and guided micro-projects.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid: Full Explorer Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <Link
            href="/school/trainer"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Communication Trainer</h3>
              <p className="text-xs text-[#5E6573]">Light mock interview practice with zero facial scoring.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>Start Studio</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Scholarship &amp; Exam Finder</h3>
              <p className="text-xs text-[#5E6573]">Verified deadlines and transparent eligibility criteria.</p>
            </div>
            <span className="text-xs font-bold text-[#7B57FF] flex items-center gap-1">
              <span>Find Grants</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#D97706] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Entrance Exam Tracker</h3>
              <p className="text-xs text-[#5E6573]">JEE, NEET, CUET countdowns and syllabus milestone logs.</p>
            </div>
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1">
              <span>View Countdowns</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">College Comparison Tool</h3>
              <p className="text-xs text-[#5E6573]">Neutral, factual side-by-side institutional metrics.</p>
            </div>
            <span className="text-xs font-bold text-sky-600 flex items-center gap-1">
              <span>Compare Colleges</span> &rarr;
            </span>
          </Link>

          <Link
            href="/projects"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Guided Micro-Projects</h3>
              <p className="text-xs text-[#5E6573]">Hands-on kits with verifiable completion certificates.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
              <span>Open Kits</span> &rarr;
            </span>
          </Link>

          <Link
            href="/jobs"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Curated Internships</h3>
              <p className="text-xs text-[#5E6573]">Vetted age-safe explorer internships with zero spam.</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              <span>Explore Roles</span> &rarr;
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}

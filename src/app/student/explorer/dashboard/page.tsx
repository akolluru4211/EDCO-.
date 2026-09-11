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
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Banner */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-[#13141B] text-white shadow-xl relative overflow-hidden border border-white/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explorer Track &bull; Ages 16–18 (Classes 11–12 &amp; Campus Prep)</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
              Welcome back, {user?.name || "Explorer"}! 🎓
            </h1>
            <p className="text-xs sm:text-sm text-[#989BAA] leading-relaxed">
              Entrance exam trackers, neutral college comparisons, verified scholarships, coding drills, and placement portfolio building.
            </p>
          </div>
        </div>

        {/* 1-Click Fast Launch Row: Student Career Levers */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                🚀
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Career &amp; Placement Quick-Launch</h2>
                <p className="text-xs text-slate-500">Jump directly into high-impact college &amp; placement accelerators.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              1-Click Access
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <Link
              href="/resumes"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white group border border-slate-200 transition-all text-left"
            >
              <FileText className="w-5 h-5 text-emerald-600 group-hover:text-[#D7FC51] mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-white">ATS Resume Maker</div>
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300">Single-column format</div>
            </Link>

            <Link
              href="/problems"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white group border border-slate-200 transition-all text-left"
            >
              <Layers className="w-5 h-5 text-indigo-600 group-hover:text-[#D7FC51] mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-white">Live Coding Drills</div>
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300">Interactive code editor</div>
            </Link>

            <Link
              href="/interviews"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white group border border-slate-200 transition-all text-left"
            >
              <Video className="w-5 h-5 text-rose-600 group-hover:text-[#D7FC51] mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-white">Mock Interview Studio</div>
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300">STAR questions &amp; feedback</div>
            </Link>

            <Link
              href="/projects"
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white group border border-slate-200 transition-all text-left"
            >
              <Compass className="w-5 h-5 text-purple-600 group-hover:text-[#D7FC51] mb-2" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-white">GitHub Showcase</div>
              <div className="text-[11px] text-slate-500 group-hover:text-slate-300">Verified public projects</div>
            </Link>
          </div>
        </div>

        {/* Quick Actions Grid: Full Explorer Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <Link
            href="/school/trainer"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Communication Trainer</h3>
              <p className="text-xs text-[#5E6573]">College admission &amp; placement speaking drills with zero facial scoring.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-2">
              <span>Start Studio</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=scholarships"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Scholarship &amp; Grant Radar</h3>
              <p className="text-xs text-[#5E6573]">Verified government, foundation, and institutional grants with deadlines.</p>
            </div>
            <span className="text-xs font-bold text-[#7B57FF] flex items-center gap-1 pt-2">
              <span>Find Grants</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=exam_tracker"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF6DC] text-[#D97706] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Entrance Exam Tracker</h3>
              <p className="text-xs text-[#5E6573]">JEE, NEET, CUET, and SAT countdowns with milestone logs.</p>
            </div>
            <span className="text-xs font-bold text-[#D97706] flex items-center gap-1 pt-2">
              <span>View Countdowns</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=college_compare"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">College Comparison Matrix</h3>
              <p className="text-xs text-[#5E6573]">Neutral, verified side-by-side NIRF, fees, ROI, and placement stats.</p>
            </div>
            <span className="text-xs font-bold text-sky-600 flex items-center gap-1 pt-2">
              <span>Compare Colleges</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=micro_projects"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">Guided Micro-Projects</h3>
              <p className="text-xs text-[#5E6573]">Step-by-step fullstack and data projects with verifiable certificates.</p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1 pt-2">
              <span>Open Kits</span> &rarr;
            </span>
          </Link>

          <Link
            href="/school?tab=sop_assistant"
            className="card-quixel card-quixel-interactive rounded-3xl p-6 border border-[#E8ECF2] bg-white space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#13141B] text-sm">SOP &amp; Essay Assistant</h3>
              <p className="text-xs text-[#5E6573]">Calibrate Statement of Purpose essays for university applications.</p>
            </div>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-2">
              <span>Review Essay</span> &rarr;
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}

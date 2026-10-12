"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Award,
  FileText,
  Video,
  ChevronRight
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import GrowthRing from "@/components/ui/GrowthRing";

import Interactive3DCard from "@/components/ui/Interactive3DCard";
import Footer from "@/components/layout/Footer";

type StageKey = "student" | "pro";

interface TabletStageConfig {
  key: StageKey;
  badge: string;
  badgeClass: string;
  accentClass: string;
  title: string;
  subtitle: string;
  description: string;
  keyFeature: string;
  secondaryFeature: string;
  targetDashboard: string;
  ctaUrl: string;
  loginUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABLET_STAGES: Record<StageKey, TabletStageConfig> = {
  student: {
    key: "student",
    badge: "College & Students",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentClass: "text-emerald-600",
    title: "Student & Campus OS",
    subtitle: "College Roadmaps & Placement Drills",
    description: "Build verified project portfolios, practice technical mock interviews, and access calibrated engineering roadmaps.",
    keyFeature: "Micro-Project Studio with GitHub Sync",
    secondaryFeature: "Live Coding IDE Drills & College Benchmarks",
    targetDashboard: "/dashboard",
    ctaUrl: "/auth/signup?track=student&stage=student",
    loginUrl: "/auth/login?track=student",
    icon: GraduationCap,
  },
  pro: {
    key: "pro",
    badge: "Working Professionals",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    accentClass: "text-[#D7FC51]",
    title: "Working Professional OS",
    subtitle: "ATS Resumes, STAR Drills & Telemetry",
    description: "Single-column ATS resume maker, multimodal STAR AI mock interview studio, and verified public showcase profiles.",
    keyFeature: "Single-Column ATS Scoring & Keyword Calibration",
    secondaryFeature: "STAR Video AI Interview Drills & Salary Radar",
    targetDashboard: "/dashboard",
    ctaUrl: "/auth/signup?track=pro&stage=professional",
    loginUrl: "/auth/login?track=pro",
    icon: Briefcase,
  },
};

export default function TabletLandingView() {
  const [activeStage, setActiveStage] = useState<StageKey>("student");
  const stage = TABLET_STAGES[activeStage];
  const StageIcon = stage.icon;

  return (
    <div className="hidden sm:block lg:hidden w-full bg-[#FAFAF8] text-[#13141B] min-h-screen selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* Tablet Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <EdworldLogo size="sm" showText={false} />
          <div>
            <span className="font-black text-lg text-slate-900">
              Edworld <span className="text-[#00D2B4]">Co.</span>
            </span>
            <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
              SKILLS &amp; CAREER OS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 text-[#D7FC51] shadow-sm transition-transform active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Tablet Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Tablet Hero Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Human-First Skills &amp; Career Operating System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 tracking-tight">
            The multi-stage career operating system.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            Select your learning pathway below to explore a workspace tailored for your stage with zero generic rubrics.
          </p>
        </div>

        {/* Tablet Stage Switcher Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {(Object.keys(TABLET_STAGES) as StageKey[]).map((key) => {
            const item = TABLET_STAGES[key];
            const Icon = item.icon;
            const isSelected = activeStage === key;
            return (
              <button
                key={key}
                onClick={() => setActiveStage(key)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? key === "student"
                      ? "bg-emerald-600 text-white shadow-sm font-black"
                      : "bg-slate-950 text-[#D7FC51] shadow-sm font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{key === "student" ? "College & Students" : "Working Professionals"}</span>
              </button>
            );
          })}
        </div>

        {/* Tablet Dual-Pane Showcase Card with 3D Depth */}
        <Interactive3DCard maxTilt={4} depth={12}>
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Pane: Stage Details */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${stage.badgeClass}`}>
                  {stage.badge}
                </span>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">{stage.title}</h2>
                <p className="text-xs font-bold text-slate-500">{stage.subtitle}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {stage.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{stage.keyFeature}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{stage.secondaryFeature}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  href={stage.ctaUrl}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <span>Explore Stage Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={stage.loginUrl}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Pane: Clean Stage Summary & Growth Ring */}
            <div className="md:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 flex flex-col items-center text-center justify-between">
              <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 border-b border-slate-200/70 pb-2">
                <span>Stage Identity</span>
                <span className="text-emerald-700 font-bold uppercase">{activeStage}</span>
              </div>

              <GrowthRing
                level={activeStage === "student" ? 2 : 3}
                size={90}
                streakDays={12}
              />

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900">Proven Skill Index</span>
                <p className="text-[10px] text-slate-600 font-mono">
                  {activeStage === "student" ? "Level 2 • Applied Builder" : "Level 3 • Industry Master"}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-200/70">
                <div className="bg-white border border-slate-200/60 rounded-xl p-2 text-left">
                  <span className="block text-slate-400">ATS Format</span>
                  <strong className="text-emerald-700 font-black">Single-Col</strong>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-xl p-2 text-left">
                  <span className="block text-slate-400">STAR Drills</span>
                  <strong className="text-violet-700 font-black">Adaptive</strong>
                </div>
              </div>
            </div>

          </div>
        </Interactive3DCard>

        {/* Stage Comparison Matrix & Quick Link Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-400 px-1">
            <span>Stage Comparison Matrix</span>
            <span>3 Dedicated Workspaces</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/auth/signup?track=junior&stage=junior"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-300 hover:shadow-md transition-all space-y-1 block"
            >
              <div className="flex items-center justify-between text-violet-700">
                <Compass className="w-4 h-4" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Junior Lab</h4>
              <p className="text-[10px] text-slate-500">Ages 13–15 &bull; Safe quests</p>
            </Link>

            <Link
              href="/auth/signup?track=student&stage=student"
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-1 block"
            >
              <div className="flex items-center justify-between text-emerald-800">
                <GraduationCap className="w-4 h-4" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Student OS</h4>
              <p className="text-[10px] text-slate-500">Ages 16–18 &bull; Projects</p>
            </Link>

            <Link
              href="/auth/signup?track=pro&stage=professional"
              className="p-4 rounded-2xl bg-slate-950 text-white shadow-xs hover:bg-black transition-colors space-y-1 block"
            >
              <div className="flex items-center justify-between text-[#D7FC51]">
                <Briefcase className="w-4 h-4" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-white">Career OS</h4>
              <p className="text-[10px] text-slate-400">Ages 18+ &bull; ATS &amp; Jobs</p>
            </Link>
          </div>
        </div>

      </main>

      {/* Tablet Compliance Footer */}
      <Footer />

    </div>
  );
}

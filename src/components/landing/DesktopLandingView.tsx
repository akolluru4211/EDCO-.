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
  Zap, 
  Lock, 
  ExternalLink,
  Code2,
  Cpu,
  BarChart3,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Video,
  FileText,
  UserCheck
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import GrowthRing from "@/components/ui/GrowthRing";
import Button from "@/components/ui/Button";

import Interactive3DCard from "@/components/ui/Interactive3DCard";

type StageKey = "junior" | "student" | "pro";

interface DesktopStageInfo {
  key: StageKey;
  badge: string;
  badgeColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
  humanQuote: string;
  humanAuthor: string;
  stats: { label: string; value: string }[];
  features: string[];
  ctaUrl: string;
  loginUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DESKTOP_STAGES: Record<StageKey, DesktopStageInfo> = {
  junior: {
    key: "junior",
    badge: "AGES 13–15 • JUNIOR LAB",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    accentColor: "#7B57FF",
    title: "Junior School Curiosity Lab",
    subtitle: "STEM Discovery, Digital Literacy & Youth Confidence",
    description: "A private, safe environment for young learners (Grades 8–10) to build creative technology projects, master clear speaking, and explore passions without exam pressure.",
    humanQuote: "“I built an interactive solar tracker project and learned how logic works before high school.”",
    humanAuthor: "Aarav S. • Junior Explorer",
    stats: [
      { label: "Minor Protection", value: "100% DPDP" },
      { label: "Curiosity Quests", value: "40+ Labs" },
      { label: "Growth Journals", value: "Private" },
    ],
    features: [
      "Zero open public networking & guardian verification portal",
      "Hands-on curiosity quests across AI, Robotics & Space",
      "Communication trainer for confident school presentations",
      "Private self-reflection journal for continuous discovery",
    ],
    ctaUrl: "/auth/signup?track=junior&stage=junior",
    loginUrl: "/auth/login?track=junior",
    icon: Compass,
  },
  student: {
    key: "student",
    badge: "AGES 16–18 • COLLEGE & CAMPUS",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentColor: "#00D2B4",
    title: "Student & Campus Enterprise",
    subtitle: "Projects, Coding Portfolios & Campus Placements",
    description: "Connect coursework to tangible career readiness. Benchmark problem solving in our live simulator, assemble verified GitHub projects, and step confidently into placements.",
    humanQuote: "“My peer-reviewed project portfolio and mock interview feedback helped me land my dream internship.”",
    humanAuthor: "Ananya R. • Campus Graduate",
    stats: [
      { label: "Campus Roadmaps", value: "120+ Tracks" },
      { label: "Coding Drills", value: "Live IDE" },
      { label: "Skill Benchmark", value: "Level 0–3" },
    ],
    features: [
      "Guided micro-project studio with verified GitHub sync",
      "Adaptive technical coding interview simulator with feedback",
      "Single-column ATS resume creator calibrated for freshers",
      "Verified public project showcase profile",
    ],
    ctaUrl: "/auth/signup?track=student&stage=student",
    loginUrl: "/auth/login?track=student",
    icon: GraduationCap,
  },
  pro: {
    key: "pro",
    badge: "AGES 18+ • CAREER ACCELERATION",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    accentColor: "#D7FC51",
    title: "Working Professional Acceleration",
    subtitle: "ATS Optimization, STAR Drills & Salary Growth",
    description: "Designed for engineers and high-growth professionals. Pass strict corporate screening filters with keyword-calibrated resumes, master live AI mock interviews, and command top compensation.",
    humanQuote: "“The single-column ATS scorer and STAR drills helped me pivot into a Senior Staff role with 40% salary hike.”",
    humanAuthor: "Vikram M. • Senior Software Engineer",
    stats: [
      { label: "ATS Pass Rate", value: "99.4%" },
      { label: "STAR Evaluation", value: "Audio + Code" },
      { label: "Peer Network", value: "1:1 Verified" },
    ],
    features: [
      "Single-column ATS resume builder with real-time scoring",
      "Multimodal STAR mock interview studio with audio/video feedback",
      "Verified public portfolio at edworld.co/u/yourname",
      "Curated high-growth tech jobs and salary benchmarks",
    ],
    ctaUrl: "/auth/signup?track=pro&stage=professional",
    loginUrl: "/auth/login?track=pro",
    icon: Briefcase,
  },
};

export default function DesktopLandingView() {
  const [activeStage, setActiveStage] = useState<StageKey>("pro");
  const stage = DESKTOP_STAGES[activeStage];
  const StageIcon = stage.icon;

  return (
    <div className="hidden lg:block w-full bg-[#FAFAF8] text-[#13141B] min-h-screen selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* 1. Top Enterprise Desktop Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <EdworldLogo size="md" showText={false} />
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  Edworld <span className="text-[#00D2B4]">Co.</span>
                </span>
                <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                  SKILLS &amp; CAREER OS
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1.5 pl-6 border-l border-slate-200">
              <button
                onClick={() => setActiveStage("junior")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "junior" ? "bg-violet-100 text-violet-800 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Junior Lab (13–15)
              </button>
              <button
                onClick={() => setActiveStage("student")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "student" ? "bg-emerald-100 text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Student &amp; Campus (16–18)
              </button>
              <button
                onClick={() => setActiveStage("pro")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "pro" ? "bg-amber-100 text-amber-900 shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Working Professional (18+)
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/for-schools"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
            >
              For Schools
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 hover:bg-black text-[#D7FC51] shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Humanized Storytelling & 3D Interactive Showcase */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-slate-200/80">
        
        {/* Soft Organic Background Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#00D2B4]/10 via-[#7B57FF]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-float-subtle" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#D7FC51]/15 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-12 items-center">
            
            {/* Left Column: High-Impact Human-Centric Messaging */}
            <div className="col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800">
                  Human-First Skills &amp; Career Operating System
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-5xl xl:text-6xl font-black font-display text-slate-950 tracking-tight leading-[1.08]">
                  Real adaptability <br />
                  <span className="text-slate-900">for every career stage.</span>
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-xl font-medium">
                  Edworld Co. meets you exactly where you are today. Whether you are discovering early STEM passions, stepping from campus into tech, or breaking through senior career milestones, your journey is personalized with zero generic rubrics.
                </p>
              </div>

              {/* Stage Switcher Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Select Your Career Stage:
                </span>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <button
                    onClick={() => setActiveStage("junior")}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeStage === "junior"
                        ? "bg-violet-600 text-white shadow-sm font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Junior (13–15)</span>
                  </button>

                  <button
                    onClick={() => setActiveStage("student")}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeStage === "student"
                        ? "bg-emerald-600 text-white shadow-sm font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student (16–18)</span>
                  </button>

                  <button
                    onClick={() => setActiveStage("pro")}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeStage === "pro"
                        ? "bg-slate-950 text-[#D7FC51] shadow-sm font-black"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Professional (18+)</span>
                  </button>
                </div>
              </div>

              {/* Active Stage Launch Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                      <StageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{stage.title}</h3>
                      <p className="text-xs text-slate-500">{stage.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${stage.badgeColor}`}>
                    {stage.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={stage.ctaUrl}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                  >
                    <span>Launch {activeStage === "junior" ? "Junior Lab" : activeStage === "student" ? "Student OS" : "Professional OS"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={stage.loginUrl}
                    className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Trust & Compliance Badges */}
              <div className="flex items-center gap-6 text-[11px] font-mono text-slate-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>DPDP Act Minor Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                  <span>Real ATS Calibration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>STAR Interview Metrics</span>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Interactive Showcase Card */}
            <div className="col-span-6">
              <Interactive3DCard maxTilt={6} depth={18} className="shadow-2xl">
                <div className="bg-white rounded-3xl p-8 border border-slate-200/90 relative space-y-6">
                  
                  {/* Top Badge & Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${stage.badgeColor}`}>
                        {stage.badge}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                        {stage.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {stage.subtitle}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0 shadow-xs">
                      <StageIcon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Human Learner Quote & Proof */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      {stage.humanQuote}
                    </p>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                      — {stage.humanAuthor}
                    </span>
                  </div>

                  {/* Stats Matrix */}
                  <div className="grid grid-cols-3 gap-3">
                    {stage.stats.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left space-y-1">
                        <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                          {s.label}
                        </span>
                        <strong className="text-sm font-black text-slate-900">
                          {s.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Core Deliverables */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Included in Workspace:
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-700 font-medium">
                      {stage.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={stage.ctaUrl}
                      className="w-full py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all active:scale-98"
                    >
                      <span>Explore {stage.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              </Interactive3DCard>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Three-Pillar Architecture Section with 3D Depth Cards */}
      <section className="py-20 max-w-7xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7B57FF]">
            Purpose-Built For Every Generation
          </span>
          <h2 className="text-4xl font-black font-display text-slate-950 tracking-tight">
            One platform. Three dedicated career operating systems.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Edworld strictly segments user experiences to ensure age-appropriate safety, calibrated rigor, and lifelong career progression.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          
          {/* Pillar 1: Junior */}
          <Interactive3DCard maxTilt={5} depth={10} className="h-full">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between h-full space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  Ages 13–15
                </span>
                <h3 className="text-2xl font-black text-slate-900">Junior School Curiosity Lab</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Nurtures natural curiosity with hands-on STEM quest labs, communication trainers, and private digital reflection.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-800 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    <span>Curiosity Quest Labs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    <span>School Communication Trainer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    <span>Guardian Consent Protection</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/signup?track=junior&stage=junior"
                className="w-full py-3 rounded-2xl bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-800 text-xs font-bold text-center transition-all border border-violet-200"
              >
                Start Junior Track &rarr;
              </Link>
            </div>
          </Interactive3DCard>

          {/* Pillar 2: Student */}
          <Interactive3DCard maxTilt={5} depth={10} className="h-full">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between h-full space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Ages 16–18 • College
                </span>
                <h3 className="text-2xl font-black text-slate-900">Student &amp; Campus Enterprise</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Connects academic learning to career outcomes with project portfolios, technical mock interviews, and university insights.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-800 font-medium pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Micro-Project Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Live Coding IDE Drills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>College Placement Telemetry</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/signup?track=student&stage=student"
                className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold text-center transition-all border border-emerald-200"
              >
                Start Student Track &rarr;
              </Link>
            </div>
          </Interactive3DCard>

          {/* Pillar 3: Professional */}
          <Interactive3DCard maxTilt={5} depth={10} className="h-full">
            <div className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#D7FC51] flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-[#D7FC51] border border-amber-400/30">
                  Ages 18+ • Career OS
                </span>
                <h3 className="text-2xl font-black text-white">Working Professional Acceleration</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  The ultimate career command center for engineers and knowledge workers. Single-column ATS optimization, STAR mock drills, and salary telemetry.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 font-medium pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                    <span>Single-Column ATS Resume Maker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                    <span>Multimodal STAR AI Interview Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                    <span>1:1 Verified Peer Network</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/auth/signup?track=pro&stage=professional"
                className="w-full py-3.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-slate-950 text-xs font-black uppercase tracking-wider text-center transition-all shadow-md"
              >
                Start Professional OS &rarr;
              </Link>
            </div>
          </Interactive3DCard>

        </div>
      </section>

      {/* 4. Desktop Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <EdworldLogo size="sm" showText={false} />
            <span className="font-bold text-slate-900">Edworld Co.</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} Edworld Co. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/pricing" className="hover:text-slate-950 transition-colors">Pricing</Link>
            <Link href="/for-schools" className="hover:text-slate-950 transition-colors">For Schools</Link>
            <Link href="/privacy" className="hover:text-slate-950 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-950 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-950 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

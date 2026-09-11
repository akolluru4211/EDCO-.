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

type StageKey = "junior" | "student" | "pro";

interface DesktopStageInfo {
  key: StageKey;
  badge: string;
  badgeColor: string;
  accentColor: string;
  title: string;
  subtitle: string;
  description: string;
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
    subtitle: "Early STEM Discovery & Safe Digital Literacy",
    description: "A private, safe environment for Class 8–10 learners to develop analytical thinking, build hands-on creative projects, and explore future career paths without pressure.",
    stats: [
      { label: "Minor Protection", value: "100% DPDP" },
      { label: "Curiosity Quests", value: "40+ Labs" },
      { label: "Growth Journals", value: "Private" },
    ],
    features: [
      "No open public networking or adult messaging",
      "Parent / Guardian verification portal",
      "Curiosity quests across AI, Robotics & Space Tech",
      "Private self-reflection growth journal",
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
    title: "Student & Campus Career OS",
    subtitle: "College Roadmaps, Coding & Placement Prep",
    description: "Turn foundational skills into proof-backed portfolios. Benchmark your engineering aptitude, practice college mock interviews, and build verified showcase projects.",
    stats: [
      { label: "Campus Roadmaps", value: "120+ Tracks" },
      { label: "Coding Drills", value: "Live IDE" },
      { label: "Skill Benchmark", value: "Level 0–3" },
    ],
    features: [
      "College comparison & verified placement trends",
      "Guided micro-project studio with GitHub sync",
      "Adaptive technical coding interview simulator",
      "Foundation-level ATS resume generator",
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
    title: "Working Professional Career OS",
    subtitle: "ATS Optimization, STAR Drills & Salary Telemetry",
    description: "Engineered for high-performing professionals. Pass strict corporate ATS algorithms with keyword-calibrated resumes, master live AI mock interviews with STAR feedback, and track market compensation.",
    stats: [
      { label: "ATS Pass Rate", value: "99.4%" },
      { label: "STAR Evaluation", value: "Audio + Code" },
      { label: "Peer Network", value: "1:1 Verified" },
    ],
    features: [
      "Single-column ATS resume builder with real-time scoring",
      "Multimodal STAR mock interview studio with audio/video feedback",
      "Verified public portfolio at edworld.co/u/yourname",
      "Curated high-growth tech jobs and salary radar",
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
    <div className="hidden lg:block w-full bg-[#FAFAFC] text-[#13141B] min-h-screen selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* 1. Top Enterprise Desktop Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E8ECF2]">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <EdworldLogo size="md" showText={false} />
              <div>
                <span className="font-black text-xl tracking-tight text-[#13141B] flex items-center gap-1.5">
                  Edworld <span className="text-[#00D2B4]">Co.</span>
                </span>
                <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E95A5]">
                  SKILLS &amp; CAREER OS
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1 pl-6 border-l border-[#E8ECF2]">
              <button
                onClick={() => setActiveStage("junior")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "junior" ? "bg-violet-100 text-violet-800" : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-100"
                }`}
              >
                Junior Lab (13–15)
              </button>
              <button
                onClick={() => setActiveStage("student")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "student" ? "bg-emerald-100 text-emerald-800" : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-100"
                }`}
              >
                Student &amp; Campus (16–18)
              </button>
              <button
                onClick={() => setActiveStage("pro")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeStage === "pro" ? "bg-amber-100 text-amber-900" : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-100"
                }`}
              >
                Working Professional (18+)
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/for-schools"
              className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] transition-colors"
            >
              For Schools
            </Link>
            <div className="h-4 w-px bg-[#E8ECF2]" />
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#13141B] hover:bg-slate-100 border border-[#E8ECF2] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#13141B] hover:bg-black text-[#D7FC51] shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Split-View Cockpit & Telemetry */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#E8ECF2]">
        
        {/* Subtle Ambient Gradient Auras */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#00D2B4]/10 via-[#7B57FF]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#D7FC51]/15 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-12 gap-12 items-center">
            
            {/* Left Column: High-Impact Messaging & Controls */}
            <div className="col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8ECF2] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00D2B4] animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#13141B]">
                  Adaptive Skills &amp; Career Intelligence OS
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-5xl xl:text-6xl font-black font-display text-[#13141B] tracking-tight leading-[1.08]">
                  Real adaptability for every career stage.
                </h1>
                <p className="text-base text-[#5E6573] leading-relaxed max-w-xl font-medium">
                  Edworld Co. adapts to who you are right now. Calibrate your proven skill level, pass strict corporate ATS filters, and practice high-stakes AI interviews with verified metrics.
                </p>
              </div>

              {/* Stage Switcher Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E95A5]">
                  Select Career Stage:
                </span>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-white rounded-2xl border border-[#E8ECF2] shadow-xs">
                  <button
                    onClick={() => setActiveStage("junior")}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeStage === "junior"
                        ? "bg-violet-600 text-white shadow-sm font-black"
                        : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
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
                        : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student (16–18)</span>
                  </button>

                  <button
                    onClick={() => setActiveStage("pro")}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      activeStage === "pro"
                        ? "bg-[#13141B] text-[#D7FC51] shadow-sm font-black"
                        : "text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Professional (18+)</span>
                  </button>
                </div>
              </div>

              {/* Active Stage Launch Bar */}
              <div className="p-5 rounded-3xl bg-white border border-[#E8ECF2] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[#13141B]">
                      <StageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#13141B]">{stage.title}</h3>
                      <p className="text-xs text-[#5E6573]">{stage.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${stage.badgeColor}`}>
                    {stage.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={stage.ctaUrl}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-[#13141B] hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <span>Launch {activeStage === "junior" ? "Junior Lab" : activeStage === "student" ? "Student OS" : "Career OS"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={stage.loginUrl}
                    className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#13141B] text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 text-[11px] font-mono text-[#8E95A5] pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>DPDP Act Minor Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
                  <span>Real ATS Scoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>STAR Interview Metrics</span>
                </div>
              </div>

            </div>

            {/* Right Column: Clean Premium Stage Overview Card */}
            <div className="col-span-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/90 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header with Stage Identity */}
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

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {stage.description}
                </p>

                {/* Stats Matrix */}
                <div className="grid grid-cols-3 gap-3">
                  {stage.stats.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-left space-y-1">
                      <span className="block text-[10px] font-mono font-bold uppercase text-slate-400">
                        {s.label}
                      </span>
                      <strong className="text-sm font-black text-slate-900">
                        {s.value}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* Key Deliverables & Features */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Core Capabilities &amp; Features:
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

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={stage.ctaUrl}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all active:scale-98"
                  >
                    <span>Get Started ({activeStage === "junior" ? "Junior Lab" : activeStage === "student" ? "Student OS" : "Professional OS"})</span>
                    <ArrowRight className="w-4 h-4 text-[#D7FC51]" />
                  </Link>
                  <Link
                    href={stage.loginUrl}
                    className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Three-Pillar Architecture Section */}
      <section className="py-20 max-w-7xl mx-auto px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7B57FF]">
            Architected for Every Generation
          </span>
          <h2 className="text-4xl font-black font-display text-[#13141B] tracking-tight">
            One platform. Three purpose-built operating systems.
          </h2>
          <p className="text-sm text-[#5E6573] leading-relaxed">
            Edworld strictly segments its user experiences to ensure age-appropriate safety, calibrated rigor, and career acceleration.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          
          {/* Pillar 1: Junior */}
          <div className="bg-white rounded-4xl p-8 border border-[#E8ECF2] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                Ages 13–15
              </span>
              <h3 className="text-2xl font-black text-[#13141B]">Junior School Curiosity Lab</h3>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                Nurtures natural curiosity with hands-on STEM quest labs, communication trainers, and private digital reflection.
              </p>
              <ul className="space-y-2.5 text-xs text-[#13141B] font-medium pt-2 border-t border-[#F0F2F6]">
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
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-violet-600 hover:text-white text-[#13141B] text-xs font-bold text-center transition-all"
            >
              Start Junior Track &rarr;
            </Link>
          </div>

          {/* Pillar 2: Student */}
          <div className="bg-white rounded-4xl p-8 border border-[#E8ECF2] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ages 16–18 • College
              </span>
              <h3 className="text-2xl font-black text-[#13141B]">Student &amp; Campus Enterprise</h3>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                Connects academic learning to career outcomes with project portfolios, technical mock interviews, and university insights.
              </p>
              <ul className="space-y-2.5 text-xs text-[#13141B] font-medium pt-2 border-t border-[#F0F2F6]">
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
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-[#13141B] text-xs font-bold text-center transition-all"
            >
              Start Student Track &rarr;
            </Link>
          </div>

          {/* Pillar 3: Professional */}
          <div className="bg-[#13141B] text-white rounded-4xl p-8 border border-white/10 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#D7FC51] flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-[#D7FC51] border border-amber-400/30">
                Ages 18+ • Career OS
              </span>
              <h3 className="text-2xl font-black text-white">Working Professional Acceleration</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                The ultimate career command center for engineers and knowledge workers. Single-column ATS optimization, STAR mock drills, and salary telemetry.
              </p>
              <ul className="space-y-2.5 text-xs text-white/80 font-medium pt-2 border-t border-white/10">
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
              className="w-full py-3.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black uppercase tracking-wider text-center transition-all shadow-md"
            >
              Start Professional OS &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Desktop Enterprise Footer */}
      <footer className="bg-white border-t border-[#E8ECF2] py-12 text-[#5E6573]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <EdworldLogo size="sm" showText={false} />
            <span className="font-bold text-[#13141B]">Edworld Co.</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} Edworld Co. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/pricing" className="hover:text-[#13141B] transition-colors">Pricing</Link>
            <Link href="/for-schools" className="hover:text-[#13141B] transition-colors">For Schools</Link>
            <Link href="/privacy" className="hover:text-[#13141B] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#13141B] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#13141B] transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Code2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  FileText, 
  Video, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X,
  Layers,
  Award,
  Globe,
  ShieldCheck,
  Search,
  MessageSquare,
  Lock,
  Play,
  Flame,
  Radio,
  Zap,
  Activity,
  ChevronDown
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import BackToTop from "@/components/ui/BackToTop";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import FloatingContactButton from "@/components/ui/FloatingContactButton";

export default function ModernEdworldLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"myra" | "interview" | "resume" | "network">("myra");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Myra AI and how does it help each student?",
      a: "Myra is your personal AI tutor, academic mentor, and career companion. Each student gets their own dedicated Myra instance with persistent memory of their target sector, CGPA, resume skills, and mock interview weak points. Myra is equipped with real-time web browsing, repository analysis (via Agent-Reach), and academic doubt solving."
    },
    {
      q: "How does the 3D Fullscreen Lockdown Mock Interview work?",
      a: "Myra conducts your mock interview in true browser fullscreen lockdown mode. She delivers spoken technical questions aloud, captures your video and live Speech-to-Text transcript, monitors tab-switching anti-cheat telemetry, and provides a 'What to Upgrade in Your Next Interview' diagnostic report with model STAR answer rewrites."
    },
    {
      q: "How does the Smart Resume-to-Job Matcher recommend opportunities?",
      a: "When you build or update your resume in the Resume Studio, Myra compares your skills and projects with active industry openings. She computes a precision fit score (e.g. 95% Match), highlights missing keywords, and gives you a 1-click button to practice mock interviews specifically calibrated for that job."
    },
    {
      q: "Can students connect and message peers on the Networking Hub?",
      a: "Yes! Students can browse verified peer profiles with bios, certifications, projects, and timetables, initiate 1:1 direct messaging, form study cohorts, and exchange mock interview referrals."
    },
    {
      q: "How is my personal data and privacy protected?",
      a: "EdWorld Co. strictly adheres to DPDP Act 2023 and COPPA standards. Minors (13-15) are protected with age-gated safety tracks, and private interview video/audio telemetry is stored securely and never shared with third parties."
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen w-full bg-[#0B0D14] text-slate-100 selection:bg-[#00D2B4] selection:text-slate-950 font-sans overflow-x-clip">
      
      <ScrollProgress />

      {/* Floating Modern Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0B0D14]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D2B4] to-[#D7FC51] p-0.5 shadow-lg shadow-[#00D2B4]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0D14] rounded-[14px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D2B4] to-[#D7FC51] text-lg">ED</span>
              </div>
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                EdWorld <span className="text-[#00D2B4] font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-[#00D2B4]/10 border border-[#00D2B4]/30">OS</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">AI Career &amp; Learning Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.08] text-xs font-bold text-slate-300">
            <Link href="/interviews" className="px-4 py-2 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>3D Mock Interviews</span>
            </Link>
            <Link href="/resumes" className="px-4 py-2 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D7FC51]" />
              <span>Resume &amp; Job Matcher</span>
            </Link>
            <Link href="/networking" className="px-4 py-2 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Student Network</span>
            </Link>
            <Link href="/jobs" className="px-4 py-2 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Opportunities</span>
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00D2B4] to-[#00BF9F] text-slate-950 font-black text-xs shadow-lg shadow-[#00D2B4]/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0D14] border-b border-white/[0.1] px-4 py-6 space-y-3 animate-in slide-in-from-top duration-200">
            <Link
              href="/interviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-[#00D2B4]" />
                <span>3D Mock Interviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              href="/resumes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#D7FC51]" />
                <span>Resume &amp; Job Matcher</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              href="/networking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Student Network &amp; 1:1 Chat</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] text-sm font-bold text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Opportunities &amp; Internships</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>

            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#00D2B4] text-slate-950 font-black text-center text-xs shadow-md"
              >
                Create Free Student Account
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-white/[0.05] text-slate-300 font-bold text-center text-xs"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with 3D Myra Avatar & Perspective Depth */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Futuristic Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-[#00D2B4]/15 via-indigo-600/10 to-[#D7FC51]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#00D2B4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Title & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#00D2B4] animate-ping" />
                <span className="text-[#00D2B4]">Meet Myra AI</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-300">Your Personal Career Companion</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Master Interviews. <br className="hidden sm:inline" />
                Match Dream Jobs. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2B4] via-[#65F3CD] to-[#D7FC51]">
                  Powered by Myra AI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                EdWorld Co. provides each student with a dedicated <strong>Myra AI companion</strong> equipped with live web browsing, smart resume-to-job matching, 3D fullscreen locked mock interviews, and verified peer networking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/interviews"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00D2B4] to-[#00BF9F] text-slate-950 font-black text-sm shadow-xl shadow-[#00D2B4]/25 hover:scale-105 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Mock Interview with Myra</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/resumes"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-sm border border-white/[0.1] transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#D7FC51]" />
                  <span>Build Resume &amp; Match Jobs</span>
                </Link>
              </div>

              {/* Trust & Live Metric Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 border-t border-white/[0.08]">
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-white">100%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Locked Anti-Cheat</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-[#00D2B4]">98%</div>
                  <div className="text-[10px] text-slate-400 font-medium">ATS Match Accuracy</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-[#D7FC51]">0-Cost</div>
                  <div className="text-[10px] text-slate-400 font-medium">Student Starter Plan</div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Interactive Myra Hero Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* 3D Glass Perspective Container */}
              <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-[#00D2B4]/10 space-y-6">
                
                {/* Floating Glow Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2B4]/10 border border-[#00D2B4]/30 text-xs font-bold text-[#00D2B4]">
                    <span className="w-2 h-2 rounded-full bg-[#00D2B4] animate-ping" />
                    <span>Myra AI Live Companion</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">v2.6 Enterprise</span>
                </div>

                {/* 3D Avatar Centerpiece */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-[#00D2B4]/60 shadow-2xl bg-slate-950 ring-4 ring-[#00D2B4]/20 group">
                    <Image
                      src="/images/myra-avatar.png"
                      alt="Myra AI Companion"
                      fill
                      priority
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-200 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#00D2B4]" />
                    <span>Myra &bull; Lead AI Interviewer &amp; Tutor</span>
                  </div>
                </div>

                {/* Simulated Live Question & Waveform */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#00D2B4]">
                    <span className="flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live Voice Synthesis</span>
                    <span className="text-slate-400">STAR Framing</span>
                  </div>
                  <p className="text-slate-200 italic font-medium leading-relaxed">
                    &ldquo;Welcome candidate! Walk me through how you architected Redis caching in your recent project to reduce query latency by 65%.&rdquo;
                  </p>
                  
                  {/* Waveform visualizer */}
                  <div className="flex items-end justify-center gap-1 h-5 pt-1">
                    <span className="w-1 bg-[#00D2B4] rounded-full h-3 animate-[bounce_0.6s_infinite_100ms]" />
                    <span className="w-1 bg-[#00D2B4] rounded-full h-5 animate-[bounce_0.6s_infinite_200ms]" />
                    <span className="w-1 bg-[#00D2B4] rounded-full h-2 animate-[bounce_0.6s_infinite_300ms]" />
                    <span className="w-1 bg-[#00D2B4] rounded-full h-4 animate-[bounce_0.6s_infinite_150ms]" />
                    <span className="w-1 bg-[#00D2B4] rounded-full h-5 animate-[bounce_0.6s_infinite_250ms]" />
                  </div>
                </div>

                {/* Quick 1-Click Launch Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <Link
                    href="/interviews"
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-center text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-[#00D2B4]" />
                    <span>Try 3D Interview</span>
                  </Link>
                  <Link
                    href="/resumes"
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-center text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#D7FC51]" />
                    <span>Match Jobs</span>
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 5 Core Scalable Pillars: Bento Grid Showcase */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] bg-slate-950/60 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#00D2B4] bg-[#00D2B4]/10 border border-[#00D2B4]/30 px-3 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5" />
              <span>Platform Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Everything You Need to Get Hired
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built with precision for students, engineers, and institutions. Every module feeds into your verified career identity.
            </p>
          </div>

          {/* 5-Item Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1: Dedicated Myra AI Companion */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-[#00D2B4]/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00D2B4]/10 border border-[#00D2B4]/30 text-[#00D2B4] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#00D2B4]" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#00D2B4] transition-colors">
                  Personal Myra AI Companion
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Equipped with live Google search, GitHub repository reach (Agent-Reach), curriculum alignment, and persistent memory of your academic goals.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-[#00D2B4] flex items-center justify-between">
                <span>Multi-Tool Doubt Solver</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 2: 3D Fullscreen Lockdown Mock Interviews */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-[#00D2B4]/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Video className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#00D2B4] transition-colors">
                  3D Lockdown Mock Interviews
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real browser fullscreen lock, anti-cheat tab telemetry, bi-directional voice &amp; video, and Myra's "What to Upgrade in Your Next Round" roadmap.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-indigo-400 flex items-center justify-between">
                <span>STAR Diagnostic &amp; Anti-Cheat</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 3: Smart Resume-to-Job Matcher */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-[#D7FC51]/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#D7FC51]/10 border border-[#D7FC51]/30 text-[#D7FC51] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#D7FC51]" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-[#D7FC51] transition-colors">
                  Smart Resume &amp; Job Matcher
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Single-column ATS formatting, parser verification, and instant match scoring against live job openings with missing keyword analysis.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-[#D7FC51] flex items-center justify-between">
                <span>1-Click Mock Prep For Jobs</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 4: Verified Student Networking */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  Student Networking &amp; 1:1 Chat
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discover verified student developers, view project portfolios &amp; certifications, message 1:1, and form study teams for campus drives.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                <span>End-to-End Encrypted Connect</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 5: Campus & Institutional Placement Intelligence */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group md:col-span-2 lg:col-span-2">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                  Campus Portals &amp; Institutional Placement Intelligence
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Placement directors and college heads can monitor cohort readiness metrics, schedule campus hiring drives, and benchmark student aptitude.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-amber-400 flex items-center justify-between">
                <span>College Cohorts &amp; Drive Management</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about Myra AI and the EdWorld platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#00D2B4] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-300 leading-relaxed mt-3 pt-3 border-t border-slate-800/80 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Global CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D2B4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Practice with Your Personal Myra AI?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Join thousands of student engineers mastering interviews and finding tailored career opportunities today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-2xl bg-[#00D2B4] hover:bg-[#00BF9F] text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/interviews"
              className="px-7 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-sm border border-white/[0.1] transition-all"
            >
              Explore Mock Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span>&copy; {new Date().getFullYear()} EdWorld Co. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
      <BackToTop />
      <FloatingContactButton />

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  Briefcase, 
  FileText, 
  Video, 
  GraduationCap, 
  ChevronRight,
  Menu,
  X,
  Layers,
  Radio,
  Play,
  ChevronDown
} from "lucide-react";
import BackToTop from "@/components/ui/BackToTop";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import FloatingContactButton from "@/components/ui/FloatingContactButton";
import MyraWelcomeModal from "@/components/ai/MyraWelcomeModal";

export default function ModernEdworldLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen w-full bg-white text-zinc-950 selection:bg-zinc-900 selection:text-white font-sans overflow-x-clip">
      
      <ScrollProgress />
      
      {/* Cheerful Voice Welcome Modal with Myra Avatar */}
      <MyraWelcomeModal />

      {/* Floating Modern White Glass Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 border-b border-zinc-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Left Brand Identity with New Geometric ED Monogram */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 p-1.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-lg font-black text-zinc-950 tracking-tight flex items-center gap-1.5">
                EdWorld <span className="text-[#00B49B] font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">OS</span>
              </span>
              <p className="text-[10px] text-zinc-500 font-mono hidden sm:block">AI Career &amp; Learning Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600">
            <Link href="/interviews" className="px-4 py-2 rounded-full hover:text-zinc-950 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs">
              <Video className="w-3.5 h-3.5 text-[#00B49B]" />
              <span>3D Mock Interviews</span>
            </Link>
            <Link href="/resumes" className="px-4 py-2 rounded-full hover:text-zinc-950 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Resume &amp; Job Matcher</span>
            </Link>
            <Link href="/networking" className="px-4 py-2 rounded-full hover:text-zinc-950 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student Network</span>
            </Link>
            <Link href="/jobs" className="px-4 py-2 rounded-full hover:text-zinc-950 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              <span>Opportunities</span>
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-zinc-600 hover:text-zinc-950 px-4 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs shadow-md shadow-zinc-950/10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
            <Link
              href="/interviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-900"
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-[#00B49B]" />
                <span>3D Mock Interviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link
              href="/resumes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-900"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Resume &amp; Job Matcher</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link
              href="/networking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-900"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Student Network &amp; 1:1 Chat</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-900"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Opportunities &amp; Internships</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>

            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-950 text-white font-black text-center text-xs shadow-md"
              >
                Create Free Student Account
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-800 font-bold text-center text-xs border border-zinc-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with 3D Myra Avatar & Subtle Ambient Mesh Pattern */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px]">
        
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-[#00D2B4]/10 via-indigo-500/5 to-[#D7FC51]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#00D2B4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Title & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/90 text-xs font-bold text-zinc-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#00B49B] animate-ping" />
                <span className="text-[#00B49B]">Meet Myra AI</span>
                <span className="text-zinc-400">&bull;</span>
                <span className="text-zinc-600">Your Personal Career Companion</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.08]">
                Master Interviews. <br className="hidden sm:inline" />
                Match Dream Jobs. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B49B] via-indigo-600 to-zinc-950">
                  Powered by Myra AI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                EdWorld Co. provides each student with a dedicated <strong>Myra AI companion</strong> equipped with live web browsing, continuous behavioral learning, smart resume-to-job matching, 3D fullscreen locked mock interviews, and verified peer networking.
              </p>

              {/* Action Buttons with High-Contrast Hover Animations */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/interviews"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm shadow-xl shadow-zinc-950/15 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#00D2B4]" />
                  <span>Start Mock Interview with Myra</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>

                <Link
                  href="/resumes"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-900 font-bold text-sm border border-zinc-200 hover:border-zinc-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Build Resume &amp; Match Jobs</span>
                </Link>
              </div>

              {/* Trust & Live Metric Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 border-t border-zinc-200">
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-zinc-950">100%</div>
                  <div className="text-[10px] text-zinc-500 font-medium">Locked Anti-Cheat</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-[#00B49B]">98%</div>
                  <div className="text-[10px] text-zinc-500 font-medium">ATS Match Accuracy</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-indigo-600">0-Cost</div>
                  <div className="text-[10px] text-zinc-500 font-medium">Student Starter Plan</div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Interactive Myra Hero Showcase (Light Glassmorphism) */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* 3D Glass Perspective Container */}
              <div className="relative w-full max-w-md bg-white/95 border border-zinc-200/90 rounded-3xl p-6 shadow-2xl shadow-zinc-300/40 space-y-6">
                
                {/* Floating Glow Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-[#00B49B] animate-ping" />
                    <span>Myra AI Live Companion</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">v2.8 Learning Engine</span>
                </div>

                {/* 3D Avatar Centerpiece (New Teddy in ED Hoodie) */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-zinc-900 shadow-2xl bg-gradient-to-b from-zinc-100 to-zinc-200 ring-4 ring-zinc-100 group">
                    <Image
                      src="/images/myra-avatar.png"
                      alt="Myra AI Companion in ED Hoodie"
                      fill
                      priority
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#00B49B]" />
                    <span>Myra &bull; Lead AI Interviewer &amp; Tutor</span>
                  </div>
                </div>

                {/* Simulated Live Question & Waveform */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#00B49B]">
                    <span className="flex items-center gap-1"><Radio className="w-3 h-3 animate-pulse" /> Live Voice Synthesis</span>
                    <span className="text-zinc-500 font-mono">STAR Framing</span>
                  </div>
                  <p className="text-zinc-800 italic font-medium leading-relaxed">
                    &ldquo;Welcome candidate! Walk me through how you architected Redis caching in your recent project to reduce query latency by 65%.&rdquo;
                  </p>
                  
                  {/* Waveform visualizer */}
                  <div className="flex items-end justify-center gap-1 h-5 pt-1">
                    <span className="w-1 bg-[#00B49B] rounded-full h-3 animate-[bounce_0.6s_infinite_100ms]" />
                    <span className="w-1 bg-[#00B49B] rounded-full h-5 animate-[bounce_0.6s_infinite_200ms]" />
                    <span className="w-1 bg-[#00B49B] rounded-full h-2 animate-[bounce_0.6s_infinite_300ms]" />
                    <span className="w-1 bg-[#00B49B] rounded-full h-4 animate-[bounce_0.6s_infinite_150ms]" />
                    <span className="w-1 bg-[#00B49B] rounded-full h-5 animate-[bounce_0.6s_infinite_250ms]" />
                  </div>
                </div>

                {/* Quick 1-Click Launch Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <Link
                    href="/interviews"
                    className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-center text-zinc-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-[#00B49B]" />
                    <span>Try 3D Interview</span>
                  </Link>
                  <Link
                    href="/resumes"
                    className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-center text-zinc-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Match Jobs</span>
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 5 Core Scalable Pillars: Clean Light Bento Grid Showcase */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 bg-zinc-50/50 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-800 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5 text-[#00B49B]" />
              <span>Platform Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Everything You Need to Get Hired
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Built with precision for students, engineers, and institutions. Every module feeds into your verified career identity.
            </p>
          </div>

          {/* 5-Item Bento Grid with White Cards & Hover Elevation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Pillar 1: Dedicated Myra AI Companion */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-950 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-[#00B49B]" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 group-hover:text-[#00B49B] transition-colors">
                  Personal Myra AI Companion
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Equipped with live Google search, cognitive learning memory, GitHub repository reach (Agent-Reach), and adaptive academic doubt solving.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-zinc-900 font-bold flex items-center justify-between">
                <span>Multi-Tool Doubt Solver</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Pillar 2: 3D Fullscreen Lockdown Mock Interviews */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 group-hover:text-indigo-600 transition-colors">
                  3D Lockdown Mock Interviews
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Real browser fullscreen lock, anti-cheat tab telemetry, bi-directional voice &amp; video, and Myra&apos;s &ldquo;What to Upgrade in Your Next Round&rdquo; roadmap.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-indigo-600 font-bold flex items-center justify-between">
                <span>STAR Diagnostic &amp; Anti-Cheat</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Pillar 3: Smart Resume-to-Job Matcher */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 group-hover:text-emerald-600 transition-colors">
                  Smart Resume &amp; Job Matcher
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Single-column ATS formatting, parser verification, and instant match scoring against live job openings with missing keyword analysis.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-emerald-600 font-bold flex items-center justify-between">
                <span>1-Click Mock Prep For Jobs</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Pillar 4: Verified Student Networking */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 group-hover:text-amber-600 transition-colors">
                  Student Networking &amp; 1:1 Chat
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Discover verified student developers, view project portfolios &amp; certifications, message 1:1, and form study teams for campus drives.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-amber-600 font-bold flex items-center justify-between">
                <span>End-to-End Encrypted Connect</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Pillar 5: Campus & Institutional Placement Intelligence */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 hover:border-zinc-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-sm flex flex-col justify-between group md:col-span-2 lg:col-span-2">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-black text-zinc-950 group-hover:text-purple-600 transition-colors">
                  Campus Portals &amp; Institutional Placement Intelligence
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Placement directors and college heads can monitor cohort readiness metrics, schedule campus hiring drives, and benchmark student aptitude.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[11px] font-mono text-purple-600 font-bold flex items-center justify-between">
                <span>College Cohorts &amp; Drive Management</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Frequently Asked Questions (Light Card Accordion) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-500">Everything you need to know about Myra AI and the EdWorld platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-zinc-200 transition-all hover:border-zinc-300 shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-zinc-900 hover:text-zinc-950 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="text-xs text-zinc-600 leading-relaxed mt-3 pt-3 border-t border-zinc-100 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Global High-Contrast CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white border border-zinc-800 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D2B4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Practice with Your Personal Myra AI?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Join thousands of student engineers mastering interviews and finding tailored career opportunities today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-2xl bg-white text-zinc-950 font-black text-sm shadow-xl hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/interviews"
              className="px-7 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm border border-zinc-700 active:scale-95 transition-all"
            >
              Explore Mock Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Clean White Footer */}
      <footer className="border-t border-zinc-200 py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-700">
            <span>&copy; {new Date().getFullYear()} EdWorld Co. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-950 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-950 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-zinc-950 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
      <BackToTop />
      <FloatingContactButton />

    </div>
  );
}

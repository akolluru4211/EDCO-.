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
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Zap,
  Target,
  Brain,
  Terminal,
  ExternalLink
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
      q: "What is Myra AI and how does it follow me across the platform?",
      a: "Myra is EdWorld Co.'s unified AI career copilot. Unlike disconnected single-feature chatbots, Myra securely retrieves your real career profile (resume skills, mock interview rubrics, project portfolio, and target role) to provide contextual feedback, doubt resolution, and tailored study plans across the entire platform."
    },
    {
      q: "How does the 3D Fullscreen Lockdown Mock Interview work?",
      a: "Myra simulates an authentic technical interview in true browser fullscreen lockdown with anti-cheat telemetry. She speaks technical questions aloud via neural voice synthesis, transcribes your answers in real time, evaluates STAR responses, and provides comprehensive scoring with model answer rewrites."
    },
    {
      q: "How does the Smart ATS Resume & Job Matcher optimize applications?",
      a: "When you upload or build your resume, Myra verifies enterprise ATS compliance, reformats bullet points using the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]), and benchmarks your resume against real job descriptions to identify missing keywords and calculate match scores."
    },
    {
      q: "What is the EdFix Production Engineering Lab?",
      a: "EdFix is a hands-on simulation arena where you diagnose real-world production engineering crises: race conditions, memory leaks, database connection pool exhaustion, and distributed systems latency bottlenecks under time pressure."
    },
    {
      q: "Can students connect and network safely on the platform?",
      a: "Yes. Verified members get a digital portfolio ID card, can showcase verified GitHub and technical projects, benchmark skills against cohorts, and exchange 1-way birthday wishes without inbox clutter or spam."
    },
    {
      q: "How is my personal data and privacy protected?",
      a: "EdWorld Co. complies with DPDP Act 2023 and COPPA standards. Minors under 18 have strict privacy boundaries (no AI copilot access or full-time job visibility), and interview recordings and telemetry are strictly private to your account."
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("features-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black selection:bg-black selection:text-white font-sans overflow-x-clip">
      
      <ScrollProgress />
      
      {/* Cheerful Voice Welcome Modal with Myra Avatar */}
      <MyraWelcomeModal />

      {/* 1. MINIMALIST FLOATING HEADER */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/95 border-b border-neutral-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black border border-neutral-800 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Logo"
                width={30}
                height={30}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-lg font-black text-black tracking-tight flex items-center gap-1.5 leading-none">
                EdWorld <span className="text-neutral-500 font-mono text-xs uppercase px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">CO.</span>
              </span>
              <p className="text-[10px] text-neutral-500 font-mono hidden sm:block mt-0.5">Career Intelligence Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-50 p-1.5 rounded-full border border-neutral-200 text-xs font-bold text-neutral-700">
            <Link href="/interviews" className="px-4 py-2 rounded-full hover:text-black hover:bg-white transition-all flex items-center gap-1.5 hover:shadow-xs">
              <Video className="w-3.5 h-3.5 text-black" />
              <span>3D Mock Interviews</span>
            </Link>
            <Link href="/resumes" className="px-4 py-2 rounded-full hover:text-black hover:bg-white transition-all flex items-center gap-1.5 hover:shadow-xs">
              <FileText className="w-3.5 h-3.5 text-black" />
              <span>ATS Resume Studio</span>
            </Link>
            <Link href="/edfix" className="px-4 py-2 rounded-full hover:text-black hover:bg-white transition-all flex items-center gap-1.5 hover:shadow-xs">
              <Code2 className="w-3.5 h-3.5 text-black" />
              <span>EdFix Lab</span>
            </Link>
            <Link href="/network" className="px-4 py-2 rounded-full hover:text-black hover:bg-white transition-all flex items-center gap-1.5 hover:shadow-xs">
              <Users className="w-3.5 h-3.5 text-black" />
              <span>Verified Network</span>
            </Link>
            <Link href="/jobs" className="px-4 py-2 rounded-full hover:text-black hover:bg-white transition-all flex items-center gap-1.5 hover:shadow-xs">
              <Briefcase className="w-3.5 h-3.5 text-black" />
              <span>Opportunities</span>
            </Link>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-neutral-600 hover:text-black px-4 py-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-black text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-white" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-800 hover:text-black"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
            <Link
              href="/interviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-black"
            >
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-black" />
                <span>3D Mock Interviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link
              href="/resumes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-black"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-black" />
                <span>Resume &amp; Job Matcher</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link
              href="/edfix"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-black"
            >
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-black" />
                <span>EdFix Lab</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link
              href="/network"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-black"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-black" />
                <span>Verified Network</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-black"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-black" />
                <span>Opportunities &amp; Jobs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-black text-white font-black text-center text-xs shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-neutral-100 text-neutral-800 font-bold text-center text-xs border border-neutral-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION WITH PROMINENT HIGHLIGHT TEXT IN TOP */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        
        {/* Subtle Minimalist Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Highlight Text in Top & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Top Eyebrow Tag with Clean Contrast Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-black shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span className="font-mono uppercase tracking-wider text-[11px] text-black font-extrabold">✦ EDWORLD CO.</span>
                <span className="text-neutral-400">&bull;</span>
                <span className="text-neutral-600 font-medium">The Career Intelligence Platform</span>
              </div>

              {/* High-Impact Hero Title with Prominent Highlight Badge */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[1.08] text-balance">
                Master Tech Interviews. <br className="hidden sm:inline" />
                Land Your Dream Job. <br />
                <span className="relative inline-block mt-2 sm:mt-3">
                  <span className="relative z-10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black text-white text-2xl sm:text-4xl lg:text-5xl font-black shadow-xl inline-flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white inline-block shrink-0" />
                    <span>Supercharged by Myra AI</span>
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                EdWorld Co. gives engineers and ambitious students a unified career acceleration engine: <strong>3D lockdown mock interviews</strong>, <strong>smart ATS resume-to-job matching</strong>, <strong>hands-on engineering challenges</strong>, and a <strong>personal AI copilot</strong> grounded in your verified progress.
              </p>

              {/* Minimalist CTA Buttons with Hover Elevation */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black hover:bg-neutral-800 text-white font-black text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 text-white" />
                </Link>

                <button
                  onClick={scrollToFeatures}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-neutral-50 text-black font-bold text-sm border border-neutral-300 hover:border-black shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Features</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-6 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 border-t border-neutral-200">
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-black">100%</div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Lockdown Anti-Cheat</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-black">98%</div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">ATS Match Rate</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg sm:text-xl font-black font-mono text-black">0-Cost</div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Student Starter</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Minimalist Myra Copilot Preview Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl space-y-6">
                
                {/* Card Top Pill */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-bold text-black">
                    <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                    <span>Myra AI Platform Copilot</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 font-semibold">Live Telemetry</span>
                </div>

                {/* 3D Avatar Centerpiece with Clean Border */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border border-neutral-300 shadow-lg bg-neutral-100 group">
                    <Image
                      src="/images/myra-avatar.png"
                      alt="Myra AI Companion"
                      fill
                      priority
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 px-3 py-1 rounded-full text-xs font-bold text-black shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>Myra &bull; Academic Mentor &amp; Interviewer</span>
                  </div>
                </div>

                {/* Live Question & Waveform Simulation */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-900">
                    <span className="flex items-center gap-1"><Radio className="w-3 h-3 text-black animate-pulse" /> Spoken Interview Prompt</span>
                    <span className="text-neutral-500 font-mono">STAR Rubric</span>
                  </div>
                  <p className="text-neutral-800 italic font-medium leading-relaxed">
                    &ldquo;Welcome candidate! Walk me through how you architected Redis caching in your recent project to reduce query latency by 65%.&rdquo;
                  </p>
                  
                  {/* Waveform indicator */}
                  <div className="flex items-end justify-center gap-1 h-4 pt-1">
                    <span className="w-1 bg-black rounded-full h-2 animate-[bounce_0.6s_infinite_100ms]" />
                    <span className="w-1 bg-neutral-600 rounded-full h-4 animate-[bounce_0.6s_infinite_200ms]" />
                    <span className="w-1 bg-black rounded-full h-2 animate-[bounce_0.6s_infinite_300ms]" />
                    <span className="w-1 bg-neutral-600 rounded-full h-3 animate-[bounce_0.6s_infinite_150ms]" />
                    <span className="w-1 bg-black rounded-full h-4 animate-[bounce_0.6s_infinite_250ms]" />
                  </div>
                </div>

                {/* Direct Action Launch Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                  <Link
                    href="/interviews"
                    className="p-2.5 rounded-xl bg-black hover:bg-neutral-800 text-center text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-white" />
                    <span>Try 3D Interview</span>
                  </Link>
                  <Link
                    href="/resumes"
                    className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-center text-black border border-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-black" />
                    <span>Match Jobs</span>
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 3. DOWN BELOW: CORE FEATURES SHOWCASE ("in down show the featuers") */}
      <section id="features-section" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 bg-neutral-50/60 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-14">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-black bg-white border border-neutral-200 px-3.5 py-1 rounded-full shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span>CORE PLATFORM CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Everything You Need to Get Hired in Top Tech
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
              Six interconnected intelligence engines engineered to elevate your engineering craft, communication, and career velocity.
            </p>
          </div>

          {/* 6-Pillar Bento Grid with Pure White Cards & Dark Hover Borders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: 3D Mock Interview Studio */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 01</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">Lockdown Mode</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    3D Mock Interview Studio
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Simulate high-stakes campus placement and tech screening rounds in true fullscreen lockdown mode with tab anti-cheat, spoken AI questions, speech cadence analytics, and STAR answer rewrites.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href="/interviews"
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Practice Interviews</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">STAR Diagnostic</span>
              </div>
            </div>

            {/* Feature 2: ATS Resume & Job Matcher */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 02</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">98% Match</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    ATS Resume &amp; Job Matcher
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Format bullet points with the Google X-Y-Z formula, verify parsing against strict enterprise ATS standards, and compare your profile against real job descriptions to reveal missing keywords.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href="/resumes"
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Tailor Your Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">X-Y-Z Optimizer</span>
              </div>
            </div>

            {/* Feature 3: Platform-Wide Myra AI Copilot */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 03</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">Grounded Memory</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    Platform-Wide Myra AI Copilot
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  One persistent, smart companion who knows your target role, resume, interview themes, and daily learning goals. Ask doubts, get architectural code reviews, and conquer tricky CS concepts.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-myra-copilot"));
                    }
                  }}
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Ask Myra AI</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </button>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">AI Career Copilot</span>
              </div>
            </div>

            {/* Feature 4: EdFix Production Engineering Challenges */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Terminal className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 04</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">Real Incidents</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    EdFix Production Engineering
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Tackle real production scenarios: race conditions, SQL connection pool exhaustion, memory leak debugging, and high-concurrency microservice latency spikes.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href="/edfix"
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Solve EdFix Drills</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">Hands-On Code</span>
              </div>
            </div>

            {/* Feature 5: Verified Student & Professional Network */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 05</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">Verified Peers</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    Verified Network &amp; Portfolio
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Connect with verified peers and alumni engineers. Showcase your live portfolio, track mutual connections, and send safe 1-way birthday wishes without spam or inbox clutter.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href="/network"
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Explore Network</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">Verified Identity</span>
              </div>
            </div>

            {/* Feature 6: Institutional Campus Placement Intelligence */}
            <div className="p-7 rounded-3xl bg-white border border-neutral-200 hover:border-black hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 space-y-5 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-black" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Pillar 06</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-black">Campus Drives</span>
                  </div>
                  <h3 className="text-xl font-black text-black group-hover:text-neutral-900 transition-colors">
                    Institutional Placement Hub
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  Universities, training institutes, and placement officers get real-time cohort readiness telemetry, campus hiring drive management, and skill benchmark tracking.
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <Link
                  href="/for-college"
                  className="text-xs font-bold text-black flex items-center gap-1.5 group-hover:underline cursor-pointer"
                >
                  <span>Campus Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                </Link>
                <span className="text-[10px] font-mono text-neutral-400 font-medium">Cohort Analytics</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (3 MINIMALIST STEPS) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-white">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-3.5 py-1 rounded-full">
            <Target className="w-3.5 h-3.5 text-black" />
            <span>HOW EDWORLD WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            From Preparation to Offer Letter in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-normal">
            A structured, repeatable framework designed to eliminate guesswork from your tech career progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4 hover:border-black transition-colors">
            <span className="text-3xl font-black font-mono text-black">01</span>
            <h3 className="text-lg font-black text-black">Optimize Your Resume</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Import or create your resume. Myra applies Google X-Y-Z impact bullet standards and validates against enterprise ATS parser rules.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4 hover:border-black transition-colors">
            <span className="text-3xl font-black font-mono text-black">02</span>
            <h3 className="text-lg font-black text-black">Practice Under Real Pressure</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Enter 3D lockdown mock interviews. Receive live speech pacing feedback, filler word counts, and calibrated STAR answer models.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4 hover:border-black transition-colors">
            <span className="text-3xl font-black font-mono text-black">03</span>
            <h3 className="text-lg font-black text-black">Match Openings &amp; Get Hired</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Browse curated job opportunities. See precision fit scores and prep 1-click tailored mock rounds before submitting your application.
            </p>
          </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (MINIMALIST ACCORDION) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 bg-white border-t border-neutral-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">Frequently Asked Questions</h2>
          <p className="text-xs text-neutral-500 font-normal">Everything you need to know about Myra AI and the EdWorld platform.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-neutral-200 transition-all hover:border-black shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-black cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="text-xs text-neutral-600 leading-relaxed mt-3 pt-3 border-t border-neutral-100 animate-in fade-in font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. MINIMALIST HIGH-CONTRAST BOTTOM CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-black text-white border border-neutral-800 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Practice with Your Personal Myra AI?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal">
              Join thousands of engineers and learners mastering interviews and landing verified technical roles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-2xl bg-white text-black font-black text-sm shadow-xl hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-black" />
            </Link>
            <Link
              href="/interviews"
              className="px-7 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700 active:scale-95 transition-all"
            >
              Explore Mock Studio
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CLEAN MINIMALIST MONOCHROME FOOTER */}
      <footer className="border-t border-neutral-200 py-12 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-black">
            <span>&copy; {new Date().getFullYear()} EdWorld Co. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-neutral-600 font-medium">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-black transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

      <CookieConsentBanner />
      <BackToTop />
      <FloatingContactButton />

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import Footer from "@/components/layout/Footer";

export default function ModernEdworldLanding() {
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
      
      {/* 2. CENTERED HERO SECTION: WELCOME TO EDWORLD CLUB */}
      <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        
        {/* Subtle Minimalist Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:28px_28px] opacity-70 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          
          {/* Top Eyebrow Tag: Welcome to EdWorld Club */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-neutral-100 border border-neutral-200 text-xs sm:text-sm font-bold text-black shadow-xs">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span className="font-mono uppercase tracking-wider text-[11px] sm:text-xs text-black font-extrabold">✦ EDWORLD CLUB</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-700 font-semibold tracking-wide lowercase">meet • connect • play • begin • enjoy</span>
          </div>

          {/* High-Impact Hero Title Centered */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-black tracking-tight leading-[1.08] text-balance">
            Welcome to EdWorld Club. <br />
            <span className="text-neutral-500 font-bold text-xl sm:text-3xl lg:text-4xl block mt-3 sm:mt-4">
              Meet &bull; Connect &bull; Play &bull; Begin &bull; Enjoy
            </span>
            <span className="block mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl text-black font-black">
              Master Tech Interviews. <br className="hidden sm:inline" />
              Land Your Dream Job.
            </span>
          </h1>

          {/* Subtitle Centered */}
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
            EdWorld Co. gives engineers and ambitious students a unified career acceleration engine: <strong>3D lockdown mock interviews</strong>, <strong>smart ATS resume-to-job matching</strong>, <strong>hands-on engineering challenges</strong>, and verified peer networking.
          </p>

          {/* Centered Minimalist CTA Buttons with Hover Elevation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
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

          {/* Centered Trust Metric Badges */}
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-neutral-200">
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black font-mono text-black">100%</div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">Lockdown Anti-Cheat</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black font-mono text-black">98%</div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">ATS Match Rate</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-2xl font-black font-mono text-black">0-Cost</div>
              <div className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">Student Starter</div>
            </div>
          </div>

        </div>

      </section>

      {/* 3. DOWN BELOW: CORE FEATURES SHOWCASE ("in down show the featuers") */}
      <section id="features-section" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 bg-white relative scroll-mt-20">
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
          
          <div className="p-7 rounded-3xl bg-white border border-neutral-200 space-y-4 hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <span className="text-3xl font-black font-mono text-black">01</span>
            <h3 className="text-lg font-black text-black">Optimize Your Resume</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Import or create your resume. Myra applies Google X-Y-Z impact bullet standards and validates against enterprise ATS parser rules.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-neutral-200 space-y-4 hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <span className="text-3xl font-black font-mono text-black">02</span>
            <h3 className="text-lg font-black text-black">Practice Under Real Pressure</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Enter 3D lockdown mock interviews. Receive live speech pacing feedback, filler word counts, and calibrated STAR answer models.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-neutral-200 space-y-4 hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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

      {/* 7. UNIFIED ENTERPRISE COMPLIANCE FOOTER */}
      <Footer />

      <BackToTop />
      <FloatingContactButton />

    </div>
  );
}

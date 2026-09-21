"use client";

import React, { useState } from "react";
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
  Newspaper, 
  GraduationCap, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Layers,
  Award,
  Globe,
  Share2,
  ShieldCheck,
  Search,
  MessageSquare
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

export default function ModernEdworldLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const coreFlow = [
    {
      id: "learn",
      step: "01",
      title: "LEARNING",
      description: "Build skills through structured learning, roadmaps and practical resources.",
      icon: BookOpen,
      tag: "Foundational & Advanced",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "build",
      step: "02",
      title: "PROFILE",
      description: "Create a professional identity that grows with your achievements.",
      icon: FileText,
      tag: "Verified Proof",
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      id: "connect",
      step: "03",
      title: "NETWORK",
      description: "Connect with students, mentors, colleges and communities.",
      icon: Users,
      tag: "Peer & Mentor Hub",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      id: "discover",
      step: "04",
      title: "OPPORTUNITIES",
      description: "Discover internships, jobs, events, competitions and other opportunities.",
      icon: Briefcase,
      tag: "Curated Listings",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "grow",
      step: "05",
      title: "GROW",
      description: "Track your progress and turn your learning into real career momentum.",
      icon: TrendingUp,
      tag: "Career Momentum",
      color: "bg-emerald-50 text-emerald-800 border-emerald-300",
    },
  ];

  const networkEntities = [
    {
      title: "Students",
      subtitle: "9th Grade to B.Tech/M.Tech & Scholars",
      description: "Build peer study groups, discover collaborative open-source repos, and practice live mock interview drills together.",
      icon: GraduationCap,
      badge: "Peer Network",
      avatarBg: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Mentors",
      subtitle: "Engineers, Alums & Tech Leads",
      description: "Receive actionable guidance on resume calibration, technical roadmaps, and career transition milestones.",
      icon: Compass,
      badge: "1:1 Guidance",
      avatarBg: "bg-teal-100 text-teal-800",
    },
    {
      title: "Researchers",
      subtitle: "Labs, Papers & Science Fellows",
      description: "Share preprint insights, find cross-institution co-authors, and access computing resources.",
      icon: BookOpen,
      badge: "Academic Exchange",
      avatarBg: "bg-sky-100 text-sky-800",
    },
    {
      title: "Colleges",
      subtitle: "Universities, Clubs & Placement Cells",
      description: "Streamline campus drives, manage student placement readiness cohorts, and host inter-college hackathons.",
      icon: Globe,
      badge: "Campus Hubs",
      avatarBg: "bg-indigo-100 text-indigo-800",
    },
    {
      title: "Communities",
      subtitle: "Coding Squads, AI & Design Collectives",
      description: "Join topic-focused channels to build in public, share learning journals, and attend weekend workshops.",
      icon: Users,
      badge: "Student Circles",
      avatarBg: "bg-purple-100 text-purple-800",
    },
    {
      title: "Opportunities",
      subtitle: "Internships, Fellowships & Competitions",
      description: "Direct discovery of verified roles filtered by graduation year, technical discipline, and stipend criteria.",
      icon: Briefcase,
      badge: "Direct Pathways",
      avatarBg: "bg-amber-100 text-amber-800",
    },
  ];

  const careerProgression = [
    { name: "Discover", role: "Target & Skills", desc: "Identify high-demand roles and pinpoint exact skill gaps." },
    { name: "Learn", role: "Curriculum", desc: "Work through interactive roadmaps and hands-on drills." },
    { name: "Build", role: "Project Studio", desc: "Develop real projects with verified GitHub repositories." },
    { name: "Prove", role: "ATS & Interviews", desc: "Score 85%+ on ATS parsers and master live STAR mock drills." },
    { name: "Connect", role: "Network & Referrals", desc: "Engage with campus alumni and senior industry mentors." },
    { name: "Opportunity", role: "Placement", desc: "Interview with confidence for verified internships and jobs." },
  ];

  const featuresList = [
    {
      title: "AI Career Profile",
      description: "An adaptive digital identity that maps your proven skills, coursework, and problem-solving benchmarks.",
      icon: Sparkles,
      link: "/profile",
    },
    {
      title: "Resume Builder",
      description: "Single-column ATS resumes calibrated to pass corporate screening filters with real-time scoring.",
      icon: FileText,
      link: "/resumes",
    },
    {
      title: "AI Mock Interviews",
      description: "Multimodal behavioral and technical coding interviews with instant speech cadence and STAR analysis.",
      icon: Video,
      link: "/interviews",
    },
    {
      title: "Learning Roadmaps",
      description: "Role-aligned curriculums from high-school foundational logic through senior engineering stacks.",
      icon: Layers,
      link: "/problems",
    },
    {
      title: "Student Network",
      description: "A safe, verified space to connect with peers, find project partners, and collaborate nationwide.",
      icon: Users,
      link: "/network",
    },
    {
      title: "Jobs & Internships",
      description: "Verified opportunity board filtered specifically for student schedules, freshers, and interns.",
      icon: Briefcase,
      link: "/jobs",
    },
    {
      title: "Events & Hackathons",
      description: "Discover national campus hackathons, technical webinars, and student design challenges.",
      icon: Calendar,
      link: "/jobs",
    },
    {
      title: "Communities",
      description: "Join active cohorts in AI/ML, Systems Engineering, Web3, Open Source, and Competitive Programming.",
      icon: MessageSquare,
      link: "/network",
    },
    {
      title: "Portfolio Showcase",
      description: "A beautiful public portfolio at edworld.co.in/u/yourname backed by real GitHub commits.",
      icon: ExternalLink,
      link: "/portfolio",
    },
    {
      title: "EdNews",
      description: "Stay ahead with curated updates on education technology, industry shifts, and campus hiring trends.",
      icon: Newspaper,
      link: "#ednews",
    },
  ];

  const newsItems = [
    {
      tag: "AI & Education",
      date: "September 2026",
      title: "How Engineering Students Are Leveraging Domain-Specific AI Models in Research",
      snippet: "Undergraduate labs are adopting integrated inference engines to accelerate algorithmic verification and simulations.",
      readTime: "4 min read",
    },
    {
      tag: "Campus Placement",
      date: "September 2026",
      title: "The 2026 Tech Hiring Shift: What Recruiters Look for Beyond LeetCode",
      snippet: "Why single-column ATS resumes and verified GitHub project proofs are driving higher interview conversion rates.",
      readTime: "5 min read",
    },
    {
      tag: "Student Spotlight",
      date: "September 2026",
      title: "From Campus Project to Production: Student Open-Source Highlights",
      snippet: "How peer collaboration on EdWorld helped a student team build an open-source distributed cache engine.",
      readTime: "3 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] selection:bg-[#00D2B4]/20 selection:text-[#0A5245] font-sans antialiased">
      
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FCFCFB]/90 backdrop-blur-md border-b border-[#EBECEF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#13141B] flex items-center justify-center p-1.5 shadow-sm border border-black/5 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/images/edworld-logo.png"
                  alt="EdWorld Co."
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#13141B] leading-none">
                  EdWorld <span className="text-[#00D2B4]">Co.</span>
                </span>
                <span className="text-[9px] font-bold text-[#8E95A5] uppercase tracking-wider mt-0.5">
                  Education &bull; Network &bull; Careers
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <a
                href="#features"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
              >
                Explore
              </a>
              <Link
                href="/jobs"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
              >
                Opportunities
              </Link>
              <Link
                href="/problems"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
              >
                Learning
              </Link>
              <Link
                href="/network"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
              >
                Network
              </Link>
              <a
                href="#community"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
              >
                About
              </a>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#13141B] bg-[#00D2B4] hover:bg-[#00BF9A] shadow-sm hover:shadow transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Join EdWorld
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#13141B] hover:bg-[#F4F6FB] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#EBECEF] bg-[#FCFCFB] px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#13141B] hover:bg-[#F4F6FB]"
              >
                Explore
              </a>
              <Link
                href="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#13141B] hover:bg-[#F4F6FB]"
              >
                Opportunities
              </Link>
              <Link
                href="/problems"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#13141B] hover:bg-[#F4F6FB]"
              >
                Learning
              </Link>
              <Link
                href="/network"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#13141B] hover:bg-[#F4F6FB]"
              >
                Network
              </Link>
              <a
                href="#community"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-[#13141B] hover:bg-[#F4F6FB]"
              >
                About
              </a>
            </div>
            <div className="pt-3 border-t border-[#EBECEF] flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-[#13141B] border border-[#EBECEF]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-[#13141B] bg-[#00D2B4] shadow-sm"
              >
                Join EdWorld
              </Link>
            </div>
          </div>
        )}
      </header>


      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 sm:pb-28 border-b border-[#EBECEF]">
        
        {/* Soft Ambient Background Highlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-[#00D2B4]/10 via-emerald-100/20 to-teal-50/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Subtle Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBECEF] shadow-xs text-xs font-semibold text-[#5E6573]">
            <span className="w-2 h-2 rounded-full bg-[#00D2B4]" />
            <span>Student Education, Networking &amp; Opportunities</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#13141B] max-w-4xl mx-auto leading-[1.08]">
            Your world of learning,{" "}
            <span className="relative inline-block text-[#0C7869] decoration-[#00D2B4]/40 underline underline-offset-8">
              connections &amp; opportunities.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl text-[#5E6573] max-w-2xl mx-auto leading-relaxed font-normal">
            Learn, connect, build your profile, discover opportunities, and grow with a community built for students.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#13141B] hover:bg-[#252833] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Join EdWorld</span>
              <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
            </Link>

            <a
              href="#core-flow"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F4F6FB] text-[#13141B] text-xs sm:text-sm font-bold border border-[#EBECEF] flex items-center justify-center gap-2 transition-all hover:border-[#CBD5E1]"
            >
              <span>Explore EdWorld</span>
              <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
            </a>
          </div>

          {/* Trust / Identity Line */}
          <div className="pt-6">
            <p className="text-xs sm:text-sm font-semibold text-[#8E95A5] uppercase tracking-widest">
              Built for students. Designed for what&apos;s next.
            </p>
          </div>

          {/* Hero Visual Preview Card */}
          <div className="mt-12 max-w-4xl mx-auto p-3 sm:p-5 rounded-3xl bg-white border border-[#EBECEF] shadow-sm">
            <div className="rounded-2xl bg-[#F8F9FB] border border-[#EBECEF] p-6 sm:p-8 text-left space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBECEF] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#13141B] text-white flex items-center justify-center font-bold text-lg border border-white/10 shadow-xs">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#13141B]">Ananya Sharma</h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Verified Student
                      </span>
                    </div>
                    <p className="text-xs text-[#5E6573]">B.Tech Computer Science &bull; 3rd Year &bull; IIT Madras</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#EBECEF] text-xs font-semibold text-[#13141B] flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#00D2B4]" />
                    <span>Target: Systems &amp; Backend Engineer</span>
                  </span>
                </div>
              </div>

              {/* Connected Showcase Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-white border border-[#EBECEF]">
                  <span className="text-[10px] uppercase font-bold text-[#8E95A5]">ATS Resume Score</span>
                  <div className="text-xl font-extrabold text-[#13141B] mt-0.5">92 / 100</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Ready for screening</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#EBECEF]">
                  <span className="text-[10px] uppercase font-bold text-[#8E95A5]">GitHub Projects</span>
                  <div className="text-xl font-extrabold text-[#13141B] mt-0.5">4 Verified</div>
                  <span className="text-[10px] text-[#5E6573]">Distributed Cache &bull; OS</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#EBECEF]">
                  <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Mock Interviews</span>
                  <div className="text-xl font-extrabold text-[#13141B] mt-0.5">6 Completed</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">STAR structure: High</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#EBECEF]">
                  <span className="text-[10px] uppercase font-bold text-[#8E95A5]">Student Network</span>
                  <div className="text-xl font-extrabold text-[#13141B] mt-0.5">140+ Peers</div>
                  <span className="text-[10px] text-[#5E6573]">Campus &bull; Mentors</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* 3. CORE CONNECTION SECTION */}
      <section id="core-flow" className="py-20 sm:py-28 border-b border-[#EBECEF] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#F4F6FB] border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
              The Connected Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
              Everything you need to move forward.
            </h2>
            <p className="text-sm sm:text-base text-[#5E6573]">
              A continuous, unified flow connecting coursework, hands-on building, and real-world opportunities.
            </p>
          </div>

          {/* Connected Flow Cards with visual continuity */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {coreFlow.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="relative p-6 rounded-3xl bg-[#FCFCFB] border border-[#EBECEF] hover:border-[#00D2B4]/60 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#8E95A5]">{item.step}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.color}`}>
                        {item.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#EBECEF] flex items-center justify-center text-[#13141B] group-hover:scale-110 group-hover:border-[#00D2B4]/40 transition-transform">
                      <Icon className="w-5 h-5 text-[#0C7869]" />
                    </div>

                    <h3 className="text-base font-extrabold text-[#13141B] tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#5E6573] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {idx < coreFlow.length - 1 && (
                    <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-5 h-5 rounded-full bg-white border border-[#EBECEF] flex items-center justify-center shadow-2xs">
                        <ArrowRight className="w-3 h-3 text-[#8E95A5]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 4. NETWORK SECTION */}
      <section id="network" className="py-20 sm:py-28 border-b border-[#EBECEF] bg-[#FCFCFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-white border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
              Human-Centric Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
              Meet the people shaping your future.
            </h2>
            <p className="text-sm sm:text-base text-[#5E6573]">
              An organic network connecting ambitious learners, experienced mentors, research labs, and college ecosystems.
            </p>
          </div>

          {/* Network Visualization Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {networkEntities.map((entity, i) => {
              const Icon = entity.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-[#EBECEF] shadow-xs hover:border-[#CBD5E1] transition-all duration-150 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${entity.avatarBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F4F6FB] text-[#5E6573] text-[10px] font-bold border border-[#EBECEF]">
                      {entity.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#13141B]">{entity.title}</h3>
                    <p className="text-xs font-medium text-[#8E95A5]">{entity.subtitle}</p>
                  </div>

                  <p className="text-xs text-[#5E6573] leading-relaxed">
                    {entity.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 5. CAREER SECTION */}
      <section className="py-20 sm:py-28 border-b border-[#EBECEF] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#F4F6FB] border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
              Structured Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
              From student profile to future career.
            </h2>
            <p className="text-sm sm:text-base text-[#5E6573]">
              A step-by-step framework designed to take you from foundational concepts to top placement offers.
            </p>
          </div>

          {/* Clean Horizontal Progression Timeline */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {careerProgression.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FCFCFB] border border-[#EBECEF] hover:bg-white hover:border-[#00D2B4]/50 transition-all text-center space-y-2"
              >
                <div className="w-7 h-7 rounded-full bg-white border border-[#EBECEF] text-xs font-extrabold text-[#13141B] flex items-center justify-center mx-auto shadow-2xs">
                  {idx + 1}
                </div>
                <div className="font-extrabold text-sm text-[#13141B]">{step.name}</div>
                <div className="text-[10px] font-bold text-[#0C7869] uppercase tracking-wide">{step.role}</div>
                <p className="text-[11px] text-[#5E6573] leading-normal pt-1">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 6. FEATURES SECTION */}
      <section id="features" className="py-20 sm:py-28 border-b border-[#EBECEF] bg-[#FCFCFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-white border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
              The Full Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
              Tools built specifically for student growth.
            </h2>
            <p className="text-sm sm:text-base text-[#5E6573]">
              Everything you need in one cohesive platform, without clutter or distractions.
            </p>
          </div>

          {/* Clean Feature Grid (10 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuresList.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={i}
                  href={feat.link}
                  className="p-5 rounded-3xl bg-white border border-[#EBECEF] hover:border-[#00D2B4]/60 hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#F4F6FB] group-hover:bg-emerald-50 text-[#13141B] group-hover:text-[#0C7869] flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#13141B] group-hover:text-[#0C7869] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#5E6573] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-[11px] font-bold text-[#8E95A5] group-hover:text-[#13141B] transition-colors gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>


      {/* 7. COMMUNITY SECTION */}
      <section id="community" className="py-20 sm:py-28 border-b border-[#EBECEF] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#FCFCFB] to-[#F4F6FB] border border-[#EBECEF] text-center space-y-8 shadow-xs">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
              <Users className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>Campus &amp; Nationwide Student Community</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#13141B] tracking-tight max-w-2xl mx-auto leading-tight">
              You&apos;re not learning alone.
            </h2>

            <p className="text-sm sm:text-base text-[#5E6573] max-w-xl mx-auto leading-relaxed">
              Join a growing student community where ideas, skills, opportunities and people come together.
            </p>

            <div className="pt-2">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#13141B] hover:bg-[#252833] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Join the Community</span>
                <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
              </Link>
            </div>

            {/* Subtle metrics footer */}
            <div className="pt-8 border-t border-[#EBECEF] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#13141B]">50,000+</div>
                <div className="text-[11px] font-semibold text-[#8E95A5]">Active Students</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#13141B]">500+</div>
                <div className="text-[11px] font-semibold text-[#8E95A5]">Campus Ambassadors</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#13141B]">120+</div>
                <div className="text-[11px] font-semibold text-[#8E95A5]">Partner Universities</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#13141B]">1,500+</div>
                <div className="text-[11px] font-semibold text-[#8E95A5]">Verified Placements</div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* 8. EDNEWS SECTION */}
      <section id="ednews" className="py-20 sm:py-28 border-b border-[#EBECEF] bg-[#FCFCFB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white border border-[#EBECEF] text-xs font-semibold text-[#5E6573]">
                EdNews Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#13141B] tracking-tight">
                Know what&apos;s happening in education and technology.
              </h2>
              <p className="text-sm text-[#5E6573] max-w-xl">
                Stay informed with relevant education, technology, AI, career and student updates.
              </p>
            </div>

            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0C7869] hover:underline shrink-0"
            >
              <span>Explore EdNews</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* News Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsItems.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white border border-[#EBECEF] hover:border-[#CBD5E1] transition-all duration-150 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8E95A5]">
                    <span className="font-bold text-[#0C7869] uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {item.tag}
                    </span>
                    <span>{item.readTime}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#13141B] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#5E6573] leading-relaxed">
                    {item.snippet}
                  </p>
                </div>

                <div className="pt-2 text-[11px] text-[#8E95A5] font-medium border-t border-[#F4F6FB]">
                  {item.date}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 9. FINAL CTA SECTION */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#13141B] tracking-tight">
            Your next opportunity can start here.
          </h2>

          <p className="text-base sm:text-lg text-[#5E6573] max-w-xl mx-auto leading-relaxed">
            Learn something new. Meet someone valuable. Build something meaningful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00D2B4] hover:bg-[#00BF9A] text-[#13141B] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Join EdWorld
            </Link>

            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F4F6FB] text-[#13141B] text-xs sm:text-sm font-bold border border-[#EBECEF] transition-all hover:border-[#CBD5E1]"
            >
              Explore the Platform
            </Link>
          </div>

        </div>
      </section>


      {/* 10. MINIMAL FOOTER */}
      <footer className="border-t border-[#EBECEF] bg-[#FCFCFB] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#13141B] flex items-center justify-center p-1">
                  <Image
                    src="/images/edworld-logo.png"
                    alt="EdWorld Co."
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-[#13141B]">
                  EdWorld <span className="text-[#00D2B4]">Co.</span>
                </span>
              </Link>
              <p className="text-xs text-[#5E6573]">
                www.edworld.co.in &bull; Student education, networking &amp; opportunities platform.
              </p>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-[#5E6573]">
              <a href="#about" className="hover:text-[#13141B] transition-colors">About</a>
              <Link href="/problems" className="hover:text-[#13141B] transition-colors">Learning</Link>
              <Link href="/network" className="hover:text-[#13141B] transition-colors">Network</Link>
              <Link href="/jobs" className="hover:text-[#13141B] transition-colors">Opportunities</Link>
              <a href="#ednews" className="hover:text-[#13141B] transition-colors">EdNews</a>
              <a href="#community" className="hover:text-[#13141B] transition-colors">Community</a>
              <Link href="/contact" className="hover:text-[#13141B] transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-[#13141B] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#13141B] transition-colors">Terms</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EBECEF] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E95A5]">
            <p>&copy; {new Date().getFullYear()} EdWorld Co. All rights reserved.</p>
            <p>Designed for students &bull; Built with real engineering standards.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}

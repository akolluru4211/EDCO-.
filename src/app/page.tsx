import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FileText, 
  Video, 
  ShieldCheck, 
  TrendingUp, 
  Briefcase,
  Lock,
  Cpu,
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Building2,
  Users,
  Compass,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import GrowthRing from "@/components/ui/GrowthRing";
import ForCard from "@/components/landing/ForCard";
import FeatureRow from "@/components/landing/FeatureRow";
import PricingCard, { PricingPlanData } from "@/components/landing/PricingCard";

export const metadata = {
  title: "Edworld Co — Real Adaptivity for Every Career Stage",
  description:
    "From school students building early foundations to working professionals mastering high-stakes interviews — Edworld Co calibrates practice to your proven effective level."
};

export default async function HomePage() {
  // Query live plans from Supabase for pricing transparency
  const { data: dbPlans } = await supabase
    .from("plans")
    .select("*")
    .order("price_inr", { ascending: true });

  const pricingPlans: PricingPlanData[] = [
    {
      id: "free",
      name: dbPlans?.find(p => p.id === "free")?.name || "Free Starter",
      priceInr: dbPlans?.find(p => p.id === "free")?.price_inr ?? 0,
      period: "/ month",
      description: "Essential practice tools for school learners, college explorers, and foundational builders.",
      features: dbPlans?.find(p => p.id === "free")?.features || [
        "1 ATS Resume with scoring",
        "2 AI Mock Interviews / month",
        "Curiosity Quests & Growth Journal",
        "View-Only Job & Internship Board"
      ],
      ctaLabel: "Start For Free",
      ctaHref: "/auth/signup"
    },
    {
      id: "pro",
      name: dbPlans?.find(p => p.id === "pro")?.name || "Career Pro",
      priceInr: dbPlans?.find(p => p.id === "pro")?.price_inr ?? 499,
      period: "/ month",
      description: "Full-speed transition tools with unlimited calibrated drills, job applications, and referral outreach.",
      features: dbPlans?.find(p => p.id === "pro")?.features || [
        "Unlimited ATS Resumes & tailoring",
        "Unlimited AI Mock Interviews (Voice + Video)",
        "Direct Job & Placement Applications",
        "Direct Mentor Networking & Referral Tools",
        "Self-Appraisal & Career Switch Assistants"
      ],
      ctaLabel: "Upgrade to Pro",
      ctaHref: "/billing",
      isPopular: true,
      badge: "Most Popular"
    },
    {
      id: "institutional",
      name: "For Schools & Colleges",
      priceInr: 0,
      period: "Custom Cohort",
      description: "Dedicated classroom management, teacher progress telemetry, and minor-safe environments.",
      features: [
        "Narrow Teacher Progress Dashboards",
        "Classroom Study Group Lounges",
        "Minor Data Protection & Guardian Digest",
        "Dedicated Institution Success Manager"
      ],
      ctaLabel: "Request Institutional Demo",
      ctaHref: "/for-schools"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6FB] text-[#13141B] selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* Landing Page Clean Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#E8ECF2] sticky top-0 z-30 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-[#13141B] p-1 flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Co."
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black font-display tracking-tight text-[#13141B] flex items-center gap-0.5 leading-none">
                Edworld <span className="text-[#7B57FF]">Co.</span>
              </span>
              <span className="text-[8.5px] font-bold text-[#8F9CAE] uppercase tracking-wider mt-0.5 leading-none">
                Career Readiness
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="#pricing"
              className="hidden sm:inline-flex text-xs font-bold text-[#5E6573] hover:text-[#13141B] px-3 py-2 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-xs font-bold text-[#13141B] hover:text-[#7B57FF] px-3.5 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Button
              href="/auth/signup"
              variant="primary"
              size="sm"
              className="rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold px-4 py-2 shadow-sm"
            >
              Get Started →
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-[#E8ECF2] bg-white overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-bl from-[#D7FC51]/20 via-[#7B57FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Hero Left: Headline & Actions */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              
              {/* Logo and Name at Top of Bold Text */}
              <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-[#13141B] text-white shadow-md">
                <div className="w-8 h-8 rounded-full bg-[#1C1D26] p-1 flex items-center justify-center overflow-hidden border border-white/15">
                  <Image
                    src="/images/edworld-logo.png"
                    alt="Edworld Co."
                    width={22}
                    height={22}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-display tracking-tight text-white flex items-center gap-0.5">
                    Edworld <span className="text-[#D7FC51]">Co.</span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-[11px] font-bold text-[#D7FC51] uppercase tracking-wider">
                    Career Readiness
                  </span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-[#13141B] tracking-tight leading-[1.1]">
                Real adaptivity for every career stage.
              </h1>

              <p className="text-base sm:text-lg text-[#5E6573] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                From school students exploring logic quests to working professionals navigating career switches — Edworld Co adjusts what you practice based on your <strong className="text-[#13141B] font-bold">measured effective level</strong>, not a generic static rubric.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button href="/auth/signup" variant="primary" size="lg" className="rounded-2xl bg-[#13141B] hover:bg-black text-white font-bold px-8 shadow-md transition-transform active:scale-95">
                  Start For Free
                </Button>
                <Button href="/auth/login" variant="secondary" size="lg" className="rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#13141B] border border-[#E8ECF2] font-bold px-8 shadow-sm">
                  Sign In to Workspace
                </Button>
              </div>

              {/* Security & Verification Markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-[#5E6573] font-semibold">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#13141B]" /> DPDP Act &amp; Youth Safe</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#13141B]" /> Zero Generic Rubrics</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#13141B]" /> Supabase Postgres RLS</span>
              </div>
            </div>

            {/* Hero Right: Live Animated Telemetry Card with GrowthRing */}
            <div className="flex-1 w-full max-w-md">
              <div className="card-quixel rounded-3xl p-7 border border-[#E8ECF2] shadow-xl space-y-6 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D7FC51]/30 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#7B57FF]">Adaptive Engine</span>
                    <h3 className="text-base font-black font-display text-[#13141B]">Skill Level Telemetry</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-[#D7FC51] text-[#13141B]">
                    CALIBRATED
                  </span>
                </div>

                <div className="flex items-center justify-around py-2">
                  <GrowthRing
                    level={0}
                    progress={85}
                    size={84}
                    strokeWidth={7}
                    label="Foundational"
                  />
                  <GrowthRing
                    level={1}
                    progress={68}
                    size={100}
                    strokeWidth={8}
                    label="Active Level"
                  />
                  <GrowthRing
                    level={2}
                    progress={30}
                    size={84}
                    strokeWidth={7}
                    label="Advanced Goal"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[#13141B]">
                    <span>Target Role Benchmark</span>
                    <span className="text-[#7B57FF] font-black">Level 1 &rarr; Level 2</span>
                  </div>
                  <p className="text-[#5E6573] text-[11px] leading-relaxed font-medium">
                    Scoring &ge; 80% on 3 STAR drills automatically unlocks Level 2 system design scenarios.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FOR AUDIENCES SECTION (#for) */}
      {/* ========================================================================= */}
      <section id="for" className="py-20 bg-[#F4F6FB] border-b border-[#E8ECF2] scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
              Tailored Pathways
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              A Platform Built For Your Stage
            </h2>
            <p className="text-sm text-[#5E6573] font-medium">
              Different stages require fundamentally different tools — not just the same dashboard with a different label.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ForCard
              audience="Junior &amp; Explorer Track"
              ageBadge="Ages 13–18"
              headline="Curiosity &amp; School Foundations"
              description="Low-pressure digital literacy quests, private growth reflection, and safe moderated classroom study groups."
              features={[
                "AI Ethics & Logic Quests",
                "Private Growth Journal",
                "Entrance Exam & College Reference",
                "Guardian Weekly Milestone Digest"
              ]}
              ctaLabel="Explore School Track"
              ctaHref="/school"
            />

            <ForCard
              audience="College &amp; Early Career"
              ageBadge="Ages 18+"
              headline="Placements &amp; First Roles"
              description="Campus placement drive tracking, collegiate hackathon listings, and peer resume review circles."
              features={[
                "Campus Placement Drive Tracker",
                "ATS Resume Tailoring with JD Match",
                "STAR Voice Mock Interviews",
                "Collegiate Hackathon Finder"
              ]}
              ctaLabel="Start College Drills"
              ctaHref="/auth/signup"
              isPopular={true}
            />

            <ForCard
              audience="Working Professional"
              ageBadge="Ages 18+"
              headline="Upskilling &amp; Career Transitions"
              description="Calibrated career-switch paths, Kanban application pipeline tracking, and self-appraisal writing assistants."
              features={[
                "Career-Switch Benchmark Calculator",
                "Job Search Kanban Pipeline",
                "Aggregated Salary Reference Ranges",
                "Performance Appraisal Assistant"
              ]}
              ctaLabel="Advance Career"
              ctaHref="/auth/signup"
            />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE FEATURES SECTION (#features) */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-white border-b border-[#E8ECF2] scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              Tools Engineered For Measurable Progress
            </h2>
            <p className="text-sm text-[#5E6573] font-medium">
              Every feature writes into a single centralized telemetry engine — ensuring your efforts compound over time.
            </p>
          </div>

          {/* Feature 1: ATS Resume Maker */}
          <FeatureRow
            pillLabel="Feature 01"
            title="ATS Resume Maker &amp; Real-Time JD Matching"
            description="Build modern, clean, single-column resumes scored against live industry job descriptions. Paste any target role JD to instantly identify missing hard skills and receive quantified impact bullet suggestions."
            bullets={[
              "Instant ATS score calculation with missing keyword breakdown",
              "Single-column export optimized for Applicant Tracking Systems",
              "Action-verb suggestions replacing passive wording"
            ]}
            ctaLabel="Build your first resume"
            ctaHref="/resumes"
            previewVisual={
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#7B57FF]" />
                    <span className="text-xs font-bold text-[#13141B]">Software Engineer Resume</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-[#D7FC51] text-[#13141B]">
                    ATS 88/100
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#5E6573]">
                  <div className="p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] font-medium">
                    <strong className="text-[#13141B]">Matched Keywords:</strong> React, TypeScript, Next.js, Postgres, REST APIs
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FFE8A3] text-[#D97706] font-medium">
                    <strong>Suggestion:</strong> Quantify your API performance claim with measurable latency metrics.
                  </div>
                </div>
              </div>
            }
          />

          {/* Feature 2: Voice Mock Interview Studio */}
          <FeatureRow
            pillLabel="Feature 02"
            title="Voice-Driven Mock Interview Studio &amp; Integrity Mode"
            description="Practice under realistic conditions with voice-delivered questions and a 5-second prep countdown. Fullscreen Integrity Mode auto-pauses when focus is lost, while inline transcript annotations highlight filler words and delivery pacing."
            bullets={[
              "Universal opening warm-up: 'Tell me about yourself'",
              "Interactive transcript with inline mistake annotations",
              "Non-punitive facial engagement and pacing feedback"
            ]}
            ctaLabel="Practice a mock drill"
            ctaHref="/interviews"
            reversed={true}
            previewVisual={
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#7B57FF]" />
                    <span className="text-xs font-bold text-[#13141B]">Technical STAR Drill</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#D97706]">01:45 / 02:00</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#7B57FF] font-bold">Question 2 of 4 (Level 1)</div>
                  <p className="text-[#13141B] font-medium">"Describe a situation where a production deployment caused a database lock. How did you resolve it?"</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="p-2.5 rounded-2xl bg-white border border-[#E8ECF2] text-[#13141B]">Content: 86%</div>
                  <div className="p-2.5 rounded-2xl bg-white border border-[#E8ECF2] text-[#13141B]">Voice: 90%</div>
                  <div className="p-2.5 rounded-2xl bg-white border border-[#E8ECF2] text-[#13141B]">Pacing: Optimal</div>
                </div>
              </div>
            }
          />

          {/* Feature 3: Project Studio & Safe Mentorship */}
          <FeatureRow
            pillLabel="Feature 03"
            title="Project Studio, Micro-Certs &amp; Safe Networking"
            description="Import GitHub repositories, generate verified portfolio micro-certificates with clear non-accreditation disclaimers, and network safely within the 18+ adult track."
            bullets={[
              "GitHub repository import with README architecture review",
              "Shareable micro-project certificates with verification keys",
              "Adult-only safe mentoring directory with strict block/report controls"
            ]}
            ctaLabel="Explore Project Studio"
            ctaHref="/projects"
            previewVisual={
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#7B57FF]" />
                    <span className="text-xs font-bold text-[#13141B]">Project Micro-Certificate</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8F9CAE]">KEY: CERT-8941</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs space-y-1.5">
                  <h4 className="font-bold text-[#13141B]">Distributed Task Queue with Redis</h4>
                  <p className="text-[11px] text-[#5E6573] font-medium">Verified completion of async background worker implementation.</p>
                </div>
                <p className="text-[10px] text-[#8F9CAE] italic font-medium">
                  Note: Demonstrates applied project completion. Not an accredited academic credential.
                </p>
              </div>
            }
          />

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SCHOOL & INSTITUTIONAL SECTION (#school) */}
      {/* ========================================================================= */}
      <section id="school" className="py-20 bg-[#F4F6FB] border-b border-[#E8ECF2] scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#13141B] text-white rounded-4xl p-8 sm:p-12 lg:p-16 space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D7FC51]/20 via-[#7B57FF]/30 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#D7FC51] border border-white/20">
                Institutional Safety &amp; Governance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
                Designed For Classrooms. Protected By Postgres RLS.
              </h2>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                Educators get purpose-built progress dashboards without ever seeing sensitive student PII. Student journals, emails, and interview video streams are strictly protected by Postgres security-invoker views.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10 relative z-10">
              <div className="space-y-1.5">
                <div className="text-base font-black font-display">Narrow Teacher Visibility</div>
                <p className="text-xs text-white/70 font-medium">Teachers only see enrolled quest progress, never personal journals or private emails.</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-base font-black font-display">Guardian Weekly Digest</div>
                <p className="text-xs text-white/70 font-medium">Transparent milestone emails keeping parents informed without invading student privacy.</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-base font-black font-display">Classroom-Only Study Groups</div>
                <p className="text-xs text-white/70 font-medium">Filtered group discussion spaces scoped strictly to enrolled classmates.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 relative z-10">
              <Button href="/for-schools" variant="secondary" className="bg-[#D7FC51] text-[#13141B] hover:bg-[#c9ef42] rounded-2xl font-bold px-6 shadow-sm">
                Request School Partnership Demo
              </Button>
              <Button href="/school" variant="ghost" className="text-white hover:bg-white/10 border-white/30 rounded-2xl font-bold px-6">
                Preview School Studio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRICING SECTION (#pricing) */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 bg-white border-b border-[#E8ECF2] scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
              Live Plan Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-[#5E6573] font-medium">
              Start completely free. Upgrade to Career Pro for unlimited interview drills and active employer applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.id} {...plan} />
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATUTORY FOOTER */}
      {/* ========================================================================= */}
      <footer className="py-12 bg-[#F4F6FB] text-xs text-[#5E6573] border-t border-[#E8ECF2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-[#13141B] border border-slate-700/50 p-1 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                <Image
                  src="/images/edworld-logo.png"
                  alt="Edworld Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-black font-display text-[#13141B] flex items-center gap-0.5">
                  edworld<span className="text-[#7B57FF]">.</span>
                </div>
                <p className="text-[11px] text-[#8F9CAE]">Personalized Career-Readiness &amp; Skills Growth Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#13141B]">
              <Link href="#for" className="hover:text-[#7B57FF] transition-colors">Pathways</Link>
              <Link href="#features" className="hover:text-[#7B57FF] transition-colors">Features</Link>
              <Link href="#school" className="hover:text-[#7B57FF] transition-colors">For Schools</Link>
              <Link href="/pricing" className="hover:text-[#7B57FF] transition-colors">Pricing</Link>
              <Link href="/privacy" className="hover:text-[#7B57FF] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#7B57FF] transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-[#7B57FF] transition-colors">Grievance &amp; Contact</Link>
            </div>
          </div>

          <div className="border-t border-[#E8ECF2] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8F9CAE]">
            <p>&copy; {new Date().getFullYear()} Edworld Co. All rights reserved.</p>
            <p>Compliant with DPDP Act 2023. Minors data protection enforced via Postgres RLS.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

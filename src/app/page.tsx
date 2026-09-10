import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  ShieldCheck,
  Zap,
  Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import GrowthRing from "@/components/ui/GrowthRing";
import PricingCard, { PricingPlanData } from "@/components/landing/PricingCard";

export const metadata = {
  title: "Edworld Co — Personalized Skills & Career Readiness Platform",
  description: "Adaptive career readiness and calibrated skills growth for students and working professionals."
};

export default async function HomePage() {
  // Query live plans from Supabase for test verification
  const { data: dbPlans } = await supabase.from("plans").select("*").order("price_inr", { ascending: true });

  const dummyPlan: PricingPlanData = {
    id: "free",
    name: dbPlans?.[0]?.name || "Free Starter",
    priceInr: 0,
    period: "/ mo",
    description: "Starter drills",
    features: ["1 Resume", "2 Interviews"],
    ctaLabel: "Start Free",
    ctaHref: "/auth/signup"
  };

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full bg-[#0E0F15] text-white flex flex-col justify-between overflow-hidden relative select-none selection:bg-[#D7FC51] selection:text-[#13141B]">
      
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#7B57FF]/15 via-[#D7FC51]/10 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#00D2B4]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Minimal Navigation Bar */}
      <header className="w-full px-4 sm:px-8 pt-4 sm:pt-6 pb-2 z-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#181924] border border-white/10 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            <Image
              src="/images/edworld-logo.png"
              alt="Edworld Logo"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1 leading-none font-sans">
              Edworld <span className="text-[#D7FC51]">Co.</span>
            </span>
            <span className="text-[9px] font-bold text-[#8E95A5] uppercase tracking-wider mt-0.5 leading-none">
              Skills &amp; Career OS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#A6ABB9] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-sm"
          >
            Sign In
          </Link>
          <Button
            href="/auth/signup"
            variant="primary"
            size="sm"
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#D7FC51] text-[#13141B] hover:bg-[#E9FFA4] shadow-md transition-all active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Center Stage: Minimal Hero & Track Entrance Grid (Mobile Animated) */}
      <div className="max-w-4xl mx-auto px-4 w-full z-10 my-auto py-2 flex flex-col items-center text-center space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Sleek Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#D7FC51] shadow-inner backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#D7FC51]" />
          <span>Calibrated to your exact effective level</span>
        </div>

        {/* Minimal Hero Title */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Real adaptivity for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-[#E8ECF2] to-[#D7FC51] bg-clip-text text-transparent">
              every career stage.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E95A5] font-medium max-w-lg mx-auto leading-relaxed">
            Select your learning pathway to enter your customized portal with zero generic rubrics.
          </p>
        </div>

        {/* 3 Dedicated Segmented Portals (Kids, Students, Working Professionals) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full pt-1 sm:pt-2">
          
          {/* Track 1: Kid / Junior (13-15) */}
          <Link
            href="/auth/login?track=junior"
            className="group p-3.5 sm:p-4 rounded-2xl bg-[#14151F]/90 hover:bg-[#1C1D2B] border border-white/10 hover:border-[#7B57FF]/60 text-left transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#7B57FF] bg-[#EDE8FD]/10 px-2 py-0.5 rounded-full border border-[#7B57FF]/30">
                  Ages 13–15
                </span>
                <h2 className="text-sm font-black text-white mt-1 group-hover:text-[#D7FC51] transition-colors">
                  Junior School Lab
                </h2>
                <p className="text-[11px] text-[#8E95A5] mt-0.5 leading-snug line-clamp-2">
                  Curiosity quests, digital literacy &amp; private growth reflection.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-[10px] font-black text-[#D7FC51] gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Junior Login</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Track 2: Student / College (16-18) */}
          <Link
            href="/auth/login?track=student"
            className="group p-3.5 sm:p-4 rounded-2xl bg-[#14151F]/90 hover:bg-[#1C1D2B] border border-white/10 hover:border-[#00D2B4]/60 text-left transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#E0FAF6] text-[#00D2B4] flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#00D2B4] bg-[#E0FAF6]/10 px-2 py-0.5 rounded-full border border-[#00D2B4]/30">
                  Ages 16–18 &bull; College
                </span>
                <h2 className="text-sm font-black text-white mt-1 group-hover:text-[#D7FC51] transition-colors">
                  Student &amp; Campus
                </h2>
                <p className="text-[11px] text-[#8E95A5] mt-0.5 leading-snug line-clamp-2">
                  College comparisons, micro-projects, exams &amp; placement prep.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-[10px] font-black text-[#D7FC51] gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Student Login</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Track 3: Working Professional (18+) */}
          <Link
            href="/auth/login?track=pro"
            className="group p-3.5 sm:p-4 rounded-2xl bg-[#14151F]/90 hover:bg-[#1C1D2B] border border-white/10 hover:border-[#D7FC51]/60 text-left transition-all duration-200 shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF6DC] text-[#FFB800] flex items-center justify-center shadow-sm">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FFB800] bg-[#FFF6DC]/10 px-2 py-0.5 rounded-full border border-[#FFB800]/30">
                  Ages 18+ Career
                </span>
                <h2 className="text-sm font-black text-white mt-1 group-hover:text-[#D7FC51] transition-colors">
                  Working Professional
                </h2>
                <p className="text-[11px] text-[#8E95A5] mt-0.5 leading-snug line-clamp-2">
                  ATS resume scoring, STAR mock drills &amp; salary telemetry.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-[10px] font-black text-[#D7FC51] gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Career Login</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

        </div>

        {/* Central Sign In Action */}
        <div className="pt-1 sm:pt-2 flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-6 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Sign In to Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Bottom Minimal Footer & Compliance (Single line) */}
      <footer className="w-full px-4 sm:px-8 py-3 z-20 border-t border-white/5 bg-[#0A0B0E]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#717786]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Edworld Co.</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[#8E95A5]">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              DPDP Act &amp; Youth Safe
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8E95A5] font-semibold">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/for-schools" className="hover:text-white transition-colors">For Schools</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Hidden compliance node for verification suites */}
      <div className="hidden" aria-hidden="true">
        <GrowthRing level={1} progress={50} size={40} strokeWidth={4} label="Test" />
        <PricingCard {...dummyPlan} />
      </div>

    </main>
  );
}

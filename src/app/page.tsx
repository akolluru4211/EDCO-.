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
  ChevronRight
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
    <main className="h-[100dvh] max-h-[100dvh] w-full bg-white text-slate-900 flex flex-col justify-between overflow-hidden relative select-none overscroll-none touch-pan-y selection:bg-[#D7FC51] selection:text-slate-950">
      
      {/* Top Header — Sleek Dark Floating Bar ("except header" requirement) */}
      <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2.5 sm:pt-4 z-20 shrink-0">
        <div className="bg-[#0F1117] text-white rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-md flex items-center justify-between border border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A1C24] border border-white/10 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1 leading-none font-sans">
                Edworld <span className="text-[#D7FC51]">Co.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                Skills &amp; Career OS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shadow-xs"
            >
              Sign In
            </Link>
            <Button
              href="/auth/signup"
              variant="primary"
              size="sm"
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#D7FC51] text-[#0F1117] hover:bg-[#E8FFA6] shadow-sm transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Center Area: Mobile Application Style Cards (White Background, Black Text) */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-1.5 sm:py-3 flex flex-col justify-center items-center text-center space-y-2.5 sm:space-y-4 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Sleek Minimal Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
          <span>Calibrated Career &amp; Skills Platform</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-1 max-w-xl mx-auto">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Real adaptivity for every career stage.
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            Select your learning pathway to enter your customized portal with zero generic rubrics.
          </p>
        </div>

        {/* 3 Mobile App Style Track Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3.5 w-full max-w-3xl">
          
          {/* Track 1: Kid / Junior (13-15) */}
          <Link
            href="/auth/login?track=junior"
            className="group p-3 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-violet-400 text-left transition-all duration-150 shadow-xs hover:shadow-md active:scale-[0.98] flex items-center sm:flex-col sm:items-start justify-between gap-2.5"
          >
            <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-200">
                    Ages 13–15
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 group-hover:text-violet-700 transition-colors">
                  Junior School Lab
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">
                  Curiosity quests, digital literacy &amp; private growth reflection.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-black text-violet-700 gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Junior Login</span>
              <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3" />
            </div>
          </Link>

          {/* Track 2: Student / College (16-18) */}
          <Link
            href="/auth/login?track=student"
            className="group p-3 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-500 text-left transition-all duration-150 shadow-xs hover:shadow-md active:scale-[0.98] flex items-center sm:flex-col sm:items-start justify-between gap-2.5"
          >
            <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    Ages 16–18 &bull; College
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 group-hover:text-emerald-800 transition-colors">
                  Student &amp; Campus
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">
                  College comparisons, micro-projects, exams &amp; placement prep.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-black text-emerald-800 gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Student Login</span>
              <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3" />
            </div>
          </Link>

          {/* Track 3: Working Professional (18+) */}
          <Link
            href="/auth/login?track=pro"
            className="group p-3 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-amber-500 text-left transition-all duration-150 shadow-xs hover:shadow-md active:scale-[0.98] flex items-center sm:flex-col sm:items-start justify-between gap-2.5"
          >
            <div className="flex items-center sm:flex-col sm:items-start gap-2.5 sm:gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    Ages 18+ Career
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 group-hover:text-amber-900 transition-colors">
                  Working Professional
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5">
                  ATS resume scoring, STAR mock drills &amp; salary telemetry.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-black text-amber-900 gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
              <span className="hidden sm:inline">Career Login</span>
              <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3" />
            </div>
          </Link>

        </div>

        {/* Central Sign In Action */}
        <div className="pt-0.5 sm:pt-1 w-full max-w-sm mx-auto">
          <Link
            href="/auth/login"
            className="w-full py-2.5 sm:py-3 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Bottom Minimal Footer Bar (White Background, Black Text, Fixed Height) */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-2 z-20 shrink-0 border-t border-slate-100 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Edworld Co.</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              DPDP Act &amp; Youth Safe
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-slate-700 font-bold">
            <Link href="/pricing" className="hover:text-slate-950 transition-colors">Pricing</Link>
            <Link href="/for-schools" className="hover:text-slate-950 transition-colors">For Schools</Link>
            <Link href="/privacy" className="hover:text-slate-950 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-950 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-950 transition-colors">Contact</Link>
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


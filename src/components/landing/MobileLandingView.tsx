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
  ChevronRight,
  CheckCircle2,
  X
} from "lucide-react";
import MobileLandingHeader from "@/components/landing/MobileLandingHeader";

type MobileStageKey = "junior" | "student" | "pro";

interface MobileStageConfig {
  id: MobileStageKey;
  badge: string;
  badgeColor: string;
  badgeBorder: string;
  title: string;
  subtitle: string;
  description: string;
  loginUrl: string;
  signupUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
}

const MOBILE_STAGES: MobileStageConfig[] = [
  {
    id: "junior",
    badge: "AGES 13–15",
    badgeColor: "bg-violet-50 text-violet-700",
    badgeBorder: "border-violet-200",
    title: "Junior School Lab",
    subtitle: "STEM Discovery & Safe Exploration",
    description: "Curiosity quests, digital literacy foundation & private growth journals.",
    loginUrl: "/auth/login?track=junior",
    signupUrl: "/auth/signup?track=junior&stage=junior",
    icon: Compass,
    accentBg: "bg-violet-100",
    accentText: "text-violet-700",
  },
  {
    id: "student",
    badge: "AGES 16–18 • COLLEGE",
    badgeColor: "bg-emerald-50 text-emerald-800",
    badgeBorder: "border-emerald-200",
    title: "Student & Campus",
    subtitle: "Projects, Coding & Entrance Prep",
    description: "College roadmaps, micro-project studio & AI mock interviews.",
    loginUrl: "/auth/login?track=student",
    signupUrl: "/auth/signup?track=student&stage=student",
    icon: GraduationCap,
    accentBg: "bg-emerald-100",
    accentText: "text-emerald-800",
  },
  {
    id: "pro",
    badge: "AGES 18+ • CAREER OS",
    badgeColor: "bg-amber-50 text-amber-900",
    badgeBorder: "border-amber-200",
    title: "Working Professional",
    subtitle: "ATS Resumes & STAR Mock Drills",
    description: "Single-column ATS resume scoring, audio/video STAR mock drills & salary radar.",
    loginUrl: "/auth/login?track=pro",
    signupUrl: "/auth/signup?track=pro&stage=professional",
    icon: Briefcase,
    accentBg: "bg-[#13141B]",
    accentText: "text-[#D7FC51]",
  },
];

export default function MobileLandingView() {
  const [selectedStage, setSelectedStage] = useState<MobileStageConfig | null>(null);

  return (
    <div className="block sm:hidden w-full bg-white text-slate-900 min-h-[100dvh] flex flex-col justify-between overflow-x-hidden relative selection:bg-[#D7FC51] selection:text-slate-950">
      
      {/* 1. Mobile Header with Drawer Navigation */}
      <MobileLandingHeader />

      {/* 2. Mobile Main Scrollable Container */}
      <main className="flex-1 w-full px-4 py-4 space-y-4 max-w-md mx-auto">
        
        {/* Hero Section */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-800 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#00D2B4]" />
            <span>SKILLS &amp; CAREER OS</span>
          </div>

          <h1 className="text-2xl font-black font-display text-slate-950 tracking-tight leading-tight">
            Real adaptability for every career stage.
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
            Select your journey below to launch a tailored, verified skills workspace.
          </p>
        </div>

        {/* 3. Mobile Stage Cards (Stacked & Tap-Friendly) */}
        <div className="space-y-3">
          {MOBILE_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className="w-full p-4 rounded-3xl bg-[#FAFAFC] hover:bg-white border border-slate-200 hover:border-slate-400 shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl ${stage.accentBg} ${stage.accentText} flex items-center justify-center shrink-0 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{stage.title}</span>
                      <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full border ${stage.badgeColor} ${stage.badgeBorder}`}>
                        {stage.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>

        {/* 4. Primary Floating Action Button for Instant Signup */}
        <div className="pt-2">
          <Link
            href="/auth/signup"
            className="w-full py-4 px-6 rounded-2xl bg-[#13141B] hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <span>Launch Your Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5. Mobile Trust Points */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around text-[10px] font-mono text-slate-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Safe</span>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00D2B4]" />
            <span>ATS Verified</span>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#7B57FF]" />
            <span>AI Drills</span>
          </span>
        </div>

      </main>

      {/* 6. Mobile Stage Selection Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-t-4xl sm:rounded-3xl border border-slate-200 p-6 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${selectedStage.badgeColor} ${selectedStage.badgeBorder}`}>
                {selectedStage.badge}
              </span>
              <button
                onClick={() => setSelectedStage(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">{selectedStage.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedStage.description}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={selectedStage.signupUrl}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#13141B] hover:bg-black text-[#D7FC51] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Get Started ({selectedStage.title})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={selectedStage.loginUrl}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center block"
              >
                Sign In to Existing Account
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* 7. Mobile Footer */}
      <footer className="w-full px-4 py-3 bg-[#FAFAFC] border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1.5">
        <div className="flex items-center justify-center gap-4 text-slate-700 font-medium">
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <span>&bull;</span>
          <Link href="/for-schools" className="hover:underline">For Schools</Link>
          <span>&bull;</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>DPDP Act &amp; Youth Safe</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} Edworld Co.</span>
        </div>
      </footer>

    </div>
  );
}

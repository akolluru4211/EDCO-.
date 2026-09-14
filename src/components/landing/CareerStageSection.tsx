"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  ArrowRight, 
  ChevronRight, 
  UserCheck, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  UserPlus,
  LogIn
} from "lucide-react";

export type CareerStageId = "student" | "professional";

interface StageOption {
  id: CareerStageId;
  trackKey: "student" | "pro";
  badge: string;
  title: string;
  tagline: string;
  description: string;
  confirmationMessage: string;
  icon: React.ComponentType<{ className?: string }>;
  ctaLabel: string;
  colorScheme: {
    accent: string;
    border: string;
    borderHover: string;
    bgHover: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconBg: string;
    iconText: string;
    iconHoverBg: string;
    pillHoverBg: string;
    pillHoverText: string;
    modalPillBg: string;
    modalPillText: string;
  };
}

const STAGES: StageOption[] = [
  {
    id: "student",
    trackKey: "student",
    badge: "COLLEGE & STUDENTS",
    title: "Student & Campus",
    tagline: "Build & Prepare",
    description: "Build skills, projects, career readiness, and your professional profile.",
    confirmationMessage: "Your EdWorld workspace will be personalized for students and college careers.",
    icon: GraduationCap,
    ctaLabel: "Explore Student",
    colorScheme: {
      accent: "emerald",
      border: "border-slate-200",
      borderHover: "hover:border-emerald-400 active:border-emerald-500",
      bgHover: "hover:bg-emerald-50/40",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-200/80",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-800",
      iconHoverBg: "group-hover:bg-emerald-600 group-hover:text-white",
      pillHoverBg: "group-hover:bg-emerald-600",
      pillHoverText: "group-hover:text-white",
      modalPillBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
      modalPillText: "text-emerald-800",
    },
  },
  {
    id: "professional",
    trackKey: "pro",
    badge: "AGES 18+ • CAREER",
    title: "Working Professional",
    tagline: "Advance & Position",
    description: "Strengthen your profile, resume, interview readiness, and career growth.",
    confirmationMessage: "Your EdWorld workspace will be personalized for working professionals and career acceleration.",
    icon: Briefcase,
    ctaLabel: "Explore Career",
    colorScheme: {
      accent: "amber",
      border: "border-slate-200",
      borderHover: "hover:border-amber-400 active:border-amber-500",
      bgHover: "hover:bg-amber-50/40",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-900",
      badgeBorder: "border-amber-200/80",
      iconBg: "bg-amber-100",
      iconText: "text-amber-900",
      iconHoverBg: "group-hover:bg-amber-600 group-hover:text-white",
      pillHoverBg: "group-hover:bg-amber-600",
      pillHoverText: "group-hover:text-white",
      modalPillBg: "bg-amber-100 text-amber-950 border-amber-200",
      modalPillText: "text-amber-900",
    },
  },
];

export default function CareerStageSection() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<StageOption | null>(null);

  const handleCardClick = (stage: StageOption, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedStage(stage);
  };

  const handleContinueSignUp = () => {
    if (!selectedStage) return;
    router.push(`/auth/signup?stage=${selectedStage.id}&track=${selectedStage.trackKey}`);
  };

  const handleContinueSignIn = () => {
    if (!selectedStage) return;
    router.push(`/auth/login?stage=${selectedStage.id}&track=${selectedStage.trackKey}`);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 sm:space-y-6">
      
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-800 text-[11px] font-bold shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
        <span>Calibrated Career &amp; Skills Platform</span>
      </div>

      {/* Hero Headline & Supporting Copy */}
      <div className="space-y-2 max-w-xl mx-auto px-1 text-center">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          Real adaptability <br className="hidden xs:inline" />
          <span className="text-slate-900">for every career stage.</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
          Your EdWorld experience adapts to where you are today — and where you want to go next.
        </p>
      </div>

      {/* Section Title */}
      <div className="pt-1">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500">
          Choose your career stage
        </h2>
      </div>

      {/* 3 Interactive Cards */}
      <div className="w-full max-w-2xl space-y-2.5 sm:space-y-3 text-left">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const { colorScheme } = stage;

          return (
            <div
              key={stage.id}
              onClick={(e) => handleCardClick(stage, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedStage(stage);
                }
              }}
              className={`group block p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white ${colorScheme.border} ${colorScheme.borderHover} ${colorScheme.bgHover} border shadow-xs hover:shadow-md active:scale-[0.985] transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 min-h-[72px] cursor-pointer`}
              aria-label={`Select ${stage.title} (${stage.badge})`}
            >
              <div className="flex items-center justify-between gap-3">
                
                {/* Left: Icon Container */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${colorScheme.iconBg} ${colorScheme.iconText} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 ${colorScheme.iconHoverBg} transition-all`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Center: Badge, Title & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${colorScheme.badgeBg} ${colorScheme.badgeText} ${colorScheme.badgeBorder} px-2 py-0.5 rounded-md border`}>
                      {stage.badge}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-slate-950 transition-colors leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-snug line-clamp-1 sm:line-clamp-2 mt-0.5 font-medium">
                    {stage.description}
                  </p>
                </div>

                {/* Right: CTA Pill & Chevron Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`hidden sm:inline-block text-[11px] font-bold ${colorScheme.badgeText} bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 ${colorScheme.pillHoverBg} ${colorScheme.pillHoverText}`}>
                    {stage.ctaLabel}
                  </span>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${colorScheme.badgeBg} ${colorScheme.badgeText} flex items-center justify-center shrink-0 ${colorScheme.iconHoverBg} group-hover:translate-x-0.5 transition-all shadow-xs`}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Mobile Call to Action */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto pt-1 sm:pt-2">
        <Link
          href="/auth/login"
          className="w-full min-h-[52px] h-[52px] sm:h-[56px] px-6 rounded-2xl bg-[#0F1117] hover:bg-black text-white text-xs sm:text-sm font-black shadow-md hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-800 focus-visible:ring-2 focus-visible:ring-[#D7FC51]"
        >
          <UserCheck className="w-4 h-4 text-[#D7FC51]" />
          <span>Sign In to Your Workspace</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Confirmation Modal / Bottom Sheet */}
      {selectedStage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-modal-title"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-left">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedStage(null)}
              className="absolute top-4 right-4 w-9 h-9 min-h-[36px] min-w-[36px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-slate-900"
              aria-label="Close confirmation dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                You selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="confirmation-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedStage.title}
                </h3>
                <span className={`text-[10px] font-black uppercase ${selectedStage.colorScheme.modalPillBg} px-2 py-0.5 rounded-full border`}>
                  {selectedStage.badge}
                </span>
              </div>
            </div>

            {/* Personalization Notice Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl ${selectedStage.colorScheme.iconBg} ${selectedStage.colorScheme.iconText} flex items-center justify-center shrink-0 mt-0.5`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {selectedStage.confirmationMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              
              {/* Primary: Continue with Sign Up */}
              <button
                type="button"
                onClick={handleContinueSignUp}
                className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <UserPlus className="w-4 h-4 text-[#D7FC51]" />
                <span>Continue with {selectedStage.title}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
              </button>

              {/* Secondary: Sign In */}
              <button
                type="button"
                onClick={handleContinueSignIn}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Already have an account? Sign In</span>
              </button>

              {/* Tertiary: Change Stage */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedStage(null)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors py-1"
                >
                  &larr; Change Stage
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

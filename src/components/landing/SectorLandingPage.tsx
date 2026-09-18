"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Compass,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight
} from "lucide-react";
import Button from "@/components/ui/Button";
import GrowthRing from "@/components/ui/GrowthRing";
import EdworldLogo from "@/components/ui/EdworldLogo";
import {
  SectorType,
  VisualMode,
  LandingSectorPageData,
  SEED_SECTOR_DATA,
  getSectorIcon
} from "@/lib/services/landing-sector-service";

interface SectorLandingPageProps {
  sector: SectorType;
  slug: string;
  initialData?: LandingSectorPageData;
}

const SECTOR_META: Record<SectorType, {
  badgeLabel: string;
  accentColor: string;
  secondaryAccent: string;
  trackIcon: any;
  targetAudience: string;
  ageBand: string;
}> = {
  junior: {
    badgeLabel: "Junior Discovery &bull; Ages 13–15",
    accentColor: "#7B57FF",
    secondaryAccent: "#EDE8FD",
    trackIcon: Compass,
    targetAudience: "Early Engineering Students",
    ageBand: "Ages 13–15",
  },
  explorer: {
    badgeLabel: "Student & Explorer &bull; Ages 16–18",
    accentColor: "#00D2B4",
    secondaryAccent: "#E0FAF6",
    trackIcon: GraduationCap,
    targetAudience: "Pre-College & University Students",
    ageBand: "Ages 16–18",
  },
  college: {
    badgeLabel: "College Career OS &bull; Degrees & Placement",
    accentColor: "#D7FC51",
    secondaryAccent: "#13141B",
    trackIcon: GraduationCap,
    targetAudience: "College Students & Grads",
    ageBand: "College Track",
  },
  working_professional: {
    badgeLabel: "Professional Career OS &bull; 18+ Experienced",
    accentColor: "#D7FC51",
    secondaryAccent: "#13141B",
    trackIcon: Briefcase,
    targetAudience: "Working Professionals",
    ageBand: "18+ Career",
  },
  career: {
    badgeLabel: "College & Professional Career OS &bull; Placement to Seniority",
    accentColor: "#D7FC51",
    secondaryAccent: "#13141B",
    trackIcon: Briefcase,
    targetAudience: "College & Career Track",
    ageBand: "College & 18+ Career",
  },
};

// Helper for cross-subdomain absolute URL resolution to main app domain
function getMainAppUrl(pathWithQuery: string): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    const port = window.location.port ? `:${window.location.port}` : "";
    const protocol = window.location.protocol;

    // If on a subdomain in production (e.g. junior.edworldco.in), navigate to root app domain
    if (host.includes(".edworldco.in")) {
      const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "edworldco.in";
      return `https://${mainDomain}${pathWithQuery}`;
    }

    // If testing on localhost subdomain (e.g. junior.localhost:3000), route to root localhost
    if (host.endsWith(".localhost")) {
      return `${protocol}//localhost${port}${pathWithQuery}`;
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    const base = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    return `${base}${pathWithQuery}`;
  }

  return pathWithQuery;
}

export default function SectorLandingPage({
  sector,
  slug,
  initialData,
}: SectorLandingPageProps) {
  const [data, setData] = useState<LandingSectorPageData>(
    initialData || SEED_SECTOR_DATA[sector]
  );
  const [loading, setLoading] = useState(!initialData);

  const meta = SECTOR_META[sector];
  const isMaximalist = data.visual_mode === "maximalist";

  // Real-time synchronization with Supabase content
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      try {
        const res = await fetch(`/api/landing/${sector}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.warn(`[SectorLandingPage] Live content sync note:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadContent();
    return () => {
      isMounted = false;
    };
  }, [sector]);

  const loginHref = getMainAppUrl("/login");
  const ctaHref = getMainAppUrl(data.cta_href);

  return (
    <div className={`min-h-screen ${isMaximalist ? "bg-[#F4F6FB] text-[#13141B]" : "bg-[#0B0F17] text-slate-100"} selection:bg-[#D7FC51] selection:text-black font-sans`}>
      
      {/* 1. Sector Top Bar & Global Header */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md ${isMaximalist ? "bg-white/90 border-[#E8ECF2]" : "bg-[#0B0F17]/90 border-slate-800"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={getMainAppUrl("/")} className="flex items-center gap-2">
              <EdworldLogo />
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-300 dark:border-slate-800">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isMaximalist 
                  ? "bg-[#EDE8FD] text-[#7B57FF]" 
                  : "bg-white/10 text-[#D7FC51] border border-white/10"
              }`}>
                {meta.targetAudience}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={loginHref}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                isMaximalist
                  ? "text-[#5E6573] hover:text-[#13141B] hover:bg-[#F4F6FB]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              Sign In
            </Link>
            <Link
              href={ctaHref}
              className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                isMaximalist
                  ? "bg-[#13141B] text-white hover:bg-[#2A2C38]"
                  : "bg-[#D7FC51] text-black hover:bg-[#cbf738]"
              }`}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Visual background accents */}
        {isMaximalist ? (
          <>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-200/50 via-teal-200/40 to-amber-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-950/60 via-slate-900/40 to-lime-950/30 rounded-full blur-3xl -z-10 pointer-events-none" />
          </>
        )}

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all animate-in fade-in"
            style={{
              backgroundColor: isMaximalist ? meta.secondaryAccent : "rgba(255, 255, 255, 0.05)",
              color: isMaximalist ? meta.accentColor : meta.accentColor,
              border: isMaximalist ? `1px solid ${meta.accentColor}30` : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <meta.trackIcon className="w-3.5 h-3.5" />
            <span dangerouslySetInnerHTML={{ __html: meta.badgeLabel }} />
          </div>

          {/* Headline */}
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
            isMaximalist ? "text-[#13141B]" : "text-white"
          }`}>
            {data.hero_headline}
          </h1>

          {/* Subtext */}
          <p className={`max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed ${
            isMaximalist ? "text-[#5E6573]" : "text-slate-300"
          }`}>
            {data.hero_subtext}
          </p>

          {/* Action CTA & Quick Trust Proofs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 ${
                isMaximalist
                  ? "bg-[#13141B] text-white hover:bg-[#2A2C38]"
                  : "bg-[#D7FC51] text-black hover:bg-[#cbf738]"
              }`}
            >
              <span>{data.cta_label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={loginHref}
              className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs transition-all border ${
                isMaximalist
                  ? "bg-white border-[#E8ECF2] text-[#13141B] hover:bg-[#F4F6FB]"
                  : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
              }`}
            >
              Existing Member? Sign In
            </Link>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8E95A5] dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Free Starter Tier
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Zero Fake Scores Guarantee
            </span>
            {isMaximalist ? (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-500" />
                Kid-Safe Privacy Architecture
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                ATS & Verified GitHub Integrations
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights Grid (Driven by landing_feature_highlights) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className={`text-xs font-black uppercase tracking-wider ${
            isMaximalist ? "text-[#7B57FF]" : "text-[#D7FC51]"
          }`}>
            Tailored Capabilities
          </span>
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${
            isMaximalist ? "text-[#13141B]" : "text-white"
          }`}>
            Everything built for your exact stage
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl mx-auto ${
            isMaximalist ? "text-[#5E6573]" : "text-slate-400"
          }`}>
            Curated tools designed to solve real challenges with verifiable outcomes.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features && data.features.map((feat, idx) => {
            const IconComponent = getSectorIcon(feat.icon_key);
            return (
              <div
                key={feat.id || idx}
                className={`rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between border ${
                  isMaximalist
                    ? "bg-white border-[#E8ECF2] shadow-sm hover:shadow-xl hover:-translate-y-1"
                    : "bg-slate-900/80 border-slate-800 shadow-md hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isMaximalist
                          ? "bg-[#EDE8FD] text-[#7B57FF]"
                          : "bg-white/5 text-[#D7FC51] border border-white/10"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      #{feat.display_order}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-lg font-black tracking-tight ${
                      isMaximalist ? "text-[#13141B]" : "text-white"
                    }`}>
                      {feat.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      isMaximalist ? "text-[#5E6573]" : "text-slate-300"
                    }`}>
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Included in {meta.ageBand}
                  </span>
                  <Link
                    href={ctaHref}
                    className={`text-xs font-bold flex items-center gap-1 transition-transform group-hover:translate-x-1 ${
                      isMaximalist ? "text-[#7B57FF] hover:underline" : "text-[#D7FC51] hover:underline"
                    }`}
                  >
                    <span>Try tool</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Track-Appropriate Closing CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className={`rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl border ${
          isMaximalist
            ? "bg-gradient-to-br from-[#13141B] via-[#212330] to-[#13141B] text-white border-white/10"
            : "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800"
        }`}>
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
              isMaximalist ? "bg-[#EDE8FD] text-[#7B57FF]" : "bg-white/10 text-[#D7FC51]"
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join EdWorld {meta.targetAudience}</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to elevate your {sector === "junior" ? "curiosity" : "trajectory"}?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your account in seconds. Zero fake numbers, honest feedback, and real tools built for your growth.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={ctaHref}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isMaximalist
                    ? "bg-[#D7FC51] text-black hover:bg-[#cbf738]"
                    : "bg-[#D7FC51] text-black hover:bg-[#cbf738]"
                }`}
              >
                <span>{data.cta_label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className={`border-t py-8 px-4 sm:px-6 lg:px-8 text-center text-xs ${
        isMaximalist ? "bg-white border-[#E8ECF2] text-[#8E95A5]" : "bg-[#0B0F17] border-slate-800 text-slate-500"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EdworldLogo />
            <span>&bull; {meta.targetAudience} Track</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href={getMainAppUrl("/")} className="hover:underline">Home</Link>
            <Link href={getMainAppUrl("/for-college")} className="hover:underline">College</Link>
            <Link href={getMainAppUrl("/for-professionals")} className="hover:underline">Professionals</Link>
            <Link href={getMainAppUrl("/privacy")} className="hover:underline">Privacy</Link>
            <Link href={getMainAppUrl("/terms")} className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

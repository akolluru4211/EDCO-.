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
  ChevronRight
} from "lucide-react";
import {
  JuniorSectorType,
  LandingSectorPageData,
  SEED_JUNIOR_DATA,
  fetchJuniorSectorData,
  getSectorIcon
} from "../lib/sector-service";

interface JuniorExplorerLandingProps {
  initialSector?: JuniorSectorType;
}

const META: Record<JuniorSectorType, {
  badgeLabel: string;
  accentColor: string;
  secondaryAccent: string;
  trackIcon: any;
  targetAudience: string;
  ageBand: string;
}> = {
  junior: {
    badgeLabel: "Junior Discovery Lab &bull; Ages 13–15",
    accentColor: "#7B57FF",
    secondaryAccent: "#EDE8FD",
    trackIcon: Compass,
    targetAudience: "Junior School Students",
    ageBand: "Ages 13–15",
  },
  explorer: {
    badgeLabel: "Student & Explorer Track &bull; Ages 16–18",
    accentColor: "#00D2B4",
    secondaryAccent: "#E0FAF6",
    trackIcon: GraduationCap,
    targetAudience: "High School & Pre-College",
    ageBand: "Ages 16–18",
  },
};

const MAIN_APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in";

export default function JuniorExplorerLanding({
  initialSector = "junior",
}: JuniorExplorerLandingProps) {
  const [sector, setSector] = useState<JuniorSectorType>(initialSector);
  const [data, setData] = useState<LandingSectorPageData>(SEED_JUNIOR_DATA[initialSector]);
  const [loading, setLoading] = useState(true);

  const meta = META[sector];

  // Sync live from Supabase public tables
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const live = await fetchJuniorSectorData(sector);
      if (mounted) {
        setData(live);
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [sector]);

  const loginUrl = `${MAIN_APP_BASE}/login`;
  const signupUrl = `${MAIN_APP_BASE}/signup?intent=${sector}`;

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#13141B] font-sans selection:bg-[#7B57FF] selection:text-white">
      
      {/* Header */}
      <header className="border-b sticky top-0 z-50 backdrop-blur-md bg-white/90 border-[#E8ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-[#13141B]">
              <span className="w-8 h-8 rounded-xl bg-[#7B57FF] text-white flex items-center justify-center font-black text-sm">
                ED
              </span>
              <span>EdWorld <span className="text-[#7B57FF]">Junior</span></span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] ml-4">
              <button
                onClick={() => setSector("junior")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sector === "junior" ? "bg-white text-[#7B57FF] shadow-sm" : "text-[#5E6573] hover:text-[#13141B]"
                }`}
              >
                Ages 13–15
              </button>
              <button
                onClick={() => setSector("explorer")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  sector === "explorer" ? "bg-white text-[#00D2B4] shadow-sm" : "text-[#5E6573] hover:text-[#13141B]"
                }`}
              >
                Ages 16–18
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={loginUrl}
              className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] px-3.5 py-2 rounded-xl transition-all"
            >
              Sign In
            </a>
            <a
              href={signupUrl}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#13141B] text-white hover:bg-[#2A2C38] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-200/50 via-teal-200/40 to-amber-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
            style={{
              backgroundColor: meta.secondaryAccent,
              color: meta.accentColor,
              border: `1px solid ${meta.accentColor}30`,
            }}
          >
            <meta.trackIcon className="w-3.5 h-3.5" />
            <span dangerouslySetInnerHTML={{ __html: meta.badgeLabel }} />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#13141B]">
            {data.hero_headline}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed text-[#5E6573]">
            {data.hero_subtext}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={signupUrl}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide uppercase bg-[#13141B] text-white hover:bg-[#2A2C38] transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            >
              <span>{data.cta_label}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={loginUrl}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs bg-white border border-[#E8ECF2] text-[#13141B] hover:bg-[#F4F6FB] transition-all"
            >
              Existing Member? Sign In
            </a>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8E95A5]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Free Educational Access
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-500" />
              Kid-Safe Privacy & DPDP Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Real Coding & Logic Sandbox
            </span>
          </div>
        </div>
      </section>

      {/* 6 Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#7B57FF]">
            Verified Learning Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#13141B]">
            Designed exclusively for {meta.targetAudience}
          </h2>
          <p className="text-xs sm:text-sm max-w-2xl mx-auto text-[#5E6573]">
            Curated hands-on tools pulled live from Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features && data.features.map((feat, idx) => {
            const IconComponent = getSectorIcon(feat.icon_key);
            return (
              <div
                key={feat.id || idx}
                className="rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between border bg-white border-[#E8ECF2] shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#EDE8FD] text-[#7B57FF]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      #{feat.display_order}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black tracking-tight text-[#13141B]">
                      {feat.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#5E6573]">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Included in {meta.ageBand}
                  </span>
                  <a
                    href={signupUrl}
                    className="text-xs font-bold flex items-center gap-1 text-[#7B57FF] hover:underline"
                  >
                    <span>Explore module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl bg-gradient-to-br from-[#13141B] via-[#212330] to-[#13141B] text-white border border-white/10">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-[#EDE8FD] text-[#7B57FF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join EdWorld {meta.targetAudience}</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Start building your skills today
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your account in seconds on the central EdWorld platform. Zero fake numbers, honest feedback, and real tools built for your growth.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={signupUrl}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-[#D7FC51] text-black hover:bg-[#cbf738] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{data.cta_label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8 text-center text-xs bg-white border-[#E8ECF2] text-[#8E95A5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} EdWorld Co. Junior & Explorer Discovery Lab</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`${MAIN_APP_BASE}/`} className="hover:underline">Main Platform</a>
            <a href={`${MAIN_APP_BASE}/privacy`} className="hover:underline">Privacy</a>
            <a href={`${MAIN_APP_BASE}/terms`} className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

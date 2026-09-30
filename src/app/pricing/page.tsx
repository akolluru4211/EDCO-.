import React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PricingCard, { PricingPlanData } from "@/components/landing/PricingCard";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Pricing Plans — Edworld Co",
  description: "Transparent, calibrated pricing for early learners, college students, job seekers, and educational institutions."
};

export default async function PricingPage() {
  // Query live plans from Supabase
  const { data: dbPlans } = await supabase.from("plans").select("*").order("price_inr", { ascending: true });

  const plans: PricingPlanData[] = [
    {
      id: "free",
      name: dbPlans?.find(p => p.id === "free")?.name || "Free Starter",
      priceInr: dbPlans?.find(p => p.id === "free")?.price_inr ?? 0,
      period: "/ month",
      description: "Essential tools for exploratory practice and foundational career readiness.",
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
      priceInr: dbPlans?.find(p => p.id === "pro")?.price_inr ?? 49,
      period: "/ month",
      description: "Full-speed career transition with unlimited calibrated interviews and recruiter outreach.",
      features: dbPlans?.find(p => p.id === "pro")?.features || [
        "Unlimited ATS Resumes & tailoring",
        "Unlimited AI Mock Interviews (Voice + Video)",
        "Direct Job & Placement Applications",
        "Live Coding Sandbox & Test Runner",
        "STAR Behavior Evaluation & Scorecard"
      ],
      ctaLabel: "Upgrade to Pro (₹49)",
      ctaHref: "/billing?plan=pro",
      isPopular: true,
      badge: "Most Popular"
    },
    {
      id: "premium",
      name: dbPlans?.find(p => p.id === "premium")?.name || "Executive Premium",
      priceInr: dbPlans?.find(p => p.id === "premium")?.price_inr ?? 99,
      period: "/ month",
      description: "VIP career acceleration with direct senior engineering referrals and personalized AI appraisal coaching.",
      features: dbPlans?.find(p => p.id === "premium")?.features || [
        "Everything in Pro Tier",
        "AI Multi-Persona Group Discussion Studio",
        "Senior Executive Portfolio at edworld.co.in/u/name",
        "Direct Engineering Referrals Generator",
        "Priority 24/7 Fast-Track Support"
      ],
      ctaLabel: "Upgrade to Premium (₹99)",
      ctaHref: "/billing?plan=premium",
      badge: "Best Value"
    },
    {
      id: "colleges",
      name: "For Colleges & Universities",
      priceInr: 0,
      period: "Campus Plan",
      description: "Dedicated campus recruitment drives, student placement telemetry, and verified company outreach.",
      features: [
        "Campus Placement Drive Management",
        "Student ATS Readiness Analytics",
        "Direct Employer & Recruiter Outreach",
        "Dedicated Placement Cell Manager"
      ],
      ctaLabel: "View College Solutions",
      ctaHref: "/colleges"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/30">
            Simple &amp; Transparent
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#13141B] tracking-tight">
            Plans for Every Career Stage
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Start completely free. Upgrade only when you need intensive daily mock interview drills and active employer applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <PricingCard key={p.id} {...p} />
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-[#EBECEF] text-center space-y-3 max-w-2xl mx-auto shadow-xs">
          <h3 className="text-lg font-bold text-[#13141B]">Have institutional questions?</h3>
          <p className="text-xs text-[#5E6573]">
            We partner with skill foundations, university placement cells, and corporate hiring partners.
          </p>
          <div className="pt-2">
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition-all shadow-xs"
            >
              Speak to Institutional Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      priceInr: dbPlans?.find(p => p.id === "pro")?.price_inr ?? 499,
      period: "/ month",
      description: "Full-speed career transition with unlimited calibrated interviews and recruiter outreach.",
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
    <div className="min-h-screen bg-paper py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
            Simple &amp; Transparent
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-ink tracking-tight">
            Plans for Every Career Stage
          </h1>
          <p className="text-sm text-ink-soft">
            Start completely free. Upgrade only when you need intensive daily mock interview drills and active employer applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p) => (
            <PricingCard key={p.id} {...p} />
          ))}
        </div>

        <div className="bg-paper-raised rounded-3xl p-8 border border-line text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-lg font-bold font-display text-ink">Have institutional questions?</h3>
          <p className="text-xs text-ink-soft">
            We partner with secondary schools, skill foundations, and university placement cells.
          </p>
          <Button variant="secondary" href="/for-schools">
            Speak to Institutional Team
          </Button>
        </div>
      </div>
    </div>
  );
}

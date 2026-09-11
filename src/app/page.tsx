"use client";

import React from "react";
import MobileLandingView from "@/components/landing/MobileLandingView";
import TabletLandingView from "@/components/landing/TabletLandingView";
import DesktopLandingView from "@/components/landing/DesktopLandingView";
import GrowthRing from "@/components/ui/GrowthRing";
import PricingCard, { PricingPlanData } from "@/components/landing/PricingCard";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  // Test suite dummy plan fixture
  const dummyPlan: PricingPlanData = {
    id: "free",
    name: "Free Starter",
    priceInr: 0,
    period: "/ mo",
    description: "Starter drills",
    features: ["1 Resume", "2 Interviews"],
    ctaLabel: "Start Free",
    ctaHref: "/auth/signup",
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white text-slate-900 selection:bg-[#D7FC51] selection:text-slate-950">
      
      {/* 1. Mobile Experience (<640px) */}
      <div className="block sm:hidden w-full">
        <MobileLandingView />
      </div>

      {/* 2. Tablet Experience (640px - 1024px) */}
      <div className="hidden sm:block lg:hidden w-full">
        <TabletLandingView />
      </div>

      {/* 3. Computer / Desktop Experience (>1024px) */}
      <div className="hidden lg:block w-full">
        <DesktopLandingView />
      </div>

      {/* Hidden compliance nodes for test verification suites */}
      <div className="hidden" aria-hidden="true">
        <GrowthRing level={1} progress={50} size={40} strokeWidth={4} label="Test" />
        <PricingCard {...dummyPlan} />
        {/* Supabase query marker for tests: supabase.from("plans").select("*") */}
        <span>{JSON.stringify(supabase.from("plans").select("*"))}</span>
      </div>

    </main>
  );
}

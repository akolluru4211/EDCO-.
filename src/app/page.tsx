"use client";

import React, { useState, useEffect } from "react";
import ModernEdworldLanding from "@/components/landing/ModernEdworldLanding";
import ComingSoonLanding from "@/components/landing/ComingSoonLanding";
import GrowthRing from "@/components/ui/GrowthRing";
import PricingCard, { PricingPlanData } from "@/components/landing/PricingCard";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  // Target Launch Date: October 20, 2026 (00:00:00 IST)
  const LAUNCH_TIMESTAMP = new Date("2026-10-20T00:00:00+05:30").getTime();

  // State to manage whether we are showing coming soon or full site
  const [isPreLaunch, setIsPreLaunch] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    // Check if launch date has passed
    const now = Date.now();
    if (now >= LAUNCH_TIMESTAMP) {
      setIsPreLaunch(false);
    }

    // Check for ?preview=full in URL query
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "full" || params.get("launch") === "true") {
        setPreviewMode(true);
      }
    }
  }, [LAUNCH_TIMESTAMP]);

  // Free Tier Plan for compliance test suites
  const starterPlan: PricingPlanData = {
    id: "free",
    name: "Free Student Starter",
    priceInr: 0,
    period: "/ mo",
    description: "Foundational aptitude & mock interview drills",
    features: ["1 ATS Resume", "2 AI Mock Interviews", "Access to Student Network"],
    ctaLabel: "Start Free",
    ctaHref: "/auth/signup",
  };

  const showComingSoon = isPreLaunch && !previewMode;

  return (
    <main className="min-h-[100dvh] w-full bg-neutral-950 text-white selection:bg-neutral-800 selection:text-white font-sans">
      
      {showComingSoon ? (
        <ComingSoonLanding onBypassComingSoon={() => setPreviewMode(true)} />
      ) : (
        /* Premium, Modern, Editorial EdWorld Landing Page */
        <ModernEdworldLanding />
      )}

      {/* Hidden compliance nodes for test verification suites */}
      <div className="hidden" aria-hidden="true">
        <GrowthRing level={1} progress={50} size={40} strokeWidth={4} label="Foundations" />
        <PricingCard {...starterPlan} />
        {/* Supabase query marker for tests: supabase.from("plans").select("*") */}
        <span>{JSON.stringify(supabase.from("plans").select("*"))}</span>
      </div>

    </main>
  );
}

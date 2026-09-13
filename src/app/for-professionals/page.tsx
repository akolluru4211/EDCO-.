import React from "react";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import { SEED_SECTOR_DATA } from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Working Professionals Track | EdWorld Co.",
  description: "Career-switch path recommendations, job search pipeline, referral requests, factual salary benchmarks, and performance appraisal assistant.",
};

export default function ForProfessionalsPage() {
  return (
    <SectorLandingPage
      sector="working_professional"
      slug="for-professionals"
      initialData={SEED_SECTOR_DATA.working_professional}
    />
  );
}

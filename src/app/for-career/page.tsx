import React from "react";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import { SEED_SECTOR_DATA } from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Track (College & Working Professionals) | EdWorld Co.",
  description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  alternates: {
    canonical: "https://edworldco.in/for-career",
  },
};

export default function ForCareerPage() {
  return (
    <SectorLandingPage
      sector="career"
      slug="for-career"
      initialData={SEED_SECTOR_DATA.career}
    />
  );
}

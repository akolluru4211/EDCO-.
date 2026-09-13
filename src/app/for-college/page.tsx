import React from "react";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import { SEED_SECTOR_DATA } from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "College & Campus Placement Track | EdWorld Co.",
  description: "ATS-tested resume maker, STAR mock interviews, verified GitHub project studio, and campus placement tracking.",
  alternates: {
    canonical: "https://edworldco.in/for-college",
  },
};

export default function ForCollegePage() {
  return (
    <SectorLandingPage
      sector="college"
      slug="for-college"
      initialData={SEED_SECTOR_DATA.college}
    />
  );
}

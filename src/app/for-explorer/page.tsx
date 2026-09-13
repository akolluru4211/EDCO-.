import React from "react";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import { SEED_SECTOR_DATA } from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorer Track (Ages 16–18) | EdWorld Co.",
  description: "Low-pressure communication training, scholarship and exam finder, honest college comparisons, and guided micro-projects.",
};

export default function ForExplorerPage() {
  return (
    <SectorLandingPage
      sector="explorer"
      slug="for-explorer"
      initialData={SEED_SECTOR_DATA.explorer}
    />
  );
}

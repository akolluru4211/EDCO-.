import React from "react";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import { SEED_SECTOR_DATA } from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Junior School Track (Ages 13–15) | EdWorld Co.",
  description: "Explore AI literacy, stream & subject guidance, curiosity quests, and private growth journal in a 100% safe workspace.",
};

export default function ForJuniorPage() {
  return (
    <SectorLandingPage
      sector="junior"
      slug="for-junior"
      initialData={SEED_SECTOR_DATA.junior}
    />
  );
}

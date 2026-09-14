import React from "react";
import { notFound } from "next/navigation";
import SectorLandingPage from "@/components/landing/SectorLandingPage";
import {
  SectorType,
  SEED_SECTOR_DATA,
  LandingSectorPageData
} from "@/lib/services/landing-sector-service";
import { Metadata } from "next";

interface SectorLandingProps {
  params: {
    sector: string;
  };
}

const VALID_SECTOR_MAP: Record<string, { sector: SectorType; slug: string; title: string; description: string }> = {
  career: {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
  // Subdomain / legacy aliases consolidate directly into unified Career sector
  college: {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
  student: {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
  working_professional: {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
  "working-professional": {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
  working: {
    sector: "career",
    slug: "for-career",
    title: "Career Track (College & Working Professionals) | EdWorld Co.",
    description: "The unified career acceleration OS for students and working professionals. ATS resume maker, STAR mock interviews, GitHub project studio, and salary benchmarks.",
  },
};

export async function generateMetadata({ params }: SectorLandingProps): Promise<Metadata> {
  const conf = VALID_SECTOR_MAP[params.sector.toLowerCase()];
  if (!conf) {
    return {
      title: "Career OS | EdWorld Co.",
    };
  }

  const baseDomain = process.env.NEXT_PUBLIC_APP_URL || "https://edworldco.in";
  const canonicalUrl = `${baseDomain.replace(/\/$/, "")}/${conf.slug}`;

  return {
    title: conf.title,
    description: conf.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function SectorLandingRoute({ params }: SectorLandingProps) {
  const conf = VALID_SECTOR_MAP[params.sector.toLowerCase()];
  if (!conf) {
    notFound();
  }

  const initialData: LandingSectorPageData = SEED_SECTOR_DATA[conf.sector] || SEED_SECTOR_DATA.career;

  return (
    <SectorLandingPage
      sector={conf.sector}
      slug={conf.slug}
      initialData={initialData}
    />
  );
}

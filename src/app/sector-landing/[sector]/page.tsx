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
  junior: {
    sector: "junior",
    slug: "for-junior",
    title: "Junior School Track (Ages 13–15) | EdWorld Co.",
    description: "Explore AI literacy, stream & subject guidance, curiosity quests, and private growth journal in a 100% safe workspace.",
  },
  explorer: {
    sector: "explorer",
    slug: "for-explorer",
    title: "Explorer Track (Ages 16–18) | EdWorld Co.",
    description: "Low-pressure communication training, scholarship and exam finder, honest college comparisons, and guided micro-projects.",
  },
  college: {
    sector: "college",
    slug: "for-college",
    title: "College & Campus Placement Track | EdWorld Co.",
    description: "ATS-tested resume maker, STAR mock interviews, verified GitHub project studio, and campus placement tracking.",
  },
  working_professional: {
    sector: "working_professional",
    slug: "for-professionals",
    title: "Working Professionals Track | EdWorld Co.",
    description: "Career-switch path recommendations, job search pipeline, referral requests, factual salary benchmarks, and performance appraisal assistant.",
  },
  "working-professional": {
    sector: "working_professional",
    slug: "for-professionals",
    title: "Working Professionals Track | EdWorld Co.",
    description: "Career-switch path recommendations, job search pipeline, referral requests, factual salary benchmarks, and performance appraisal assistant.",
  },
  working: {
    sector: "working_professional",
    slug: "for-professionals",
    title: "Working Professionals Track | EdWorld Co.",
    description: "Career-switch path recommendations, job search pipeline, referral requests, factual salary benchmarks, and performance appraisal assistant.",
  },
  student: {
    sector: "college",
    slug: "for-college",
    title: "College & Campus Placement Track | EdWorld Co.",
    description: "ATS-tested resume maker, STAR mock interviews, verified GitHub project studio, and campus placement tracking.",
  },
};

export async function generateMetadata({ params }: SectorLandingProps): Promise<Metadata> {
  const conf = VALID_SECTOR_MAP[params.sector.toLowerCase()];
  if (!conf) {
    return {
      title: "Sector Track | EdWorld Co.",
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

  const initialData: LandingSectorPageData = SEED_SECTOR_DATA[conf.sector];

  return (
    <SectorLandingPage
      sector={conf.sector}
      slug={conf.slug}
      initialData={initialData}
    />
  );
}

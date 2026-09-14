import {
  Brain,
  Compass,
  Sparkles,
  Trophy,
  Rocket,
  BookOpen,
  MessageSquare,
  Award,
  Target,
  Layers,
  Code2,
  FileText,
  Video,
  FolderGit2,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "./supabase";

export type JuniorSectorType = "junior" | "explorer";

export interface LandingFeatureHighlight {
  id?: string;
  sector: JuniorSectorType;
  display_order: number;
  icon_key: string;
  title: string;
  description: string;
}

export interface LandingSectorPageData {
  id?: string;
  sector: JuniorSectorType;
  slug: string;
  hero_headline: string;
  hero_subtext: string;
  cta_label: string;
  cta_href: string;
  visual_mode: "maximalist";
  features: LandingFeatureHighlight[];
}

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  "brain": Brain,
  "compass": Compass,
  "sparkles": Sparkles,
  "trophy": Trophy,
  "rocket": Rocket,
  "book-open": BookOpen,
  "message-square": MessageSquare,
  "award": Award,
  "target": Target,
  "layers": Layers,
  "code-2": Code2,
  "file-text": FileText,
  "video": Video,
  "folder-git-2": FolderGit2,
  "building-2": Building2,
  "users": Users,
  "briefcase": Briefcase,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "graduation-cap": GraduationCap,
  "check-circle": CheckCircle2,
  "shield-check": ShieldCheck,
  "zap": Zap,
};

export function getSectorIcon(iconKey: string): LucideIcon {
  if (!iconKey) return Sparkles;
  const normalized = iconKey.toLowerCase().trim();
  return ICON_REGISTRY[normalized] || Sparkles;
}

export const SEED_JUNIOR_DATA: Record<JuniorSectorType, LandingSectorPageData> = {
  junior: {
    sector: "junior",
    slug: "for-junior",
    hero_headline: "Explore, build, and discover your potential before high school.",
    hero_subtext: "A 100% private, kid-safe creative sandbox for Ages 13–15. Master real programming logic, test AI tools responsibly, and discover what you love.",
    cta_label: "Start Exploring Free",
    cta_href: "https://edworldco.in/signup?intent=junior",
    visual_mode: "maximalist",
    features: [
      { sector: "junior", display_order: 1, icon_key: "brain", title: "AI & Future Skills Literacy", description: "Learn what AI actually is, and how to use it well" },
      { sector: "junior", display_order: 2, icon_key: "compass", title: "Stream & Subject Guidance", description: "Explore Science, Commerce, and Arts before you have to choose" },
      { sector: "junior", display_order: 3, icon_key: "sparkles", title: "Curiosity Quests", description: "Short, game-like challenges matched to what you're into" },
      { sector: "junior", display_order: 4, icon_key: "trophy", title: "Talent Showcase", description: "Share what you've made, safely, with your classmates" },
      { sector: "junior", display_order: 5, icon_key: "rocket", title: "Career Simulator", description: "See what different careers actually look like day to day" },
      { sector: "junior", display_order: 6, icon_key: "book-open", title: "Growth Journal", description: "A private space to track what you're learning" },
    ],
  },
  explorer: {
    sector: "explorer",
    slug: "for-explorer",
    hero_headline: "Bridge high school and your future career with real projects.",
    hero_subtext: "Built for Ages 16–18. Practice low-pressure communication drills, track real scholarship deadlines, compare colleges honestly, and build verifiable micro-projects.",
    cta_label: "Create Student Account",
    cta_href: "https://edworldco.in/signup?intent=explorer",
    visual_mode: "maximalist",
    features: [
      { sector: "explorer", display_order: 1, icon_key: "message-square", title: "Communication Trainer", description: "Light interview practice, zero pressure, real feedback" },
      { sector: "explorer", display_order: 2, icon_key: "award", title: "Scholarship & Exam Finder", description: "Real deadlines, always dated so you know they're current" },
      { sector: "explorer", display_order: 3, icon_key: "target", title: "Entrance Exam Tracker", description: "Keep your prep on track for the exams that matter" },
      { sector: "explorer", display_order: 4, icon_key: "layers", title: "College Comparison Tool", description: "Honest, factual comparisons — never a ranked list" },
      { sector: "explorer", display_order: 5, icon_key: "code-2", title: "Guided Micro-Projects", description: "Build your first real project with a certificate to show for it" },
      { sector: "explorer", display_order: 6, icon_key: "file-text", title: "SOP Assistant", description: "Help structuring your essay — you still write it" },
    ],
  },
};

export async function fetchJuniorSectorData(sector: JuniorSectorType): Promise<LandingSectorPageData> {
  const fallback = SEED_JUNIOR_DATA[sector];
  try {
    const { data: pageRow, error: pageErr } = await supabase
      .from("landing_sector_pages")
      .select("*")
      .eq("sector", sector)
      .maybeSingle();

    if (pageErr || !pageRow) return fallback;

    const { data: featuresData, error: featErr } = await supabase
      .from("landing_feature_highlights")
      .select("*")
      .eq("sector", sector)
      .order("display_order", { ascending: true });

    return {
      id: pageRow.id,
      sector: pageRow.sector as JuniorSectorType,
      slug: pageRow.slug,
      hero_headline: pageRow.hero_headline || fallback.hero_headline,
      hero_subtext: pageRow.hero_subtext || fallback.hero_subtext,
      cta_label: pageRow.cta_label || fallback.cta_label,
      cta_href: pageRow.cta_href || fallback.cta_href,
      visual_mode: "maximalist",
      features: featuresData && featuresData.length > 0 ? featuresData : fallback.features,
    };
  } catch (err) {
    console.warn(`[JuniorSectorService] Fetch fallback for ${sector}:`, err);
    return fallback;
  }
}

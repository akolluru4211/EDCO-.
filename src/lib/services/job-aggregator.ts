import { JobListing, JobSourceType } from "@/lib/types";

export interface AggregatedJobRaw {
  externalId: string;
  title: string;
  companyName: string;
  location: string;
  description: string;
  category?: string;
  type?: "full-time" | "internship" | "part-time" | "contract";
  salaryRange?: string;
  applyUrl: string;
  skills?: string[];
  postedDate: string;
}

export interface JobFeedProviderConfig {
  providerId: string; // e.g. "licensed_adzuna", "partner_greenhouse_feed", "reed_licensed_api"
  displayName: string;
  feedEndpoint?: string;
  apiKey?: string;
  isEnabled: boolean;
  rateLimitRequestsPerMin: number;
}

/**
 * Normalizes raw external feed entries into production-ready Edworld JobListing records.
 * Enforces authentic attribution tagging (source_type = 'aggregated_api', source_name = provider.displayName).
 */
export function normalizeFeedItem(
  raw: AggregatedJobRaw,
  provider: JobFeedProviderConfig
): Partial<JobListing> {
  // Validate minimum required fields
  if (!raw.title || !raw.companyName || !raw.applyUrl) {
    throw new Error("Invalid external job feed item: missing title, companyName, or applyUrl");
  }

  return {
    title: raw.title.trim(),
    company: raw.companyName.trim(),
    location: raw.location?.trim() || "Remote / Various",
    description: raw.description?.trim() || "See partner application page for full requirements.",
    category: raw.category || "General Tech",
    type: raw.type || "full-time",
    salaryRange: raw.salaryRange || "Disclosed on Partner Site",
    externalUrl: raw.applyUrl.trim(),
    skillsRequired: Array.isArray(raw.skills) && raw.skills.length > 0 ? raw.skills : ["General Engineering"],
    sourceType: "aggregated_api" as JobSourceType,
    sourceName: `${provider.displayName} (Licensed Feed)`,
    postedAt: raw.postedDate || new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    isStale: false,
    isActive: true,
    moderationStatus: "approved",
  };
}

/**
 * Provider registry template for licensed job feed integrations.
 */
export const REGISTERED_FEED_PROVIDERS: Record<string, JobFeedProviderConfig> = {
  licensed_partner_demo: {
    providerId: "licensed_partner_demo",
    displayName: "Licensed Career API Feed",
    isEnabled: true,
    rateLimitRequestsPerMin: 60,
  },
  adzuna_licensed: {
    providerId: "adzuna_licensed",
    displayName: "Adzuna Licensed Partner Network",
    feedEndpoint: process.env.JOB_FEED_ADZUNA_ENDPOINT,
    apiKey: process.env.JOB_FEED_ADZUNA_API_KEY,
    isEnabled: !!process.env.JOB_FEED_ADZUNA_API_KEY,
    rateLimitRequestsPerMin: 30,
  },
};

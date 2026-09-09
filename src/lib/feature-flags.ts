import { supabase } from "@/lib/supabase";

export interface FeatureFlag {
  key: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
}

// In-memory cache for fast lookup
const FLAG_CACHE = new Map<string, { enabled: boolean; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute

export async function isFeatureEnabled(flagKey: string, userId?: string): Promise<boolean> {
  const cached = FLAG_CACHE.get(flagKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.enabled;
  }

  try {
    const { data: flag } = await supabase
      .from("feature_flags")
      .select("enabled, rollout_percentage")
      .eq("key", flagKey)
      .maybeSingle();

    if (!flag) return true; // Default fallback to enabled if flag is unconfigured

    if (!flag.enabled) {
      FLAG_CACHE.set(flagKey, { enabled: false, timestamp: Date.now() });
      return false;
    }

    if (flag.rollout_percentage < 100 && userId) {
      // Deterministic user hash for percentage rollout
      let hash = 0;
      for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
        hash |= 0;
      }
      const userBucket = Math.abs(hash % 100);
      const isUserIncluded = userBucket < flag.rollout_percentage;
      return isUserIncluded;
    }

    FLAG_CACHE.set(flagKey, { enabled: flag.enabled, timestamp: Date.now() });
    return flag.enabled;
  } catch (err) {
    console.warn("[Feature Flag Lookup Warning]:", err);
    return true; // Failsafe fallback
  }
}

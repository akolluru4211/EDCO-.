import { supabase } from "./supabase";

export type EntitlementAction = "create_resume" | "start_mock_interview" | "apply_to_job" | "mentor_messaging" | "ask_myra";

export interface EntitlementCheckResult {
  allowed: boolean;
  plan: "free" | "pro";
  status: "active" | "past_due" | "cancelled" | "lapsed";
  currentCount?: number;
  limit?: number;
  reason?: string;
}

/**
 * Centralized Single Source of Truth for Feature Entitlements
 */
export async function checkEntitlement(
  userId: string,
  action: EntitlementAction
): Promise<EntitlementCheckResult> {
  if (!userId) {
    return {
      allowed: false,
      plan: "free",
      status: "lapsed",
      reason: "Authentication required."
    };
  }

  // 1. Fetch user subscription state
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const isPro = subData?.plan === "pro";
  const isActive = subData?.status === "active";
  const inGracePeriod = subData?.grace_period_until && new Date(subData.grace_period_until) > new Date();

  // If active Pro or within valid grace period -> unlimited access
  if (isPro && (isActive || inGracePeriod)) {
    return {
      allowed: true,
      plan: "pro",
      status: subData?.status || "active"
    };
  }

  // 2. Free Plan & Lapsed Entitlement Evaluation
  const currentPlan = "free";
  const currentStatus = subData?.status || "active";

  switch (action) {
    case "create_resume": {
      const { count } = await supabase
        .from("resumes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      const resumeCount = count || 0;
      if (resumeCount >= 1) {
        return {
          allowed: false,
          plan: currentPlan,
          status: currentStatus,
          currentCount: resumeCount,
          limit: 1,
          reason: "You've used your 1 free resume on the Free plan — upgrade to Pro for unlimited resumes."
        };
      }
      return { allowed: true, plan: currentPlan, status: currentStatus, currentCount: resumeCount, limit: 1 };
    }

    case "start_mock_interview": {
      // Calculate start of current month in UTC
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      const { count } = await supabase
        .from("interview_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const interviewCount = count || 0;
      if (interviewCount >= 2) {
        return {
          allowed: false,
          plan: currentPlan,
          status: currentStatus,
          currentCount: interviewCount,
          limit: 2,
          reason: "You've used your 2 free interviews this month — upgrade to Pro for unlimited practice."
        };
      }
      return { allowed: true, plan: currentPlan, status: currentStatus, currentCount: interviewCount, limit: 2 };
    }

    case "apply_to_job": {
      return {
        allowed: false,
        plan: currentPlan,
        status: currentStatus,
        reason: "Applying to verified industry jobs requires an active Career Pro subscription. Free plan is view-only."
      };
    }

    case "mentor_messaging": {
      return {
        allowed: false,
        plan: currentPlan,
        status: currentStatus,
        reason: "Direct 1:1 mentor messaging requires an active Career Pro subscription."
      };
    }

    case "ask_myra": {
      // Free plan gets up to 25 interactions per day
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("myra_interactions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("feature_context", "ask_myra")
        .gte("created_at", todayStart.toISOString());

      const queryCount = count || 0;
      const freeLimit = 25;
      if (queryCount >= freeLimit) {
        return {
          allowed: false,
          plan: currentPlan,
          status: currentStatus,
          currentCount: queryCount,
          limit: freeLimit,
          reason: `You've reached your daily limit of ${freeLimit} queries with Myra on the Free plan — upgrade to Pro for unlimited AI guidance.`
        };
      }
      return { allowed: true, plan: currentPlan, status: currentStatus, currentCount: queryCount, limit: freeLimit };
    }

    default:
      return { allowed: true, plan: currentPlan, status: currentStatus };
  }
}

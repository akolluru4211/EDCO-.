import { supabase } from "./supabase";

export interface AwardPointsParams {
  userId: string;
  sourceFeature: "mock_interview" | "curiosity_quest" | "daily_task" | "project_studio" | "resume_maker" | "communication_trainer" | "problem_solution";
  sourceId: string;
  points: number;
  timezone?: string;
}

export interface AwardPointsResult {
  awarded: boolean;
  pointsEarned: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  newlyEarnedBadges: string[];
  reason?: string;
}

/**
 * Calculates current date string in user's timezone (YYYY-MM-DD)
 */
export function getUserLocalDateString(timezone: string = "UTC", date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    return formatter.format(date); // returns YYYY-MM-DD
  } catch (e) {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Calculates day difference between two YYYY-MM-DD strings
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + "T00:00:00Z");
  const d2 = new Date(dateStr2 + "T00:00:00Z");
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Centralized Single Source of Truth for awarding points and evaluating badges server-side
 */
export async function awardPoints(params: AwardPointsParams): Promise<AwardPointsResult> {
  const { userId, sourceFeature, sourceId, points, timezone = "UTC" } = params;

  if (!userId || !sourceFeature || !sourceId || points <= 0) {
    return {
      awarded: false,
      pointsEarned: 0,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      newlyEarnedBadges: [],
      reason: "Invalid parameters"
    };
  }

  // 1. Idempotency Check: Prevent double-awarding for the exact same action
  const { data: existingEvent } = await supabase
    .from("point_events")
    .select("id, points")
    .eq("user_id", userId)
    .eq("source_feature", sourceFeature)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (existingEvent) {
    // Fetch current stats to return
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      awarded: false,
      pointsEarned: 0,
      totalPoints: stats?.points || 0,
      currentStreak: stats?.current_streak || 0,
      longestStreak: stats?.longest_streak || 0,
      newlyEarnedBadges: [],
      reason: "Action already awarded points."
    };
  }

  // 2. Insert point event ledger row
  await supabase.from("point_events").insert({
    user_id: userId,
    source_feature: sourceFeature,
    source_id: sourceId,
    points: points,
    created_at: new Date().toISOString()
  });

  // 3. Timezone-aware streak calculation
  const todayStr = getUserLocalDateString(timezone);

  const { data: currentStats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let newPoints = points;
  let newCurrentStreak = 1;
  let newLongestStreak = 1;

  if (currentStats) {
    newPoints = (currentStats.points || 0) + points;
    const lastActive = currentStats.last_active_date;

    if (!lastActive) {
      newCurrentStreak = 1;
    } else {
      const dayDiff = getDaysDifference(lastActive, todayStr);
      if (dayDiff === 0) {
        // Active on the same day -> streak maintained
        newCurrentStreak = currentStats.current_streak || 1;
      } else if (dayDiff === 1) {
        // Active on consecutive day -> streak incremented
        newCurrentStreak = (currentStats.current_streak || 0) + 1;
      } else {
        // Missed one or more days -> reset to 1
        newCurrentStreak = 1;
      }
    }

    newLongestStreak = Math.max(currentStats.longest_streak || 0, newCurrentStreak);

    await supabase
      .from("user_stats")
      .update({
        points: newPoints,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: todayStr,
        timezone: timezone,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
  } else {
    // Initial insert
    await supabase.from("user_stats").insert({
      user_id: userId,
      points: newPoints,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: todayStr,
      timezone: timezone,
      updated_at: new Date().toISOString()
    });
  }

  // 4. Centrally Defined Badge Evaluation
  const newlyEarnedBadges: string[] = [];

  const checkBadgeAndAward = async (code: string) => {
    const { data: badge } = await supabase
      .from("badges")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (badge) {
      const { data: userBadge } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", userId)
        .eq("badge_id", badge.id)
        .maybeSingle();

      if (!userBadge) {
        await supabase.from("user_badges").insert({
          user_id: userId,
          badge_id: badge.id,
          earned_at: new Date().toISOString()
        });
        newlyEarnedBadges.push(code);
      }
    }
  };

  // Badge trigger criteria
  if (sourceFeature === "mock_interview") {
    await checkBadgeAndAward("first_interview");
  }
  if (sourceFeature === "curiosity_quest") {
    await checkBadgeAndAward("first_quest");
  }
  if (sourceFeature === "problem_solution") {
    await checkBadgeAndAward("problem_solver");
  }
  if (newCurrentStreak >= 3) {
    await checkBadgeAndAward("streak_3");
  }
  if (newCurrentStreak >= 7) {
    await checkBadgeAndAward("streak_7");
  }
  if (newPoints >= 500) {
    await checkBadgeAndAward("points_500");
  }

  return {
    awarded: true,
    pointsEarned: points,
    totalPoints: newPoints,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    newlyEarnedBadges
  };
}

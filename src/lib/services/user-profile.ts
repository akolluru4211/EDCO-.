import { supabase } from "@/lib/supabase";
import { UserProfile, AppUser, ResumeContact } from "@/lib/types";

export interface NormalizedName {
  displayName: string;
  firstName: string;
  lastName: string;
}

/**
 * Normalizes user name inputs, removing excessive spaces, preventing undefined/null/object strings,
 * and splitting into first, last, and canonical display_name.
 */
export function normalizeDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null
): NormalizedName {
  // Check if fullName is provided
  let rawFull = (fullName || "").trim();
  const rawFirst = (firstName || "").trim();
  const rawLast = (lastName || "").trim();

  // Guard against string representations of undefined/null/[object Object]
  const isInvalidStr = (s: string) => 
    !s || s === "undefined" || s === "null" || s === "[object Object]" || s === "NaN";

  if (isInvalidStr(rawFull) && !isInvalidStr(rawFirst)) {
    rawFull = isInvalidStr(rawLast) ? rawFirst : `${rawFirst} ${rawLast}`;
  } else if (isInvalidStr(rawFull) && isInvalidStr(rawFirst)) {
    return {
      displayName: "",
      firstName: "",
      lastName: "",
    };
  }

  // Normalize multi-whitespace
  const cleanFull = rawFull.replace(/\s+/g, " ").trim();

  // If cleanFull is empty
  if (!cleanFull) {
    return {
      displayName: "",
      firstName: "",
      lastName: "",
    };
  }

  const parts = cleanFull.split(" ");
  const computedFirst = parts[0] || "";
  const computedLast = parts.slice(1).join(" ") || "";

  return {
    displayName: cleanFull,
    firstName: rawFirst && !isInvalidStr(rawFirst) ? rawFirst : computedFirst,
    lastName: rawLast && !isInvalidStr(rawLast) ? rawLast : computedLast,
  };
}

/**
 * Natural user greeting helper for different platform contexts.
 */
export function formatUserGreeting(
  name?: string | null,
  context: "dashboard" | "resume" | "interview" | "portfolio" | "general" = "general",
  hour: number = new Date().getHours()
): string {
  const { firstName, displayName } = normalizeDisplayName(undefined, undefined, name);
  const targetName = firstName || displayName;

  if (!targetName) {
    switch (context) {
      case "dashboard":
        return hour < 12 ? "Good morning 👋" : hour < 18 ? "Good afternoon 👋" : "Good evening 👋";
      case "resume":
        return "Build your ATS-ready resume";
      case "interview":
        return "Ready for your mock interview?";
      case "portfolio":
        return "Professional portfolio";
      default:
        return "Welcome to EdWorld";
    }
  }

  switch (context) {
    case "dashboard":
      if (hour < 12) return `Good morning, ${targetName} 👋`;
      if (hour < 18) return `Good afternoon, ${targetName} 👋`;
      return `Good evening, ${targetName} 👋`;
    case "resume":
      return `Build your ATS-ready resume, ${targetName}`;
    case "interview":
      return `Ready for your mock interview, ${targetName}?`;
    case "portfolio":
      return `${displayName}'s Portfolio`;
    default:
      return `Welcome back, ${targetName}`;
  }
}

/**
 * Fetches canonical user profile by user ID or Firebase UID.
 */
export async function getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    if (error || !data) {
      // Fallback check in users table
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (userData) {
        const { displayName } = normalizeDisplayName(undefined, undefined, userData.name);
        return {
          name: displayName,
          phone: userData.phone || undefined,
          careerStage: userData.career_stage,
          gradeLevel: userData.grade,
          interests: [],
          primaryGoal: "EdWorld Organization Workspace",
          isPublic: userData.age_band === "18+",
          isMentor: Boolean(userData.is_mentor),
          mentorTags: [],
        };
      }
      return null;
    }

    const { displayName } = normalizeDisplayName(undefined, undefined, data.name || data.display_name);

    return {
      name: displayName,
      phone: data.phone || undefined,
      username: data.username,
      headline: data.headline,
      bio: data.bio,
      gradeLevel: data.grade_level,
      careerStage: data.career_stage,
      primaryGoal: data.primary_goal || "EdWorld Organization Workspace",
      interests: data.interests || [],
      isPublic: Boolean(data.is_public),
      isMentor: Boolean(data.is_mentor),
      mentorTags: data.mentor_tags || [],
      targetRole: data.target_role,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn("[getCurrentUserProfile Error]:", err);
    return null;
  }
}

/**
 * Authoritative update to canonical user profile across profiles and users tables.
 */
export async function updateCanonicalUserProfile(
  userId: string,
  updates: Partial<UserProfile> & {
    firstName?: string;
    lastName?: string;
    email?: string;
  }
): Promise<{ success: boolean; data?: Partial<UserProfile>; error?: string }> {
  if (!userId) return { success: false, error: "Missing user identity." };

  try {
    const { displayName, firstName, lastName } = normalizeDisplayName(
      updates.firstName,
      updates.lastName,
      updates.name
    );

    const profilePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (displayName) {
      profilePayload.name = displayName;
      profilePayload.display_name = displayName;
    }
    if (firstName) profilePayload.first_name = firstName;
    if (lastName) profilePayload.last_name = lastName;
    if (updates.phone !== undefined) profilePayload.phone = updates.phone;
    if (updates.headline !== undefined) profilePayload.headline = updates.headline;
    if (updates.bio !== undefined) profilePayload.bio = updates.bio;
    if (updates.username !== undefined) profilePayload.username = updates.username;
    if (updates.primaryGoal !== undefined) profilePayload.primary_goal = updates.primaryGoal;
    if (updates.interests !== undefined) profilePayload.interests = updates.interests;
    if (updates.isPublic !== undefined) profilePayload.is_public = updates.isPublic;
    if (updates.isMentor !== undefined) profilePayload.is_mentor = updates.isMentor;
    if (updates.mentorTags !== undefined) profilePayload.mentor_tags = updates.mentorTags;
    if (updates.targetRole !== undefined) profilePayload.target_role = updates.targetRole;
    if (updates.gradeLevel !== undefined) profilePayload.grade_level = updates.gradeLevel;

    // 1. Update profiles table
    await supabase.from("profiles").upsert({
      id: userId,
      user_id: userId,
      ...profilePayload,
    });

    // 2. Sync to users table
    const userPayload: Record<string, any> = {};
    if (displayName) userPayload.name = displayName;
    if (updates.phone !== undefined) userPayload.phone = updates.phone;
    if (updates.gradeLevel !== undefined) userPayload.grade = updates.gradeLevel;
    if (updates.careerStage !== undefined) userPayload.career_stage = updates.careerStage;

    if (Object.keys(userPayload).length > 0) {
      await supabase.from("users").update(userPayload).eq("id", userId);
    }

    return {
      success: true,
      data: {
        ...updates,
        name: displayName || updates.name,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update canonical profile." };
  }
}

/**
 * Returns default Resume Contact information based on the user's global profile.
 */
export function getResumeProfileDefaults(user: AppUser | null, profile: UserProfile | null): ResumeContact {
  const { displayName } = normalizeDisplayName(undefined, undefined, profile?.name || user?.name);

  return {
    fullName: displayName || "",
    email: user?.email || "",
    phone: profile?.phone || user?.phone || "",
    location: "",
    linkedin: profile?.username ? `linkedin.com/in/${profile.username}` : "",
    github: profile?.username ? `github.com/${profile.username}` : "",
    portfolio: profile?.username ? `edworld.co/u/${profile.username}` : "",
  };
}

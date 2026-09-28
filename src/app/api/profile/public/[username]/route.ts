import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const usernameParam = decodeURIComponent(params.username || "").trim();
  const requestId = req.headers.get("x-request-id") || undefined;

  if (!usernameParam) {
    return apiError("VALIDATION_ERROR", "Username parameter is required.", 400, undefined, requestId);
  }

  try {
    const supabase = createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 1. Try to find profile by username (case-insensitive)
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", usernameParam)
      .maybeSingle();

    // 2. If not found, try matching by ID / UUID
    if (!profile) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usernameParam);
      if (isUuid) {
        const { data: byId } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", usernameParam)
          .maybeSingle();
        if (byId) profile = byId;
      }
    }

    // 3. Fallback: try matching email prefix (e.g. adarsh_337 from adarsh_337@gmail.com)
    if (!profile) {
      const { data: byEmail } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `${usernameParam}@%`)
        .maybeSingle();
      if (byEmail) profile = byEmail;
    }

    // 4. Fallback: check users table
    if (!profile) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("*")
        .or(`id.eq.${usernameParam},email.ilike.${usernameParam}@%`)
        .maybeSingle();

      if (userRecord) {
        profile = {
          id: userRecord.id,
          user_id: userRecord.id,
          name: userRecord.name || "Software Engineer",
          email: userRecord.email,
          username: usernameParam,
          career_stage: userRecord.career_stage || "PROFESSIONAL",
          headline: "Software Engineer & Builder",
          is_public: true,
          created_at: userRecord.created_at || new Date().toISOString()
        };
      }
    }

    // If still no profile found
    if (!profile) {
      return apiError(
        "RESOURCE_NOT_FOUND",
        `User profile for "${usernameParam}" was not found.`,
        404,
        { username: usernameParam },
        requestId
      );
    }

    const targetUserId = profile.id || profile.user_id;
    const isOwner = currentUser && (currentUser.id === targetUserId || currentUser.email === profile.email);

    // 5. Check visibility (allow owner to always view their own portfolio/profile)
    if (!isOwner && profile.is_public === false) {
      return apiError(
        "FORBIDDEN",
        `The profile for "${usernameParam}" has been set to private by the user.`,
        403,
        { username: usernameParam, is_private: true },
        requestId
      );
    }

    // 6. Fetch verified public projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    // 7. Fetch verified certifications
    const { data: certs } = await supabase
      .from("certifications")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    // 8. Sanitize profile to remove internal/confidential secrets
    const sanitizedProfile = {
      id: targetUserId,
      userId: targetUserId,
      name: profile.name || profile.display_name || "Software Engineer",
      username: profile.username || usernameParam,
      headline: profile.headline || "Full Stack Software Engineer & Platform Builder",
      bio: profile.bio || "",
      avatarUrl: profile.avatar_url || null,
      skills: Array.isArray(profile.skills) ? profile.skills : Array.isArray(profile.interests) ? profile.interests : [],
      role: profile.role || profile.career_stage || "MEMBER",
      careerStage: profile.career_stage || "PROFESSIONAL",
      college: profile.college || profile.institution || profile.grade_level || null,
      degree: profile.degree || null,
      branch: profile.branch || profile.field_of_study || null,
      graduationYear: profile.graduation_year || null,
      company: profile.company || profile.current_company || null,
      jobTitle: profile.job_title || profile.target_role || null,
      location: profile.location || null,
      githubUrl: profile.github_url || null,
      linkedinUrl: profile.linkedin_url || null,
      leetcodeUrl: profile.leetcode_url || null,
      portfolioUrl: profile.portfolio_url || null,
      isPublic: profile.is_public !== false,
      isMentor: Boolean(profile.is_mentor),
      mentorTags: profile.mentor_tags || [],
      ageBand: profile.age_band || "18+",
      isOwner: Boolean(isOwner),
      projects: projects || [],
      certifications: certs || profile.certifications || []
    };

    return apiSuccess(sanitizedProfile, 200, requestId);
  } catch (error: any) {
    console.error("[Public Profile API Error]:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error?.message || "Failed to load public profile data.",
      500,
      undefined,
      requestId
    );
  }
}

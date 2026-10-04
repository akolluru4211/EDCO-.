import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSession } from "@/lib/otp-service";
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

    // 1. Identify current authenticated viewer
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const sessionToken =
      req.cookies.get("edworld_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-session-token");

    let sessionUserId: string | null = null;
    if (sessionToken) {
      try {
        const sessionResult = validateSession(sessionToken);
        if (sessionResult?.valid && sessionResult.userId) {
          sessionUserId = sessionResult.userId;
        }
      } catch (err) {
        // Ignore session decode errors
      }
    }

    let profile: any = null;

    // 2. Primary lookup: Call SECURITY DEFINER RPC to bypass RLS and match username, name, or id
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_profile", {
        p_identifier: usernameParam,
      });

      if (!rpcError && rpcData && rpcData.found) {
        profile = rpcData;
      }
    } catch (rpcErr) {
      console.warn("[Public Profile RPC Notice]:", rpcErr);
    }

    // 3. Resilient Fallbacks if RPC did not return a match
    if (!profile) {
      // Direct username / name / email match on profiles
      const { data: directProfile } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.${usernameParam},name.ilike.${usernameParam},display_name.ilike.${usernameParam},email.ilike.${usernameParam}@%`)
        .maybeSingle();

      if (directProfile) {
        profile = directProfile;
      }
    }

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

    // Fallback: Check users table
    if (!profile) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("*")
        .or(`id.eq.${usernameParam},email.ilike.${usernameParam}@%,name.ilike.${usernameParam}`)
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
    const isOwner = Boolean(
      (currentUser && (currentUser.id === targetUserId || currentUser.email === profile.email)) ||
      (sessionUserId && (sessionUserId === targetUserId || sessionUserId === profile.id || sessionUserId === profile.user_id))
    );

    // 4. Check visibility (allow owner to always view their own portfolio/profile)
    if (!isOwner && profile.is_public === false) {
      return apiError(
        "FORBIDDEN",
        `The profile for "${usernameParam}" has been set to private by the user.`,
        403,
        { username: usernameParam, is_private: true, isOwner: false },
        requestId
      );
    }

    // 5. Fetch verified public projects
    let projects: any[] = [];
    if (targetUserId) {
      try {
        const { data: pData } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });
        if (pData) projects = pData;
      } catch (_) {}
    }

    // 6. Fetch verified certifications
    let certs: any[] = [];
    if (targetUserId) {
      try {
        const { data: cData } = await supabase
          .from("certifications")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });
        if (cData) certs = cData;
      } catch (_) {}
    }

    // 7. Sanitize profile payload
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
      projects: projects.length > 0 ? projects : (profile.projects || []),
      certifications: certs.length > 0 ? certs : (profile.certifications || [])
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

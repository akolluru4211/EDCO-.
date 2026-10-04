import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSession } from "@/lib/otp-service";
import { normalizeDisplayName } from "@/lib/services/user-profile";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    let authUser: { id: string; email?: string; user_metadata?: any } | null = null;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (user) {
      authUser = user;
    } else {
      const sessionToken = 
        req.cookies.get("edworld_session")?.value ||
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
        req.headers.get("x-session-token");
      if (sessionToken) {
        const { valid, userId } = validateSession(sessionToken);
        if (valid && userId) {
          // Fetch existing profile email if possible
          const { data: p } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
          authUser = { id: userId, email: p?.email || undefined };
        }
      }
    }

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      firstName,
      lastName,
      phone,
      headline,
      bio,
      username,
      primaryGoal,
      interests,
      isPublic,
      isMentor,
      mentorTags,
      targetRole,
      gradeLevel,
      careerStage,
      certifications,
      showBirthdayToConnections,
      show_birthday_to_connections
    } = body;

    const { displayName, firstName: cleanFirst, lastName: cleanLast } = normalizeDisplayName(
      firstName,
      lastName,
      name
    );

    const nowIso = new Date().toISOString();

    // 1. Prepare profile payload
    const profilePayload: Record<string, any> = {
      updated_at: nowIso,
    };

    if (displayName) {
      profilePayload.name = displayName;
      profilePayload.display_name = displayName;
    }
    if (cleanFirst) profilePayload.first_name = cleanFirst;
    if (cleanLast) profilePayload.last_name = cleanLast;
    if (phone !== undefined) profilePayload.phone = phone;
    if (headline !== undefined) profilePayload.headline = headline;
    if (bio !== undefined) profilePayload.bio = bio;
    if (username !== undefined) profilePayload.username = username;
    if (primaryGoal !== undefined) profilePayload.primary_goal = primaryGoal;
    if (interests !== undefined) profilePayload.interests = interests;
    if (isPublic !== undefined) profilePayload.is_public = Boolean(isPublic);
    if (showBirthdayToConnections !== undefined) profilePayload.show_birthday_to_connections = Boolean(showBirthdayToConnections);
    if (show_birthday_to_connections !== undefined) profilePayload.show_birthday_to_connections = Boolean(show_birthday_to_connections);
    if (isMentor !== undefined) profilePayload.is_mentor = Boolean(isMentor);
    if (mentorTags !== undefined) profilePayload.mentor_tags = mentorTags;
    if (targetRole !== undefined) profilePayload.target_role = targetRole;
    if (gradeLevel !== undefined) profilePayload.grade_level = gradeLevel;
    if (careerStage !== undefined) profilePayload.career_stage = careerStage;
    if (certifications !== undefined) profilePayload.certifications = certifications;

    // Authoritative Upsert to profiles table
    const { data: updatedProfile, error: profileErr } = await supabase
      .from("profiles")
      .upsert({
        id: authUser.id,
        user_id: authUser.id,
        ...(authUser.email ? { email: authUser.email } : {}),
        ...profilePayload,
      })
      .select()
      .single();

    if (profileErr) {
      console.error("[Profile Update API - Profiles Error]:", profileErr);
      return NextResponse.json({ error: profileErr.message || "Failed to save profile record." }, { status: 500 });
    }

    // 2. Authoritative Sync to users table
    const userPayload: Record<string, any> = {};
    if (displayName) userPayload.name = displayName;
    if (gradeLevel !== undefined) userPayload.grade = gradeLevel;
    if (careerStage !== undefined) userPayload.career_stage = careerStage;

    const { error: userErr } = await supabase
      .from("users")
      .upsert({
        id: authUser.id,
        ...(authUser.email ? { email: authUser.email } : {}),
        ...userPayload,
      });

    if (userErr) {
      console.warn("[Profile Update API - Users sync note]:", userErr.message);
    }

    // 3. Update auth user metadata if Supabase auth user
    try {
      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: displayName || user.user_metadata?.full_name,
            name: displayName || user.user_metadata?.name,
            phone: phone !== undefined ? phone : user.user_metadata?.phone,
          }
        });
      }
    } catch (metaErr) {
      console.warn("[Profile Update API - Auth metadata note]:", metaErr);
    }

    // 4. Record Audit Log
    try {
      await supabase.from("audit_logs").insert({
        actor_id: authUser.id,
        actor_role: updatedProfile?.role || "USER",
        action: "profile.updated",
        target_type: "profile",
        target_id: authUser.id,
        metadata: {
          updated_fields: Object.keys(profilePayload).filter(k => k !== "updated_at"),
          timestamp: nowIso
        }
      });
    } catch (auditErr) {
      console.warn("[Profile Update API - Audit Log note]:", auditErr);
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: authUser.id,
        name: displayName || updatedProfile?.name,
        phone: updatedProfile?.phone,
        headline: updatedProfile?.headline,
        bio: updatedProfile?.bio,
        username: updatedProfile?.username,
        targetRole: updatedProfile?.target_role,
        gradeLevel: updatedProfile?.grade_level,
        careerStage: updatedProfile?.career_stage,
        interests: updatedProfile?.interests,
        primaryGoal: updatedProfile?.primary_goal,
        isPublic: updatedProfile?.is_public,
        isMentor: updatedProfile?.is_mentor,
        mentorTags: updatedProfile?.mentor_tags,
        certifications: updatedProfile?.certifications,
        updatedAt: nowIso
      }
    });
  } catch (err: any) {
    console.error("[Profile Update Route Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error during profile update." }, { status: 500 });
  }
}

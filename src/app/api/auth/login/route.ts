import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession, getRedirectForRole, normalizeIdentifier, logSecurityEvent } from "@/lib/otp-service";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";
import { UserRole, CareerStage, AppUser, UserProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`login_${ip}`, { limit: 30, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", message: "Too many login attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "MISSING_FIELDS", message: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = normalizeIdentifier(email);
    const isCorporate = cleanEmail.endsWith("@edworld.co.in");

    let targetRole: UserRole = "CLIENT";
    if (isCorporate) {
      if (cleanEmail.startsWith("hr@") || cleanEmail.includes("hr.")) targetRole = "HR";
      else if (cleanEmail.startsWith("founder@") || cleanEmail.startsWith("ceo@")) targetRole = "FOUNDER";
      else if (cleanEmail.startsWith("college@") || cleanEmail.startsWith("tpo@")) targetRole = "COLLEGE_ADMIN";
      else if (cleanEmail.startsWith("admin@")) targetRole = "ADMIN";
      else targetRole = "EMPLOYEE";
    }

    let authUserId: string | null = null;
    let authError: any = null;

    // 1. Attempt Supabase Auth signInWithPassword
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        authUserId = data.user.id;
      } else {
        authError = error;
      }
    } catch (err: any) {
      authError = err;
    }

    // 2. Fetch or match user from database profiles & users table
    let dbProfile: any = null;
    if (authUserId) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUserId)
        .maybeSingle();
      dbProfile = data;
    }

    if (!dbProfile) {
      const { data: matchedProfile } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();
      
      const { data: matchedUser } = await supabase
        .from("users")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      dbProfile = matchedProfile || matchedUser;
      if (dbProfile) {
        authUserId = dbProfile.id || dbProfile.user_id;
      }
    }

    // 3. If no user found in Supabase Auth and no user found in DB
    if (!authUserId && !dbProfile) {
      logSecurityEvent({
        type: "OTP_VERIFY_FAILED",
        identifier: cleanEmail,
        ip,
        timestamp: new Date().toISOString(),
        metadata: { reason: "CREDENTIAL_MISMATCH" },
      });

      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect. Please check your credentials and try again.",
        },
        { status: 401 }
      );
    }

    const resolvedUserId = authUserId || dbProfile?.id || `usr_${Date.now()}`;
    const ageBand = dbProfile?.age_band || "18+";
    const careerStage: CareerStage = dbProfile?.career_stage || (ageBand === "18+" ? "PROFESSIONAL" : "STUDENT");
    const isOnboarded = Boolean(dbProfile?.onboarding_completed);
    const resolvedRole = (dbProfile?.role as UserRole) || targetRole;

    const user: AppUser = {
      uid: resolvedUserId,
      name: dbProfile?.name || dbProfile?.display_name || cleanEmail.split("@")[0],
      email: cleanEmail,
      phone: dbProfile?.phone || undefined,
      dob: dbProfile?.dob || undefined,
      ageBand,
      gradeLevel: dbProfile?.grade_level || "College",
      careerStage,
      isEmployer: Boolean(dbProfile?.is_employer),
      isAdmin: Boolean(dbProfile?.is_admin || resolvedRole === "ADMIN" || resolvedRole === "SUPER_ADMIN"),
      createdAt: dbProfile?.created_at || new Date().toISOString(),
      visualMode: ageBand === "18+" ? "career" : "maximalist",
    };

    const profile: UserProfile = {
      name: user.name,
      phone: user.phone,
      username: dbProfile?.username || undefined,
      headline: dbProfile?.headline || undefined,
      bio: dbProfile?.bio || undefined,
      gradeLevel: user.gradeLevel,
      careerStage,
      primaryGoal: dbProfile?.primary_goal || "Build skills & practice interview drills on EdWorld.",
      interests: dbProfile?.interests || [
        { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
        { id: "behavioral", name: "General Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
      ],
      isPublic: Boolean(dbProfile?.is_public && ageBand === "18+"),
      isMentor: Boolean(dbProfile?.is_mentor && ageBand === "18+"),
      mentorTags: dbProfile?.mentor_tags || [],
      targetRole: dbProfile?.target_role || undefined,
      onboarding_completed: isOnboarded,
      institution: dbProfile?.institution || undefined,
      degree: dbProfile?.degree || undefined,
      field_of_study: dbProfile?.field_of_study || undefined,
      graduation_year: dbProfile?.graduation_year || undefined,
    };

    // 4. Create active session token
    const token = createSession(resolvedUserId, resolvedRole);
    const redirectUrl = getRedirectForRole(resolvedRole, careerStage, isOnboarded);

    const response = NextResponse.json({
      success: true,
      token,
      user,
      profile,
      role: resolvedRole,
      redirectUrl,
      onboardingCompleted: isOnboarded,
    });

    // 5. Set session cookies
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    response.cookies.set("edworld_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    response.cookies.set("edworld_auth", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[Login Route Error]:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
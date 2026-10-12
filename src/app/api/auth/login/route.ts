import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDbPool } from "@/lib/db-server";
import { createSession, getRedirectForRole, normalizeIdentifier, logSecurityEvent } from "@/lib/otp-service";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";
import { UserRole, CareerStage, AppUser, UserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    const isFounderCredential =
      cleanEmail === "edworld.eden@gmail.com" ||
      cleanEmail === "founder@edworld.co.in" ||
      cleanEmail === "ceo@edworld.co.in";

    let targetRole: UserRole = "CLIENT";
    if (isFounderCredential) {
      targetRole = "FOUNDER";
    } else if (isCorporate) {
      if (cleanEmail.startsWith("hr@") || cleanEmail.includes("hr.")) targetRole = "HR";
      else if (cleanEmail.startsWith("founder@") || cleanEmail.startsWith("ceo@")) targetRole = "FOUNDER";
      else if (cleanEmail.startsWith("college@") || cleanEmail.startsWith("tpo@")) targetRole = "COLLEGE_ADMIN";
      else if (cleanEmail.startsWith("admin@")) targetRole = "ADMIN";
      else targetRole = "EMPLOYEE";
    }

    let authUserId: string | null = null;
    let authUserEmail: string = cleanEmail;
    let passwordMatched = false;

    // 1. Attempt Supabase Auth signInWithPassword (cryptographic verification)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        authUserId = data.user.id;
        authUserEmail = data.user.email || cleanEmail;
        passwordMatched = true;
      }
    } catch (err: any) {
      console.warn("[Login GoTrue signIn notice]:", err?.message);
    }

    // 2. Direct PostgreSQL fallback if GoTrue was unlinked or had schema error
    const pool = getDbPool();
    if (!passwordMatched) {
      try {
        const dbCheck = await pool.query(
          `
          SELECT id, email, encrypted_password, raw_user_meta_data
          FROM auth.users
          WHERE LOWER(email) = $1
            AND encrypted_password = crypt($2, encrypted_password)
          LIMIT 1;
          `,
          [cleanEmail, password]
        );

        if (dbCheck.rows.length > 0) {
          authUserId = dbCheck.rows[0].id;
          authUserEmail = dbCheck.rows[0].email;
          passwordMatched = true;
        }
      } catch (dbErr: any) {
        console.warn("[Login direct Postgres check warning]:", dbErr?.message);
      }
    }

    // 3. If password did NOT match, reject with uniform generic error (prevents user enumeration)
    if (!passwordMatched) {
      logSecurityEvent({
        type: "OTP_VERIFY_FAILED",
        identifier: cleanEmail,
        ip,
        timestamp: new Date().toISOString(),
        metadata: { reason: "AUTHENTICATION_FAILED" },
      });

      return NextResponse.json(
        {
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password. Please verify your credentials and try again.",
        },
        { status: 401 }
      );
    }

    // 4. Fetch or match user from database profiles & users table
    let dbProfile: any = null;
    if (authUserId) {
      try {
        const profRes = await pool.query(
          `SELECT * FROM public.profiles WHERE id = $1 LIMIT 1`,
          [authUserId]
        );
        if (profRes.rows.length > 0) {
          dbProfile = profRes.rows[0];
        }
      } catch {}
    }

    if (!dbProfile) {
      try {
        const profRes = await pool.query(
          `SELECT * FROM public.profiles WHERE LOWER(email) = $1 LIMIT 1`,
          [cleanEmail]
        );
        if (profRes.rows.length > 0) {
          dbProfile = profRes.rows[0];
          if (!authUserId) authUserId = dbProfile.id;
        } else {
          const userRes = await pool.query(
            `SELECT * FROM public.users WHERE LOWER(email) = $1 LIMIT 1`,
            [cleanEmail]
          );
          if (userRes.rows.length > 0) {
            dbProfile = userRes.rows[0];
            if (!authUserId) authUserId = dbProfile.id;
          }
        }
      } catch {}
    }

    // If authenticated founder credentials, guarantee presence in auth.users and public tables
    if (isFounderCredential) {
      try {
        const founderCheck = await pool.query(
          "SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1",
          [cleanEmail]
        );
        let founderUid = founderCheck.rows[0]?.id;

        if (!founderUid) {
          founderUid = "00000000-0000-4000-a000-000000000001";
          await pool.query(
            `
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
            VALUES ($1::uuid, $2, crypt($3, gen_salt('bf', 10)), NOW(), 'authenticated', 'authenticated')
            ON CONFLICT (id) DO NOTHING;
            `,
            [founderUid, cleanEmail, password]
          );
        }

        authUserId = founderUid;

        if (!dbProfile) {
          dbProfile = {
            id: founderUid,
            user_id: founderUid,
            name: "EdWorld Founder & CEO",
            display_name: "EdWorld Founder & CEO",
            email: cleanEmail,
            role: "FOUNDER",
            is_founder: true,
            is_admin: true,
            age_band: "18+",
            career_stage: "working_professional",
            onboarding_completed: true,
            created_at: new Date().toISOString(),
          };

          await pool.query(
            `
            INSERT INTO public.users (id, name, email, career_stage, age_band, is_admin)
            VALUES ($1::uuid, $2, $3, 'working_professional', '18+', true)
            ON CONFLICT (id) DO NOTHING;
            `,
            [founderUid, "EdWorld Founder & CEO", cleanEmail]
          );

          await pool.query(
            `
            INSERT INTO public.profiles (id, user_id, name, email, career_stage, age_band, is_admin)
            VALUES ($1::uuid, $1::uuid, $2, $3, 'working_professional', '18+', true)
            ON CONFLICT (id) DO NOTHING;
            `,
            [founderUid, "EdWorld Founder & CEO", cleanEmail]
          );
        }
      } catch (fErr) {
        console.warn("[Founder bootstrap warning]:", fErr);
      }
    }

    const resolvedUserId = authUserId || dbProfile?.id || `00000000-0000-4000-a000-000000000099`;
    const ageBand = dbProfile?.age_band || "18+";
    const rawStage = dbProfile?.career_stage || (ageBand === "18+" ? "working_professional" : "college");
    const careerStage: CareerStage =
      rawStage === "working_professional" || rawStage === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : "STUDENT";
    const dbCareerStage = careerStage === "PROFESSIONAL" ? "working_professional" : "college";
    const isOnboarded = Boolean(dbProfile?.onboarding_completed);
    const resolvedRole = (dbProfile?.role as UserRole) || targetRole;

    // Auto-heal missing public.profiles or public.users rows
    try {
      if (authUserId) {
        await pool.query(
          `
          INSERT INTO public.users (id, name, email, career_stage, age_band, grade, is_admin)
          VALUES ($1::uuid, $2, $3, $4, $5, 'College', $6)
          ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
          `,
          [
            authUserId,
            dbProfile?.name || cleanEmail.split("@")[0],
            cleanEmail,
            dbCareerStage,
            ageBand,
            resolvedRole === "ADMIN" || resolvedRole === "SUPER_ADMIN" || resolvedRole === "FOUNDER",
          ]
        );

        await pool.query(
          `
          INSERT INTO public.profiles (id, user_id, name, email, career_stage, age_band, grade_level, is_admin)
          VALUES ($1::uuid, $1::uuid, $2, $3, $4, $5, 'College', $6)
          ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
          `,
          [
            authUserId,
            dbProfile?.name || cleanEmail.split("@")[0],
            cleanEmail,
            dbCareerStage,
            ageBand,
            resolvedRole === "ADMIN" || resolvedRole === "SUPER_ADMIN" || resolvedRole === "FOUNDER",
          ]
        );
      }
    } catch (healErr) {
      console.warn("[Auto-heal profiles/users warning]:", healErr);
    }

    // 5. Record Login in public.audit_logs
    try {
      await pool.query(
        `
        INSERT INTO public.audit_logs (
          id,
          actor_id,
          actor_role,
          action,
          target_type,
          target_id,
          metadata,
          ip_address,
          created_at
        )
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          'USER_LOGIN',
          'auth',
          $1,
          $3::jsonb,
          $4,
          NOW()
        );
        `,
        [
          resolvedUserId,
          resolvedRole,
          JSON.stringify({ email: cleanEmail, method: "password" }),
          ip,
        ]
      );
    } catch (auditErr) {
      console.warn("[Audit log insert note]:", auditErr);
    }

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
      isAdmin: Boolean(
        dbProfile?.is_admin || resolvedRole === "ADMIN" || resolvedRole === "SUPER_ADMIN"
      ),
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
      primaryGoal:
        dbProfile?.primary_goal || "Build skills & practice interview drills on EdWorld.",
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

    // 6. Create active session token
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

    // 7. Set session cookies
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
import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db-server";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limiter = rateLimit(`signup_${ip}`, { limit: 15, windowMs: 60 * 1000 });
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Too many sign up attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "Invalid request payload." }, { status: 400 });
  }

  const {
    email,
    password,
    name,
    dob,
    gradeLevel,
    phone,
    careerStage,
    primaryGoal,
    interests,
  } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "WEAK_PASSWORD", message: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();
  const cleanPhone = phone ? String(phone).trim() : null;
  const cleanGrade = gradeLevel ? String(gradeLevel).trim() : "College";
  const cleanDob = dob && /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : "2002-01-01";

  // Normalize career stage strictly to match Postgres check constraints:
  // ('college', 'working_professional')
  const stageLower = String(careerStage || "").toLowerCase();
  let dbCareerStage = "college";
  if (
    stageLower === "working_professional" ||
    stageLower === "professional" ||
    stageLower === "working professional"
  ) {
    dbCareerStage = "working_professional";
  } else {
    dbCareerStage = "college";
  }

  // Derive age band
  const birthYear = parseInt(cleanDob.split("-")[0], 10) || 2002;
  const approxAge = new Date().getFullYear() - birthYear;
  const ageBand = approxAge < 16 ? "13-15" : approxAge < 18 ? "16-18" : "18+";

  // Check roles: Public signups default strictly to CLIENT with is_admin = false.
  // Administrative privileges cannot be self-assigned via email prefix; they must be provisioned.
  const isFounder =
    cleanEmail === "edworld.eden@gmail.com" ||
    cleanEmail === "founder@edworld.co.in" ||
    cleanEmail === "ceo@edworld.co.in";
  const isAdmin = false; // Never auto-grant admin via public self-service signup
  const assignedRole = isFounder ? "FOUNDER" : "CLIENT";

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    // Check if user already exists in auth.users
    const existingCheck = await client.query(
      "SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1",
      [cleanEmail]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        {
          error: "USER_EXISTS",
          message: "An account with this email already exists. Please log in instead.",
        },
        { status: 409 }
      );
    }

    await client.query("BEGIN");

    // 1. Generate UUID for new user
    const uuidRes = await client.query("SELECT gen_random_uuid() AS id");
    const userId: string = uuidRes.rows[0].id;

    // 2. Insert into auth.users (with email_confirmed_at = NOW() to bypass SMTP delivery hang)
    const userMeta = {
      full_name: cleanName,
      name: cleanName,
      dob: cleanDob,
      phone: cleanPhone,
      age_band: ageBand,
      grade_level: cleanGrade,
      career_stage: dbCareerStage,
      role: assignedRole,
    };

    await client.query(
      `
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token
      )
      VALUES (
        $1::uuid,
        '00000000-0000-0000-0000-000000000000',
        $2,
        crypt($3, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        $4::jsonb,
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        ''
      );
      `,
      [userId, cleanEmail, password, JSON.stringify(userMeta)]
    );

    // 3. Insert into auth.identities (Required by GoTrue signInWithPassword)
    await client.query(
      `
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1::uuid,
        json_build_object('sub', $1::text, 'email', $2::text),
        'email',
        $2::text,
        NOW(),
        NOW(),
        NOW()
      );
      `,
      [userId, cleanEmail]
    );

    // 4. Insert into public.users
    await client.query(
      `
      INSERT INTO public.users (
        id,
        name,
        email,
        age_band,
        grade,
        is_employer,
        is_admin,
        is_mentor,
        career_stage,
        created_at
      )
      VALUES (
        $1::uuid,
        $2,
        $3,
        $4,
        $5,
        false,
        $6,
        false,
        $7,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        career_stage = EXCLUDED.career_stage;
      `,
      [userId, cleanName, cleanEmail, ageBand, cleanGrade, isAdmin, dbCareerStage]
    );

    // 5. Upsert into public.profiles
    const sanitizedUsername =
      cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + userId.substring(0, 4);
    const sanitizedGoal =
      primaryGoal || "Build skills & practice interview drills on EdWorld.";
    const sanitizedInterests = interests && Array.isArray(interests)
      ? JSON.stringify(interests)
      : JSON.stringify([
          { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
          { id: "behavioral", name: "Behavioral & Leadership", category: "Career", selfLevel: 0, effectiveLevel: 0 },
        ]);

    await client.query(
      `
      INSERT INTO public.profiles (
        id,
        user_id,
        name,
        email,
        dob,
        age_band,
        grade_level,
        username,
        primary_goal,
        interests,
        career_stage,
        is_public,
        is_admin,
        created_at,
        updated_at
      )
      VALUES (
        $1::uuid,
        $1::uuid,
        $2,
        $3,
        $4::date,
        $5,
        $6,
        $7,
        $8,
        $9::jsonb,
        $10,
        false,
        $11,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        career_stage = EXCLUDED.career_stage,
        primary_goal = EXCLUDED.primary_goal,
        updated_at = NOW();
      `,
      [
        userId,
        cleanName,
        cleanEmail,
        cleanDob,
        ageBand,
        cleanGrade,
        sanitizedUsername,
        sanitizedGoal,
        sanitizedInterests,
        dbCareerStage,
        isAdmin,
      ]
    );

    // 6. Record Audit Log in public.audit_logs
    await client.query(
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
        $1::text,
        $2::text,
        'USER_SIGNUP',
        'auth',
        $1::text,
        $3::jsonb,
        $4,
        NOW()
      );
      `,
      [
        userId,
        assignedRole,
        JSON.stringify({ email: cleanEmail, career_stage: dbCareerStage }),
        ip,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        role: assignedRole,
        careerStage: dbCareerStage,
      },
      message: "Account created and synchronized with Supabase database.",
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[Signup API Database Transaction Error]:", err);
    return NextResponse.json(
      {
        error: "DATABASE_ERROR",
        message: err.message || "Failed to persist user registration in Supabase database.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

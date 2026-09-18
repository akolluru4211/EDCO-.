import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/otp-service";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`session_${ip}`, { limit: 60, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json({ authenticated: false, error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const token = 
      req.cookies.get("edworld_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-session-token");

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { valid, userId, role } = validateSession(token);
    if (!valid || !userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Fetch fresh profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, name, role, age_band, career_stage, grade_level, phone, is_suspended")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.is_suspended) {
      return NextResponse.json({ authenticated: false, error: "ACCOUNT_SUSPENDED" }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      userId,
      role: role || profile?.role || "CLIENT",
      profile,
      user: {
        uid: userId,
        email: profile?.email || "",
        name: profile?.name || "Learner",
        phone: profile?.phone,
        ageBand: profile?.age_band || "18+",
        careerStage: profile?.career_stage || (profile?.age_band === "13-15" ? "JUNIOR" : profile?.age_band === "16-18" ? "STUDENT" : "PROFESSIONAL"),
        gradeLevel: profile?.grade_level || "College",
      }
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

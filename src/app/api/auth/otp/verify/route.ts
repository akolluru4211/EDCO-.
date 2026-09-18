import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-service";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit("otp_verify_" + ip, { limit: 10, windowMs: 60 * 1000 });
    
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Too many code attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, code, purpose, metaData } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { error: "MISSING_FIELDS", message: "Identifier and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(identifier, code, purpose || "login", metaData);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      role: result.role,
      status: result.status,
      sessionToken: result.token,
      redirectUrl: result.redirectUrl,
    }, { status: 200 });

    if (result.token) {
      response.cookies.set("edworld_session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "OTP_VERIFY_FAILED", message: err?.message || "Invalid or expired verification code." },
      { status: 400 }
    );
  }
}

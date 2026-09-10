import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, otp, purpose, name, dob, careerStage, gradeLevel } = body;

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Please provide both identifier and the 6-digit verification code." },
        { status: 400 }
      );
    }

    const cleanOtp = otp.toString().trim();
    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { error: "INVALID_FORMAT", message: "The verification code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    const result = await verifyOtp(identifier, cleanOtp, purpose || "login", {
      name,
      dob,
      careerStage,
      gradeLevel,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: result.user,
        role: result.role,
        redirectUrl: result.redirectUrl,
        token: result.token,
      },
      { status: 200 }
    );

    // Set HTTP-only session cookie
    response.cookies.set("edworld_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    const isSuspended = err?.message?.includes("suspended");
    const isDisabled = err?.message?.includes("disabled");
    const status = isSuspended || isDisabled ? 403 : 400;

    return NextResponse.json(
      {
        error: isSuspended ? "ACCOUNT_SUSPENDED" : isDisabled ? "ACCOUNT_DISABLED" : "VERIFICATION_FAILED",
        message: err?.message || "Invalid or expired verification code.",
      },
      { status }
    );
  }
}

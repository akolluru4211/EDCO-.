import { NextRequest, NextResponse } from "next/server";
import { invalidateSession, logSecurityEvent } from "@/lib/otp-service";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = 
      req.cookies.get("edworld_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      req.headers.get("x-session-token");

    if (sessionToken) {
      invalidateSession(sessionToken);
    }

    logSecurityEvent({
      type: "LOGOUT",
      identifier: req.headers.get("x-user-id") || "anonymous",
      timestamp: new Date().toISOString(),
    });

    const response = NextResponse.json({ success: true, message: "Logged out successfully." }, { status: 200 });
    
    // Clear cookies
    response.cookies.set("edworld_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "LOGOUT_FAILED", message: "Failed to invalidate session." }, { status: 500 });
  }
}

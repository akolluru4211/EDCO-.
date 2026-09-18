import { NextRequest, NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp-service";
import { rateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`otp_send_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Too many verification requests. Please try again in 1 minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, purpose } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "INVALID_IDENTIFIER", message: "Please provide a valid email address or mobile number." },
        { status: 400 }
      );
    }

    const result = await generateAndSendOtp(identifier, purpose || "login", ip);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "OTP_SEND_FAILED", message: err?.message || "Failed to dispatch verification code." },
      { status: 400 }
    );
  }
}

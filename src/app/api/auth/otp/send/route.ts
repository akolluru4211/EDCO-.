import { NextRequest, NextResponse } from "next/server";
import { generateAndSendOtp } from "@/lib/otp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, purpose } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "INVALID_IDENTIFIER", message: "Please provide a valid email address or mobile number." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    const result = await generateAndSendOtp(identifier, purpose || "login", ipAddress);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "OTP_SEND_FAILED", message: err?.message || "Failed to dispatch verification code." },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { runJobStalenessSweep } from "@/lib/services/job-staleness-checker";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET || "edworld-maintenance-key";

    // Simple header or query secret guard for maintenance worker
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (authHeader !== `Bearer ${cronSecret}` && key !== cronSecret && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized maintenance invocation" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await runJobStalenessSweep({
      staleThresholdDays: body.staleThresholdDays,
      expiryThresholdDays: body.expiryThresholdDays,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error("[Job Maintenance Sweep Error]:", err);
    return NextResponse.json({ error: err.message || "Staleness check failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Allow read-only trigger for testing
  return POST(req);
}

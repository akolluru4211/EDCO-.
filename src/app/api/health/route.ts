import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;

  // 1. Secrets check
  const criticalSecrets = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ];
  const missingSecrets = criticalSecrets.filter(s => !process.env[s]);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === "production") {
    missingSecrets.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  // 2. Database ping check
  let dbStatus: "pass" | "fail" = "pass";
  let dbLatency = 0;
  let dbErrorMessage: string | null = null;

  try {
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
    dbLatency = Date.now() - dbStart;

    if (dbError) {
      dbStatus = "fail";
      dbErrorMessage = dbError.message;
    }
  } catch (err: any) {
    dbStatus = "fail";
    dbErrorMessage = err?.message || "DB ping failed";
  }

  // 3. Cache check
  const cacheStatus = process.env.REDIS_URL ? "pass" : "not_configured";

  // Determine overall status
  const isHealthy = dbStatus === "pass" && missingSecrets.length === 0;
  const isDegraded = dbStatus === "pass" && missingSecrets.length > 0;
  const overallStatus: "healthy" | "degraded" | "unhealthy" = isHealthy
    ? "healthy"
    : isDegraded
    ? "degraded"
    : "unhealthy";

  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  const responsePayload = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || process.env.npm_package_version || "1.0.0",
    uptime_seconds: Math.round(process.uptime ? process.uptime() : 0),
    total_latency_ms: Date.now() - startTime,
    request_id: requestId,
    checks: {
      database: {
        status: dbStatus,
        latency_ms: dbLatency,
        ...(dbErrorMessage ? { error: dbErrorMessage } : {})
      },
      cache: {
        status: cacheStatus,
        latency_ms: 0
      },
      secrets: {
        status: missingSecrets.length === 0 ? "pass" : "fail",
        missing: missingSecrets
      }
    }
  };

  return NextResponse.json(responsePayload, {
    status: statusCode,
    headers: {
      "x-request-id": requestId,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}

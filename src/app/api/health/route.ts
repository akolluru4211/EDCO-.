import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;

  try {
    // Quick, safe database connectivity ping
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
    const dbLatency = Date.now() - dbStart;

    const isHealthy = !dbError;

    return NextResponse.json({
      status: isHealthy ? "ok" : "degraded",
      service: "edworld-platform",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.round(process.uptime ? process.uptime() : 0),
      latencyMs: Date.now() - startTime,
      request_id: requestId
    }, {
      status: isHealthy ? 200 : 503,
      headers: {
        "x-request-id": requestId,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "unhealthy",
      service: "edworld-platform",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      error: "Service degraded",
      request_id: requestId
    }, {
      status: 503,
      headers: {
        "x-request-id": requestId,
        "Cache-Control": "no-store, max-age=0"
      }
    });
  }
}

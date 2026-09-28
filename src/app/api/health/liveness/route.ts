import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || `req-${Date.now()}`;
  return NextResponse.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    request_id: requestId
  }, {
    status: 200,
    headers: {
      "x-request-id": requestId,
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

import { NextRequest, NextResponse } from "next/server";
import { awardPoints, AwardPointsParams } from "@/lib/gamification-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: AwardPointsParams = await req.json();
    const result = await awardPoints(body);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Gamification reward error" }, { status: 500 });
  }
}

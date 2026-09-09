import { NextRequest, NextResponse } from "next/server";
import { checkEntitlement, EntitlementAction } from "@/lib/entitlement-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action") as EntitlementAction;

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action parameters are required." }, { status: 400 });
    }

    const result = await checkEntitlement(userId, action);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Entitlement check error" }, { status: 500 });
  }
}

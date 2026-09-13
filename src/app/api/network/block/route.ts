import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blockerId = req.headers.get("x-user-id") || body.blockerId || body.userId;
    const blockedId = body.blockedId || body.targetUserId;
    const reason = (body.reason || "").trim();

    if (!blockerId || !blockedId) {
      return NextResponse.json({ success: false, error: "Missing blocker or blocked user ID." }, { status: 400 });
    }

    if (blockerId === blockedId) {
      return NextResponse.json({ success: false, error: "Cannot block your own account." }, { status: 400 });
    }

    // 1. Insert into user_blocks
    const { data: blockRecord, error: blockErr } = await supabase
      .from("user_blocks")
      .upsert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason: reason || "User requested block"
      })
      .select()
      .single();

    if (blockErr) {
      return NextResponse.json({ success: false, error: blockErr.message }, { status: 500 });
    }

    // 2. Remove or set connection to BLOCKED
    await supabase
      .from("connections")
      .delete()
      .or(`and(requester_id.eq.${blockerId},receiver_id.eq.${blockedId}),and(requester_id.eq.${blockedId},receiver_id.eq.${blockerId})`);

    return NextResponse.json({ success: true, block: blockRecord, message: "User blocked successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return NextResponse.json({ error: "referralCode and newUserId required" }, { status: 400 });
    }

    const { data: ambassador } = await supabase
      .from("ambassadors")
      .select("user_id, is_active")
      .eq("referral_code", referralCode.trim().toUpperCase())
      .maybeSingle();

    if (!ambassador || !ambassador.is_active) {
      return NextResponse.json({ success: false, reason: "Invalid or inactive referral code" });
    }

    const { data: existingRef } = await supabase
      .from("ambassador_referrals")
      .select("id")
      .eq("referred_user_id", newUserId)
      .maybeSingle();

    if (existingRef) {
      return NextResponse.json({ success: true, message: "User already attributed" });
    }

    const { error: insertErr } = await supabase
      .from("ambassador_referrals")
      .insert({
        ambassador_user_id: ambassador.user_id,
        referred_user_id: newUserId,
        signed_up_at: new Date().toISOString()
      });

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Referral attributed successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record referral" }, { status: 500 });
  }
}

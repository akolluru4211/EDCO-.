"use server";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { data: ambassador, error: ambError } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (ambError || !ambassador) {
      return NextResponse.json({ error: "Access Denied: You are not a registered campus ambassador." }, { status: 403 });
    }

    const { data: referrals, error: refError } = await supabase
      .from("ambassador_referrals")
      .select("id, referred_user_id, signed_up_at, users:referred_user_id(name, email, created_at)")
      .eq("ambassador_user_id", userId)
      .order("signed_up_at", { ascending: false });

    if (refError) {
      return NextResponse.json({ error: refError.message }, { status: 500 });
    }

    return NextResponse.json({
      ambassador,
      totalReferrals: (referrals || []).length,
      referrals: referrals || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch ambassador hub data" }, { status: 500 });
  }
}

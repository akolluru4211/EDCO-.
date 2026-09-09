import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { data: flags, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("key", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      flags: flags || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, enabled, rolloutPercentage = 100, description } = body;

    if (!key) {
      return NextResponse.json({ error: "Flag key is required." }, { status: 400 });
    }

    const { data: flag, error } = await supabase
      .from("feature_flags")
      .upsert({
        key,
        enabled: Boolean(enabled),
        rollout_percentage: rolloutPercentage,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      flag
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

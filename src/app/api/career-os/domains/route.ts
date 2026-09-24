import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DOMAIN_CATALOG } from "@/lib/services/career-learning-os";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ catalog: DOMAIN_CATALOG });
    }

    const { data: domains } = await supabase
      .from("user_domains")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      success: true,
      catalog: DOMAIN_CATALOG,
      userDomains: domains || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch domains" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, domains } = body;

    if (!userId || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json({ error: "User ID and a non-empty domains array are required" }, { status: 400 });
    }

    // Delete existing domains for clean sync or upsert
    for (const d of domains) {
      await supabase
        .from("user_domains")
        .upsert({
          user_id: userId,
          domain_id: d.domain_id || d.id,
          domain_name: d.domain_name || d.name,
          priority: d.priority || "primary",
          self_level: d.self_level ?? 1,
          effective_level: d.effective_level ?? d.self_level ?? 1,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,domain_id" });
    }

    const { data: freshDomains } = await supabase
      .from("user_domains")
      .select("*")
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      domains: freshDomains || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save domains" }, { status: 500 });
  }
}

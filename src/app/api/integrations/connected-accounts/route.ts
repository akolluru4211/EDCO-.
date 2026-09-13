import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ConnectedAccount } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("user_id", userId);

    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      console.warn("[Connected Accounts Fetch Warning]:", error.message);
    }

    const normalizedAccounts = (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      provider: (a.provider || "").toUpperCase(),
      username: a.provider_username || a.username || "",
      profileUrl: a.profile_url || a.profileUrl || "",
      status: a.sync_status || a.status || "CONNECTED",
      syncStatus: a.sync_status || a.syncStatus || "SYNCED",
      lastSyncedAt: a.last_synced_at || a.lastSyncedAt || a.updated_at,
      data: a.synced_data || a.data || {},
      updatedAt: a.updated_at
    }));

    return NextResponse.json({
      success: true,
      accounts: normalizedAccounts
    });
  } catch (err: any) {
    console.error("[Connected Accounts GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load connected accounts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, provider, username, profileUrl, data } = body;

    if (!userId || !provider || !username) {
      return NextResponse.json({ error: "User ID, provider, and username are required" }, { status: 400 });
    }

    const upperProvider = provider.toUpperCase();
    const cleanUrl = profileUrl || (upperProvider === "GITHUB" ? `https://github.com/${username}` : upperProvider === "LEETCODE" ? `https://leetcode.com/u/${username}` : `https://linkedin.com/in/${username}`);

    const { data: existing } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", userId)
      .ilike("provider", upperProvider)
      .maybeSingle();

    const payload = {
      user_id: userId,
      provider: upperProvider,
      provider_username: username,
      profile_url: cleanUrl,
      sync_status: "active",
      synced_data: data || {},
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let saved = null;
    if (existing?.id) {
      const { data: res } = await supabase.from("connected_accounts").update(payload).eq("id", existing.id).select().maybeSingle();
      saved = res;
    } else {
      const { data: res } = await supabase.from("connected_accounts").insert(payload).select().maybeSingle();
      saved = res;
    }

    // Sync to profiles table
    const profileField = upperProvider === "GITHUB" ? "github_url" : upperProvider === "LINKEDIN" ? "linkedin_url" : "leetcode_url";
    await supabase.from("profiles").update({
      [profileField]: cleanUrl,
      updated_at: new Date().toISOString()
    }).or(`id.eq.${userId},user_id.eq.${userId}`);

    return NextResponse.json({
      success: true,
      account: saved || payload
    });
  } catch (err: any) {
    console.error("[Connected Accounts POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to connect account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id") || searchParams.get("userId");
    const provider = searchParams.get("provider");

    if (!userId || !provider) {
      return NextResponse.json({ error: "User ID and provider are required" }, { status: 400 });
    }

    const upperProvider = provider.toUpperCase();
    await supabase
      .from("connected_accounts")
      .delete()
      .eq("user_id", userId)
      .ilike("provider", upperProvider);

    // Clear URL in profiles table
    const profileField = upperProvider === "GITHUB" ? "github_url" : upperProvider === "LINKEDIN" ? "linkedin_url" : "leetcode_url";
    await supabase.from("profiles").update({
      [profileField]: null,
      updated_at: new Date().toISOString()
    }).or(`id.eq.${userId},user_id.eq.${userId}`);

    return NextResponse.json({
      success: true,
      message: `${provider} account disconnected successfully.`
    });
  } catch (err: any) {
    console.error("[Connected Accounts DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to disconnect account" }, { status: 500 });
  }
}

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

    return NextResponse.json({
      success: true,
      accounts: data || []
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

    const newAccount: Partial<ConnectedAccount> = {
      userId,
      provider,
      username,
      profileUrl: profileUrl || (provider === "GITHUB" ? `https://github.com/${username}` : provider === "LEETCODE" ? `https://leetcode.com/u/${username}` : username),
      status: "CONNECTED",
      syncStatus: "SYNCED",
      lastSyncedAt: new Date().toISOString(),
      data,
      updatedAt: new Date().toISOString()
    };

    const { data: saved, error } = await supabase
      .from("connected_accounts")
      .upsert(
        {
          id: `${userId}-${provider.toLowerCase()}`,
          user_id: userId,
          provider,
          username,
          profile_url: newAccount.profileUrl,
          status: "CONNECTED",
          sync_status: "SYNCED",
          last_synced_at: newAccount.lastSyncedAt,
          data,
          updated_at: newAccount.updatedAt
        },
        { onConflict: "id" }
      )
      .select()
      .maybeSingle();

    return NextResponse.json({
      success: true,
      account: saved || newAccount
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

    await supabase
      .from("connected_accounts")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider.toUpperCase());

    return NextResponse.json({
      success: true,
      message: `${provider} account disconnected successfully.`
    });
  } catch (err: any) {
    console.error("[Connected Accounts DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to disconnect account" }, { status: 500 });
  }
}

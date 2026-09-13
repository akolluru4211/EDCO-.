import { NextRequest, NextResponse } from "next/server";
import { fetchLeetCodeProfileData } from "@/lib/services/social-integrations";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, userId } = body;

    if (!username) {
      return NextResponse.json({ error: "LeetCode username is required" }, { status: 400 });
    }

    const result = await fetchLeetCodeProfileData(username);
    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to fetch LeetCode profile" }, { status: 400 });
    }

    // Persist to database if userId provided
    if (userId) {
      try {
        const { data: existing } = await supabase
          .from("connected_accounts")
          .select("id")
          .eq("user_id", userId)
          .ilike("provider", "leetcode")
          .maybeSingle();

        const accountPayload = {
          user_id: userId,
          provider: "LEETCODE",
          provider_username: result.data.username,
          profile_url: result.data.profileUrl,
          sync_status: "active",
          synced_data: { leetcode: result.data },
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existing?.id) {
          await supabase.from("connected_accounts").update(accountPayload).eq("id", existing.id);
        } else {
          await supabase.from("connected_accounts").insert(accountPayload);
        }

        // Also update profiles table
        await supabase
          .from("profiles")
          .update({
            leetcode_url: result.data.profileUrl,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${userId},user_id.eq.${userId}`);
      } catch (dbErr) {
        console.warn("[LeetCode DB sync note]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (err: any) {
    console.error("[LeetCode Sync Route Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to sync LeetCode data" }, { status: 500 });
  }
}

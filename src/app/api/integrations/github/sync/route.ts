import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubProfileData } from "@/lib/services/social-integrations";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, userId } = body;

    if (!username) {
      return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
    }

    const result = await fetchGitHubProfileData(username);
    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Failed to fetch GitHub profile" }, { status: 400 });
    }

    // Persist to database if userId provided
    if (userId) {
      try {
        await supabase
          .from("connected_accounts")
          .upsert(
            {
              id: `${userId}-github`,
              user_id: userId,
              provider: "GITHUB",
              username: result.data.username,
              profile_url: `https://github.com/${result.data.username}`,
              status: "CONNECTED",
              sync_status: "SYNCED",
              last_synced_at: new Date().toISOString(),
              data: { github: result.data },
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
      } catch (dbErr) {
        console.warn("[GitHub DB sync note]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (err: any) {
    console.error("[GitHub Sync Route Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to sync GitHub data" }, { status: 500 });
  }
}

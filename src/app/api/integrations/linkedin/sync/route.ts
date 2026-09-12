import { NextRequest, NextResponse } from "next/server";
import { verifyLinkedInProfile } from "@/lib/services/social-integrations";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { profileUrl, userId } = body;

    if (!profileUrl) {
      return NextResponse.json({ error: "LinkedIn profile URL is required" }, { status: 400 });
    }

    const result = verifyLinkedInProfile(profileUrl);
    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error || "Invalid LinkedIn profile URL" }, { status: 400 });
    }

    // Persist to database if userId provided
    if (userId) {
      try {
        await supabase
          .from("connected_accounts")
          .upsert(
            {
              id: `${userId}-linkedin`,
              user_id: userId,
              provider: "LINKEDIN",
              username: result.data.username || result.data.profileUrl,
              profile_url: result.data.profileUrl,
              status: "VERIFIED",
              sync_status: "SYNCED",
              last_synced_at: new Date().toISOString(),
              data: { linkedin: result.data },
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
      } catch (dbErr) {
        console.warn("[LinkedIn DB sync note]:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (err: any) {
    console.error("[LinkedIn Sync Route Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to verify LinkedIn profile" }, { status: 500 });
  }
}

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
        const { data: existing } = await supabase
          .from("connected_accounts")
          .select("id")
          .eq("user_id", userId)
          .ilike("provider", "linkedin")
          .maybeSingle();

        const accountPayload = {
          user_id: userId,
          provider: "LINKEDIN",
          provider_username: result.data.username || "",
          profile_url: result.data.profileUrl,
          sync_status: "active",
          synced_data: { linkedin: result.data },
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
            linkedin_url: result.data.profileUrl,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${userId},user_id.eq.${userId}`);
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

import { NextRequest, NextResponse } from "next/server";
import { synthesizeDeveloperEvidence } from "@/lib/services/social-integrations";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: User ID required" }, { status: 401 });
    }

    // Retrieve user's connected accounts
    const { data: accounts } = await supabase
      .from("connected_accounts")
      .select("*")
      .eq("user_id", userId);

    let githubData = null;
    let leetcodeData = null;
    let linkedinData = null;

    (accounts || []).forEach((acc: any) => {
      if (acc.provider === "GITHUB" && acc.data?.github) githubData = acc.data.github;
      if (acc.provider === "LEETCODE" && acc.data?.leetcode) leetcodeData = acc.data.leetcode;
      if (acc.provider === "LINKEDIN" && acc.data?.linkedin) linkedinData = acc.data.linkedin;
    });

    const evidenceProfile = synthesizeDeveloperEvidence(
      userId,
      githubData,
      leetcodeData,
      linkedinData
    );

    return NextResponse.json({
      success: true,
      data: evidenceProfile
    });
  } catch (err: any) {
    console.error("[Developer Evidence Route Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to synthesize developer evidence" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEvidenceBasedBrandingPosts } from "@/lib/services/career-intelligence-graph";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await generateEvidenceBasedBrandingPosts(user.id, supabase);

    return NextResponse.json({
      success: true,
      drafts
    });
  } catch (err: any) {
    console.error("[Career Branding API Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to generate branding posts" }, { status: 500 });
  }
}

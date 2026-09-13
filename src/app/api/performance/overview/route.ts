import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { calculateUserPerformanceOverview } from "@/lib/services/performance-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const overview = await calculateUserPerformanceOverview(user.id, supabase);
    return NextResponse.json({ success: true, overview });
  } catch (error: any) {
    console.error("GET /api/performance/overview error:", error);
    return NextResponse.json({ error: error.message || "Failed to load performance overview" }, { status: 500 });
  }
}

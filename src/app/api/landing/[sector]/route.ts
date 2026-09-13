import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchSectorLandingData, SectorType } from "@/lib/services/landing-sector-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { sector: string } }
) {
  try {
    const rawSector = params.sector;
    const sectorMap: Record<string, SectorType> = {
      "junior": "junior",
      "for-junior": "junior",
      "explorer": "explorer",
      "for-explorer": "explorer",
      "college": "college",
      "for-college": "college",
      "working_professional": "working_professional",
      "for-professionals": "working_professional",
      "professionals": "working_professional",
    };

    const sector = sectorMap[rawSector];
    if (!sector) {
      return NextResponse.json({ error: "Invalid sector" }, { status: 400 });
    }

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

    const data = await fetchSectorLandingData(sector, supabase);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(`GET /api/landing/${params.sector} error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch sector landing data" }, { status: 500 });
  }
}

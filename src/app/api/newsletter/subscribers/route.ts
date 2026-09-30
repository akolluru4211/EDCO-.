import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers } from "@/lib/email-service";
import { verifyUserRole } from "@/lib/server-role-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100", 10);

    if (userId) {
      const roleCheck = await verifyUserRole(userId, ["ADMIN", "SUPER_ADMIN", "FOUNDER", "EXECUTIVE", "HR"]);
      if (!roleCheck.authorized) {
        return NextResponse.json(
          { success: false, error: "Unauthorized." },
          { status: 403 }
        );
      }
    }

    const subscribers = await getNewsletterSubscribers(limit);

    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

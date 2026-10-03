import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/network/upcoming-birthdays?userId=<uid>
 * Returns connection birthdays occurring today or within the next 7 days.
 * Privacy Guaranteed:
 * - Returns ONLY (connection_user_id, name, month, day, is_today, days_until, has_wished).
 * - Never returns birth year, raw DOB, or computed age.
 * - Only includes accepted connections who explicitly opted-in (show_birthday_to_connections = true).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();

    // 1. Attempt using Security Definer RPC
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_upcoming_connection_birthdays", {
        requesting_user_id: userId,
      });

      if (!rpcError && rpcData && Array.isArray(rpcData)) {
        // Calculate days until birthday for each connection (within 7 day window)
        const enriched = rpcData
          .map((b: any) => {
            const bMonth = b.month;
            const bDay = b.day;

            // Calculate days remaining in current year or next
            let nextDate = new Date(currentYear, bMonth - 1, bDay);
            if (nextDate < new Date(currentYear, currentMonth - 1, currentDay)) {
              nextDate = new Date(currentYear + 1, bMonth - 1, bDay);
            }

            const diffTime = nextDate.getTime() - new Date(currentYear, currentMonth - 1, currentDay).getTime();
            const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

            return {
              connection_user_id: b.connection_user_id,
              name: b.name || "Connection",
              month: bMonth,
              day: bDay,
              is_today: b.is_today || (bMonth === currentMonth && bDay === currentDay),
              days_until: daysUntil,
              has_wished: Boolean(b.has_wished),
            };
          })
          .filter((b) => b.days_until >= 0 && b.days_until <= 7)
          .sort((a, b) => a.days_until - b.days_until);

        return NextResponse.json({ birthdays: enriched });
      }
    } catch (rpcErr) {
      console.warn("[RPC upcoming_birthdays warning, using resilient fallback]:", rpcErr);
    }

    // 2. Resilient Fallback Query: Join profiles & accepted connections
    const { data: connections, error: connErr } = await supabase
      .from("connections")
      .select("requester_id, receiver_id, status")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .ilike("status", "accepted");

    if (connErr || !connections || connections.length === 0) {
      return NextResponse.json({ birthdays: [] });
    }

    const connectedUserIds = connections
      .map((c) => (c.requester_id === userId ? c.receiver_id : c.requester_id))
      .filter(Boolean);

    // Fetch only profiles with show_birthday_to_connections = true
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, name, dob, show_birthday_to_connections")
      .in("id", connectedUserIds)
      .eq("show_birthday_to_connections", true)
      .not("dob", "is", null);

    if (profErr || !profiles || profiles.length === 0) {
      return NextResponse.json({ birthdays: [] });
    }

    // Check wishes already sent this year
    const { data: sentWishes } = await supabase
      .from("birthday_wishes")
      .select("recipient_id")
      .eq("sender_id", userId)
      .eq("year", currentYear);

    const wishedIds = new Set((sentWishes || []).map((w) => w.recipient_id));

    // Exclude blocked connections
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    const blockedSet = new Set(
      (blocks || []).flatMap((b) => [
        b.blocker_id === userId ? b.blocked_id : b.blocker_id,
      ])
    );

    const enrichedBirthdays = profiles
      .filter((p) => !blockedSet.has(p.id) && p.dob)
      .map((p) => {
        const dobDate = new Date(p.dob);
        const bMonth = dobDate.getUTCMonth() + 1;
        const bDay = dobDate.getUTCDate();

        let nextDate = new Date(currentYear, bMonth - 1, bDay);
        if (nextDate < new Date(currentYear, currentMonth - 1, currentDay)) {
          nextDate = new Date(currentYear + 1, bMonth - 1, bDay);
        }

        const diffTime = nextDate.getTime() - new Date(currentYear, currentMonth - 1, currentDay).getTime();
        const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

        return {
          connection_user_id: p.id,
          name: p.name || "Connection",
          month: bMonth,
          day: bDay,
          is_today: bMonth === currentMonth && bDay === currentDay,
          days_until: daysUntil,
          has_wished: wishedIds.has(p.id),
        };
      })
      .filter((b) => b.days_until >= 0 && b.days_until <= 7)
      .sort((a, b) => a.days_until - b.days_until);

    return NextResponse.json({ birthdays: enrichedBirthdays });
  } catch (error: any) {
    console.error("[Upcoming Birthdays API Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch connection birthdays" }, { status: 500 });
  }
}

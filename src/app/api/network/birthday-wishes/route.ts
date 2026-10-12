import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/network/birthday-wishes?userId=<uid>
 * Returns birthday wishes received by the authenticated user for their private profile view.
 * Visible ONLY to the recipient. No reply / chat capability.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();

    const { data: wishes, error } = await supabase
      .from("birthday_wishes")
      .select(`
        id,
        sender_id,
        message,
        year,
        created_at,
        sender:profiles!birthday_wishes_sender_id_fkey(name, role, job_title)
      `)
      .eq("recipient_id", userId)
      .eq("year", currentYear)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without relation join if foreign key naming differs
      const { data: rawWishes, error: rawErr } = await supabase
        .from("birthday_wishes")
        .select("id, sender_id, message, year, created_at")
        .eq("recipient_id", userId)
        .eq("year", currentYear)
        .order("created_at", { ascending: false });

      if (rawErr) {
        return NextResponse.json({ wishes: [] });
      }

      // Populate sender names
      const senderIds = (rawWishes || []).map((w) => w.sender_id);
      const { data: senders } = await supabase
        .from("profiles")
        .select("id, name, job_title")
        .in("id", senderIds);

      const senderMap = new Map((senders || []).map((s) => [s.id, s]));

      const enriched = (rawWishes || []).map((w) => ({
        ...w,
        sender_name: senderMap.get(w.sender_id)?.name || "A Connection",
      }));

      return NextResponse.json({ wishes: enriched });
    }

    const formatted = (wishes || []).map((w: any) => ({
      id: w.id,
      sender_id: w.sender_id,
      sender_name: w.sender?.name || "A Connection",
      message: w.message,
      year: w.year,
      created_at: w.created_at,
    }));

    return NextResponse.json({ wishes: formatted });
  } catch (err: any) {
    console.error("[Birthday Wishes GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch birthday wishes" }, { status: 500 });
  }
}

/**
 * POST /api/network/birthday-wishes
 * Sends a one-way birthday wish to an accepted connection on their birthday.
 * 
 * Safety & Quality:
 * - Strictly one-way: No conversation thread or reply capability created.
 * - Rate limit: Enforces maximum 1 wish per sender per recipient per calendar year.
 * - Connection verification: Both users must have an 'accepted' connection.
 * - Block filter: Neither user can be blocked by the other.
 * - Content length: Capped at 200 characters.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, recipientId, message } = body;

    if (!senderId || !recipientId || !message) {
      return NextResponse.json(
        { error: "senderId, recipientId, and message are required" },
        { status: 400 }
      );
    }

    if (senderId === recipientId) {
      return NextResponse.json(
        { error: "Cannot send a birthday wish to yourself" },
        { status: 400 }
      );
    }

    // 1. Content validation & length limit
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0 || trimmedMessage.length > 200) {
      return NextResponse.json(
        { error: "Message must be between 1 and 200 characters" },
        { status: 400 }
      );
    }

    // Basic content filter
    const lowerMsg = trimmedMessage.toLowerCase();
    const bannedTerms = ["nazi", "terrorist", "kys", "kill yourself", "hate you"];
    if (bannedTerms.some((t) => lowerMsg.includes(t))) {
      return NextResponse.json(
        { error: "Message contains inappropriate content" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // 2. Verify Accepted Connection
    const { data: connection, error: connErr } = await supabase
      .from("connections")
      .select("id, status")
      .or(`and(requester_id.eq.${senderId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${senderId})`)
      .ilike("status", "accepted")
      .maybeSingle();

    if (connErr || !connection) {
      return NextResponse.json(
        { error: "You can only send birthday wishes to accepted connections" },
        { status: 403 }
      );
    }

    // 3. Block Check
    const { data: block } = await supabase
      .from("user_blocks")
      .select("id")
      .or(`and(blocker_id.eq.${senderId},blocked_id.eq.${recipientId}),and(blocker_id.eq.${recipientId},blocked_id.eq.${senderId})`)
      .maybeSingle();

    if (block) {
      return NextResponse.json(
        { error: "Cannot send birthday wish to this connection" },
        { status: 403 }
      );
    }

    // 4. Rate-Limit Check (1 per year)
    const { data: existingWish } = await supabase
      .from("birthday_wishes")
      .select("id")
      .eq("sender_id", senderId)
      .eq("recipient_id", recipientId)
      .eq("year", currentYear)
      .maybeSingle();

    if (existingWish) {
      return NextResponse.json(
        { error: "You have already sent a birthday wish to this connection this year" },
        { status: 429 }
      );
    }

    // 5. Insert Wish Record
    const { data: newWish, error: insertErr } = await supabase
      .from("birthday_wishes")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        message: trimmedMessage,
        year: currentYear,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[Birthday Wish Insert Error]:", insertErr);
      return NextResponse.json(
        { error: "Failed to send birthday wish: " + insertErr.message },
        { status: 500 }
      );
    }

    // 6. Fetch sender profile for in-app notification
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", senderId)
      .single();

    const senderName = senderProfile?.name || "A connection";

    // 7. Create In-App Notification for Recipient
    try {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        actor_id: senderId,
        type: "BIRTHDAY_WISH",
        title: "Birthday Wish Received 🎂",
        body: `${senderName} sent you a birthday wish: "${trimmedMessage}"`,
        data: {
          wishId: newWish?.id,
          senderName,
          senderId,
          year: currentYear,
        },
        read: false,
      });
    } catch (notifErr) {
      console.warn("[Notification insert note]:", notifErr);
    }

    return NextResponse.json({
      success: true,
      wish: newWish,
      message: "Birthday wish sent successfully!",
    });
  } catch (err: any) {
    console.error("[Birthday Wish POST Error]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while sending the wish" },
      { status: 500 }
    );
  }
}

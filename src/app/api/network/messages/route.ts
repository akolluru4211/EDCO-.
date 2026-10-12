import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db-server";
import { sendEmailNotification } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    const peerId = req.nextUrl.searchParams.get("peerId");

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required: missing user ID." },
        { status: 401 }
      );
    }

    const pool = getDbPool();

    // MODE 0: Rapid count-only probe for Navbar & notification badges
    const countOnly = req.nextUrl.searchParams.get("countOnly") === "true";
    if (countOnly) {
      const countRes = await pool.query(
        `SELECT COUNT(*) as unread_count
         FROM public.direct_messages
         WHERE receiver_id = $1 AND is_read = false`,
        [currentUserId]
      );
      const unreadCount = parseInt(countRes.rows[0]?.unread_count || "0", 10);
      return NextResponse.json({ success: true, unreadCount });
    }

    // MODE 1: Fetch all conversation threads for current user
    if (!peerId) {
      const threadsRes = await pool.query(
        `SELECT DISTINCT ON (conversation_id)
           m.id,
           m.conversation_id,
           m.sender_id,
           m.receiver_id,
           m.content,
           m.is_read,
           m.created_at,
           CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS partner_id
         FROM public.direct_messages m
         WHERE m.sender_id = $1 OR m.receiver_id = $1
         ORDER BY conversation_id, m.created_at DESC`,
        [currentUserId]
      );

      const threads = threadsRes.rows || [];
      if (threads.length === 0) {
        return NextResponse.json({ success: true, threads: [], totalUnreadCount: 0 });
      }

      // Collect partner IDs
      const partnerIds = Array.from(new Set(threads.map((t: any) => t.partner_id)));

      // Fetch partner profiles
      const partnersRes = await pool.query(
        `SELECT id, name, username, headline, grade_level, career_stage
         FROM public.profiles
         WHERE id = ANY($1::uuid[])`,
        [partnerIds]
      );

      const profileMap = new Map<string, any>((partnersRes.rows || []).map((p: any) => [p.id, p]));

      // Fetch unread counts for each partner
      const unreadRes = await pool.query(
        `SELECT sender_id, COUNT(*) as unread_count
         FROM public.direct_messages
         WHERE receiver_id = $1 AND is_read = false
         GROUP BY sender_id`,
        [currentUserId]
      );

      const unreadMap = new Map<string, number>(
        (unreadRes.rows || []).map((u: any) => [u.sender_id, parseInt(u.unread_count, 10)])
      );

      const formattedThreads = threads.map((t: any) => {
        const partner = profileMap.get(t.partner_id) || {};
        return {
          id: t.id,
          conversationId: t.conversation_id,
          partnerId: t.partner_id,
          partnerName: partner.name || partner.username || "EdWorld Member",
          partnerUsername: partner.username || "member",
          partnerHeadline: partner.headline || (partner.career_stage === "college" ? "Student" : "Working Professional"),
          partnerAvatarUrl: null,
          lastMessage: t.content,
          lastSenderId: t.sender_id,
          isLastFromMe: t.sender_id === currentUserId,
          unreadCount: unreadMap.get(t.partner_id) || 0,
          updatedAt: t.created_at,
        };
      });

      formattedThreads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      const totalUnreadCount = Array.from(unreadMap.values()).reduce((sum, c) => sum + c, 0);

      return NextResponse.json({ success: true, threads: formattedThreads, totalUnreadCount });
    }

    // MODE 2: Fetch message stream for specific conversation between currentUserId & peerId
    const canonicalConvId = [currentUserId, peerId].sort().join(":");

    // Mark unread incoming messages as read
    try {
      await pool.query(
        `UPDATE public.direct_messages
         SET is_read = true
         WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
        [currentUserId, peerId]
      );
    } catch (readErr) {
      console.warn("[Mark Read Note]:", readErr);
    }

    // Query messages in chronological order
    const msgsRes = await pool.query(
      `SELECT id, sender_id, receiver_id, conversation_id, content, is_read, created_at
       FROM public.direct_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 200`,
      [canonicalConvId]
    );

    const formattedMessages = (msgsRes.rows || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      conversationId: m.conversation_id,
      message: m.content,
      content: m.content,
      isRead: m.is_read ?? true,
      createdAt: m.created_at,
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (err: any) {
    console.error("[GET direct_messages error]:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch messages." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id");
    const body = await req.json();
    const { receiverId, message, content, senderName } = body;

    const actualSenderId = currentUserId || body.senderId;
    const messageText = (content || message || "").trim();

    if (!actualSenderId || !receiverId || !messageText) {
      return NextResponse.json(
        { success: false, error: "Sender ID, receiver ID, and message text are required." },
        { status: 400 }
      );
    }

    const canonicalConvId = [actualSenderId, receiverId].sort().join(":");
    const pool = getDbPool();

    // 1. Persist in public.direct_messages table
    const insertRes = await pool.query(
      `INSERT INTO public.direct_messages (id, sender_id, receiver_id, conversation_id, content, is_read, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, false, NOW())
       RETURNING id, sender_id, receiver_id, conversation_id, content, is_read, created_at`,
      [actualSenderId, receiverId, canonicalConvId, messageText]
    );

    const savedMsg = insertRes.rows[0];

    // 2. Dispatch transactional email notification to recipient
    notifyMessageEmail(actualSenderId, receiverId, messageText, senderName);

    return NextResponse.json({
      success: true,
      message: {
        id: savedMsg.id,
        senderId: savedMsg.sender_id,
        receiverId: savedMsg.receiver_id,
        conversationId: savedMsg.conversation_id,
        message: savedMsg.content,
        content: savedMsg.content,
        isRead: savedMsg.is_read,
        createdAt: savedMsg.created_at,
      },
    });
  } catch (err: any) {
    console.error("[POST direct_messages error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to send message." },
      { status: 500 }
    );
  }
}

async function notifyMessageEmail(senderId: string, receiverId: string, text: string, senderNameOverride?: string) {
  try {
    const pool = getDbPool();
    const usersRes = await pool.query(
      `SELECT id, name, email FROM public.profiles WHERE id = ANY($1::uuid[])`,
      [[senderId, receiverId]]
    );

    const profiles = usersRes.rows || [];
    const sender = profiles.find((p: any) => p.id === senderId);
    const receiver = profiles.find((p: any) => p.id === receiverId);

    const receiverEmail = receiver?.email;
    const receiverName = receiver?.name || "Member";
    const fromName = senderNameOverride || sender?.name || "A connection on EdWorld Co.";

    if (receiverEmail) {
      const emailHtml = renderBrandedEmailHtml({
        title: `New Direct Message from ${fromName}`,
        previewText: `${fromName} sent you a message on Edworld Co.`,
        contentHtml: `
          <p><strong>Hello ${receiverName},</strong></p>
          <p><strong>${fromName}</strong> sent you a direct message on EdWorld Co.:</p>
          <blockquote style="border-left: 3px solid #00D2B4; padding-left: 12px; margin: 16px 0; color: #4B5563; font-style: italic;">
            "${text.slice(0, 200)}${text.length > 200 ? "..." : ""}"
          </blockquote>
          <p>Open your messages inbox to view the full conversation and reply.</p>
        `,
        ctaText: "Open Messages",
        ctaUrl: "https://edworldco.in/messages",
        footerNote: "This notification was sent because you are registered on EdWorld Co. Verified Networking.",
      });

      await sendEmailNotification({
        to: receiverEmail,
        subject: `💬 New Message from ${fromName} on EdWorld Co.`,
        html: emailHtml,
        category: "system",
      });
    }
  } catch (emailErr) {
    console.warn("[Direct message email notification note]:", emailErr);
  }
}

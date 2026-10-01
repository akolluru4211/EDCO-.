import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmailNotification } from "@/lib/email-service";
import { renderBrandedEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    const peerId = req.nextUrl.searchParams.get("peerId");

    if (!currentUserId || !peerId) {
      return NextResponse.json(
        { success: false, error: "Both current user ID and peer ID are required." },
        { status: 400 }
      );
    }

    // Try fetching from direct_messages table in Supabase
    const { data: messages, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      // If table does not exist or errors, return empty array gracefully
      return NextResponse.json({
        success: true,
        messages: [],
      });
    }

    const formattedMessages = (messages || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      message: m.message || m.content || "",
      isRead: m.is_read ?? true,
      createdAt: m.created_at || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (err: any) {
    console.error("GET direct_messages error:", err);
    return NextResponse.json({ success: true, messages: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id");
    const body = await req.json();
    const { receiverId, message, senderName } = body;

    const actualSenderId = currentUserId || body.senderId;

    if (!actualSenderId || !receiverId || !message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Sender ID, receiver ID, and message text are required." },
        { status: 400 }
      );
    }

    const trimmedMsg = message.trim();
    const messageId = `dm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Persist in Supabase direct_messages
    try {
      await supabase.from("direct_messages").insert({
        id: messageId,
        sender_id: actualSenderId,
        receiver_id: receiverId,
        message: trimmedMsg,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("direct_messages insert note:", dbErr);
    }

    // 2. Fetch receiver profile / user email to send transactional email notification
    try {
      const { data: receiverData } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", receiverId)
        .single();

      const receiverEmail = receiverData?.email;
      const receiverName = receiverData?.name || "Peer";
      const fromName = senderName || "A peer on Edworld Co.";

      if (receiverEmail) {
        const emailHtml = renderBrandedEmailHtml({
          title: `New Direct Message from ${fromName}`,
          previewText: `${fromName} sent you a message on Edworld Co.`,
          contentHtml: `
            <p><strong>Hello ${receiverName},</strong></p>
            <p><strong>${fromName}</strong> has sent you a direct message on the Edworld Co. verified networking platform:</p>
            <blockquote style="border-left: 3px solid #00D2B4; padding-left: 12px; margin: 16px 0; color: #4B5563; font-style: italic;">
              "${trimmedMsg.slice(0, 200)}${trimmedMsg.length > 200 ? "..." : ""}"
            </blockquote>
            <p>Log in to your workspace to reply and continue your professional conversation.</p>
          `,
          ctaText: "Open Message on Edworld Co.",
          ctaUrl: "https://edworld.co/networking",
          footerNote: "This notification was sent because you are registered on Edworld Co. Verified Networking.",
        });

        await sendEmailNotification({
          to: receiverEmail,
          subject: `💬 New Direct Message from ${fromName} on Edworld Co.`,
          html: emailHtml,
          category: "system",
        });
      }
    } catch (emailErr) {
      console.warn("Direct message email notification note:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        senderId: actualSenderId,
        receiverId,
        message: trimmedMsg,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("POST direct_messages error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to send message." },
      { status: 500 }
    );
  }
}

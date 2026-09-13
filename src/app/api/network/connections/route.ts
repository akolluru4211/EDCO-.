import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing user authentication." }, { status: 401 });
    }

    const { data: conns, error } = await supabase
      .from("connections")
      .select(`
        id,
        requester_id,
        receiver_id,
        status,
        request_type,
        message,
        created_at,
        updated_at
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!conns || conns.length === 0) {
      return NextResponse.json({
        success: true,
        connections: [],
        pendingReceived: [],
        pendingSent: [],
        count: 0
      });
    }

    // Collect all partner user IDs to fetch their live profiles
    const partnerIds = Array.from(new Set(
      conns.map((c: any) => (c.requester_id === userId ? c.receiver_id : c.requester_id))
    ));

    const { data: partnerProfiles } = await supabase
      .from("profiles")
      .select("id, name, username, headline, avatar_url, role, career_stage, college, company")
      .in("id", partnerIds);

    const profileMap = new Map<string, any>((partnerProfiles || []).map((p: any) => [p.id, p]));

    const mappedConns = conns.map((c: any) => {
      const isReq = c.requester_id === userId;
      const partnerId = isReq ? c.receiver_id : c.requester_id;
      const partner = profileMap.get(partnerId) || {};
      const normStatus = (c.status || "").toLowerCase();

      return {
        id: c.id,
        requesterId: c.requester_id,
        receiverId: c.receiver_id,
        partnerId,
        partnerName: partner.name || "EdWorld Member",
        partnerUsername: partner.username || "member",
        partnerHeadline: partner.headline || (partner.role === "STUDENT" ? "Student" : "Working Professional"),
        partnerAvatarUrl: partner.avatar_url || null,
        partnerCollege: partner.college,
        partnerCompany: partner.company,
        status: normStatus,
        requestType: c.request_type || "connection",
        message: c.message || "",
        isRequester: isReq,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      };
    });

    const activeConnections = mappedConns.filter((c) => c.status === "accepted");
    const pendingReceived = mappedConns.filter((c) => c.status === "pending" && !c.isRequester);
    const pendingSent = mappedConns.filter((c) => c.status === "pending" && c.isRequester);

    return NextResponse.json({
      success: true,
      connections: activeConnections,
      pendingReceived,
      pendingSent,
      count: activeConnections.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const targetUserId = body.receiverId || body.targetUserId || body.recipientId;
    const message = (body.message || "").trim();
    const requestType = body.requestType || "connection";

    if (!userId || !targetUserId) {
      return NextResponse.json({ success: false, error: "Missing requester or receiver ID." }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ success: false, error: "Cannot create a connection with yourself." }, { status: 400 });
    }

    // Check if target user has blocked requester or vice versa
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("id")
      .or(`and(blocker_id.eq.${userId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${userId})`);

    if (blocks && blocks.length > 0) {
      return NextResponse.json({ success: false, error: "Unable to connect with this member." }, { status: 403 });
    }

    // Check for existing connection
    const { data: existing } = await supabase
      .from("connections")
      .select("id, status, requester_id, receiver_id")
      .or(`and(requester_id.eq.${userId},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${userId})`)
      .maybeSingle();

    if (existing) {
      const status = (existing.status || "").toUpperCase();
      if (status === "ACCEPTED") {
        return NextResponse.json({ success: true, message: "Already connected.", connection: existing });
      }
      if (status === "PENDING") {
        return NextResponse.json({ success: true, message: "Connection request is already pending.", connection: existing });
      }
      // If declined previously, reactivate request
      const { data: updated, error: updateErr } = await supabase
        .from("connections")
        .update({
          requester_id: userId,
          receiver_id: targetUserId,
          status: "PENDING",
          message,
          request_type: requestType,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, connection: updated, message: "Connection request sent." });
    }

    // Create new connection request
    const { data: created, error: insertErr } = await supabase
      .from("connections")
      .insert({
        requester_id: userId,
        receiver_id: targetUserId,
        status: "PENDING",
        request_type: requestType,
        message: message || null
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, connection: created, message: "Connection request sent." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const connectionId = body.connectionId;
    const action = (body.action || "").toLowerCase(); // "accept" | "decline"

    if (!userId || !connectionId || !["accept", "decline"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid parameters for connection response." }, { status: 400 });
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "DECLINED";

    const { data, error } = await supabase
      .from("connections")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", connectionId)
      .eq("receiver_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, connection: data, action: newStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    const connectionId = req.nextUrl.searchParams.get("connectionId");
    const targetUserId = req.nextUrl.searchParams.get("targetUserId");

    if (!userId || (!connectionId && !targetUserId)) {
      return NextResponse.json({ success: false, error: "Missing user identification or connection identifier." }, { status: 400 });
    }

    let query = supabase.from("connections").delete();

    if (connectionId) {
      query = query.eq("id", connectionId).or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
    } else if (targetUserId) {
      query = query.or(`and(requester_id.eq.${userId},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${userId})`);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Connection removed successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

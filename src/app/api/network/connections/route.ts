import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db-server";
import { 
  sendConnectionRequestNotification, 
  sendConnectionAcceptedNotification 
} from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized: Missing user authentication." }, { status: 401 });
    }

    const pool = getDbPool();

    // Fetch all connections where user is requester or recipient
    const connsRes = await pool.query(
      `SELECT id, requester_id, recipient_id, status, type, note, created_at, updated_at
       FROM public.connections
       WHERE requester_id = $1 OR recipient_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    const conns = connsRes.rows || [];
    if (conns.length === 0) {
      return NextResponse.json({
        success: true,
        connections: [],
        pendingReceived: [],
        pendingSent: [],
        count: 0
      });
    }

    // Collect all partner user IDs
    const partnerIds = Array.from(new Set(
      conns.map((c: any) => (c.requester_id === userId ? c.recipient_id : c.requester_id))
    ));

    // Fetch live partner profiles
    const partnersRes = await pool.query(
      `SELECT id, name, username, headline, bio, grade_level, career_stage
       FROM public.profiles
       WHERE id = ANY($1::uuid[])`,
      [partnerIds]
    );

    const profileMap = new Map<string, any>((partnersRes.rows || []).map((p: any) => [p.id, p]));

    const mappedConns = conns.map((c: any) => {
      const isReq = c.requester_id === userId;
      const partnerId = isReq ? c.recipient_id : c.requester_id;
      const partner = profileMap.get(partnerId) || {};
      const normStatus = (c.status || "").toLowerCase();

      return {
        id: c.id,
        requesterId: c.requester_id,
        receiverId: c.recipient_id,
        partnerId,
        partnerName: partner.name || "EdWorld Member",
        partnerUsername: partner.username || "member",
        partnerHeadline: partner.headline || (partner.career_stage === "college" ? "Student" : "Working Professional"),
        partnerAvatarUrl: null,
        partnerCollege: partner.grade_level,
        status: normStatus,
        requestType: c.type || "connection",
        message: c.note || "",
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
    console.error("[Connections GET Error]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = req.headers.get("x-user-id") || body.userId;
    const targetUserId = body.receiverId || body.targetUserId || body.recipientId;
    const message = (body.message || "").trim();
    const rawType = (body.requestType || body.type || "").toLowerCase();
    const validConnType = rawType === "mentorship" ? "mentorship" : "peer";

    if (!userId || !targetUserId) {
      return NextResponse.json({ success: false, error: "Missing requester or recipient ID." }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ success: false, error: "Cannot create a connection with yourself." }, { status: 400 });
    }

    const pool = getDbPool();

    // Check user blocks
    const blockCheck = await pool.query(
      `SELECT id FROM public.user_blocks 
       WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
      [userId, targetUserId]
    );

    if (blockCheck.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Unable to connect with this member." }, { status: 403 });
    }

    // Check existing connection
    const existingRes = await pool.query(
      `SELECT id, status, requester_id, recipient_id FROM public.connections
       WHERE (requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1)`,
      [userId, targetUserId]
    );

    const existing = existingRes.rows[0];

    if (existing) {
      const status = (existing.status || "").toLowerCase();
      if (status === "accepted") {
        return NextResponse.json({ success: true, message: "Already connected.", connection: existing });
      }
      if (status === "pending") {
        return NextResponse.json({ success: true, message: "Connection request is already pending.", connection: existing });
      }

      // Reactivate previously declined/removed connection
      const updateRes = await pool.query(
        `UPDATE public.connections
         SET requester_id = $1, recipient_id = $2, status = 'pending', note = $3, type = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [userId, targetUserId, message || null, validConnType, existing.id]
      );

      notifyConnectionRequest(userId, targetUserId, message);
      return NextResponse.json({ success: true, connection: updateRes.rows[0], message: "Connection request sent." });
    }

    // Insert new connection request
    const insertRes = await pool.query(
      `INSERT INTO public.connections (id, requester_id, recipient_id, status, type, note, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 'pending', $3, $4, NOW(), NOW())
       RETURNING *`,
      [userId, targetUserId, validConnType, message || null]
    );

    notifyConnectionRequest(userId, targetUserId, message);
    return NextResponse.json({ success: true, connection: insertRes.rows[0], message: "Connection request sent." });
  } catch (err: any) {
    console.error("[Connections POST Error]:", err);
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

    const newStatus = action === "accept" ? "accepted" : "declined";
    const pool = getDbPool();

    const updateRes = await pool.query(
      `UPDATE public.connections
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND recipient_id = $3
       RETURNING *`,
      [newStatus, connectionId, userId]
    );

    const updated = updateRes.rows[0];
    if (!updated) {
      return NextResponse.json({ success: false, error: "Connection request not found or not addressed to you." }, { status: 404 });
    }

    if (newStatus === "accepted") {
      notifyConnectionAccepted(updated);
    }

    return NextResponse.json({ success: true, connection: updated, action: newStatus });
  } catch (err: any) {
    console.error("[Connections PUT Error]:", err);
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

    const pool = getDbPool();

    if (connectionId) {
      await pool.query(
        `DELETE FROM public.connections WHERE id = $1 AND (requester_id = $2 OR recipient_id = $2)`,
        [connectionId, userId]
      );
    } else if (targetUserId) {
      await pool.query(
        `DELETE FROM public.connections 
         WHERE (requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1)`,
        [userId, targetUserId]
      );
    }

    return NextResponse.json({ success: true, message: "Connection removed successfully." });
  } catch (err: any) {
    console.error("[Connections DELETE Error]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

async function notifyConnectionRequest(reqUserId: string, targetUserId: string, msg?: string) {
  try {
    const pool = getDbPool();
    const profilesRes = await pool.query(
      `SELECT id, name, email, headline, username, grade_level FROM public.profiles WHERE id = ANY($1::uuid[])`,
      [[reqUserId, targetUserId]]
    );

    const profiles = profilesRes.rows || [];
    const reqProfile = profiles.find((p: any) => p.id === reqUserId);
    const targetProfile = profiles.find((p: any) => p.id === targetUserId);

    if (targetProfile?.email) {
      await sendConnectionRequestNotification({
        recipientEmail: targetProfile.email,
        recipientName: targetProfile.name || targetProfile.username || "EdWorld Member",
        requesterName: reqProfile?.name || reqProfile?.username || "A fellow member",
        requesterHeadline: reqProfile?.headline || undefined,
        requesterCollegeOrCompany: reqProfile?.grade_level || undefined,
        message: msg || undefined,
      });
    }
  } catch (err) {
    console.warn("[Connection Request Email Dispatch Note]:", err);
  }
}

async function notifyConnectionAccepted(connectionRecord: any) {
  try {
    const pool = getDbPool();
    const originalRequesterId = connectionRecord.requester_id;
    const originalReceiverId = connectionRecord.recipient_id;

    const profilesRes = await pool.query(
      `SELECT id, name, email, headline, username, grade_level FROM public.profiles WHERE id = ANY($1::uuid[])`,
      [[originalRequesterId, originalReceiverId]]
    );

    const profiles = profilesRes.rows || [];
    const reqProfile = profiles.find((p: any) => p.id === originalRequesterId);
    const receiverProfile = profiles.find((p: any) => p.id === originalReceiverId);

    if (reqProfile?.email) {
      await sendConnectionAcceptedNotification({
        requesterEmail: reqProfile.email,
        requesterName: reqProfile.name || reqProfile.username || "EdWorld Member",
        accepterName: receiverProfile?.name || receiverProfile?.username || "Your connection",
        accepterHeadline: receiverProfile?.headline || undefined,
        accepterCollegeOrCompany: receiverProfile?.grade_level || undefined,
      });
    }
  } catch (err) {
    console.warn("[Connection Accepted Email Dispatch Note]:", err);
  }
}

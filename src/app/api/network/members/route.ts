import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db-server";
import { PublicUserProfile } from "@/lib/types";
import { formatEdId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId") || null;
    const networkType = (req.nextUrl.searchParams.get("type") || "all").toLowerCase();
    const searchQuery = (req.nextUrl.searchParams.get("query") || "").trim().toLowerCase();
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0", 10), 0);

    const pool = getDbPool();

    // 1. Fetch active blocks involving current user (both blocked by and blocker)
    const blockedUserIds: string[] = [];
    if (currentUserId) {
      try {
        const blocksRes = await pool.query(
          `SELECT blocker_id, blocked_id FROM public.user_blocks WHERE blocker_id = $1 OR blocked_id = $1`,
          [currentUserId]
        );
        blocksRes.rows.forEach((b: any) => {
          blockedUserIds.push(b.blocker_id === currentUserId ? b.blocked_id : b.blocker_id);
        });
      } catch (blockErr) {
        console.warn("[User Blocks Query Note]:", blockErr);
      }
    }

    // 2. Query all registered members from profiles joined with users
    const membersRes = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.username,
        p.headline,
        p.bio,
        p.grade_level,
        p.career_stage,
        p.interests,
        p.is_mentor,
        p.mentor_tags,
        p.is_public,
        p.created_at,
        u.grade,
        u.is_admin,
        u.is_employer
      FROM public.profiles p
      LEFT JOIN public.users u ON u.id = p.id
      ORDER BY p.created_at DESC
    `);

    const rawProfiles = membersRes.rows || [];

    // Filter out current user and blocked users
    const validProfiles = rawProfiles.filter((p: any) => {
      if (currentUserId && p.id === currentUserId) return false;
      if (blockedUserIds.includes(p.id)) return false;
      return true;
    });

    // 3. Fetch connections involving current user using recipient_id
    const connectionMap = new Map<string, { id: string; status: string; isRequester: boolean }>();
    const currentUserAcceptedConnectionSet = new Set<string>();

    if (currentUserId) {
      try {
        const userConnsRes = await pool.query(
          `SELECT id, requester_id, recipient_id, status FROM public.connections WHERE requester_id = $1 OR recipient_id = $1`,
          [currentUserId]
        );

        userConnsRes.rows.forEach((c: any) => {
          const isReq = c.requester_id === currentUserId;
          const targetId = isReq ? c.recipient_id : c.requester_id;
          const normStatus = (c.status || "").toUpperCase();

          connectionMap.set(targetId, {
            id: c.id,
            status: normStatus,
            isRequester: isReq,
          });

          if (normStatus === "ACCEPTED") {
            currentUserAcceptedConnectionSet.add(targetId);
          }
        });
      } catch (connErr) {
        console.warn("[User Connections Query Note]:", connErr);
      }
    }

    // 4. Fetch all accepted connections for calculating mutual connections
    const userToAcceptedSet = new Map<string, Set<string>>();
    try {
      const allAcceptedConns = await pool.query(
        `SELECT requester_id, recipient_id FROM public.connections WHERE UPPER(status) = 'ACCEPTED'`
      );

      allAcceptedConns.rows.forEach((c: any) => {
        if (!userToAcceptedSet.has(c.requester_id)) userToAcceptedSet.set(c.requester_id, new Set());
        if (!userToAcceptedSet.has(c.recipient_id)) userToAcceptedSet.set(c.recipient_id, new Set());
        userToAcceptedSet.get(c.requester_id)!.add(c.recipient_id);
        userToAcceptedSet.get(c.recipient_id)!.add(c.requester_id);
      });
    } catch (allConnsErr) {
      console.warn("[All Accepted Connections Note]:", allConnsErr);
    }

    // 5. Map and classify profiles into rich PublicUserProfile objects
    const mappedMembers: PublicUserProfile[] = validProfiles.map((p: any) => {
      const pId = p.id;
      const rawStage = (p.career_stage || "").toLowerCase();
      const rawGrade = (p.grade_level || p.grade || "").toLowerCase();

      const isStudent =
        rawStage === "college" ||
        rawStage === "student" ||
        rawGrade.includes("college") ||
        rawGrade.includes("year") ||
        rawGrade.includes("class") ||
        rawStage !== "working_professional";

      const userType: "STUDENT" | "WORKING_PROFESSIONAL" = isStudent ? "STUDENT" : "WORKING_PROFESSIONAL";

      // Parse skills safely from interests JSON array
      let parsedSkills: string[] = [];
      if (Array.isArray(p.interests)) {
        parsedSkills = p.interests.map((i: any) => (typeof i === "string" ? i : i.name || i.id)).filter(Boolean);
      }
      if (parsedSkills.length === 0) {
        parsedSkills = isStudent ? ["Computer Science", "DSA", "Web Development"] : ["Software Engineering", "System Design", "Cloud"];
      }

      // Compute mutual connections with current user
      let mutualCount = 0;
      if (currentUserId && currentUserAcceptedConnectionSet.size > 0 && userToAcceptedSet.has(pId)) {
        const targetConns = userToAcceptedSet.get(pId)!;
        currentUserAcceptedConnectionSet.forEach((friendId) => {
          if (friendId !== pId && targetConns.has(friendId)) {
            mutualCount++;
          }
        });
      }

      // Resolve connection status
      let connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted" | "declined" | "blocked" = "none";
      let connectionId: string | undefined;

      if (connectionMap.has(pId)) {
        const conn = connectionMap.get(pId)!;
        connectionId = conn.id;
        if (conn.status === "ACCEPTED") connectionStatus = "accepted";
        else if (conn.status === "PENDING") connectionStatus = conn.isRequester ? "pending_sent" : "pending_received";
        else if (conn.status === "DECLINED") connectionStatus = "declined";
        else if (conn.status === "BLOCKED") connectionStatus = "blocked";
      }

      const displayName = p.name || (p.email ? p.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ") : "EdWorld Member");
      const displayUsername = p.username || displayName.toLowerCase().replace(/\s+/g, "_");
      const defaultHeadline = isStudent
        ? `Student & Emerging Technologist • ${p.grade || p.grade_level || "College"}`
        : "Software Engineering & Technology Professional";

      return {
        userId: p.id,
        edId: formatEdId(p.id),
        username: displayUsername,
        name: displayName,
        avatarUrl: p.avatar_url || undefined,
        headline: p.headline || defaultHeadline,
        bio: p.bio || `Passionate about building software, peer collaboration, and engineering excellence.`,
        role: userType,
        userType,
        college: p.grade_level || p.grade || (isStudent ? "University / College" : undefined),
        degree: isStudent ? "B.Tech / B.E." : undefined,
        currentRole: !isStudent ? (p.headline || "Software Engineer") : undefined,
        company: !isStudent ? "Technology" : undefined,
        skills: parsedSkills,
        timetable: [
          { id: "t-1", timeOfDay: "Morning (09:00 - 11:00)", focus: "Core CS & DSA Drills", duration: "2 hrs" },
          { id: "t-2", timeOfDay: "Afternoon (14:00 - 16:00)", focus: "Project Engineering & System Design", duration: "2 hrs" },
          { id: "t-3", timeOfDay: "Evening (18:00 - 19:30)", focus: "STAR Behavioral & Mock Interview", duration: "1.5 hrs" }
        ],
        isPublic: true,
        visibility: "PUBLIC",
        showInNetwork: true,
        isMentor: Boolean(p.is_mentor),
        mentorTags: p.mentor_tags || [],
        ageBand: p.age_band || "18+",
        mutualConnectionsCount: mutualCount,
        connectionStatus,
        connectionId,
      };
    });

    // 6. Apply search query across real database fields
    let filtered = mappedMembers;
    if (searchQuery) {
      filtered = mappedMembers.filter((m) => {
        const matchName = m.name.toLowerCase().includes(searchQuery);
        const matchUsername = m.username.toLowerCase().includes(searchQuery);
        const matchEdId = (m.edId || "").toLowerCase().includes(searchQuery);
        const matchHeadline = (m.headline || "").toLowerCase().includes(searchQuery);
        const matchBio = (m.bio || "").toLowerCase().includes(searchQuery);
        const matchSkills = (m.skills || []).some((s) => s.toLowerCase().includes(searchQuery));
        return matchName || matchUsername || matchEdId || matchHeadline || matchBio || matchSkills;
      });
    }

    // 7. Separate into students and professionals
    const students = filtered.filter((m) => m.userType === "STUDENT");
    const professionals = filtered.filter((m) => m.userType === "WORKING_PROFESSIONAL");

    let resultMembers = filtered;
    if (networkType === "student" || networkType === "students") {
      resultMembers = students;
    } else if (networkType === "professional" || networkType === "professionals" || networkType === "working_professional") {
      resultMembers = professionals;
    }

    const paginated = resultMembers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      students: students.slice(0, 50),
      professionals: professionals.slice(0, 50),
      members: paginated,
      total: resultMembers.length,
      counts: {
        total: mappedMembers.length,
        students: students.length,
        professionals: professionals.length,
      },
    });
  } catch (err: any) {
    console.error("[Network Members Exception]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

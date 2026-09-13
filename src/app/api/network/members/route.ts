import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PublicUserProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");
    const networkType = (req.nextUrl.searchParams.get("type") || "all").toLowerCase(); // "all" | "student" | "professional"
    const searchQuery = (req.nextUrl.searchParams.get("query") || "").trim().toLowerCase();
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50", 10), 100);
    const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0", 10), 0);

    // 1. Fetch active blocks involving current user (both blocked by and blocker)
    let blockedUserIds: string[] = [];
    if (currentUserId) {
      const { data: blocks } = await supabase
        .from("user_blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      if (blocks && blocks.length > 0) {
        blockedUserIds = blocks.map((b: any) =>
          b.blocker_id === currentUserId ? b.blocked_id : b.blocker_id
        );
      }
    }

    // 2. Query discoverable real profiles from Supabase
    let query = supabase
      .from("profiles")
      .select("*")
      .neq("visibility", "PRIVATE")
      .neq("visibility", "private");

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    const { data: rawProfiles, error } = await query;

    if (error) {
      console.error("[Network Members Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!rawProfiles || rawProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
        professionals: [],
        members: [],
        total: 0
      });
    }

    // 3. Filter out blocked users and private/hidden profiles
    const validProfiles = rawProfiles.filter((p: any) => {
      if (blockedUserIds.includes(p.id)) return false;
      if (p.show_in_network === false) return false;
      if (p.visibility === "PRIVATE" || p.visibility === "private") return false;
      return true;
    });

    // 4. Fetch connections of current user to compute accurate connection statuses
    const connectionMap = new Map<string, { id: string; status: string; isRequester: boolean }>();
    const currentUserAcceptedConnectionSet = new Set<string>();

    if (currentUserId) {
      const { data: userConns } = await supabase
        .from("connections")
        .select("id, requester_id, receiver_id, status")
        .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      if (userConns) {
        userConns.forEach((c: any) => {
          const isReq = c.requester_id === currentUserId;
          const targetId = isReq ? c.receiver_id : c.requester_id;
          const normStatus = (c.status || "").toUpperCase();

          connectionMap.set(targetId, {
            id: c.id,
            status: normStatus,
            isRequester: isReq
          });

          if (normStatus === "ACCEPTED") {
            currentUserAcceptedConnectionSet.add(targetId);
          }
        });
      }
    }

    // 5. Fetch all accepted connections for calculating real mutual connections
    const { data: allAcceptedConns } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .eq("status", "ACCEPTED");

    const userToAcceptedSet = new Map<string, Set<string>>();
    if (allAcceptedConns) {
      allAcceptedConns.forEach((c: any) => {
        if (!userToAcceptedSet.has(c.requester_id)) userToAcceptedSet.set(c.requester_id, new Set());
        if (!userToAcceptedSet.has(c.receiver_id)) userToAcceptedSet.set(c.receiver_id, new Set());
        userToAcceptedSet.get(c.requester_id)!.add(c.receiver_id);
        userToAcceptedSet.get(c.receiver_id)!.add(c.requester_id);
      });
    }

    // 6. Map and classify profiles
    const mappedMembers: PublicUserProfile[] = validProfiles.map((p: any) => {
      const pId = p.id;
      const rawRole = (p.role || "").toUpperCase();
      const rawStage = (p.career_stage || "").toUpperCase();
      const isStudent =
        rawRole === "STUDENT" ||
        rawStage === "STUDENT" ||
        rawStage === "COLLEGE" ||
        (p.grade_level && (p.grade_level.toLowerCase().includes("college") || p.grade_level.toLowerCase().includes("class"))) ||
        Boolean(p.college && !p.company);

      const userType: "STUDENT" | "WORKING_PROFESSIONAL" = isStudent ? "STUDENT" : "WORKING_PROFESSIONAL";

      // Parse skills safely
      let parsedSkills: string[] = [];
      if (Array.isArray(p.skills)) {
        parsedSkills = p.skills;
      } else if (Array.isArray(p.interests)) {
        parsedSkills = p.interests.map((i: any) => (typeof i === "string" ? i : i.name || i.id));
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

      const showCollege = p.show_college !== false;
      const showExp = p.show_experience !== false;
      const showSkills = p.show_skills !== false;
      const showLoc = p.is_location_visible !== false;

      return {
        userId: p.id,
        username: p.username || (p.name ? p.name.toLowerCase().replace(/\s+/g, "_") : p.id.slice(0, 8)),
        name: p.name || "EdWorld Member",
        avatarUrl: p.avatar_url || null,
        headline: p.headline || (isStudent ? "Student and Emerging Technologist" : "Working Professional"),
        bio: p.bio || "",
        role: rawRole || (isStudent ? "STUDENT" : "WORKING_PROFESSIONAL"),
        userType,
        college: showCollege ? (p.college || (p.grade_level ? p.grade_level : undefined)) : undefined,
        degree: showCollege ? (p.degree || undefined) : undefined,
        branch: showCollege ? (p.branch || undefined) : undefined,
        graduationYear: showCollege ? (p.graduation_year || undefined) : undefined,
        currentRole: showExp ? (p.job_title || undefined) : undefined,
        company: showExp ? (p.company || undefined) : undefined,
        industry: showExp ? (p.industry || undefined) : undefined,
        experienceYears: showExp ? (p.experience_years || undefined) : undefined,
        location: showLoc ? (p.location || undefined) : undefined,
        isLocationVisible: showLoc,
        skills: showSkills ? parsedSkills : [],
        isPublic: p.is_public !== false,
        visibility: p.visibility || "PUBLIC",
        showInNetwork: p.show_in_network !== false,
        isMentor: Boolean(p.is_mentor),
        mentorTags: p.mentor_tags || [],
        ageBand: p.age_band || "18+",
        mutualConnectionsCount: mutualCount,
        connectionStatus,
        connectionId
      };
    });

    // 7. Apply search query across real database fields
    let filtered = mappedMembers;
    if (searchQuery) {
      filtered = mappedMembers.filter((m) => {
        const matchName = m.name.toLowerCase().includes(searchQuery);
        const matchUsername = m.username.toLowerCase().includes(searchQuery);
        const matchHeadline = (m.headline || "").toLowerCase().includes(searchQuery);
        const matchBio = (m.bio || "").toLowerCase().includes(searchQuery);
        const matchCollege = (m.college || "").toLowerCase().includes(searchQuery);
        const matchDegree = (m.degree || "").toLowerCase().includes(searchQuery);
        const matchBranch = (m.branch || "").toLowerCase().includes(searchQuery);
        const matchCompany = (m.company || "").toLowerCase().includes(searchQuery);
        const matchRole = (m.currentRole || "").toLowerCase().includes(searchQuery);
        const matchIndustry = (m.industry || "").toLowerCase().includes(searchQuery);
        const matchLocation = (m.location || "").toLowerCase().includes(searchQuery);
        const matchSkills = (m.skills || []).some((s) => s.toLowerCase().includes(searchQuery));

        return (
          matchName ||
          matchUsername ||
          matchHeadline ||
          matchBio ||
          matchCollege ||
          matchDegree ||
          matchBranch ||
          matchCompany ||
          matchRole ||
          matchIndustry ||
          matchLocation ||
          matchSkills
        );
      });
    }

    // 8. Separate into students and professionals
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
        professionals: professionals.length
      }
    });
  } catch (err: any) {
    console.error("[Network Members Exception]:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal error" }, { status: 500 });
  }
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import { PublicUserProfile } from "@/lib/types";
import ReportModal from "@/components/networking/ReportModal";
import ConnectionRequestModal from "@/components/networking/ConnectionRequestModal";
import { 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  GitBranch, 
  Briefcase, 
  UserPlus, 
  MessageSquare, 
  Flag, 
  Ban, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  FolderGit2, 
  AlertCircle,
  ArrowRight,
  UserX,
  Users
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { normalizeDisplayName } from "@/lib/services/user-profile";

export const dynamic = "force-dynamic";

export default function PublicProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const usernameParam = (params?.username as string) || "";

  const [profileData, setProfileData] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending_sent" | "pending_received" | "accepted" | "declined" | "blocked">("none");
  const [isBlocked, setIsBlocked] = useState(false);
  const [mutualCount, setMutualCount] = useState<number>(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwnProfile = user && profileData && user.uid === profileData.userId;
  const isCurrentUserAdult = user?.ageBand === "18+";

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // 1. Fetch live profile from Supabase
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .or(`username.eq.${usernameParam},id.eq.${usernameParam}`)
          .maybeSingle();

        if (dbProfile) {
          const targetId = dbProfile.id || dbProfile.user_id;

          // Check if user is blocked
          if (user) {
            const { data: blockRecord } = await supabase
              .from("user_blocks")
              .select("id")
              .or(`and(blocker_id.eq.${user.uid},blocked_id.eq.${targetId}),and(blocker_id.eq.${targetId},blocked_id.eq.${user.uid})`)
              .maybeSingle();

            if (blockRecord) {
              setIsBlocked(true);
              setLoading(false);
              return;
            }
          }

          // Fetch real projects for this user
          const { data: dbProjects } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", targetId)
            .eq("is_public", true);

          // Fetch connection status with current user
          if (user && user.uid !== targetId) {
            const { data: conn } = await supabase
              .from("connections")
              .select("id, requester_id, receiver_id, status")
              .or(`and(requester_id.eq.${user.uid},receiver_id.eq.${targetId}),and(requester_id.eq.${targetId},receiver_id.eq.${user.uid})`)
              .maybeSingle();

            if (conn) {
              const norm = (conn.status || "").toUpperCase();
              if (norm === "ACCEPTED") setConnectionStatus("accepted");
              else if (norm === "PENDING") {
                setConnectionStatus(conn.requester_id === user.uid ? "pending_sent" : "pending_received");
              } else if (norm === "DECLINED") setConnectionStatus("declined");
              else if (norm === "BLOCKED") setConnectionStatus("blocked");
            }

            // Fetch mutual connections count
            const { data: userConns } = await supabase
              .from("connections")
              .select("requester_id, receiver_id")
              .eq("status", "ACCEPTED")
              .or(`requester_id.eq.${user.uid},receiver_id.eq.${user.uid}`);

            const { data: targetConns } = await supabase
              .from("connections")
              .select("requester_id, receiver_id")
              .eq("status", "ACCEPTED")
              .or(`requester_id.eq.${targetId},receiver_id.eq.${targetId}`);

            if (userConns && targetConns) {
              const myFriends = new Set(
                userConns.map((c: any) => (c.requester_id === user.uid ? c.receiver_id : c.requester_id))
              );
              const targetFriends = new Set(
                targetConns.map((c: any) => (c.requester_id === targetId ? c.receiver_id : c.requester_id))
              );
              let mutuals = 0;
              myFriends.forEach((fId) => {
                if (fId !== targetId && targetFriends.has(fId)) mutuals++;
              });
              setMutualCount(mutuals);
            }
          }

          const { displayName } = normalizeDisplayName(dbProfile.first_name, dbProfile.last_name, dbProfile.name || dbProfile.display_name);

          const mappedProjects = (dbProjects || []).map((p: any) => ({
            id: p.id,
            title: p.title || "Untitled Project",
            description: p.description || "",
            technologies: p.skills || [],
            githubRepo: p.github_url || null,
            liveDemoUrl: p.live_url || null,
            verificationStatus: p.is_verified ? "verified" : "unverified",
          }));

          let parsedSkills: string[] = [];
          if (Array.isArray(dbProfile.skills)) {
            parsedSkills = dbProfile.skills;
          } else if (Array.isArray(dbProfile.interests)) {
            parsedSkills = dbProfile.interests.map((i: any) => typeof i === "string" ? i : i.name || i.id);
          }

          const rawRole = (dbProfile.role || "").toUpperCase();
          const rawStage = (dbProfile.career_stage || "").toUpperCase();
          const isStudent =
            rawRole === "STUDENT" ||
            rawStage === "STUDENT" ||
            rawStage === "COLLEGE" ||
            Boolean(dbProfile.college && !dbProfile.company);

          const found: PublicUserProfile = {
            userId: targetId,
            username: dbProfile.username || usernameParam,
            name: displayName || dbProfile.name || "EdWorld Member",
            avatarUrl: dbProfile.avatar_url || null,
            headline: dbProfile.headline || (isStudent ? "Student & Emerging Technologist" : "Working Professional"),
            bio: dbProfile.bio || "",
            role: rawRole || (isStudent ? "STUDENT" : "WORKING_PROFESSIONAL"),
            userType: isStudent ? "STUDENT" : "WORKING_PROFESSIONAL",
            college: dbProfile.college || (dbProfile.grade_level ? dbProfile.grade_level : undefined),
            degree: dbProfile.degree || undefined,
            branch: dbProfile.branch || undefined,
            graduationYear: dbProfile.graduation_year || undefined,
            currentRole: dbProfile.job_title || undefined,
            company: dbProfile.company || undefined,
            industry: dbProfile.industry || undefined,
            experienceYears: dbProfile.experience_years || undefined,
            location: dbProfile.location || undefined,
            isLocationVisible: dbProfile.is_location_visible !== false,
            skills: parsedSkills,
            projects: mappedProjects,
            githubUrl: dbProfile.github_url || undefined,
            linkedinUrl: dbProfile.linkedin_url || undefined,
            leetcodeUrl: dbProfile.leetcode_url || undefined,
            portfolioUrl: dbProfile.portfolio_url || undefined,
            isPublic: dbProfile.is_public !== false,
            visibility: dbProfile.visibility || "PUBLIC",
            isMentor: Boolean(dbProfile.is_mentor),
            mentorTags: dbProfile.mentor_tags || [],
            ageBand: dbProfile.age_band || "18+",
            mutualConnectionsCount: mutualCount,
            connectionStatus
          };

          setProfileData(found);
          setLoading(false);
          return;
        }

        // No profile found
        setProfileData(null);
      } catch (err) {
        console.warn("[Portfolio Load Note]", err);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [usernameParam, user]);

  const handleSendConnection = async (data: any) => {
    if (!user || !profileData) return;
    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          receiverId: profileData.userId,
          message: data.message,
          requestType: data.requestType
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        setConnectionStatus("pending_sent");
      }
    } catch (e) {
      console.error("Connection error:", e);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !profileData) return;
    if (!confirm(`Are you sure you want to block ${profileData.name}?`)) return;
    try {
      await fetch("/api/network/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({ blockedId: profileData.userId })
      });
      setIsBlocked(true);
    } catch (e) {
      console.error("Block error:", e);
    }
  };

  const handleReportUser = async (reportData: any) => {
    if (!user || !profileData) return;
    try {
      await fetch("/api/network/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          reportedId: profileData.userId,
          category: reportData.type,
          reason: reportData.reason
        })
      });
    } catch (e) {
      console.error("Report error:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-paper">
        <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Profile Not Found State
  if (!profileData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-paper-soft border border-line text-ink-muted flex items-center justify-center mx-auto">
            <UserX className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-display text-ink">User Profile Not Found</h1>
            <p className="text-xs text-ink-soft leading-relaxed">
              The profile for &ldquo;{usernameParam}&rdquo; does not exist or has not been made publicly visible.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // 2. Private Profile or Minor Safety Isolation Gate
  if (!profileData.isPublic && !isOwnProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-forest/10 text-forest">
              Private Profile
            </span>
            <h1 className="text-xl font-bold font-display text-ink">This Profile is Private</h1>
            <p className="text-xs text-ink-soft leading-relaxed">
              This learner has set their portfolio to private mode. Private information is strictly protected by database Row-Level Security.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // 3. Blocked State
  if (isBlocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-paper flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Ban className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-display text-ink">User Blocked</h1>
          <p className="text-xs text-ink-soft">
            You have blocked interactions with this member.
          </p>
          <Link href="/networking" className="inline-block text-xs font-bold text-forest underline">
            Return to Networking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/networking" className="text-xs font-bold text-ink-muted hover:text-ink flex items-center gap-1.5">
            <span>&larr; Back to Directory</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-forest/10 text-forest px-2.5 py-1 rounded-full border border-forest/20">
              Verified Public Portfolio
            </span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-paper-raised rounded-3xl border border-line p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">{profileData.name}</h1>
                {profileData.isMentor && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest text-white">
                    Verified Mentor
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-forest font-bold font-mono">
                @{profileData.username} &bull; {profileData.headline}
              </p>
              {profileData.bio && (
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed max-w-xl">
                  {profileData.bio}
                </p>
              )}
              {mutualCount > 0 && (
                <div className="text-[11px] font-mono text-forest font-bold flex items-center gap-1 pt-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{mutualCount} mutual connection{mutualCount === 1 ? "" : "s"}</span>
                </div>
              )}
            </div>

            {/* Actions for other users */}
            {!isOwnProfile && user && (
              <div className="flex items-center gap-2 shrink-0">
                {connectionStatus === "none" && (
                  <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-4 py-2 rounded-xl bg-forest hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                )}
                {connectionStatus === "pending_sent" && (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    Request Pending
                  </span>
                )}
                {connectionStatus === "pending_received" && (
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                    Request Received
                  </span>
                )}
                {connectionStatus === "accepted" && (
                  <Link
                    href={`/networking/messages/${[user.uid, profileData.userId].sort().join("_")}`}
                    className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </Link>
                )}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-xl border border-line text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Report Member"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleBlockUser}
                  className="p-2 rounded-xl border border-line text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Block Member"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Academic & Professional Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-line pt-4 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                {profileData.userType === "STUDENT" ? "Academic Details" : "Professional Overview"}
              </span>
              <div className="space-y-1">
                {profileData.userType === "STUDENT" ? (
                  <>
                    <p className="font-medium text-ink">
                      {profileData.college || "College not added"}
                    </p>
                    {profileData.degree && (
                      <p className="text-[11px] text-ink-soft">
                        {profileData.degree} {profileData.branch ? `• ${profileData.branch}` : ""} {profileData.graduationYear ? `(Class of ${profileData.graduationYear})` : ""}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-ink">
                      {profileData.currentRole || "Working Professional"} {profileData.company ? `at ${profileData.company}` : ""}
                    </p>
                    {profileData.industry && (
                      <p className="text-[11px] text-ink-soft">
                        Industry: {profileData.industry} {profileData.experienceYears ? `• ${profileData.experienceYears} years exp` : ""}
                      </p>
                    )}
                  </>
                )}
                {profileData.location && (
                  <p className="text-ink-soft text-[11px]">
                    Location: {profileData.location}
                  </p>
                )}
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Connected Profiles</span>
              <div className="flex flex-col gap-1.5">
                {profileData.githubUrl ? (
                  <a
                    href={profileData.githubUrl.startsWith("http") ? profileData.githubUrl : `https://github.com/${profileData.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-forest hover:underline font-mono"
                  >
                    GitHub: {profileData.githubUrl}
                  </a>
                ) : (
                  <span className="text-[11px] text-ink-muted italic">GitHub not connected</span>
                )}

                {profileData.linkedinUrl ? (
                  <a
                    href={profileData.linkedinUrl.startsWith("http") ? profileData.linkedinUrl : `https://linkedin.com/in/${profileData.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-forest hover:underline font-mono"
                  >
                    LinkedIn Profile
                  </a>
                ) : (
                  <span className="text-[11px] text-ink-muted italic">LinkedIn not connected</span>
                )}

                {profileData.leetcodeUrl ? (
                  <a
                    href={profileData.leetcodeUrl.startsWith("http") ? profileData.leetcodeUrl : `https://leetcode.com/${profileData.leetcodeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-forest hover:underline font-mono"
                  >
                    LeetCode Profile
                  </a>
                ) : (
                  <span className="text-[11px] text-ink-muted italic">LeetCode not connected</span>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Demonstrated Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {profileData.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-paper-soft text-ink text-xs font-medium border border-line">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 border-t border-line pt-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Demonstrated Skills</span>
              <p className="text-xs text-ink-muted italic">No skills added.</p>
            </div>
          )}

          {/* Projects */}
          <div className="space-y-3 border-t border-line pt-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Published Projects</span>
            {profileData.projects && profileData.projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-2xl bg-paper-soft border border-line space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-ink">{proj.title}</h3>
                      {proj.verificationStatus === "verified" && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-forest/10 text-forest">
                          Verified
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-ink-soft line-clamp-2">{proj.description}</p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t: string, i: number) => (
                          <span key={i} className="text-[10px] text-ink-muted font-mono bg-paper px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-ink-muted bg-paper-soft rounded-2xl border border-line">
                No public projects.
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <ConnectionRequestModal
          targetUserId={profileData.userId}
          targetName={profileData.name}
          targetHeadline={profileData.headline}
          isMentor={profileData.isMentor}
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSendRequest={handleSendConnection}
        />

        <ReportModal
          targetType="profile"
          targetId={profileData.userId}
          targetName={profileData.name}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmitReport={handleReportUser}
        />

      </div>
    </div>
  );
}

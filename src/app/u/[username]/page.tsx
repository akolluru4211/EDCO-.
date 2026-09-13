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
  UserX
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
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "accepted" | "declined">("none");
  const [isBlocked, setIsBlocked] = useState(false);
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
          // Fetch real projects for this user
          const { data: dbProjects } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", dbProfile.id || dbProfile.user_id)
            .eq("is_public", true);

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

          const found: PublicUserProfile = {
            userId: dbProfile.id || dbProfile.user_id,
            username: dbProfile.username || usernameParam,
            name: displayName || dbProfile.name || "EdWorld Member",
            headline: dbProfile.headline || "EdWorld Member",
            bio: dbProfile.bio || "",
            skills: (dbProfile.interests || []).map((i: any) => typeof i === "string" ? i : i.name),
            projects: mappedProjects,
            isPublic: Boolean(dbProfile.is_public),
            isMentor: Boolean(dbProfile.is_mentor),
            mentorTags: dbProfile.mentor_tags || [],
            ageBand: dbProfile.age_band || "18+",
          };

          setProfileData(found);
          setLoading(false);
          return;
        }

        // 2. Check local registered profiles if user is inspecting their own session
        if (user) {
          const storedProfileKey = `edworld_profile_${user.uid}`;
          const userProf = localStorage.getItem(storedProfileKey);
          if (userProf) {
            try {
              const p = JSON.parse(userProf);
              const userRaw = JSON.parse(localStorage.getItem(`edworld_user_${user.uid}`) || "{}");
              if (p.username === usernameParam || user.name.toLowerCase().replace(/\s+/g, "_") === usernameParam) {
                const { displayName } = normalizeDisplayName(undefined, undefined, user.name);
                const ownProfile: PublicUserProfile = {
                  userId: user.uid,
                  username: p.username || user.name.toLowerCase().replace(/\s+/g, "_"),
                  name: displayName || user.name,
                  headline: p.headline || "Verified Member",
                  bio: p.bio || "",
                  skills: (p.interests || []).map((i: any) => typeof i === "string" ? i : i.name),
                  projects: [],
                  isPublic: Boolean(p.isPublic),
                  isMentor: Boolean(p.isMentor),
                  mentorTags: p.mentorTags || [],
                  ageBand: userRaw.ageBand || "18+",
                };
                setProfileData(ownProfile);
                setLoading(false);
                return;
              }
            } catch (e) {}
          }
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
    const connections = JSON.parse(localStorage.getItem(`edworld_${user.uid}_connections`) || "[]");
    connections.push({
      id: `${user.uid}_${profileData.userId}`,
      requesterId: user.uid,
      requesterName: user.name,
      recipientId: profileData.userId,
      recipientName: profileData.name,
      status: "pending",
      requestType: data.requestType,
      message: data.message,
      sentAt: new Date().toISOString(),
    });
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(connections));
    setConnectionStatus("pending");
  };

  const handleBlockUser = () => {
    if (!user || !profileData) return;
    const blocks = JSON.parse(localStorage.getItem(`edworld_${user.uid}_blocks`) || "[]");
    if (!blocks.includes(profileData.userId)) {
      blocks.push(profileData.userId);
      localStorage.setItem(`edworld_${user.uid}_blocks`, JSON.stringify(blocks));
    }
    setIsBlocked(true);
  };

  const handleReportUser = async (reportData: any) => {
    if (!user) return;
    const reports = JSON.parse(localStorage.getItem(`edworld_reports`) || "[]");
    reports.push({
      ...reportData,
      reporterId: user.uid,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(`edworld_reports`, JSON.stringify(reports));
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
            </div>

            {/* Actions for other users */}
            {!isOwnProfile && isCurrentUserAdult && (
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
                {connectionStatus === "pending" && (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    Request Pending
                  </span>
                )}
                {connectionStatus === "accepted" && (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-xl border border-line text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Report Member"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
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
                No public projects published yet.
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

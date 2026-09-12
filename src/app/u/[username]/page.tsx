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
  ArrowRight
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { normalizeDisplayName } from "@/lib/services/user-profile";

export const dynamic = "force-dynamic";

// Seeded directory of public demo profiles for instant discovery & testing
const DEMO_PUBLIC_PROFILES: Record<string, PublicUserProfile> = {
  alexrivera: {
    userId: "user-alex-18",
    username: "alexrivera",
    name: "Alex Rivera",
    headline: "Full-Stack Software Engineer & Distributed Systems Enthusiast",
    bio: "Passionate about high-throughput concurrency, TypeScript, and microservice architectures. Building scalable EdTech platforms.",
    skills: ["TypeScript", "Next.js", "Node.js", "Redis", "Distributed Systems", "PostgreSQL"],
    projects: [
      {
        id: "proj-1",
        title: "Distributed Concurrency Engine",
        description: "Optimistic concurrency control layer with Redis pub/sub for real-time state synchronization.",
        technologies: ["TypeScript", "Redis", "Docker", "Node.js"],
        githubRepo: "https://github.com/alexrivera/distributed-concurrency",
        verificationStatus: "verified",
      },
      {
        id: "proj-2",
        title: "Autonomous Algorithmic Trading Simulator",
        description: "Event-driven matching engine in Python with sub-millisecond order execution.",
        technologies: ["Python", "AsyncIO", "FastAPI", "WebSockets"],
        githubRepo: "https://github.com/alexrivera/trading-sim",
        verificationStatus: "verified",
      },
    ],
    isPublic: true,
    isMentor: false,
    ageBand: "18+",
    showResume: true,
  },
  sarah_recruiting: {
    userId: "demo-employer-user-789",
    username: "sarah_recruiting",
    name: "Sarah Jenkins",
    headline: "Head of Engineering Talent @ TechCorp Labs",
    bio: "Hiring verified early-career software engineers and systems apprentices.",
    skills: ["Technical Recruiting", "System Design", "Engineering Leadership"],
    isPublic: true,
    isMentor: true,
    mentorTags: ["Career Strategy", "Resume Reviews", "Behavioral Interview Prep"],
    ageBand: "18+",
  },
  arvind_scale: {
    userId: "user-mentor-1",
    username: "arvind_scale",
    name: "Dr. Arvind Subramanian",
    headline: "Principal Systems Architect @ CloudScale Labs",
    bio: "12+ years in high-volume distributed infrastructure. Mentoring candidates on Level 2 concurrency and system design.",
    skills: ["Distributed Systems", "Kafka", "Go", "AWS", "High Availability"],
    isPublic: true,
    isMentor: true,
    mentorTags: ["System Design", "Distributed Systems", "Staff Engineer Coaching"],
    ageBand: "18+",
  },
  // Private Profile Demo (Testing zero-leakage)
  private_user: {
    userId: "user-private-99",
    username: "private_user",
    name: "Devon Reed",
    headline: "Confidential Senior Architect",
    bio: "Confidential bio details that must NEVER leak when isPublic is false.",
    skills: ["Confidential Skills"],
    isPublic: false,
    ageBand: "18+",
  },
  // Minor Profile Demo (Testing under-18 inaccessible boundary)
  samira_explorer: {
    userId: "demo-minor-user-456",
    username: "samira_explorer",
    name: "Samira Patel",
    headline: "Class 11 STEM Student",
    bio: "High school learner exploring robotics.",
    skills: ["Robotics"],
    isPublic: false,
    ageBand: "16-18",
  },
};

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
      // 1. Check live database first
      try {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .or(`username.eq.${usernameParam},id.eq.${usernameParam}`)
          .maybeSingle();

        if (dbProfile) {
          const { displayName } = normalizeDisplayName(dbProfile.first_name, dbProfile.last_name, dbProfile.name || dbProfile.display_name);
          const found: PublicUserProfile = {
            userId: dbProfile.id || dbProfile.user_id,
            username: dbProfile.username || usernameParam,
            name: displayName || dbProfile.name || "EdWorld Member",
            headline: dbProfile.headline || "EdWorld Verified Learner",
            bio: dbProfile.bio || "Building verifiable technical capabilities on EdWorld.",
            skills: (dbProfile.interests || []).map((i: any) => typeof i === "string" ? i : i.name),
            projects: [],
            isPublic: Boolean(dbProfile.is_public),
            isMentor: Boolean(dbProfile.is_mentor),
            mentorTags: dbProfile.mentor_tags || [],
            ageBand: dbProfile.age_band || "18+",
          };
          setProfileData(found);
          return;
        }
      } catch (err) {
        console.warn("[Portfolio Load Note]", err);
      }

      // 2. Look up profile in demo profiles or localStorage
      let foundProfile: PublicUserProfile | null = DEMO_PUBLIC_PROFILES[usernameParam.toLowerCase()] || null;

      if (!foundProfile && typeof window !== "undefined") {
        // Check local user data
        const localUsersKey = "edworld_all_registered_profiles";
        const cached = localStorage.getItem(localUsersKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed[usernameParam]) {
              foundProfile = parsed[usernameParam];
            }
          } catch (e) {}
        }

        // Check current user if matching username
        if (!foundProfile && user) {
          const storedProfileKey = `edworld_profile_${user.uid}`;
          const userProf = localStorage.getItem(storedProfileKey);
          if (userProf) {
            try {
              const p = JSON.parse(userProf);
              const userRaw = JSON.parse(localStorage.getItem(`edworld_user_${user.uid}`) || "{}");
              if (p.username === usernameParam || user.name.toLowerCase().replace(/\s+/g, "_") === usernameParam) {
                const { displayName } = normalizeDisplayName(undefined, undefined, user.name);
                foundProfile = {
                  userId: user.uid,
                  username: p.username || user.name.toLowerCase().replace(/\s+/g, "_"),
                  name: displayName || user.name,
                  headline: p.headline,
                  bio: p.bio,
                  skills: (p.interests || []).map((i: any) => i.name),
                  projects: [
                    {
                      id: "local-proj-1",
                      title: "Full-Stack Portfolio Project",
                      description: "End-to-end full stack web application with authentication and database persistence.",
                      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
                      verificationStatus: "verified",
                    },
                  ],
                  isPublic: p.isPublic || false,
                  isMentor: p.isMentor || false,
                  mentorTags: p.mentorTags || [],
                  ageBand: userRaw.ageBand || "18+",
                };
              }
            } catch (e) {}
          }
        }
      }

      setProfileData(foundProfile);

      // Check connection and block status
      if (user && foundProfile) {
        const connections = JSON.parse(localStorage.getItem(`edworld_${user.uid}_connections`) || "[]");
        const match = connections.find(
          (c: any) =>
            (c.requesterId === user.uid && c.recipientId === foundProfile?.userId) ||
            (c.recipientId === user.uid && c.requesterId === foundProfile?.userId)
        );
        if (match) {
          setConnectionStatus(match.status);
        }

        const blocks = JSON.parse(localStorage.getItem(`edworld_${user.uid}_blocks`) || "[]");
        if (blocks.includes(foundProfile.userId)) {
          setIsBlocked(true);
        }
      }

      setLoading(false);
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
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(connections));
    setConnectionStatus("pending");
  };

  const handleBlockUser = async () => {
    if (!user || !profileData) return;
    if (!confirm(`Are you sure you want to block ${profileData.name}? This will sever any connections and prevent future messages.`)) return;

    const blocks = JSON.parse(localStorage.getItem(`edworld_${user.uid}_blocks`) || "[]");
    blocks.push(profileData.userId);
    localStorage.setItem(`edworld_${user.uid}_blocks`, JSON.stringify(blocks));

    // Remove connection
    const connections = JSON.parse(localStorage.getItem(`edworld_${user.uid}_connections`) || "[]");
    const filtered = connections.filter(
      (c: any) =>
        !(c.requesterId === profileData.userId || c.recipientId === profileData.userId)
    );
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(filtered));

    setIsBlocked(true);
    setConnectionStatus("none");
  };

  const handleSubmitReport = async (reportData: any) => {
    const reports = JSON.parse(localStorage.getItem("edworld_global_reports") || "[]");
    reports.push({
      id: `rep-${Date.now()}`,
      ...reportData,
      reportedBy: user?.uid || "anonymous",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("edworld_global_reports", JSON.stringify(reports));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-paper text-ink">
        <div className="text-center space-y-3 font-mono text-xs text-ink-muted">
          <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading public profile...</p>
        </div>
      </div>
    );
  }

  // 1. Strict Youth Boundary: Minor profiles are NEVER public or reachable
  if (!profileData || profileData.ageBand !== "18+") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-paper-soft border border-line text-ink-muted flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-ink tracking-tight">Profile Not Found</h1>
            <p className="text-xs text-ink-soft leading-relaxed">
              The user profile <strong>@{usernameParam}</strong> does not exist or is not publicly accessible.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // 2. Strict Privacy Boundary: isPublic === false returns clean private state with zero data leakage
  if (!profileData.isPublic && !isOwnProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-paper-soft border border-line text-ink-muted flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-0.5 rounded-full bg-paper-soft text-ink-soft border border-line text-xs font-mono font-bold">
              @{profileData.username}
            </span>
            <h1 className="text-2xl font-bold font-display text-ink tracking-tight">This Profile is Private</h1>
            <p className="text-xs text-ink-soft leading-relaxed">
              {profileData.name} has set their profile to private. Only connected users can view full career activity.
            </p>
          </div>

          {isCurrentUserAdult && !isBlocked && (
            <button
              onClick={() => setShowConnectModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Send Connection Request</span>
            </button>
          )}

          <ConnectionRequestModal
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            targetUserId={profileData.userId}
            targetName={profileData.name}
            targetHeadline={profileData.headline}
            isMentor={profileData.isMentor}
            onSendRequest={handleSendConnection}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-paper-raised rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-forest text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                {profileData.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-ink tracking-tight">
                    {profileData.name}
                  </h1>
                  <span className="text-xs font-mono text-ink-muted">@{profileData.username}</span>
                  {profileData.isMentor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-[10px] font-mono font-bold border border-forest/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-forest" />
                      Verified Mentor
                    </span>
                  )}
                </div>

                {profileData.headline && (
                  <p className="text-xs sm:text-sm text-ink-soft font-medium leading-relaxed">
                    {profileData.headline}
                  </p>
                )}
              </div>
            </div>

            {/* Actions for 18+ Logged-In Users */}
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {isCurrentUserAdult && (
                  <>
                    {connectionStatus === "accepted" ? (
                      <Button
                        href={`/networking/messages/${[user?.uid, profileData.userId].sort().join("_")}`}
                        variant="primary"
                        size="sm"
                        icon={<MessageSquare className="w-3.5 h-3.5" />}
                      >
                        <span>Message</span>
                      </Button>
                    ) : connectionStatus === "pending" ? (
                      <button
                        disabled
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-paper-soft border border-line text-ink-muted text-xs font-bold uppercase tracking-wider"
                      >
                        Request Pending
                      </button>
                    ) : isBlocked ? (
                      <span className="text-xs font-mono text-rose-600 font-bold">User Blocked</span>
                    ) : (
                      <Button
                        onClick={() => setShowConnectModal(true)}
                        variant="primary"
                        size="sm"
                        icon={<UserPlus className="w-3.5 h-3.5" />}
                      >
                        <span>{profileData.isMentor ? "Request Mentorship" : "Connect"}</span>
                      </Button>
                    )}
                  </>
                )}

                <button
                  onClick={() => setShowReportModal(true)}
                  title="Report Profile"
                  className="p-2.5 rounded-xl border border-line text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {user && !isBlocked && (
                  <button
                    onClick={handleBlockUser}
                    title="Block User"
                    className="p-2.5 rounded-xl border border-line text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          {profileData.bio && (
            <div className="space-y-2 pt-4 border-t border-line">
              <h2 className="text-xs font-bold text-ink uppercase font-mono tracking-wider">About</h2>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                {profileData.bio}
              </p>
            </div>
          )}

          {/* Mentor Specialization */}
          {profileData.isMentor && profileData.mentorTags && profileData.mentorTags.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-line">
              <h2 className="text-xs font-bold text-ink uppercase font-mono tracking-wider">
                Mentorship Areas
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {profileData.mentorTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-line">
              <h2 className="text-xs font-bold text-ink uppercase font-mono tracking-wider">
                Skills &amp; Technologies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {profileData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg bg-paper-soft text-ink-soft border border-line text-xs font-mono font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Public Projects from Project Studio */}
        {profileData.projects && profileData.projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-display text-ink flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-forest" />
              <span>Verified Engineering Projects</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-paper-raised rounded-3xl border border-line p-5 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md hover:border-forest/30 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-ink">{proj.title}</h3>
                      {proj.verificationStatus === "verified" && (
                        <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest text-[10px] font-mono font-bold border border-forest/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-forest" />
                          GitHub Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-paper-soft border border-line rounded text-[10px] font-mono text-ink-soft"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {proj.githubRepo && (
                    <div className="pt-2 border-t border-line">
                      <a
                        href={proj.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-ink hover:text-forest flex items-center gap-1.5 transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>View Repository</span>
                        <ExternalLink className="w-3 h-3 text-ink-muted" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <ConnectionRequestModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          targetUserId={profileData.userId}
          targetName={profileData.name}
          targetHeadline={profileData.headline}
          isMentor={profileData.isMentor}
          onSendRequest={handleSendConnection}
        />

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="profile"
          targetId={profileData.userId}
          targetName={`@${profileData.username} (${profileData.name})`}
          onSubmitReport={handleSubmitReport}
        />
      </div>
    </div>
  );
}

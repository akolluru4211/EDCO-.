"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import { Connection, PublicUserProfile, ConnectionRequestType } from "@/lib/types";
import ConnectionRequestModal from "@/components/networking/ConnectionRequestModal";
import ReportModal from "@/components/networking/ReportModal";
import { 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Search, 
  Lock, 
  UserPlus, 
  Check, 
  X, 
  Unlink, 
  ExternalLink, 
  Star, 
  Sparkles, 
  Filter, 
  GraduationCap,
  ArrowRight,
  Clock,
  Briefcase
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/auth/AuthGuard";

export const dynamic = "force-dynamic";

export default function NetworkingHubPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [activeTab, setActiveTab] = useState<"discovery" | "connections" | "mentors" | "messages">("discovery");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [discoverableUsers, setDiscoverableUsers] = useState<PublicUserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedUserForConnect, setSelectedUserForConnect] = useState<PublicUserProfile | null>(null);

  useEffect(() => {
    if (!user || !isAdult) return;

    // Load live discoverable profiles from Supabase
    async function loadPublicProfiles() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("age_band", "18+")
          .neq("id", user?.uid);

        if (data && data.length > 0) {
          setDiscoverableUsers(
            data.map((p) => ({
              userId: p.id,
              username: p.username || p.name?.toLowerCase().replace(/\s+/g, "_"),
              name: p.name,
              headline: p.headline || "Software & Technology Professional",
              bio: p.bio || "Building modern software architectures and AI systems.",
              skills: p.interests?.map((i: any) => (typeof i === "string" ? i : i.name)) || ["Software Engineering"],
              isPublic: true,
              isMentor: p.is_mentor || false,
              ageBand: "18+",
            }))
          );
        }
      } catch (err) {
        console.warn("Public profiles load note:", err);
      }
    }

    loadPublicProfiles();

    // Load active connections
    const cached = localStorage.getItem(`edworld_${user.uid}_connections`);
    if (cached) {
      try {
        setConnections(JSON.parse(cached));
      } catch (e) {}
    } else {
      // Initialize active user connections
      const initial: Connection[] = [];
      setConnections(initial);
      localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(initial));
    }
  }, [user, isAdult]);

  const handleSendConnection = async (data: {
    recipientId: string;
    requestType: ConnectionRequestType;
    message: string;
  }) => {
    if (!user || !selectedUserForConnect) return;

    const newConn: Connection = {
      id: `${user.uid}_${selectedUserForConnect.userId}`,
      requesterId: user.uid,
      requesterName: user.name || "Candidate",
      recipientId: selectedUserForConnect.userId,
      recipientName: selectedUserForConnect.name,
      recipientHeadline: selectedUserForConnect.headline,
      status: "pending",
      requestType: data.requestType,
      message: data.message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...connections, newConn];
    setConnections(updated);
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(updated));
  };

  const handleAcceptRequest = (connectionId: string) => {
    if (!user) return;
    const updated = connections.map((c) => (c.id === connectionId ? { ...c, status: "accepted" as const } : c));
    setConnections(updated);
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(updated));
  };

  const handleDeclineRequest = (connectionId: string) => {
    if (!user) return;
    const updated = connections.map((c) => (c.id === connectionId ? { ...c, status: "declined" as const } : c));
    setConnections(updated);
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(updated));
  };

  const handleRemoveConnection = (connectionId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to remove this connection?")) return;
    const updated = connections.filter((c) => c.id !== connectionId);
    setConnections(updated);
    localStorage.setItem(`edworld_${user.uid}_connections`, JSON.stringify(updated));
  };

  // Strict 18+ Access Guard (Youth Safety)
  if (!isAdult && user) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#F4F6FB]">
          <div className="max-w-md w-full card-quixel rounded-3xl p-8 text-center space-y-6 shadow-sm border border-[#E8ECF2]">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF6DC] border border-[#FFE8A3] text-[#D97706] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#13141B]/5 text-[#13141B] text-xs font-mono font-bold uppercase tracking-wider border border-[#13141B]/10">
                Career Track (18+) Only
              </span>
              <h1 className="text-2xl font-black font-display text-[#13141B] tracking-tight">Access Restricted</h1>
              <p className="text-xs text-[#5E6573] leading-relaxed">
                Open peer networking and direct messaging are strictly restricted to verified Career Track adult accounts under Edworld youth protection standards.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-95"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const activeConnections = connections.filter((c) => c.status === "accepted");
  const pendingReceived = connections.filter((c) => c.status === "pending" && c.recipientId === user?.uid);
  const pendingSent = connections.filter((c) => c.status === "pending" && c.requesterId === user?.uid);

  const filteredDiscovery = discoverableUsers.filter((p) => {
    if (p.userId === user?.uid) return false;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = skillFilter === "all" || (p.skills || []).includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  const mentorsList = discoverableUsers.filter((p) => p.isMentor);

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="card-quixel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-[#E8ECF2]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D7FC51]/20 via-[#7B57FF]/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
                Career Track 18+
              </span>
              <span className="text-xs text-[#8F9CAE] font-medium">&bull; Verified Professional Network</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
              Networking &amp; Mentor Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573] max-w-2xl font-medium">
              Connect with verified peers, message accepted connections 1:1, and request calibrated guidance from industry mentors.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Button
              href={`/u/${user?.name?.toLowerCase().replace(/\s+/g, "_") || "alexrivera"}`}
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              className="rounded-2xl border-[#E8ECF2] bg-white hover:bg-slate-50 text-[#13141B] font-bold shadow-sm"
            >
              <span>View My Public Profile</span>
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 pb-1 overflow-x-auto touch-scroll-x">
          <button
            onClick={() => setActiveTab("discovery")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "discovery"
                ? "bg-[#13141B] text-white shadow-sm"
                : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Discover Professionals</span>
          </button>

          <button
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "connections"
                ? "bg-[#13141B] text-white shadow-sm"
                : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Connections ({activeConnections.length})</span>
            {pendingReceived.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#D7FC51] text-[#13141B] text-[10px] font-black flex items-center justify-center">
                {pendingReceived.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "mentors"
                ? "bg-[#13141B] text-white shadow-sm"
                : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Mentor Directory ({mentorsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "messages"
                ? "bg-[#13141B] text-white shadow-sm"
                : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Direct Messages ({activeConnections.length})</span>
          </button>
        </div>

        {/* Tab 1: Discovery */}
        {activeTab === "discovery" && (
          <div className="space-y-6">
            <div className="card-quixel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#E8ECF2]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, headline, or skill (e.g. Distributed Systems)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#13141B] text-xs font-medium focus:ring-2 focus:ring-[#13141B] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscovery.map((prof) => {
                const isConn = activeConnections.some(
                  (c) => c.recipientId === prof.userId || c.requesterId === prof.userId
                );
                const isPending = pendingSent.some((c) => c.recipientId === prof.userId);

                return (
                  <div
                    key={prof.userId}
                    className="card-quixel card-quixel-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-[#E8ECF2]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#13141B] text-[#D7FC51] font-black flex items-center justify-center text-sm shadow-sm">
                            {prof.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/u/${prof.username}`}
                              className="font-black text-base text-[#13141B] hover:text-[#7B57FF] transition-colors flex items-center gap-1"
                            >
                              <span>{prof.name}</span>
                              <ExternalLink className="w-3 h-3 text-[#8F9CAE]" />
                            </Link>
                            <p className="text-xs text-[#8F9CAE] font-medium line-clamp-1">@{prof.username}</p>
                          </div>
                        </div>

                        {prof.isMentor && (
                          <span className="px-2.5 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[10px] font-mono font-black border border-[#DDD4FC] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#7B57FF]" />
                            Mentor
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#5E6573] line-clamp-2 leading-relaxed font-medium">
                        {prof.headline || prof.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {(prof.skills || []).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-full bg-[#F4F6FB] text-[#13141B] border border-[#E8ECF2] text-[10px] font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between">
                      <Link
                        href={`/u/${prof.username}`}
                        className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] underline"
                      >
                        View Profile
                      </Link>

                      {isConn ? (
                        <Button
                          href={`/networking/messages/${[user?.uid, prof.userId].sort().join("_")}`}
                          variant="primary"
                          size="sm"
                          icon={<MessageSquare className="w-3.5 h-3.5" />}
                          className="rounded-2xl bg-[#13141B] hover:bg-black text-white font-bold"
                        >
                          <span>Message</span>
                        </Button>
                      ) : isPending ? (
                        <span className="text-[11px] font-mono text-[#8F9CAE] font-bold">Request Pending</span>
                      ) : (
                        <Button
                          onClick={() => setSelectedUserForConnect(prof)}
                          variant="primary"
                          size="sm"
                          icon={<UserPlus className="w-3.5 h-3.5" />}
                          className="rounded-2xl bg-[#13141B] hover:bg-black text-white font-bold"
                        >
                          <span>Connect</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Connections & Disconnect Action */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            {/* Pending Requests Received */}
            {pendingReceived.length > 0 && (
              <div className="card-quixel rounded-3xl border border-[#FFE8A3] bg-[#FFFBEB] p-6 space-y-4">
                <h3 className="text-xs font-black text-[#D97706] uppercase tracking-wider font-mono">
                  Pending Connection Requests Received ({pendingReceived.length})
                </h3>
                <div className="space-y-3">
                  {pendingReceived.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl p-4 border border-[#FFE8A3] flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-[#13141B]">{req.requesterName}</p>
                        {req.message && <p className="text-xs text-[#5E6573]">&ldquo;{req.message}&rdquo;</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="p-2 rounded-2xl border border-[#E8ECF2] text-[#5E6573] hover:bg-[#F4F6FB] text-xs font-bold transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3.5 py-2 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold uppercase flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                        >
                          <Check className="w-4 h-4 text-[#D7FC51]" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Connections List */}
            <div className="card-quixel rounded-3xl border border-[#E8ECF2] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-base font-black font-display text-[#13141B]">
                  Active Connections ({activeConnections.length})
                </h2>
                <span className="text-xs font-mono text-[#8F9CAE]">1:1 Messaging Enabled</span>
              </div>

              {activeConnections.length === 0 ? (
                <div className="py-12 text-center text-[#8F9CAE] text-xs font-medium">
                  No active connections yet. Explore professionals to expand your network.
                </div>
              ) : (
                <div className="divide-y divide-[#E8ECF2]">
                  {activeConnections.map((conn) => {
                    const otherName = conn.requesterId === user?.uid ? conn.recipientName : conn.requesterName;
                    const otherId = conn.requesterId === user?.uid ? conn.recipientId : conn.requesterId;
                    const convId = [user?.uid, otherId].sort().join("_");

                    return (
                      <div
                        key={conn.id}
                        className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#13141B] text-[#D7FC51] font-black flex items-center justify-center text-xs">
                            {otherName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#13141B]">{otherName}</p>
                            <span className="text-[11px] font-mono text-[#8F9CAE]">
                              Connected on {new Date(conn.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/networking/messages/${convId}`}
                            className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#D7FC51]" />
                            <span>Message</span>
                          </Link>

                          <button
                            onClick={() => handleRemoveConnection(conn.id)}
                            title="Disconnect User"
                            className="p-2 rounded-2xl text-[#8F9CAE] hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
                          >
                            <Unlink className="w-4 h-4" />
                            <span className="hidden sm:inline font-mono">Disconnect</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Mentors Directory */}
        {activeTab === "mentors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorsList.map((mentor) => (
              <div
                key={mentor.userId}
                className="card-quixel card-quixel-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-[#E8ECF2]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7B57FF] text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {mentor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-[#13141B]">{mentor.name}</h3>
                        <p className="text-xs text-[#8F9CAE] font-medium line-clamp-1">@{mentor.username}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#EDE8FD] text-[#7B57FF] text-[10px] font-mono font-black border border-[#DDD4FC] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#7B57FF]" />
                      Verified Mentor
                    </span>
                  </div>

                  <p className="text-xs text-[#5E6573] line-clamp-2 leading-relaxed font-medium">
                    {mentor.headline || mentor.bio}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#8F9CAE] font-bold">Mentorship Focus</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(mentor.mentorTags || []).map((t) => (
                        <span key={t} className="px-2.5 py-0.5 bg-[#F4F6FB] text-[#13141B] border border-[#E8ECF2] rounded-full text-[10px] font-bold font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between">
                  <Link
                    href={`/u/${mentor.username}`}
                    className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] underline"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => setSelectedUserForConnect(mentor)}
                    className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#D7FC51]" />
                    <span>Mentorship Ask</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Messages */}
        {activeTab === "messages" && (
          <div className="card-quixel rounded-3xl border border-[#E8ECF2] overflow-hidden divide-y divide-[#E8ECF2]">
            {activeConnections.length === 0 ? (
              <div className="py-12 text-center text-[#8F9CAE] text-xs font-medium">
                You have no active conversations. Connect with professionals to start messaging.
              </div>
            ) : (
              activeConnections.map((conn) => {
                const otherName = conn.requesterId === user?.uid ? conn.recipientName : conn.requesterName;
                const otherId = conn.requesterId === user?.uid ? conn.recipientId : conn.requesterId;
                const convId = [user?.uid, otherId].sort().join("_");

                return (
                  <Link
                    key={conn.id}
                    href={`/networking/messages/${convId}`}
                    className="p-5 hover:bg-[#F4F6FB] transition-colors flex items-center justify-between gap-4 block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#13141B] text-[#D7FC51] font-black flex items-center justify-center text-sm shadow-sm">
                        {otherName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#13141B]">{otherName}</h3>
                        <p className="text-xs text-[#5E6573] font-medium">Click to open 1:1 conversation</p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#8F9CAE]" />
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Connect / Mentorship Modal */}
        <ConnectionRequestModal
          isOpen={!!selectedUserForConnect}
          onClose={() => setSelectedUserForConnect(null)}
          targetUserId={selectedUserForConnect?.userId || ""}
          targetName={selectedUserForConnect?.name || ""}
          targetHeadline={selectedUserForConnect?.headline}
          isMentor={selectedUserForConnect?.isMentor}
          onSendRequest={handleSendConnection}
        />
        </div>
      </div>
    </AuthGuard>
  );
}

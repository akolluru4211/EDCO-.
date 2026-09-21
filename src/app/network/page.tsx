"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import { PublicUserProfile, ConnectionRequestType } from "@/lib/types";
import ConnectionRequestModal from "@/components/networking/ConnectionRequestModal";
import ReportModal from "@/components/networking/ReportModal";
import AuthGuard from "@/components/auth/AuthGuard";
import EdIdBadge from "@/components/ui/EdIdBadge";
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Unlink,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Sparkles,
  Building,
  MapPin,
  Clock,
  Ban,
  Flag,
  UserCheck,
  UserX
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function NetworkPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "students" | "professionals" | "connections" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<PublicUserProfile[]>([]);
  const [professionals, setProfessionals] = useState<PublicUserProfile[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [selectedUserForConnect, setSelectedUserForConnect] = useState<PublicUserProfile | null>(null);
  const [reportingUser, setReportingUser] = useState<PublicUserProfile | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch real network members from database
  const loadNetworkData = useCallback(async (query = "") => {
    if (!user) return;
    setLoading(true);
    try {
      const url = `/api/network/members?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();

      if (data.success) {
        setStudents(data.students || []);
        setProfessionals(data.professionals || []);
      }
    } catch (err) {
      console.warn("Failed to load network members:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch real connections
  const loadConnections = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/network/connections", {
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();
      if (data.success) {
        setActiveConnections(data.connections || []);
        setPendingReceived(data.pendingReceived || []);
        setPendingSent(data.pendingSent || []);
      }
    } catch (err) {
      console.warn("Failed to load connections:", err);
    }
  }, [user]);

  // Fetch real signal recommendations
  const loadRecommendations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/network/recommendations", {
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.warn("Failed to load recommendations:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNetworkData();
      loadConnections();
      loadRecommendations();
    }
  }, [user, loadNetworkData, loadConnections, loadRecommendations]);

  // Handle Search Input with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNetworkData(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadNetworkData]);

  // Send real connection request
  const handleSendConnection = async (reqData: {
    recipientId: string;
    requestType: ConnectionRequestType;
    message: string;
  }) => {
    if (!user || !selectedUserForConnect) return;
    setActionInProgress(selectedUserForConnect.userId);
    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          receiverId: selectedUserForConnect.userId,
          message: reqData.message,
          requestType: reqData.requestType
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadNetworkData(searchQuery);
        await loadConnections();
      }
    } catch (err) {
      console.error("Connection request error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Accept Connection
  const handleAccept = async (connectionId: string) => {
    if (!user) return;
    setActionInProgress(connectionId);
    try {
      const res = await fetch("/api/network/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          connectionId,
          action: "accept"
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadConnections();
        await loadNetworkData(searchQuery);
      }
    } catch (err) {
      console.error("Accept connection error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Decline Connection
  const handleDecline = async (connectionId: string) => {
    if (!user) return;
    setActionInProgress(connectionId);
    try {
      const res = await fetch("/api/network/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          connectionId,
          action: "decline"
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadConnections();
        await loadNetworkData(searchQuery);
      }
    } catch (err) {
      console.error("Decline connection error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Remove Connection / Disconnect
  const handleDisconnect = async (connectionId: string, partnerName: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to remove ${partnerName} from your connections?`)) return;
    setActionInProgress(connectionId);
    try {
      const res = await fetch(`/api/network/connections?connectionId=${connectionId}`, {
        method: "DELETE",
        headers: { "x-user-id": user.uid }
      });
      const data = await res.json();
      if (data.success) {
        await loadConnections();
        await loadNetworkData(searchQuery);
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Block User
  const handleBlockUser = async (targetUserId: string, targetName: string) => {
    if (!user) return;
    if (!confirm(`Block ${targetName}? You will not see each other in networking or search.`)) return;
    try {
      await fetch("/api/network/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({ blockedId: targetUserId })
      });
      await loadNetworkData(searchQuery);
      await loadConnections();
      await loadRecommendations();
    } catch (err) {
      console.error("Block error:", err);
    }
  };

  // Report User
  const handleSubmitReport = async (reportData: { type: any; targetId: string; reason: string }) => {
    if (!user) return;
    await fetch("/api/network/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.uid
      },
      body: JSON.stringify({
        reportedId: reportData.targetId,
        category: reportData.type,
        reason: reportData.reason
      })
    });
  };

  const totalMembersCount = students.length + professionals.length;

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="card-quixel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-[#E8ECF2] shadow-sm">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D7FC51]/20 via-[#7B57FF]/10 to-transparent rounded-bl-full pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EDE8FD] text-[#7B57FF] border border-[#DDD4FC]">
                  EdWorld Co. Network
                </span>
                <span className="text-xs text-[#8F9CAE] font-medium">• Real Verified Accounts</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#13141B] tracking-tight">
                Network
              </h1>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <Button
                href={`/u/${user?.name?.toLowerCase().replace(/\s+/g, "_") || user?.uid || "profile"}`}
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                className="rounded-2xl border-[#E8ECF2] bg-white hover:bg-slate-50 text-[#13141B] font-bold shadow-sm"
              >
                <span>View My Profile</span>
              </Button>
            </div>
          </div>

          {/* Search Bar & Tab Navigation */}
          <div className="space-y-4">
            {/* Search Input */}
            <div className="card-quixel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#E8ECF2]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, college, degree, branch, company, role, or skill..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#13141B] text-xs font-medium focus:ring-2 focus:ring-[#13141B] focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pb-1 overflow-x-auto touch-scroll-x">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>All Members ({totalMembersCount})</span>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "students"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Students ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("professionals")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "professionals"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Working Professionals ({professionals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("connections")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "connections"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>My Connections ({activeConnections.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "pending"
                    ? "bg-[#13141B] text-white shadow-sm"
                    : "bg-white border border-[#E8ECF2] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending Requests ({pendingReceived.length + pendingSent.length})</span>
                {pendingReceived.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#D7FC51] text-[#13141B] text-[10px] font-black flex items-center justify-center">
                    {pendingReceived.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Real Recommendations (Only displayed when real signals produce matches) */}
          {activeTab === "all" && recommendations.length > 0 && !searchQuery && (
            <div className="card-quixel rounded-3xl p-6 border border-[#DDD4FC] bg-[#EDE8FD]/40 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7B57FF]" />
                  <h2 className="text-sm font-black font-display uppercase tracking-wider text-[#7B57FF]">
                    Recommended Connections
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#7B57FF] font-medium">Based on real shared college & skills</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.userId}
                    className="bg-white rounded-2xl p-4 border border-[#DDD4FC] flex flex-col justify-between space-y-3 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#7B57FF] text-white font-black flex items-center justify-center text-xs shadow-sm">
                          {rec.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/u/${rec.username}`} className="font-bold text-xs text-[#13141B] hover:text-[#7B57FF] flex items-center gap-1">
                            <span>{rec.name}</span>
                            <ExternalLink className="w-3 h-3 text-[#8F9CAE]" />
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <EdIdBadge userId={rec.userId} customId={rec.edId} size="sm" variant="minimal" />
                          </div>
                          <p className="text-[11px] text-[#8F9CAE] font-medium line-clamp-1">{rec.headline}</p>
                        </div>
                      </div>
                      {rec.matchReason && (
                        <p className="text-[10px] font-mono text-[#7B57FF] bg-[#EDE8FD] px-2 py-0.5 rounded-full inline-block font-bold">
                          {rec.matchReason}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E8ECF2] flex items-center justify-between gap-2">
                      <Link href={`/u/${rec.username}`} className="text-[11px] font-bold text-[#5E6573] hover:text-[#13141B] flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-[#8F9CAE]" />
                        <span>Visit Profile</span>
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/networking/messages/${user?.uid ? [user.uid, rec.userId].sort().join("_") : rec.userId}`}
                          className="px-2.5 py-1.5 rounded-xl border border-[#E8ECF2] hover:bg-[#F4F6FB] text-[#13141B] text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                          title="Chat with user"
                        >
                          <MessageSquare className="w-3 h-3 text-[#7B57FF]" />
                          <span>Chat</span>
                        </Link>
                        <button
                          onClick={() => setSelectedUserForConnect(rec)}
                          className="px-3 py-1.5 rounded-xl bg-[#13141B] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3 h-3 text-[#D7FC51]" />
                          <span>Connect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: STUDENTS (When tab is "all" or "students") */}
          {(activeTab === "all" || activeTab === "students") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#7B57FF]" />
                  <h2 className="text-base sm:text-lg font-black font-display text-[#13141B]">
                    Students ({students.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#8F9CAE]">Higher Ed & Campus</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#8F9CAE] text-xs font-medium">
                  Loading verified student accounts...
                </div>
              ) : students.length === 0 ? (
                <div className="card-quixel rounded-3xl p-8 text-center space-y-2 border border-[#E8ECF2] bg-white">
                  <UserX className="w-8 h-8 text-[#8F9CAE] mx-auto" />
                  <p className="font-bold text-xs text-[#13141B]">
                    {searchQuery ? "No EdWorld members match your search." : "No students found on EdWorld yet."}
                  </p>
                  <p className="text-[11px] text-[#5E6573]">
                    {searchQuery ? "Try searching for a different name, skill, or college." : "When student accounts register on EdWorld Co., they will be discoverable here."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((stu) => (
                    <MemberCard
                      key={stu.userId}
                      member={stu}
                      onConnect={() => setSelectedUserForConnect(stu)}
                      onReport={() => setReportingUser(stu)}
                      onBlock={() => handleBlockUser(stu.userId, stu.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: WORKING PROFESSIONALS (When tab is "all" or "professionals") */}
          {(activeTab === "all" || activeTab === "professionals") && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#13141B]" />
                  <h2 className="text-base sm:text-lg font-black font-display text-[#13141B]">
                    Working Professionals ({professionals.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#8F9CAE]">Industry & Career</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#8F9CAE] text-xs font-medium">
                  Loading verified professional accounts...
                </div>
              ) : professionals.length === 0 ? (
                <div className="card-quixel rounded-3xl p-8 text-center space-y-2 border border-[#E8ECF2] bg-white">
                  <UserX className="w-8 h-8 text-[#8F9CAE] mx-auto" />
                  <p className="font-bold text-xs text-[#13141B]">
                    {searchQuery ? "No EdWorld members match your search." : "No working professionals found on EdWorld yet."}
                  </p>
                  <p className="text-[11px] text-[#5E6573]">
                    {searchQuery ? "Try searching for a different name, company, or skill." : "When working professional accounts register on EdWorld Co., they will be discoverable here."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {professionals.map((pro) => (
                    <MemberCard
                      key={pro.userId}
                      member={pro}
                      onConnect={() => setSelectedUserForConnect(pro)}
                      onReport={() => setReportingUser(pro)}
                      onBlock={() => handleBlockUser(pro.userId, pro.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: My Connections */}
          {activeTab === "connections" && (
            <div className="card-quixel rounded-3xl border border-[#E8ECF2] p-6 sm:p-8 space-y-4 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-base font-black font-display text-[#13141B]">
                  Active Connections ({activeConnections.length})
                </h2>
                <span className="text-xs font-mono text-[#8F9CAE]">1:1 Messaging & Direct Collaboration</span>
              </div>

              {activeConnections.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-[#8F9CAE]">
                  <UserX className="w-8 h-8 mx-auto text-[#8F9CAE]" />
                  <p className="text-xs font-bold text-[#13141B]">You haven't connected with anyone yet.</p>
                  <p className="text-[11px] text-[#5E6573]">Explore students and working professionals above to expand your network.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8ECF2]">
                  {activeConnections.map((conn) => {
                    const convId = [user?.uid, conn.partnerId].sort().join("_");

                    return (
                      <div
                        key={conn.id}
                        className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#13141B] text-[#D7FC51] font-black flex items-center justify-center text-xs shadow-sm">
                            {conn.partnerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/u/${conn.partnerUsername}`} className="font-bold text-xs text-[#13141B] hover:text-[#7B57FF] flex items-center gap-1">
                              <span>{conn.partnerName}</span>
                              <ExternalLink className="w-3 h-3 text-[#8F9CAE]" />
                            </Link>
                            <p className="text-[11px] text-[#5E6573] font-medium line-clamp-1">{conn.partnerHeadline}</p>
                            <span className="text-[10px] font-mono text-[#8F9CAE]">
                              Connected on {new Date(conn.updatedAt || conn.createdAt).toLocaleDateString()}
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
                            onClick={() => handleDisconnect(conn.id, conn.partnerName)}
                            title="Remove Connection"
                            disabled={actionInProgress === conn.id}
                            className="p-2 rounded-2xl text-[#8F9CAE] hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
                          >
                            <Unlink className="w-4 h-4" />
                            <span className="hidden sm:inline font-mono">Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Pending Requests */}
          {activeTab === "pending" && (
            <div className="space-y-6">
              {/* Received Requests */}
              <div className="card-quixel rounded-3xl border border-[#E8ECF2] p-6 sm:p-8 space-y-4 bg-white shadow-sm">
                <h3 className="text-xs font-black text-[#D97706] uppercase tracking-wider font-mono">
                  Pending Requests Received ({pendingReceived.length})
                </h3>

                {pendingReceived.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#8F9CAE] font-medium">
                    No pending connection requests received.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingReceived.map((req) => (
                      <div
                        key={req.id}
                        className="bg-[#FFFBEB] rounded-2xl p-4 border border-[#FFE8A3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#13141B]">{req.partnerName}</span>
                            <span className="text-[10px] font-mono uppercase bg-[#13141B]/5 px-2 py-0.5 rounded-full font-bold">
                              {req.requestType}
                            </span>
                          </div>
                          {req.partnerHeadline && <p className="text-[11px] text-[#5E6573]">{req.partnerHeadline}</p>}
                          {req.message && <p className="text-xs text-[#5E6573] italic">"{req.message}"</p>}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleDecline(req.id)}
                            disabled={actionInProgress === req.id}
                            className="p-2 rounded-2xl border border-[#E8ECF2] bg-white text-[#5E6573] hover:bg-[#F4F6FB] text-xs font-bold transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAccept(req.id)}
                            disabled={actionInProgress === req.id}
                            className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-black text-white text-xs font-bold uppercase flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                          >
                            <Check className="w-4 h-4 text-[#D7FC51]" />
                            <span>Accept</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="card-quixel rounded-3xl border border-[#E8ECF2] p-6 sm:p-8 space-y-4 bg-white shadow-sm">
                <h3 className="text-xs font-black text-[#5E6573] uppercase tracking-wider font-mono">
                  Pending Requests Sent ({pendingSent.length})
                </h3>

                {pendingSent.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#8F9CAE] font-medium">
                    No pending connection requests sent.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingSent.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl p-4 border border-[#E8ECF2] flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#13141B]">{req.partnerName}</p>
                          <p className="text-[11px] text-[#8F9CAE] font-medium">{req.partnerHeadline}</p>
                          <span className="text-[10px] font-mono text-[#8F9CAE]">Sent on {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#F4F6FB] text-[#8F9CAE] text-[10px] font-mono font-bold uppercase">
                          Awaiting Response
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Connect Modal */}
        <ConnectionRequestModal
          isOpen={!!selectedUserForConnect}
          onClose={() => setSelectedUserForConnect(null)}
          targetUserId={selectedUserForConnect?.userId || ""}
          targetName={selectedUserForConnect?.name || ""}
          targetHeadline={selectedUserForConnect?.headline}
          isMentor={selectedUserForConnect?.isMentor}
          onSendRequest={handleSendConnection}
        />

        {/* Report Modal */}
        <ReportModal
          isOpen={!!reportingUser}
          onClose={() => setReportingUser(null)}
          targetType="profile"
          targetId={reportingUser?.userId || ""}
          targetName={reportingUser?.name}
          onSubmitReport={handleSubmitReport}
        />
      </div>
    </AuthGuard>
  );
}

// Subcomponent: MemberCard
function MemberCard({
  member,
  onConnect,
  onReport,
  onBlock
}: {
  member: PublicUserProfile;
  onConnect: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  const isStudent = member.userType === "STUDENT";
  const status = member.connectionStatus || "none";

  return (
    <div className="card-quixel card-quixel-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 border border-[#E8ECF2] bg-white shadow-sm hover:shadow-md transition-all">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center text-sm shadow-sm ${
                isStudent ? "bg-[#EDE8FD] text-[#7B57FF]" : "bg-[#13141B] text-[#D7FC51]"
              }`}
            >
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/u/${member.username}`}
                className="font-black text-base text-[#13141B] hover:text-[#7B57FF] transition-colors flex items-center gap-1"
              >
                <span>{member.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8F9CAE]" />
              </Link>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-[#8F9CAE] font-medium">@{member.username}</span>
                <EdIdBadge userId={member.userId} customId={member.edId} size="sm" variant="pill" />
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black border flex items-center gap-1 ${
              isStudent
                ? "bg-[#EDE8FD] text-[#7B57FF] border-[#DDD4FC]"
                : "bg-[#F4F6FB] text-[#13141B] border-[#E8ECF2]"
            }`}
          >
            {isStudent ? <GraduationCap className="w-3 h-3 text-[#7B57FF]" /> : <Briefcase className="w-3 h-3 text-[#13141B]" />}
            {isStudent ? "Student" : "Professional"}
          </span>
        </div>

        {/* Academic / Professional Details */}
        <div className="space-y-1 text-xs text-[#5E6573]">
          {isStudent ? (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Building className="w-3.5 h-3.5 text-[#8F9CAE] shrink-0" />
              <span className="line-clamp-1">{member.college || "College not added"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Building className="w-3.5 h-3.5 text-[#8F9CAE] shrink-0" />
              <span className="line-clamp-1">{member.company || member.currentRole || "Professional"}</span>
            </div>
          )}

          {member.degree && member.branch && (
            <p className="text-[11px] text-[#8F9CAE] pl-5 font-mono">
              {member.degree} • {member.branch} {member.graduationYear ? `('${member.graduationYear.slice(-2)})` : ""}
            </p>
          )}

          {member.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#8F9CAE]">
              <MapPin className="w-3.5 h-3.5 text-[#8F9CAE] shrink-0" />
              <span>{member.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {member.bio ? (
          <p className="text-xs text-[#5E6573] line-clamp-2 leading-relaxed font-medium">
            {member.bio}
          </p>
        ) : member.headline ? (
          <p className="text-xs text-[#8F9CAE] line-clamp-1 italic font-medium">
            {member.headline}
          </p>
        ) : null}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {member.skills && member.skills.length > 0 ? (
            member.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-full bg-[#F4F6FB] text-[#13141B] border border-[#E8ECF2] text-[10px] font-bold"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#8F9CAE] italic">No skills added</span>
          )}
        </div>

        {/* Mutual Connections (Calculated strictly from database) */}
        {typeof member.mutualConnectionsCount === "number" && member.mutualConnectionsCount > 0 && (
          <div className="text-[10px] font-mono text-[#7B57FF] font-bold flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{member.mutualConnectionsCount} mutual connection{member.mutualConnectionsCount === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href={`/u/${member.username}`}
            className="text-xs font-bold text-[#13141B] hover:text-[#7B57FF] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8ECF2] hover:bg-[#F4F6FB] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#8F9CAE]" />
            <span>Visit Profile</span>
          </Link>
          <button
            onClick={onReport}
            title="Report User"
            className="p-1.5 rounded-lg text-[#8F9CAE] hover:text-rose-600 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onBlock}
            title="Block User"
            className="p-1.5 rounded-lg text-[#8F9CAE] hover:text-rose-600 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            href={`/networking/messages/${member.userId}`}
            variant="outline"
            size="sm"
            icon={<MessageSquare className="w-3.5 h-3.5 text-[#7B57FF]" />}
            className="rounded-xl border-[#E8ECF2] hover:bg-[#F4F6FB] text-[#13141B] font-bold text-xs"
          >
            <span>Chat</span>
          </Button>

          {status === "accepted" ? (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Connected</span>
            </span>
          ) : status === "pending_sent" ? (
            <span className="text-[11px] font-mono text-[#8F9CAE] font-bold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
              Pending
            </span>
          ) : status === "pending_received" ? (
            <span className="text-[11px] font-mono text-[#D97706] font-bold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
              Requested
            </span>
          ) : (
            <Button
              onClick={onConnect}
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              className="rounded-xl bg-[#13141B] hover:bg-black text-white font-bold text-xs shadow-sm"
            >
              <span>Connect</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

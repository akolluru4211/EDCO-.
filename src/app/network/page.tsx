"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";
import { PublicUserProfile } from "@/lib/types";
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
  GraduationCap,
  Briefcase,
  Sparkles,
  Building,
  MapPin,
  Clock,
  Ban,
  Flag,
  UserCheck,
  UserX,
  ArrowUpRight
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
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
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

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadNetworkData(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, loadNetworkData]);

  // Send Connection Request
  const handleSendConnection = async (reqData: {
    recipientId: string;
    requestType: any;
    message: string;
  }) => {
    if (!user) return;
    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          recipientId: reqData.recipientId,
          requestType: reqData.requestType,
          note: reqData.message
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadConnections();
        await loadNetworkData(searchQuery);
        setSelectedUserForConnect(null);
      }
    } catch (err) {
      console.error("Connection request error:", err);
    }
  };

  // Accept Connection Request
  const handleAcceptConnection = async (requestId: string) => {
    if (!user) return;
    setActionInProgress(requestId);
    try {
      const res = await fetch("/api/network/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          requestId,
          status: "accepted"
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

  // Decline Connection Request
  const handleDeclineConnection = async (requestId: string) => {
    if (!user) return;
    setActionInProgress(requestId);
    try {
      const res = await fetch("/api/network/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid
        },
        body: JSON.stringify({
          requestId,
          status: "declined"
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
      <div className="min-h-[calc(100vh-4rem)] bg-[#FCFCFB] py-8 px-4 sm:px-6 lg:px-8 text-[#13141B]">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[#EBECEF] shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20">
                  Network Directory
                </span>
                <span className="text-xs text-[#5E6573] font-medium">• Verified Members</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#13141B] tracking-tight">
                Peer &amp; Professional Network
              </h1>
              <p className="text-xs text-[#5E6573] font-medium">
                Connect with verified students, alumni, and industry engineers for mentorship and career growth.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                href={`/u/${user?.name?.toLowerCase().replace(/\s+/g, "_") || user?.uid || "profile"}`}
                variant="secondary"
                size="sm"
                icon={<ArrowUpRight className="w-3.5 h-3.5 text-[#00D2B4]" />}
                className="rounded-xl border-[#EBECEF] bg-white hover:bg-slate-50 text-[#13141B] font-bold text-xs shadow-xs"
              >
                <span>My Public Profile</span>
              </Button>
            </div>
          </div>

          {/* Search Bar & Tab Navigation */}
          <div className="space-y-4">
            {/* Search Input */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#EBECEF] shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5E6573] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, college, degree, branch, company, role, or skill..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EBECEF] bg-[#FCFCFB] text-[#13141B] text-xs font-medium focus:ring-1 focus:ring-[#13141B] focus:outline-none transition-all placeholder:text-[#8F9CAE]"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pb-1 overflow-x-auto touch-scroll-x">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-[#13141B] text-white shadow-xs"
                    : "bg-white border border-[#EBECEF] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#00D2B4]" />
                <span>All Members ({totalMembersCount})</span>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "students"
                    ? "bg-[#13141B] text-white shadow-xs"
                    : "bg-white border border-[#EBECEF] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Students ({students.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("professionals")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "professionals"
                    ? "bg-[#13141B] text-white shadow-xs"
                    : "bg-white border border-[#EBECEF] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Working Professionals ({professionals.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("connections")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "connections"
                    ? "bg-[#13141B] text-white shadow-xs"
                    : "bg-white border border-[#EBECEF] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>My Connections ({activeConnections.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "pending"
                    ? "bg-[#13141B] text-white shadow-xs"
                    : "bg-white border border-[#EBECEF] text-[#5E6573] hover:text-[#13141B] hover:bg-slate-50"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Requests ({pendingReceived.length + pendingSent.length})</span>
                {pendingReceived.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#00D2B4] text-[#13141B] text-[10px] font-black flex items-center justify-center">
                    {pendingReceived.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Real Recommendations */}
          {activeTab === "all" && recommendations.length > 0 && !searchQuery && (
            <div className="bg-white rounded-2xl p-6 border border-[#EBECEF] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00D2B4]" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#13141B]">
                    Recommended Connections
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#5E6573]">Based on shared campus &amp; skill signals</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.userId}
                    className="bg-[#FCFCFB] rounded-xl p-4 border border-[#EBECEF] flex flex-col justify-between space-y-3 hover:border-[#D1D5DC] transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#13141B] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                          {rec.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/u/${rec.username}`} className="font-bold text-xs text-[#13141B] hover:text-[#00D2B4] flex items-center gap-1">
                            <span>{rec.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <EdIdBadge userId={rec.userId} customId={rec.edId} size="sm" variant="minimal" />
                          </div>
                          <p className="text-[11px] text-[#5E6573] font-medium line-clamp-1">{rec.headline}</p>
                        </div>
                      </div>
                      {rec.matchReason && (
                        <p className="text-[10px] font-mono text-[#0A5245] bg-[#00D2B4]/10 border border-[#00D2B4]/20 px-2 py-0.5 rounded-md inline-block font-bold">
                          {rec.matchReason}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#EBECEF] flex items-center justify-between gap-2">
                      <Link href={`/u/${rec.username}`} className="text-[11px] font-bold text-[#5E6573] hover:text-[#13141B] flex items-center gap-1">
                        <span>View Profile</span>
                        <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
                      </Link>
                      <button
                        onClick={() => setSelectedUserForConnect(rec)}
                        className="px-3 py-1 rounded-lg bg-[#13141B] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3 text-[#00D2B4]" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: STUDENTS (When tab is "all" or "students") */}
          {(activeTab === "all" || activeTab === "students") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBECEF] pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00D2B4]" />
                  <h2 className="text-sm sm:text-base font-extrabold font-sans text-[#13141B]">
                    Students ({students.length})
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#5E6573]">Higher Ed &amp; Campus</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#5E6573] text-xs font-medium">
                  Loading verified student accounts...
                </div>
              ) : students.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-[#EBECEF] shadow-xs">
                  <UserX className="w-8 h-8 text-[#8F9CAE] mx-auto" />
                  <p className="font-bold text-xs text-[#13141B]">
                    {searchQuery ? "No EdWorld members match your search." : "No students found on EdWorld yet."}
                  </p>
                  <p className="text-[11px] text-[#5E6573]">
                    {searchQuery ? "Try searching for a different name, skill, or college." : "When student accounts register on EdWorld Co., they will be discoverable here."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          {/* Section 2: PROFESSIONALS (When tab is "all" or "professionals") */}
          {(activeTab === "all" || activeTab === "professionals") && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#EBECEF] pb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00D2B4]" />
                  <h2 className="text-sm sm:text-base font-extrabold font-sans text-[#13141B]">
                    Working Professionals ({professionals.length})
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[#5E6573]">Industry &amp; Alumni</span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-[#5E6573] text-xs font-medium">
                  Loading verified professionals...
                </div>
              ) : professionals.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-[#EBECEF] shadow-xs">
                  <UserX className="w-8 h-8 text-[#8F9CAE] mx-auto" />
                  <p className="font-bold text-xs text-[#13141B]">
                    {searchQuery ? "No professionals match your search." : "No professionals found on EdWorld yet."}
                  </p>
                  <p className="text-[11px] text-[#5E6573]">
                    {searchQuery ? "Try searching for a different name, company, or skill." : "When verified professionals register, they will appear in this directory."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          {/* Section 3: ACTIVE CONNECTIONS (When tab is "connections") */}
          {activeTab === "connections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EBECEF] pb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#00D2B4]" />
                  <h2 className="text-sm sm:text-base font-extrabold font-sans text-[#13141B]">
                    My Connections ({activeConnections.length})
                  </h2>
                </div>
              </div>

              {activeConnections.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-[#EBECEF] shadow-xs">
                  <Users className="w-8 h-8 text-[#8F9CAE] mx-auto" />
                  <p className="font-bold text-xs text-[#13141B]">No active connections yet.</p>
                  <p className="text-[11px] text-[#5E6573] max-w-sm mx-auto">
                    Search above or browse students and professionals to build your verified career network.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeConnections.map((conn) => {
                    const isSender = conn.senderId === user?.uid;
                    const partner = isSender ? conn.recipient : conn.sender;
                    if (!partner) return null;

                    return (
                      <div
                        key={conn.id}
                        className="bg-white rounded-2xl p-5 border border-[#EBECEF] shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-[#13141B] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                                {partner.name?.slice(0, 2).toUpperCase() || "??"}
                              </div>
                              <div>
                                <Link
                                  href={`/u/${partner.username || partner.userId}`}
                                  className="font-bold text-xs text-[#13141B] hover:text-[#00D2B4] flex items-center gap-1"
                                >
                                  <span>{partner.name}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <EdIdBadge userId={partner.userId} customId={partner.edId} size="sm" variant="minimal" />
                                </div>
                                <p className="text-[11px] text-[#5E6573] font-medium line-clamp-1">{partner.headline}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20">
                              Connected
                            </span>
                          </div>

                          <div className="text-xs text-[#5E6573] space-y-1">
                            {partner.company ? (
                              <div className="flex items-center gap-1.5 font-medium">
                                <Building className="w-3.5 h-3.5 text-[#8F9CAE]" />
                                <span>{partner.company}</span>
                              </div>
                            ) : partner.college ? (
                              <div className="flex items-center gap-1.5 font-medium">
                                <GraduationCap className="w-3.5 h-3.5 text-[#8F9CAE]" />
                                <span>{partner.college}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#EBECEF] flex items-center justify-between gap-2">
                          <Link
                            href={`/u/${partner.username || partner.userId}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#13141B] text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <span>View Profile</span>
                            <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
                          </Link>

                          <button
                            onClick={() => handleDisconnect(conn.id, partner.name)}
                            disabled={actionInProgress === conn.id}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 4: PENDING REQUESTS (When tab is "pending") */}
          {activeTab === "pending" && (
            <div className="space-y-6">
              {/* Received Requests */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EBECEF] pb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm sm:text-base font-extrabold font-sans text-[#13141B]">
                    Requests Received ({pendingReceived.length})
                  </h2>
                </div>

                {pendingReceived.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#5E6573] border border-[#EBECEF] shadow-xs">
                    No incoming connection requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingReceived.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl p-5 border border-[#EBECEF] shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#13141B] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                              {req.sender?.name?.slice(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <Link
                                href={`/u/${req.sender?.username || req.sender?.userId}`}
                                className="font-bold text-xs text-[#13141B] hover:text-[#00D2B4] flex items-center gap-1"
                              >
                                <span>{req.sender?.name}</span>
                                <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <EdIdBadge userId={req.sender?.userId} customId={req.sender?.edId} size="sm" variant="minimal" />
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                            {req.requestType || "Connect"}
                          </span>
                        </div>

                        {req.note && (
                          <p className="text-xs text-[#5E6573] bg-[#FCFCFB] p-2.5 rounded-xl border border-[#EBECEF] italic">
                            &ldquo;{req.note}&rdquo;
                          </p>
                        )}

                        <div className="pt-2 border-t border-[#EBECEF] flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeclineConnection(req.id)}
                            disabled={actionInProgress === req.id}
                            className="px-3 py-1.5 rounded-xl border border-[#EBECEF] hover:bg-slate-50 text-[#5E6573] text-xs font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleAcceptConnection(req.id)}
                            disabled={actionInProgress === req.id}
                            className="px-3.5 py-1.5 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5 text-[#00D2B4]" />
                            <span>Accept</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-[#EBECEF] pb-2">
                  <Clock className="w-4 h-4 text-[#5E6573]" />
                  <h2 className="text-sm sm:text-base font-extrabold font-sans text-[#13141B]">
                    Requests Sent ({pendingSent.length})
                  </h2>
                </div>

                {pendingSent.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#5E6573] border border-[#EBECEF] shadow-xs">
                    No pending sent connection requests.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingSent.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl p-5 border border-[#EBECEF] shadow-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#13141B] font-extrabold flex items-center justify-center text-xs">
                            {req.recipient?.name?.slice(0, 2).toUpperCase() || "??"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#13141B]">{req.recipient?.name}</p>
                            <p className="text-[11px] text-[#5E6573] line-clamp-1">{req.recipient?.headline || "EdWorld Member"}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#5E6573] border border-slate-200">
                          Pending
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
    <div className="bg-white rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-[#EBECEF] shadow-xs hover:border-[#D1D5DC] transition-all">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl font-extrabold flex items-center justify-center text-xs shadow-2xs ${
                isStudent ? "bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20" : "bg-[#13141B] text-white"
              }`}
            >
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/u/${member.username}`}
                className="font-extrabold text-xs sm:text-sm text-[#13141B] hover:text-[#00D2B4] transition-colors flex items-center gap-1"
              >
                <span>{member.name}</span>
                <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
              </Link>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-[#5E6573] font-medium">@{member.username}</span>
                <EdIdBadge userId={member.userId} customId={member.edId} size="sm" variant="pill" />
              </div>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${
              isStudent
                ? "bg-[#00D2B4]/10 text-[#0A5245] border-[#00D2B4]/20"
                : "bg-slate-100 text-[#13141B] border-[#EBECEF]"
            }`}
          >
            {isStudent ? <GraduationCap className="w-3 h-3 text-[#00D2B4]" /> : <Briefcase className="w-3 h-3 text-[#13141B]" />}
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
                className="px-2 py-0.5 rounded-md bg-[#FCFCFB] text-[#13141B] border border-[#EBECEF] text-[10px] font-bold"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#8F9CAE] italic">No skills added</span>
          )}
        </div>

        {/* Mutual Connections */}
        {typeof member.mutualConnectionsCount === "number" && member.mutualConnectionsCount > 0 && (
          <div className="text-[10px] font-mono text-[#00D2B4] font-bold flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{member.mutualConnectionsCount} mutual connection{member.mutualConnectionsCount === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-[#EBECEF] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/u/${member.username}`}
            className="text-[11px] font-bold text-[#13141B] hover:text-[#00D2B4] flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EBECEF] hover:bg-slate-50 transition-colors"
          >
            <span>Profile</span>
            <ArrowUpRight className="w-3 h-3 text-[#8F9CAE]" />
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

        <div className="flex items-center gap-1.5">
          {status === "accepted" ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Connected</span>
            </span>
          ) : status === "pending_sent" ? (
            <span className="text-[10px] font-mono text-[#5E6573] font-bold px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
              Pending
            </span>
          ) : status === "pending_received" ? (
            <span className="text-[10px] font-mono text-[#D97706] font-bold px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
              Requested
            </span>
          ) : (
            <Button
              onClick={onConnect}
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3 h-3 text-[#00D2B4]" />}
              className="rounded-lg bg-[#13141B] hover:bg-black text-white font-bold text-[11px] px-3 py-1 shadow-2xs"
            >
              <span>Connect</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

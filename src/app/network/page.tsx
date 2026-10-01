"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PublicUserProfile } from "@/lib/types";
import EdIdBadge from "@/components/ui/EdIdBadge";
import UserProfileDetailModal from "@/components/networking/UserProfileDetailModal";
import DirectMessageModal from "@/components/networking/DirectMessageModal";
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  GraduationCap,
  Briefcase,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  Lock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  MessageSquare,
  Award,
  BookOpen
} from "lucide-react";

export default function NetworkPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"all" | "students" | "professionals" | "connections" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<PublicUserProfile[]>([]);
  const [professionals, setProfessionals] = useState<PublicUserProfile[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);

  // Modals state
  const [selectedUserDetail, setSelectedUserDetail] = useState<PublicUserProfile | null>(null);
  const [selectedDmPeer, setSelectedDmPeer] = useState<PublicUserProfile | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [notificationToast, setNotificationToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Fetch real network members from database
  const loadNetworkData = useCallback(async (query = "") => {
    if (!user) return;
    setLoading(true);
    try {
      const url = `/api/network/members?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { "x-user-id": user.uid },
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
        headers: { "x-user-id": user.uid },
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

  useEffect(() => {
    if (user) {
      loadNetworkData();
      loadConnections();
    }
  }, [user, loadNetworkData, loadConnections]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      loadNetworkData(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, loadNetworkData]);

  // Trigger Toast Notification
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Handle Connect Request
  const handleConnect = async (targetUserId: string) => {
    if (!user || actionInProgress) return;
    setActionInProgress(targetUserId);

    try {
      const res = await fetch("/api/network/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          receiverId: targetUserId,
          message: "Let's connect on Edworld Co. verified network!",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Connection request sent! Recipient will be notified via email.");
        await loadConnections();
        await loadNetworkData(searchQuery);
      }
    } catch (err) {
      console.error("Connection error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Accept Connection
  const handleAcceptConnection = async (connectionId: string, partnerName: string) => {
    if (!user || actionInProgress) return;
    setActionInProgress(connectionId);

    try {
      const res = await fetch("/api/network/connections", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          connectionId,
          action: "accept",
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Connected with ${partnerName}! You can now start 1-on-1 direct messaging.`);
        await loadConnections();
        await loadNetworkData(searchQuery);
      }
    } catch (err) {
      console.error("Accept connection error:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Combine and filter list
  const allMembers = [...students, ...professionals];
  
  // Collect unique skills for filtering
  const allSkills = Array.from(
    new Set(allMembers.flatMap((m) => m.skills || []).filter(Boolean))
  ).slice(0, 10);

  const filterBySkill = (members: PublicUserProfile[]) => {
    if (selectedSkillFilter === "All") return members;
    return members.filter((m) => m.skills?.includes(selectedSkillFilter));
  };

  const getDisplayedMembers = () => {
    switch (activeTab) {
      case "students":
        return filterBySkill(students);
      case "professionals":
        return filterBySkill(professionals);
      case "connections":
        const connIds = new Set(activeConnections.map((c) => c.partnerId));
        return filterBySkill(allMembers.filter((m) => connIds.has(m.userId)));
      case "pending":
        const pendingIds = new Set(pendingReceived.map((p) => p.partnerId));
        return filterBySkill(allMembers.filter((m) => pendingIds.has(m.userId)));
      case "all":
      default:
        return filterBySkill(allMembers);
    }
  };

  const displayedList = getDisplayedMembers();

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] font-sans pb-24">
      
      {/* Real-Time Toast Notification */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#13141B] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#00D2B4] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#00D2B4]" />
          </div>
          <p className="text-xs font-medium text-gray-100">{notificationToast.message}</p>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Hero Station */}
        <div className="bg-white border border-[#EBECEF] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Database Network
              </span>
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D2B4]" />
                Zero Mock Users
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#13141B] tracking-tight">
              Peer &amp; Professional Networking
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Connect with verified university students, alumni, and industry engineers. View detailed academic portfolios, projects, certifications, and initiate 1-on-1 private messaging.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBECEF]">
            <div className="px-3.5 py-1.5 text-center border-r border-[#E8ECF2]">
              <div className="text-base sm:text-lg font-black font-mono text-[#13141B]">
                {allMembers.length}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Members</div>
            </div>
            <div className="px-3.5 py-1.5 text-center border-r border-[#E8ECF2]">
              <div className="text-base sm:text-lg font-black font-mono text-emerald-700">
                {activeConnections.length}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Connected</div>
            </div>
            <div className="px-3.5 py-1.5 text-center">
              <div className="text-base sm:text-lg font-black font-mono text-amber-700">
                {pendingReceived.length}
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-[#EBECEF] rounded-2xl p-4 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, college, skills..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F4F6FB] border border-[#E8ECF2] rounded-xl text-[#13141B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2B4]/40 transition-all"
              />
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Members", count: allMembers.length },
                { id: "students", label: "Students", count: students.length },
                { id: "professionals", label: "Professionals", count: professionals.length },
                { id: "connections", label: "My Connections", count: activeConnections.length },
                { id: "pending", label: "Requests", count: pendingReceived.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#13141B] text-white shadow-2xs"
                        : "text-gray-600 hover:text-[#13141B] hover:bg-[#F4F6FB]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive ? "bg-white/20 text-[#00D2B4]" : "bg-gray-200/70 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Filter Chips */}
          {allSkills.length > 0 && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-[#EBECEF] overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 pr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Skills:
              </span>
              <button
                onClick={() => setSelectedSkillFilter("All")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  selectedSkillFilter === "All"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-[#F4F6FB] text-gray-600 hover:bg-slate-100 border border-[#E8ECF2]"
                }`}
              >
                All
              </button>
              {allSkills.map((sk, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSkillFilter(sk)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                    selectedSkillFilter === sk
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-[#F4F6FB] text-gray-600 hover:bg-slate-100 border border-[#E8ECF2]"
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Member Cards Bento Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-[#EBECEF] animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded-md w-1/2"></div>
                  </div>
                </div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : displayedList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#EBECEF] text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F6FB] text-gray-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#13141B]">No members found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery
                ? `No database users matched "${searchQuery}". Try clearing your search.`
                : "No members available in this category yet. Be the first to invite peers!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedList.map((member) => {
              const initials = (member.name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const isConnected = member.connectionStatus === "accepted";
              const isPendingSent = member.connectionStatus === "pending_sent";
              const isPendingReceived = member.connectionStatus === "pending_received";

              return (
                <div
                  key={member.userId}
                  className="bg-white border border-[#EBECEF] hover:border-[#D1D5DC] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    
                    {/* Top Identity Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#E8ECF2]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#13141B] to-slate-800 text-[#00D2B4] flex items-center justify-center font-black text-sm shadow-2xs">
                              {initials}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-[#13141B] truncate leading-tight group-hover:text-emerald-700 transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {member.headline || (member.userType === "STUDENT" ? "Student" : "Tech Professional")}
                          </p>
                          {member.edId && (
                            <div className="mt-1">
                              <EdIdBadge userId={member.userId} customId={member.edId} size="sm" variant="pill" />
                            </div>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${
                          member.userType === "STUDENT"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}
                      >
                        {member.userType === "STUDENT" ? "Student" : "Pro"}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                      {member.college && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-[#00D2B4] shrink-0" />
                          <span className="truncate">{member.college}</span>
                        </div>
                      )}
                      {member.company && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 truncate">
                          <Building2 className="w-3.5 h-3.5 text-[#00D2B4] shrink-0" />
                          <span className="truncate">{member.company}</span>
                        </div>
                      )}
                      {member.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{member.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills preview */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {member.skills.slice(0, 3).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F4F6FB] text-gray-700 border border-[#E8ECF2]"
                          >
                            {sk}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-gray-400">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Card Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-[#EBECEF] flex items-center gap-2">
                    
                    {/* View Full Profile Button */}
                    <button
                      onClick={() => setSelectedUserDetail(member)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#F4F6FB] hover:bg-slate-100 border border-[#E8ECF2] text-[#13141B] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {/* Direct Message (E2E DM) */}
                    <button
                      onClick={() => setSelectedDmPeer(member)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E8ECF2] text-gray-700 transition-colors"
                      title="Send 1-on-1 Direct Message"
                    >
                      <MessageSquare className="w-4 h-4 text-[#00D2B4]" />
                    </button>

                    {/* Connect / Pending Action */}
                    {isPendingReceived ? (
                      <button
                        onClick={() => handleAcceptConnection(member.connectionId || "", member.name)}
                        disabled={actionInProgress === member.connectionId}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(member.userId)}
                        disabled={isConnected || isPendingSent || actionInProgress === member.userId}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                          isConnected
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                            : isPendingSent
                            ? "bg-amber-50 text-amber-800 border border-amber-200 cursor-default"
                            : "bg-[#13141B] hover:bg-[#252632] text-white"
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Connected</span>
                          </>
                        ) : isPendingSent ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Pending</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-[#00D2B4]" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Comprehensive Profile Detail Modal */}
      <UserProfileDetailModal
        user={selectedUserDetail}
        isOpen={Boolean(selectedUserDetail)}
        onClose={() => setSelectedUserDetail(null)}
        onConnect={(uid) => handleConnect(uid)}
        onOpenMessage={(u) => setSelectedDmPeer(u)}
        isConnecting={Boolean(actionInProgress)}
      />

      {/* 1-on-1 Direct Messaging Modal (E2E Mood) */}
      <DirectMessageModal
        peer={selectedDmPeer}
        isOpen={Boolean(selectedDmPeer)}
        onClose={() => setSelectedDmPeer(null)}
        onMessageSent={(msg) => showToast("Message sent! Email notification dispatched to recipient.")}
      />

    </div>
  );
}

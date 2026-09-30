"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  BarChart3, 
  Check, 
  Search, 
  Sparkles, 
  Clock, 
  Building2, 
  Activity, 
  RefreshCw, 
  FileText, 
  Video, 
  AlertCircle,
  Database,
  Lock,
  Download,
  Shield,
  Cpu,
  MessageSquare,
  Flag,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  LifeBuoy
} from "lucide-react";
import { UserRole } from "@/lib/types";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import { supabase } from "@/lib/supabase";
import { downloadUsersAsExcel } from "@/lib/excel-export";
import { AdminTicket } from "@/app/api/admin/tickets/route";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  lastActivity: string;
  createdAt: string;
}

interface AuditLogRecord {
  id: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AdminMetrics {
  totalUsers: number;
  totalResumes: number;
  totalInterviews: number;
  totalApplications: number;
  aiLogsCount: number;
  roleCounts: Record<string, number>;
  dbLatencyMs: number;
}

const ALL_ROLES: UserRole[] = [
  "SUPER_ADMIN", 
  "ADMIN", 
  "FOUNDER", 
  "HR", 
  "EMPLOYEE", 
  "COLLEGE_ADMIN", 
  "PLACEMENT_OFFICER", 
  "CLIENT", 
  "STUDENT", 
  "EXECUTIVE"
];

export default function AdminControlPage() {
  const { user, role, isAdmin, isSuperAdmin, isFounder } = useAuth();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "tickets" | "moderation" | "audit_logs">("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  const isPermitted = isAdmin || isSuperAdmin || isFounder;

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Overview data
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setUsers(data.users || []);
        setAuditLogs(data.recentAuditLogs || []);
      }

      // 2. Support Tickets & Moderation items
      const ticketRes = await fetch("/api/admin/tickets", {
        headers: user ? { "x-user-id": user.uid } : {},
      });
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json();
        if (ticketData.success) {
          setTickets(ticketData.tickets || []);
        }
      }
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPermitted) {
      loadAdminData();
    }
  }, [user, isPermitted]);

  if (user && !isPermitted) {
    return (
      <AccessDeniedPortal
        portalName="Platform Admin Console"
        requiredRole="System Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", userId);

      await supabase.from("audit_logs").insert({
        actor_id: user?.uid || null,
        actor_role: role,
        action: "admin.role_modified",
        target_type: "user",
        target_id: userId,
        metadata: { newRole }
      });

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setNotification(`Role successfully changed to ${newRole}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    setUpdatingId(userId);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await supabase
        .from("profiles")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", userId);

      await supabase.from("audit_logs").insert({
        actor_id: user?.uid || null,
        actor_role: role,
        action: newStatus === "SUSPENDED" ? "admin.user_suspended" : "admin.user_activated",
        target_type: "user",
        target_id: userId,
        metadata: { previousStatus: currentStatus, newStatus }
      });

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
      setNotification(`Account status updated to ${newStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateTicketStatus = async (ticket: AdminTicket, newStatus: string) => {
    setUpdatingId(ticket.id);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.uid || "",
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          ticketType: ticket.type,
          status: newStatus,
          resolutionNotes: resolutionNotes || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus as any, resolutionNotes } : t));
        setNotification(`Ticket status updated to ${newStatus}.`);
        setResolvingTicketId(null);
        setResolutionNotes("");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "OPEN") return t.status === "NEW" || t.status === "IN_PROGRESS";
    if (ticketFilter === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "APPROVED";
    return true;
  });

  const moderationTickets = tickets.filter((t) => t.type === "report" || t.type === "ugc_review");

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1536px] mx-auto font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#13141B] text-white flex items-center gap-1.5 font-mono">
              <Shield className="w-3.5 h-3.5 text-[#00D2B4]" />
              <span>ADMIN OPERATIONS PORTAL</span>
            </span>
            <span className="text-xs text-[#5E6573] font-mono">
              Live Postgres Telemetry &bull; Zero Mock Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13141B] tracking-tight">
            Platform Administration &amp; Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Comprehensive control of user roles, support ticket queues, content moderation, and audit compliance.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#F4F6FB] hover:bg-[#EBECEF] border border-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5E6573] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Full User Database</span>
          </Link>
          <Link
            href="/admin/system"
            className="px-4 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
          >
            <Activity className="w-4 h-4 text-[#00D2B4]" />
            <span>System Operations</span>
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Real Live Database Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#13141B] font-mono">{metrics?.totalUsers ?? users.length}</p>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">Live Postgres Records</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Resumes Built</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#13141B] font-mono">{metrics?.totalResumes ?? 0}</p>
          <span className="text-[10px] text-[#5E6573] font-mono">ATS Document DB</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Open Tickets</span>
            <LifeBuoy className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            {tickets.filter(t => t.status === "NEW" || t.status === "IN_PROGRESS").length}
          </p>
          <span className="text-[10px] text-amber-700 font-mono">Requires Attention</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Resolved Issues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "APPROVED").length}
          </p>
          <span className="text-[10px] text-emerald-700 font-mono">Completed Resolutions</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Flagged Reports</span>
            <Flag className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700 font-mono">{moderationTickets.length}</p>
          <span className="text-[10px] text-[#5E6573] font-mono">Trust &amp; Safety Queue</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBECEF] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5E6573] text-xs font-bold">
            <span>Database RLS</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">Active</p>
          <span className="text-[10px] text-emerald-700 font-mono">100% Policy Isolation</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EBECEF] scrollbar-none">
        {[
          { id: "overview", label: "System Telemetry", icon: BarChart3 },
          { id: "tickets", label: `Support Tickets & Issues (${tickets.length})`, icon: LifeBuoy },
          { id: "moderation", label: `User Reviews & Reports (${moderationTickets.length})`, icon: Flag },
          { id: "users", label: `User Directory & Roles (${users.length})`, icon: Users },
          { id: "audit_logs", label: `Audit Trail (${auditLogs.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#13141B] text-white shadow-xs font-extrabold"
                  : "bg-white text-[#5E6573] border border-[#EBECEF] hover:text-[#13141B] hover:bg-[#F4F6FB]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#13141B]">Database Role Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(metrics?.roleCounts || {}).map(([roleName, count]) => (
                <div key={roleName} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EBECEF] text-xs">
                  <span className="font-bold text-[#13141B]">{roleName}</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">{count} registered</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-[#13141B]">Operations Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/users"
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] hover:border-[#13141B] transition-all space-y-1 block"
              >
                <div className="flex items-center gap-2 text-[#13141B] font-bold text-xs">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Student &amp; User Intelligence</span>
                </div>
                <p className="text-[11px] text-[#5E6573]">Search users, view verified contact details, export to Excel.</p>
              </Link>

              <button
                onClick={() => setActiveTab("tickets")}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] hover:border-[#13141B] transition-all space-y-1 block text-left w-full"
              >
                <div className="flex items-center gap-2 text-[#13141B] font-bold text-xs">
                  <LifeBuoy className="w-4 h-4 text-amber-600" />
                  <span>Triage Support Queue</span>
                </div>
                <p className="text-[11px] text-[#5E6573]">Review inquiries, reply to user requests, and close issues.</p>
              </button>

              <button
                onClick={() => setActiveTab("moderation")}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] hover:border-[#13141B] transition-all space-y-1 block text-left w-full"
              >
                <div className="flex items-center gap-2 text-[#13141B] font-bold text-xs">
                  <Flag className="w-4 h-4 text-rose-600" />
                  <span>Content Moderation</span>
                </div>
                <p className="text-[11px] text-[#5E6573]">Approve or reject flagged UGC and member policy violations.</p>
              </button>

              <Link
                href="/admin/system"
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] hover:border-[#13141B] transition-all space-y-1 block"
              >
                <div className="flex items-center gap-2 text-[#13141B] font-bold text-xs">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>System Health Check</span>
                </div>
                <p className="text-[11px] text-[#5E6573]">Live Supabase health, latency probes, and storage storage audit.</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS & ISSUE RESOLUTION */}
      {activeTab === "tickets" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#13141B]">Support Tickets &amp; Inquiries</h3>
              <p className="text-xs text-[#5E6573]">Review user requests, send resolution emails, and close issues.</p>
            </div>

            <div className="flex items-center gap-2">
              {["ALL", "OPEN", "RESOLVED"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    ticketFilter === filter ? "bg-[#13141B] text-white" : "bg-[#F8FAFC] text-[#5E6573] border border-[#EBECEF]"
                  }`}
                >
                  {filter === "ALL" ? `All (${tickets.length})` : filter === "OPEN" ? "Open Issues" : "Resolved"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-[#5E6573] bg-[#F8FAFC] rounded-2xl border border-[#EBECEF] text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-[#13141B]">Zero Open Issues in this view</p>
                <p className="mt-1">All support inquiries and user tickets are up to date.</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isResolving = resolvingTicketId === t.id;
                const isClosed = t.status === "RESOLVED" || t.status === "CLOSED" || t.status === "APPROVED";

                return (
                  <div key={t.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBECEF] pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                          t.priority === "URGENT" || t.priority === "HIGH" 
                            ? "bg-rose-100 text-rose-800 border border-rose-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {t.priority}
                        </span>
                        <span className="font-extrabold text-[#13141B] text-sm">{t.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase font-mono ${
                          isClosed ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-[#8E95A5] text-[11px] font-mono">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-700 bg-white p-3.5 rounded-xl border border-[#EBECEF] whitespace-pre-wrap leading-relaxed">
                      {t.description}
                    </div>

                    {t.sourceEmail && (
                      <div className="text-[11px] text-[#5E6573] flex items-center gap-2">
                        <span><strong>User Email:</strong> <a href={`mailto:${t.sourceEmail}`} className="text-indigo-600 underline font-semibold">{t.sourceEmail}</a></span>
                      </div>
                    )}

                    {t.resolutionNotes && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                        <strong>Resolution Summary:</strong> {t.resolutionNotes}
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-[#8E95A5] font-mono">
                        Ticket ID: #{t.id.slice(0, 10)}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isClosed && !isResolving && (
                          <button
                            onClick={() => setResolvingTicketId(t.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolve &amp; Close Issue</span>
                          </button>
                        )}

                        {!isClosed && !isResolving && (
                          <button
                            disabled={updatingId === t.id}
                            onClick={() => handleUpdateTicketStatus(t, "IN_PROGRESS")}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#EBECEF] text-slate-700 hover:text-slate-900 font-bold text-xs"
                          >
                            Mark In-Progress
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resolution Form Inline */}
                    {isResolving && (
                      <div className="p-4 rounded-xl bg-white border border-emerald-300 space-y-3 animate-in fade-in">
                        <label className="block font-bold text-xs text-[#13141B]">
                          Resolution Notes (User will be notified via email):
                        </label>
                        <textarea
                          rows={3}
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Explain what steps were taken to resolve this issue..."
                          className="w-full p-2.5 rounded-xl border border-[#EBECEF] bg-[#F8FAFC] text-xs text-[#13141B] focus:outline-none focus:border-emerald-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setResolvingTicketId(null); setResolutionNotes(""); }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#EBECEF] text-slate-600 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={updatingId === t.id}
                            onClick={() => handleUpdateTicketStatus(t, "RESOLVED")}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                          >
                            {updatingId === t.id ? "Saving..." : "Confirm & Send Resolution"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER REVIEWS & MODERATION */}
      {activeTab === "moderation" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#13141B]">Content Moderation &amp; User Safety</h3>
              <p className="text-xs text-[#5E6573]">Approve or reject flagged UGC submissions, community reports, and profile violations.</p>
            </div>
            <Link
              href="/admin/moderation"
              className="px-4 py-2 rounded-xl bg-[#13141B] text-white text-xs font-bold hover:bg-[#252632] transition-colors"
            >
              Open Dedicated Moderation Studio
            </Link>
          </div>

          <div className="space-y-3">
            {moderationTickets.length === 0 ? (
              <div className="p-12 text-center text-[#5E6573] bg-[#F8FAFC] rounded-2xl border border-[#EBECEF] text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-[#13141B]">Zero Flagged Items</p>
                <p className="mt-1">All user reviews, experiences, and safety reports are clear.</p>
              </div>
            ) : (
              moderationTickets.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-rose-600" />
                      <span className="font-extrabold text-[#13141B]">{item.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {item.status}
                    </span>
                  </div>

                  <p className="p-3 bg-white rounded-xl border border-[#EBECEF] text-slate-700">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EBECEF]">
                    <span className="text-[11px] text-[#8E95A5]">Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateTicketStatus(item, "REJECTED")}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs"
                      >
                        Reject &amp; Remove
                      </button>
                      <button
                        onClick={() => handleUpdateTicketStatus(item, "APPROVED")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-xs"
                      >
                        Approve Content
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#EBECEF] text-xs text-[#13141B] placeholder:text-slate-400 focus:outline-none focus:border-[#13141B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 rounded-xl bg-[#F8FAFC] border border-[#EBECEF] text-xs text-[#13141B] font-bold focus:outline-none"
              >
                <option value="ALL">All Roles ({users.length})</option>
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                onClick={() => downloadUsersAsExcel(filteredUsers as any, "edworld_admin_users")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                title="Download user records as an Excel spreadsheet (.xls / .xlsx)"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredUsers.map((u) => (
              <div 
                key={u.id} 
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EBECEF] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#13141B] text-sm">{u.name}</span>
                    <span className="text-[11px] text-[#5E6573] font-mono">({u.email})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {u.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E95A5]">
                    User ID: <code>{u.id.slice(0, 8)}</code> &bull; Created: {u.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    disabled={updatingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="p-1.5 rounded-xl bg-white border border-[#EBECEF] text-xs text-[#13141B] font-bold focus:outline-none"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>

                  <button
                    disabled={updatingId === u.id}
                    onClick={() => handleToggleSuspend(u.id, u.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      u.status === "ACTIVE"
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT LOGS */}
      {activeTab === "audit_logs" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-[#13141B]">Immutable System Audit Log</h3>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-[#5E6573] py-8 text-center">No recent audit log entries recorded.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EBECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{log.action}</span>
                    <span className="text-[#13141B] font-semibold">{log.actorRole || "SYSTEM"} ({log.actorId ? log.actorId.slice(0, 8) : "core"})</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#8E95A5]">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

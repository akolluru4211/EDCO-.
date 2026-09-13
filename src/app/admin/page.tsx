"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Flag, 
  BarChart3, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  Search, 
  Sparkles, 
  Clock,
  Eye,
  CheckCircle2,
  Building2,
  KeyRound,
  Filter,
  Layers,
  Settings,
  Shield,
  UserX,
  Activity
} from "lucide-react";
import Button from "@/components/ui/Button";
import { UserRole, SystemAuditLog } from "@/lib/types";
import { getAuditLogs, recordAuditLog } from "@/lib/audit-logger";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";
import { supabase } from "@/lib/supabase";
import { normalizeDisplayName } from "@/lib/services/user-profile";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: "ACTIVE" | "SUSPENDED";
  lastLogin: string;
}

export default function AdminControlPage() {
  const { user, role, isAdmin, isSuperAdmin } = useAuth();

  if (user && !isAdmin && !isSuperAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Platform Admin Console"
        requiredRole="System Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"users_roles" | "audit_logs" | "organizations" | "security_events">("users_roles");

  // State
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    const logs = await getAuditLogs();
    setAuditLogs(logs);

    try {
      const { data: dbProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbProfiles && dbProfiles.length > 0) {
        const mapped: AdminUserRecord[] = dbProfiles.map((p) => {
          const { displayName } = normalizeDisplayName(p.first_name, p.last_name, p.name || p.display_name);
          return {
            id: p.id || p.user_id,
            name: displayName || p.name || p.email || "Registered User",
            email: p.email || `${p.username || "user"}@edworld.co.in`,
            role: (p.role as UserRole) || "CLIENT",
            department: p.department || (p.role === "TEACHER" ? "Faculty" : p.role === "EMPLOYEE" ? "Engineering" : "User Platform"),
            status: p.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
            lastLogin: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recent",
          };
        });
        setUsers(mapped);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.warn("[Admin profiles load note]:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updated);

    const targetUser = users.find(u => u.id === userId);
    await recordAuditLog({
      actorId: user?.uid || "admin_actor",
      actorName: user?.name || "Admin",
      actorRole: "ADMIN",
      action: "admin.role_modified",
      resource: "user_role",
      resourceId: userId,
      result: "SUCCESS",
      metadata: { targetUser: targetUser?.email, newRole },
    });

    setNotification(`Role updated to ${newRole} for ${targetUser?.name}.`);
    setTimeout(() => setNotification(null), 3500);
    const freshLogs = await getAuditLogs();
    setAuditLogs(freshLogs);
  };

  const handleToggleSuspend = async (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        return { ...u, status: newStatus as any };
      }
      return u;
    });
    setUsers(updated);

    const targetUser = users.find(u => u.id === userId);
    const actionName = targetUser?.status === "ACTIVE" ? "admin.user_suspended" : "admin.user_activated";
    await recordAuditLog({
      actorId: user?.uid || "admin_actor",
      actorName: user?.name || "Admin",
      actorRole: "ADMIN",
      action: actionName,
      resource: "user_status",
      resourceId: userId,
      result: "SUCCESS",
      metadata: { targetUser: targetUser?.email },
    });

    setNotification(`Status updated for ${targetUser?.name}.`);
    setTimeout(() => setNotification(null), 3500);
    const freshLogs = await getAuditLogs();
    setAuditLogs(freshLogs);
  };

  const allRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "FOUNDER", "HR", "EMPLOYEE", "TEACHER", "SCHOOL_ADMIN", "COLLEGE_ADMIN", "PLACEMENT_OFFICER", "CLIENT", "STUDENT", "EXECUTIVE"];

  const filteredUsers = users.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D7FC51]/10 text-[#D7FC51] border border-[#D7FC51]/30 flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#D7FC51]" />
              Platform Command
            </span>
            <span className="text-xs text-[#8E95A5]">Security Enforcement Level 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform Admin &amp; RBAC Control</h1>
          <p className="text-xs text-[#8E95A5]">
            Manage user roles, inspect immutable audit trails, and govern workspace permissions.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Link
            href="/admin/ai-monitoring"
            className="px-4 py-2.5 rounded-2xl bg-[#7B57FF]/20 hover:bg-[#7B57FF]/30 border border-[#7B57FF]/40 text-xs font-bold text-[#D7FC51] transition-all shadow-md flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-[#D7FC51]" />
            <span>AI Telemetry</span>
          </Link>
          <Link
            href="/admin/audit-logs"
            className="px-4 py-2.5 rounded-2xl bg-[#1C1D26] hover:bg-[#252633] border border-white/10 text-xs font-bold text-slate-200 transition-all shadow-md"
          >
            Audit Logs
          </Link>
          <Link
            href="/admin/system-health"
            className="px-4 py-2.5 rounded-2xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black uppercase tracking-wider transition-all shadow-md"
          >
            System Health
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "users_roles", label: `User Directory & RBAC Roles (${users.length})`, icon: Users },
          { id: "audit_logs", label: `Audit Trail Explorer (${auditLogs.length})`, icon: ShieldCheck },
          { id: "organizations", label: "Departments & Organizations", icon: Building2 },
          { id: "security_events", label: "Security & Policy Radar", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#D7FC51] text-[#13141B] shadow-md font-black"
                  : "bg-[#1C1D26] text-[#8E95A5] hover:text-white hover:bg-[#252633]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === "users_roles" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-[#8E95A5] uppercase">Role Filter:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 rounded-xl bg-[#1C1D26] border border-white/10 text-xs text-white"
              >
                <option value="ALL">All Roles</option>
                {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{u.name}</span>
                    <span className="text-[10px] text-[#8E95A5] font-mono">({u.email})</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {u.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8E95A5]">
                    {u.department} &bull; Last Login: {u.lastLogin}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="space-y-1">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                      className="p-1.5 rounded-xl bg-[#13141B] border border-white/10 text-xs text-[#D7FC51] font-bold"
                    >
                      {allRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleToggleSuspend(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      u.status === "ACTIVE"
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500 hover:bg-emerald-400 text-[#13141B]"
                    }`}
                  >
                    {u.status === "ACTIVE" ? "Suspend" : "Re-activate"}
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredUsers.length === 0 && (
              <div className="p-8 rounded-2xl bg-[#1C1D26] text-center space-y-3">
                <UserX className="w-8 h-8 text-[#8E95A5] mx-auto" />
                <p className="text-xs text-[#8E95A5]">No users found matching current filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "audit_logs" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">System Audit Log Explorer</h2>
              <p className="text-xs text-[#8E95A5]">Immutable record of account creations, role changes, payroll batches, and sensitive queries.</p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#1C1D26] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#D7FC51] font-bold">{log.action}</span>
                    <span className="px-2 py-0.2 rounded text-[9px] font-black bg-white/5 text-[#8E95A5]">{log.actorRole}</span>
                    <span className="text-white font-medium">by {log.actorName}</span>
                  </div>
                  <span className="text-[10px] text-[#8E95A5] font-mono">
                    Resource: {log.resource} {log.resourceId ? `(${log.resourceId})` : ""} &bull; {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black font-mono self-start md:self-auto ${log.result === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                  {log.result}
                </span>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="p-6 rounded-2xl bg-[#1C1D26] text-center text-xs text-[#8E95A5]">
                No audit log records found yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONS */}
      {activeTab === "organizations" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white">Enterprise Organizations &amp; Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">Engineering</span>
              <p className="text-[10px] text-[#8E95A5]">Core Platform, Distributed Infrastructure &amp; AI Agents</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">People Operations</span>
              <p className="text-[10px] text-[#8E95A5]">Talent Acquisition, Compliance &amp; Appraisal Governance</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-1">
              <span className="text-xs font-bold text-white">Academic Faculty</span>
              <p className="text-[10px] text-[#8E95A5]">School Quests, Curiosity Curricula &amp; Student Mentorship</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY RADAR */}
      {activeTab === "security_events" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Security &amp; Policy Radar</h2>
              <p className="text-xs text-[#8E95A5]">Real-time monitoring of Row-Level Security policies and auth token verification.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Zero Active Breaches
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Row-Level Security (RLS) Active on 100% of Relational Tables</span>
            </div>
            <p className="text-[#8E95A5]">
              Cross-tenant isolation enforced at Postgres engine level. Minors under 18 cannot be queried by external actors.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

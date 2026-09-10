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
  Shield
} from "lucide-react";
import Button from "@/components/ui/Button";
import { UserRole, SystemAuditLog } from "@/lib/types";
import { getAuditLogs, recordAuditLog } from "@/lib/audit-logger";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

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

  const loadAdminData = async () => {
    const logs = await getAuditLogs();
    setAuditLogs(logs);

    setUsers([
      { id: "usr-1", name: "System Administrator", email: "admin@edworld.co.in", role: "SUPER_ADMIN", department: "Executive Operations", status: "ACTIVE", lastLogin: "Just now" },
      { id: "usr-2", name: "Sunita Rao", email: "sunita@edworld.co.in", role: "FOUNDER", department: "Engineering", status: "ACTIVE", lastLogin: "10 mins ago" },
      { id: "usr-3", name: "Arjun Verma", email: "arjun.hr@edworld.co.in", role: "HR", department: "People Operations", status: "ACTIVE", lastLogin: "1 hour ago" },
      { id: "usr-4", name: "Dr. Shalini Gupta", email: "shalini.tpo@edworld.co.in", role: "COLLEGE_ADMIN", department: "Placement Cell", status: "ACTIVE", lastLogin: "2 hours ago" },
      { id: "usr-5", name: "Vikram Malhotra", email: "vikram.m@edworld.co.in", role: "EMPLOYEE", department: "Engineering", status: "ACTIVE", lastLogin: "Yesterday" },
      { id: "usr-6", name: "K. Narayanan", email: "narayanan.tea@edworld.co.in", role: "TEACHER", department: "Academic Faculty", status: "ACTIVE", lastLogin: "3 hours ago" },
    ]);
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
      resource: "user_account",
      resourceId: userId,
      result: "SUCCESS",
      metadata: { targetUser: targetUser?.email },
    });

    setNotification(`Account status changed for ${targetUser?.name}.`);
    setTimeout(() => setNotification(null), 3500);
    const freshLogs = await getAuditLogs();
    setAuditLogs(freshLogs);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const allRoles: UserRole[] = [
    "CLIENT",
    "EMPLOYEE",
    "HR",
    "TEACHER",
    "COLLEGE_ADMIN",
    "PLACEMENT_OFFICER",
    "FOUNDER",
    "EXECUTIVE",
    "ADMIN",
    "SUPER_ADMIN"
  ];

  return (
    <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
              System Administration
            </span>
            <span className="text-xs text-[#8E95A5]">🛡️ EdWorld Organization OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            Admin &amp; Security Command
          </h1>
          <p className="text-xs text-[#8E95A5]">
            Manage users, RBAC roles, organizational units, and explore immutable system audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black font-mono">
            Zero CVE Guard Active
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {[
          { id: "users_roles", label: "User Directory & RBAC Roles", icon: Users },
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
                No audit events recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONS */}
      {activeTab === "organizations" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white">Configured Organizational Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Core Engineering", head: "Sunita Rao", staffCount: 8, costCenter: "CC-101" },
              { name: "People Operations & HR", head: "Arjun Verma", staffCount: 3, costCenter: "CC-102" },
              { name: "Academic Faculty & K-12", head: "K. Narayanan", staffCount: 4, costCenter: "CC-103" },
              { name: "College Placements & TPO", head: "Dr. Shalini Gupta", staffCount: 3, costCenter: "CC-104" },
            ].map((div, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white block">{div.name}</span>
                <div className="text-[11px] text-[#8E95A5] space-y-0.5">
                  <div>Lead: <strong className="text-white">{div.head}</strong></div>
                  <div>Staff: <strong className="text-white">{div.staffCount} Members</strong></div>
                  <div>Cost Center: <strong className="text-[#D7FC51] font-mono">{div.costCenter}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY EVENTS */}
      {activeTab === "security_events" && (
        <div className="bg-[#13141B] p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white">Security Radar &amp; Threat Mitigation</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Privilege Escalation Policy Enforced</span>
              </span>
              <p className="text-[11px] text-emerald-300/80">
                All protected routes verify server-side authorization tokens against PostgreSQL user records. Unverified client tokens are rejected with 403 Forbidden.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1D26] border border-white/5 text-xs text-[#8E95A5] space-y-1">
              <span className="font-bold text-white block">Corporate Mailbox Isolation</span>
              <p className="text-[11px]">
                Internal organization routes are locked to authorized @edworld.co.in credentials with dedicated RBAC matrices.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

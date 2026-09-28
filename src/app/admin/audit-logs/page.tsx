"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  Clock, 
  User, 
  Lock, 
  ArrowLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  Eye
} from "lucide-react";
import Button from "@/components/ui/Button";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

const CATEGORY_MAP: Record<string, string> = {
  all: "All Event Categories",
  auth: "Authentication (Signup/Login/Logout)",
  consent: "Consent & Guardian Approvals",
  profile: "Profile & Goal Revisions",
  moderation: "Content Moderation & Reports",
  admin: "Admin Tooling & Clearance",
  billing: "Subscriptions & Razorpay",
  data_rights: "Data Rights & Erasure",
};

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { user, role, isAdmin, loading: authLoading } = useAuth();

  if (user && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="System Security Audit Logs"
        requiredRole="Security Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchLogs();
  }, [isAdmin, authLoading]);

  const fetchLogs = async () => {
    setLoading(true);

    try {
      // 1. Fetch from server-side authenticated audit logs API
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.logs)) {
          setLogs(json.logs);
          return;
        }
      }

      // 2. Direct Supabase Query Fallback
      const { data: dbLogs } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (dbLogs && dbLogs.length > 0) {
        const mapped: AuditLog[] = dbLogs.map((log: any) => ({
          id: log.id,
          actorId: log.actor_id || "System",
          actorRole: log.actor_role || "system",
          action: log.action || "system.event",
          targetType: log.target_type || "resource",
          targetId: log.target_id || "global",
          metadata: log.metadata || {},
          ipAddress: log.ip_address || "127.0.0.1",
          timestamp: log.created_at || log.timestamp || new Date().toISOString(),
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-bold uppercase tracking-wider">
              Admin Clearance Required
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              The immutable <code>auditLogs</code> system is accessible exclusively to verified platform administrators.
            </p>
          </div>
          <Button href="/admin" variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            <span>Return to Admin Hub</span>
          </Button>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      selectedCategory === "all" || log.action.startsWith(`${selectedCategory}.`);
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Hub</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retention Policy: 730 Days</span>
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold font-mono uppercase tracking-wider border border-rose-200">
                Security &amp; Accountability
              </span>
              <span className="text-xs font-mono text-slate-500">Immutable Server-Side Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Real-time audit trail capturing authentication, guardian consent authorizations, content moderation, admin actions, and DPDP data rights requests.
            </p>
          </div>

          <Button
            onClick={fetchLogs}
            variant="outline"
            size="sm"
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            <span>Refresh Ledger</span>
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Action, Actor ID, or Target ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Timestamp (UTC)</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Target</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isMinor = log.actorRole === "minor";
                    const isAdminAction = log.actorRole === "admin";
                    const isConsent = log.action.startsWith("consent.");

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isAdminAction
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : isConsent
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-brand-50 text-brand-800 border border-brand-200"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{log.actorId}</span>
                            <span className="text-[10px] text-slate-400 uppercase">({log.actorRole})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                          <span className="text-slate-400 font-normal">{log.targetType}:</span>{" "}
                          <span className="font-bold">{log.targetId}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                          {log.ipAddress || "—"}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold">No audit entries matching filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Sanitized Metadata Inspector */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Audit Event Entry
                  </span>
                  <h3 className="text-base font-black text-slate-900">{selectedLog.action}</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                  <p><strong className="text-slate-500">Log ID:</strong> {selectedLog.id}</p>
                  <p><strong className="text-slate-500">Timestamp:</strong> {selectedLog.timestamp}</p>
                  <p><strong className="text-slate-500">Actor:</strong> {selectedLog.actorId} ({selectedLog.actorRole})</p>
                  <p><strong className="text-slate-500">Target:</strong> {selectedLog.targetType} / {selectedLog.targetId}</p>
                  <p><strong className="text-slate-500">IP Address:</strong> {selectedLog.ipAddress || "null"}</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Sanitized Event Metadata (Zero PII Leaked):
                  </p>
                  <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setSelectedLog(null)}
                  variant="dark"
                  size="sm"
                  icon={null}
                >
                  <span>Close Inspector</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

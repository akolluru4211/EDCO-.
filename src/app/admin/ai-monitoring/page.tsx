"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Cpu,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Terminal,
  BarChart3
} from "lucide-react";

interface MonitoringData {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  activeModel: string;
  activeFastModel: string;
  featureBreakdown: Record<string, number>;
  recentLogs: Array<{
    id: string;
    analysis_id: string;
    feature: string;
    analysis_type: string;
    model: string;
    prompt_version: string;
    latency_ms: number;
    status: string;
    created_at: string;
  }>;
}

export default function AIMonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ai-monitoring");
      if (!res.ok) throw new Error("Failed to load telemetry data.");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <AuthGuard allowedRoles={["ADMIN", "SUPER_ADMIN", "FOUNDER"]}>
      <div className="min-h-screen bg-[#0E0F15] text-white p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/admin" className="hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
            <span>/</span>
            <span className="text-[#D7FC51] font-bold">Claude AI Telemetry & Monitoring</span>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-[#13141B] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7B57FF]/20 text-[#7B57FF] border border-[#7B57FF]/30 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  <span>Internal AI Monitoring Layer</span>
                </span>
                <span className="text-xs font-mono text-slate-400">Phase 33 Standard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Claude MCP Analysis &amp; Health Radar
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Real-time observability of Anthropic Claude reasoning requests, scoped MCP data tool invocations, prompt versioning, and latency telemetry. Zero mock numbers.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 font-mono text-xs text-right bg-black/40 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Primary Reasoning:</span>
                <span className="text-[#D7FC51] font-bold">{data?.activeModel || "claude-3-7-sonnet"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Fast Evaluator:</span>
                <span className="text-[#00D2B4] font-bold">{data?.activeFastModel || "claude-3-5-haiku"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#13141B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Total Claude Requests</span>
              <Activity className="w-4 h-4 text-[#7B57FF]" />
            </div>
            <div className="text-2xl font-black text-white">{data?.totalRequests || 0}</div>
            <div className="text-[10px] text-slate-400 font-mono">Logged across all features</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#13141B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Success Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {data && data.totalRequests > 0 ? Math.round((data.successfulRequests / data.totalRequests) * 100) + "%" : "100%"}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{data?.successfulRequests || 0} Succeeded / {data?.failedRequests || 0} Failed</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#13141B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Average Latency</span>
              <Clock className="w-4 h-4 text-[#00D2B4]" />
            </div>
            <div className="text-2xl font-black text-[#00D2B4]">{data?.averageLatencyMs || 0} ms</div>
            <div className="text-[10px] text-slate-400 font-mono">End-to-end processing time</div>
          </div>
          <div className="p-5 rounded-2xl bg-[#13141B] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Active Features</span>
              <Layers className="w-4 h-4 text-[#D7FC51]" />
            </div>
            <div className="text-2xl font-black text-[#D7FC51]">{data ? Object.keys(data.featureBreakdown).length : 0}</div>
            <div className="text-[10px] text-slate-400 font-mono">Distinct analysis domains</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#7B57FF]" />
              <h3 className="text-sm font-bold text-white">Requests by Feature Domain</h3>
            </div>
            {data && Object.keys(data.featureBreakdown).length > 0 ? (
              <div className="space-y-3 pt-2">
                {Object.entries(data.featureBreakdown).map(([feat, count]) => (
                  <div key={feat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-300 font-bold">{feat}</span>
                      <span className="font-mono text-[#D7FC51]">{count} requests</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-[#7B57FF] h-full rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, data.totalRequests)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 italic bg-black/30 rounded-2xl border border-dashed border-white/10">
                No feature requests logged yet.
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-[#13141B] p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">MCP Architecture &amp; Security Protocol</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#00D2B4] uppercase block font-bold">Data Isolation</span>
                <p className="text-slate-300">Claude has zero direct SQL or database access. All data flows strictly through authorized MCP tools.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#7B57FF] uppercase block font-bold">Evidence Rule</span>
                <p className="text-slate-300">Every single recommendation requires traceable snippets from uploaded resumes or real transcripts.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-[#D7FC51] uppercase block font-bold">Zero Fake Numbers</span>
                <p className="text-slate-300">If data is insufficient, the system returns an honest empty state rather than simulated analytics.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase block font-bold">24-Hour Cache Deduplication</span>
                <p className="text-slate-300">Unchanged documents reuse previous structured results to eliminate redundant API token billing.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#13141B] p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D7FC51]" />
              <h3 className="text-sm font-bold text-white">Recent Claude Analysis Telemetry Logs</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{data?.recentLogs.length || 0} Entries</span>
          </div>
          {data && data.recentLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 font-bold">Analysis ID</th>
                    <th className="pb-3 font-bold">Feature</th>
                    <th className="pb-3 font-bold">Type</th>
                    <th className="pb-3 font-bold">Model</th>
                    <th className="pb-3 font-bold">Prompt Ver</th>
                    <th className="pb-3 font-bold">Latency</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 text-white font-bold">{log.analysis_id}</td>
                      <td className="py-3 capitalize text-slate-300">{log.feature}</td>
                      <td className="py-3 text-[#00D2B4]">{log.analysis_type}</td>
                      <td className="py-3 text-slate-400">{log.model}</td>
                      <td className="py-3 text-slate-400">{log.prompt_version}</td>
                      <td className="py-3 text-white">{log.latency_ms} ms</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : log.status === "INSUFFICIENT_DATA"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500 italic bg-black/30 rounded-2xl border border-dashed border-white/10 space-y-1">
              <p className="font-bold text-slate-400">No AI Activity Logged Yet</p>
              <p className="text-[11px]">Claude analysis requests and MCP tool telemetry will appear here in real time.</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

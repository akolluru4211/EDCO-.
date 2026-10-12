"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  RefreshCw,
  Eye,
  Check
} from "lucide-react";

export default function AdminBulkMailSenderPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    allStudents: 0,
    onboardedStudents: 0,
    totalUsers: 0,
  });
  const [hasResendKey, setHasResendKey] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer Form
  const [audience, setAudience] = useState<"all_students" | "onboarded_students" | "all_users">("all_students");
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  
  // Dispatch State
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bulk-mail");
      const data = await res.json();
      if (data.counts) setCounts(data.counts);
      setHasResendKey(data.hasResendKey || false);
      if (data.recentBroadcasts) setRecentBroadcasts(data.recentBroadcasts);
    } catch (err) {
      console.error("Failed to load bulk mail telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSend = async (isTest: boolean) => {
    if (!subject.trim() || !message.trim()) {
      setDispatchResult({
        success: false,
        message: "Subject and Message body are required before dispatching.",
      });
      return;
    }

    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch("/api/admin/bulk-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          subject: subject.trim(),
          headline: headline.trim() || subject.trim(),
          message: message.trim(),
          ctaLabel: ctaLabel.trim() || undefined,
          ctaUrl: ctaUrl.trim() || undefined,
          isTest,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchResult({
          success: true,
          message: data.notice || `Successfully broadcast to ${data.deliveredCount} recipients via Resend!`,
        });
        if (!isTest) {
          setSubject("");
          setHeadline("");
          setMessage("");
          setCtaLabel("");
          setCtaUrl("");
        }
        fetchTelemetry();
      } else {
        setDispatchResult({
          success: false,
          message: data.error || "Failed to dispatch email.",
        });
      }
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: err.message || "Network error while dispatching email.",
      });
    } finally {
      setDispatching(false);
    }
  };

  const recipientCount = 
    audience === "all_students" 
      ? counts.allStudents 
      : audience === "onboarded_students" 
      ? counts.onboardedStudents 
      : counts.totalUsers;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-black" />
              <span>Resend Email Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Bulk Mail Sender for Students
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600">
              Broadcast direct platform updates, hiring announcements, and hackathon alerts to student cohorts via Resend.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border flex items-center gap-1.5 ${
              hasResendKey
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-neutral-100 text-neutral-700 border-neutral-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${hasResendKey ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`} />
              <span>{hasResendKey ? "Resend Live API Active" : "Resend Audit Mode"}</span>
            </span>

            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-2 rounded-xl border border-neutral-200 hover:border-black text-black bg-white"
              title="Refresh Audience Count"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Email Composer Form */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <h2 className="text-lg font-black text-black">Compose Broadcast</h2>
            <span className="text-xs font-mono font-bold text-neutral-500">
              Target: {recipientCount} Recipients
            </span>
          </div>

          {dispatchResult && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              dispatchResult.success 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : "bg-red-50 border-red-200 text-red-900"
            }`}>
              {dispatchResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{dispatchResult.message}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            
            {/* Audience Selector */}
            <div className="space-y-1">
              <label className="font-bold text-black uppercase text-[10px] tracking-wider">Select Student Audience</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAudience("all_students")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    audience === "all_students"
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="font-bold text-xs">All Students</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${audience === "all_students" ? "text-neutral-300" : "text-neutral-500"}`}>
                    {counts.allStudents} candidates
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("onboarded_students")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    audience === "onboarded_students"
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="font-bold text-xs">Onboarded Only</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${audience === "onboarded_students" ? "text-neutral-300" : "text-neutral-500"}`}>
                    {counts.onboardedStudents} candidates
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("all_users")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    audience === "all_users"
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div className="font-bold text-xs">All Accounts</div>
                  <div className={`text-[10px] font-mono mt-0.5 ${audience === "all_users" ? "text-neutral-300" : "text-neutral-500"}`}>
                    {counts.totalUsers} accounts
                  </div>
                </button>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="font-bold text-black uppercase text-[10px] tracking-wider">Email Subject Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. 🚀 15+ New Full-Time & Internship Roles Live on EdWorld Co."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-semibold text-black bg-white"
              />
            </div>

            {/* Hero Headline */}
            <div className="space-y-1">
              <label className="font-bold text-black uppercase text-[10px] tracking-wider">Hero Headline in Email Body (Optional)</label>
              <input
                type="text"
                placeholder="Defaults to Subject if left blank"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="font-bold text-black uppercase text-[10px] tracking-wider">Message Content *</label>
              <textarea
                rows={7}
                required
                placeholder="Write your announcement message to the students. Supports multiple paragraphs..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white leading-relaxed"
              />
            </div>

            {/* Optional Call to Action Button */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <span className="font-bold text-black uppercase text-[10px] tracking-wider block">
                Call to Action Button (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Button Label (e.g. Explore Jobs)"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
                />
                <input
                  type="url"
                  placeholder="Target URL (e.g. https://edworldco.in/jobs)"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-black text-xs font-medium text-black bg-white"
                />
              </div>
            </div>

            {/* Dispatch Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSend(true)}
                disabled={dispatching || !subject.trim() || !message.trim()}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-black text-black font-bold text-xs transition-colors bg-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Send Test Preview to Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend(false)}
                disabled={dispatching || !subject.trim() || !message.trim()}
                className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {dispatching 
                    ? "Transmitting via Resend..." 
                    : `Send to All ${recipientCount} Students`}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Live Email Preview Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span>Live Inbox Email Preview</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Resend Engine</span>
            </div>

            {/* Mock Email Preview Screen */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 space-y-4 text-xs font-sans">
              <div className="space-y-1 border-b border-neutral-200 pb-3 text-[11px]">
                <div className="text-neutral-500">
                  <span className="font-bold text-black">From:</span> EdWorld Co. &lt;notifications@edworldco.in&gt;
                </div>
                <div className="text-neutral-500 truncate">
                  <span className="font-bold text-black">Subject:</span> {subject || "Subject line will appear here..."}
                </div>
              </div>

              {/* Email Content Canvas */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                <div className="border-b-2 border-black pb-3">
                  <span className="text-[9px] font-mono font-extrabold uppercase bg-black text-white px-2 py-0.5 rounded">
                    ANNOUNCEMENT
                  </span>
                  <h3 className="text-base font-black text-black mt-2 leading-tight">
                    {headline || subject || "Your Announcement Headline"}
                  </h3>
                </div>

                <div className="text-neutral-800 leading-relaxed text-xs whitespace-pre-wrap min-h-[80px]">
                  {message || "Message content preview will render here in real-time as you compose your announcement..."}
                </div>

                {ctaLabel && (
                  <div className="text-center pt-2">
                    <span className="inline-block px-5 py-2.5 rounded-lg bg-black text-white font-bold text-xs shadow-xs">
                      {ctaLabel} &rarr;
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-100 text-[10px] text-neutral-400 text-center space-y-0.5 font-mono">
                  <div>EdWorld Co. • Hyderabad, Telangana, India</div>
                  <div>Automated Student Dispatch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Past Broadcast History */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-black">Recent Dispatches</h3>
            {recentBroadcasts.length === 0 ? (
              <p className="text-xs text-neutral-500">No broadcasts recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBroadcasts.slice(0, 4).map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-black">
                      <span className="truncate max-w-[200px]">{log.metadata?.subject || "Announcement"}</span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {new Date(log.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {log.metadata?.recipientCount || 1} recipients • {log.metadata?.isTest ? "Admin Test" : "Student Broadcast"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

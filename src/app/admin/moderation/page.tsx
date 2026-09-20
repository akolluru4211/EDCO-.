"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Lock 
} from "lucide-react";
import Button from "@/components/ui/Button";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

export default function AdminModerationPage() {
  const { user, role, isAdmin, loading } = useAuth();

  if (user && !isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Content Moderation Console"
        requiredRole="Content Moderator / Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubmissions() {
      if (!user) return;
      const { data, error } = await supabase
        .from("showcase_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setSubmissions(data);
      setFetching(false);
    }
    loadSubmissions();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("showcase_submissions")
        .update({ moderation_status: newStatus })
        .eq("id", id);

      if (!error) {
        setSubmissions(submissions.map(s => s.id === id ? { ...s, moderation_status: newStatus } : s));
        setActionMessage(`Submission ${newStatus} successfully.`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (e) {
      console.warn("Moderation status update note:", e);
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Clearance Required</h1>
          <p className="text-xs text-slate-500">Only authorized administrators and educators have access to moderation queues.</p>
          <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-900">Admin Hub</Link>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-900">Talent Showcase Moderation</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Minor Safety & Showcase Review Queue</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/ambassadors"
              className="px-4 py-2 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-sm"
            >
              Ambassador Applications Queue &rarr;
            </Link>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {submissions.filter(s => s.moderation_status === "pending").length} Pending Reviews
            </span>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-400">
              No submissions queued for review.
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">User ID: {sub.user_id}</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{sub.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${
                      sub.moderation_status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : sub.moderation_status === "rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {sub.moderation_status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      {sub.visibility}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{sub.description}</p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Submitted on {new Date(sub.created_at).toLocaleString()}
                  </span>

                  <div className="flex gap-2">
                    {sub.moderation_status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "approved")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {sub.moderation_status !== "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "rejected")}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

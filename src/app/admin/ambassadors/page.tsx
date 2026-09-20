"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink,
  ShieldCheck,
  Power
} from "lucide-react";
import AccessDeniedPortal from "@/components/ui/AccessDeniedPortal";

export const dynamic = "force-dynamic";

export default function AdminAmbassadorModerationPage() {
  const { user, role, isAdmin, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [activeTab, setActiveTab] = useState<"applications" | "ambassadors">("applications");
  const [reviewModalApp, setReviewModalApp] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ambassador/admin?status=${filterStatus}`);
      const data = await res.json();
      if (data.applications) setApplications(data.applications);
      if (data.ambassadors) setAmbassadors(data.ambassadors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, filterStatus]);

  const handleReview = async (action: "approved" | "rejected") => {
    if (!user || !reviewModalApp) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/ambassador/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: reviewModalApp.id,
          reviewerId: user.uid,
          action,
          reviewNotes: reviewNotes.trim() || null
        })
      });

      if (res.ok) {
        setReviewModalApp(null);
        setReviewNotes("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/ambassador/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isActive: !currentStatus
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Authenticating...</div>;
  }

  if (!isAdmin) {
    return (
      <AccessDeniedPortal
        portalName="Ambassador Management Console"
        requiredRole="Platform Administrator"
        userRole={role}
        redirectTo="/dashboard"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/admin/moderation" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Moderation Hub
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#181920]">Campus Ambassador Moderation</h1>
              <p className="text-xs text-[#767E94]">Review university ambassador applications, assign referral codes, and manage active campus leaders.</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#E8ECF2] pb-3">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "applications"
                ? "bg-[#181920] text-white"
                : "bg-white text-[#767E94] border border-[#E8ECF2]"
            }`}
          >
            Applications Queue ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("ambassadors")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "ambassadors"
                ? "bg-[#181920] text-white"
                : "bg-white text-[#767E94] border border-[#E8ECF2]"
            }`}
          >
            Active Ambassadors ({ambassadors.length})
          </button>
        </div>

        {activeTab === "applications" ? (
          /* Applications Queue */
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              {["pending", "approved", "rejected", "withdrawn", "all"].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    filterStatus === st
                      ? "bg-[#5C38FF] text-white shadow-sm"
                      : "bg-white text-[#767E94] border border-[#E8ECF2]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-xs text-[#767E94]">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="card-quixel p-12 text-center text-xs text-[#767E94]">
                No applications matching status '{filterStatus}'.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="card-quixel p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E8ECF2] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#181920]">{app.users?.name || "Applicant"}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            app.status === "pending" ? "bg-amber-100 text-amber-800" :
                            app.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#5C38FF]">{app.college_name}</p>
                      </div>
                      <span className="text-[11px] font-mono text-[#767E94]">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-[#181920] font-bold">Why Ambassador:</strong>
                        <p className="text-[#767E94] mt-0.5">{app.why_ambassador}</p>
                      </div>

                      {app.relevant_experience && (
                        <div>
                          <strong className="text-[#181920] font-bold">Relevant Experience:</strong>
                          <p className="text-[#767E94] mt-0.5">{app.relevant_experience}</p>
                        </div>
                      )}

                      {app.social_links && (app.social_links.linkedin || app.social_links.instagram) && (
                        <div className="flex items-center gap-3 pt-1">
                          {app.social_links.linkedin && (
                            <a href={app.social_links.linkedin} target="_blank" rel="noreferrer" className="text-xs text-[#5C38FF] font-bold hover:underline flex items-center gap-1">
                              LinkedIn <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {app.social_links.instagram && (
                            <a href={app.social_links.instagram} target="_blank" rel="noreferrer" className="text-xs text-[#5C38FF] font-bold hover:underline flex items-center gap-1">
                              Instagram <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {app.review_notes && (
                        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                          <strong>Admin Internal Note:</strong> {app.review_notes}
                        </div>
                      )}
                    </div>

                    {app.status === "pending" && (
                      <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-end gap-3">
                        <button
                          onClick={() => setReviewModalApp(app)}
                          className="px-4 py-2 rounded-xl bg-[#5C38FF] text-white text-xs font-bold hover:bg-[#4D2CE0]"
                        >
                          Review &amp; Decide
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Active Ambassadors Management */
          <div className="space-y-4">
            {ambassadors.length === 0 ? (
              <div className="card-quixel p-12 text-center text-xs text-[#767E94]">
                No active campus ambassadors registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ambassadors.map(amb => (
                  <div key={amb.user_id} className="card-quixel p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#181920]">{amb.users?.name || "Ambassador"}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          amb.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {amb.is_active ? "Active" : "Deactivated"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#5C38FF]">{amb.college_name}</p>
                      <div className="p-2 rounded-lg bg-[#F4F6FB] border border-[#E8ECF2] font-mono text-xs font-bold text-[#181920]">
                        {amb.referral_code}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#767E94]">Joined: {new Date(amb.joined_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleToggleActive(amb.user_id, amb.is_active)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                          amb.is_active 
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{amb.is_active ? "Deactivate" : "Reactivate"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: Review Application */}
        {reviewModalApp && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E8ECF2] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-lg font-black text-[#181920]">Review Ambassador Application</h2>
                <button onClick={() => setReviewModalApp(null)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <strong className="text-[#181920]">Applicant:</strong> {reviewModalApp.users?.name} ({reviewModalApp.college_name})
                </div>
                <div>
                  <strong className="text-[#181920]">Statement:</strong>
                  <p className="text-[#767E94] mt-1">{reviewModalApp.why_ambassador}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Internal Admin Note (Never shown to applicant)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Good leadership background, approved for South Region..."
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs bg-[#F4F6FB] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReview("rejected")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleReview("approved")}
                  className="px-5 py-2 rounded-xl bg-[#00C48C] hover:bg-[#00A878] text-white text-xs font-black shadow"
                >
                  {submitting ? "Processing..." : "Approve Ambassador & Issue Code"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

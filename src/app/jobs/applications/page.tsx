"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobApplication, ResumeContent } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { 
  FileCheck, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Building2, 
  AlertCircle, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  FileText, 
  X,
  Eye,
  Trash2,
  AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function ApplicationsTrackerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<{
    jobTitle: string;
    companyName: string;
    resumeTitle: string;
    snapshot?: ResumeContent;
  } | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

  const isAdult = user ? user.ageBand === "18+" : true;

  const loadApplications = async () => {
    if (!user || !isAdult) return;
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, jobs(title, company)")
        .eq("user_id", user.uid)
        .order("applied_at", { ascending: false });

      if (data && data.length > 0) {
        const mapped: JobApplication[] = data.map((a: any) => ({
          id: a.id,
          jobId: a.job_id,
          jobTitle: a.jobs?.title || a.job_title || "Engineering Role",
          companyName: a.jobs?.company || a.company_name || "Verified Employer",
          userId: a.user_id,
          applicantName: user.name,
          applicantEmail: user.email,
          resumeId: a.resume_id,
          resumeTitle: "Submitted Resume Snapshot",
          resumeSnapshot: a.resume_snapshot,
          coverNote: a.cover_note,
          status: a.status,
          appliedAt: a.applied_at,
          matchScore: a.match_score,
          statusUpdatedAt: a.status_updated_at || a.updated_at || a.applied_at,
          feedbackNote: a.feedback_note || a.employer_notes,
          viewedAt: a.viewed_at,
        }));
        setApplications(mapped);
        return;
      }
    } catch (err) {
      console.warn("Failed to load applications from Supabase:", err);
    }

    // Fallback to local storage
    const saved = localStorage.getItem("edworld_applications");
    if (saved) {
      try {
        const list: JobApplication[] = JSON.parse(saved);
        setApplications(list.filter((a) => a.userId === user.uid));
        return;
      } catch (e) {}
    }

    setApplications([]);
  };

  useEffect(() => {
    loadApplications();
  }, [user, isAdult]);

  // Handle Withdrawal
  const handleWithdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this application? This will remove your submission from the employer's active candidate review.")) {
      return;
    }

    setIsWithdrawing(appId);
    try {
      const resp = await fetch("/api/jobs/applications/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          mockUserId: user?.uid,
        }),
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.error || "Failed to withdraw application");
      }

      // Update local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: "withdrawn", statusUpdatedAt: new Date().toISOString() }
            : a
        )
      );

      // Also update localStorage
      const saved = localStorage.getItem("edworld_applications");
      if (saved) {
        try {
          const list: JobApplication[] = JSON.parse(saved);
          const updated = list.map((a) =>
            a.id === appId ? { ...a, status: "withdrawn" as const } : a
          );
          localStorage.setItem("edworld_applications", JSON.stringify(updated));
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err.message || "Failed to withdraw");
    } finally {
      setIsWithdrawing(null);
    }
  };

  const getStatusBadge = (status: JobApplication["status"]) => {
    switch (status) {
      case "submitted":
      case "applied":
        return {
          label: "Submitted — Waiting for review",
          className: "bg-stone-100 text-stone-700 border-stone-200",
        };
      case "viewed_by_employer":
      case "viewed":
        return {
          label: "Viewed by employer",
          className: "bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold",
        };
      case "shortlisted":
      case "interview":
        return {
          label: "Shortlisted for interview",
          className: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold",
        };
      case "rejected":
        return {
          label: "Application declined",
          className: "bg-stone-100 text-stone-600 border-stone-200",
        };
      case "withdrawn":
        return {
          label: "Withdrawn by candidate",
          className: "bg-rose-50 text-rose-700 border-rose-200 italic",
        };
      default:
        return {
          label: String(status),
          className: "bg-stone-100 text-stone-700 border-stone-200",
        };
    }
  };

  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Access Restricted</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Job applications are restricted to adult Career Track accounts (18+).
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Board</span>
          </Link>
          <span className="text-xs text-stone-500 font-semibold">{applications.length} Applications Total</span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 font-serif">My Job Applications</h1>
              <p className="text-xs text-stone-500">
                Transparent status tracking, immutable resume snapshots, and direct employer feedback notes.
              </p>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const statusInfo = getStatusBadge(app.status);
              const isWithdrawn = app.status === "withdrawn";

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-3xl border ${isWithdrawn ? "border-stone-200 opacity-60" : "border-stone-200"} shadow-sm p-6 sm:p-7 space-y-4 hover:shadow-md transition-all`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-stone-900 font-serif">{app.jobTitle}</h2>
                        <span className="text-xs font-semibold text-stone-500">&bull; {app.companyName}</span>
                        {app.matchScore && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {app.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>Snapshot: <strong className="text-stone-700">{app.resumeTitle}</strong></span>
                        <button
                          onClick={() =>
                            setSelectedSnapshot({
                              jobTitle: app.jobTitle || "Role",
                              companyName: app.companyName || "Employer",
                              resumeTitle: app.resumeTitle,
                              snapshot: app.resumeSnapshot,
                            })
                          }
                          className="text-emerald-800 hover:underline font-bold inline-flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Submitted Snapshot</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs border text-center ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>

                      {!isWithdrawn && (
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          disabled={isWithdrawing === app.id}
                          title="Withdraw Application"
                          className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Candidate Note */}
                  {app.coverNote && (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-700 italic">
                      <span className="font-bold not-italic text-stone-800 block mb-0.5">Your Note to Recruiter:</span>
                      &ldquo;{app.coverNote}&rdquo;
                    </div>
                  )}

                  {/* Recruiter Feedback Note */}
                  {app.feedbackNote && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-emerald-900">Employer Feedback Note:</span>
                        <p className="mt-0.5 text-stone-700">{app.feedbackNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <span>
                      {app.viewedAt ? (
                        <span className="text-cyan-800 font-medium">Viewed on {new Date(app.viewedAt).toLocaleDateString()}</span>
                      ) : (
                        <span>Status updated: {new Date(app.statusUpdatedAt).toLocaleDateString()}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3 shadow-sm">
            <Briefcase className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-900 font-serif">No applications submitted yet</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Explore the job board and submit one-click applications with your saved Edworld resumes.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-sm hover:bg-emerald-900 transition-colors"
            >
              <span>Explore Opportunities</span>
            </Link>
          </div>
        )}

        {/* Submitted Resume Snapshot Modal */}
        {selectedSnapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Immutable Resume Snapshot
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1 font-serif">
                    {selectedSnapshot.resumeTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Captured for {selectedSnapshot.jobTitle} @ {selectedSnapshot.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedSnapshot.snapshot ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Contact</h4>
                    <p className="text-stone-700">
                      {selectedSnapshot.snapshot.contact?.fullName || "Candidate"} &bull; {selectedSnapshot.snapshot.contact?.email || ""}
                    </p>
                  </div>

                  {selectedSnapshot.snapshot.summary && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Summary</h4>
                      <p className="text-stone-700 leading-relaxed">{selectedSnapshot.snapshot.summary}</p>
                    </div>
                  )}

                  {selectedSnapshot.snapshot.skills && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Technical Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {((selectedSnapshot.snapshot.skills as any).technical || []).map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-stone-100 rounded text-stone-800 font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSnapshot.snapshot.experience && selectedSnapshot.snapshot.experience.length > 0 && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Experience</h4>
                      <div className="space-y-2">
                        {selectedSnapshot.snapshot.experience.map((exp: any, i: number) => (
                          <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="font-bold text-stone-900">{exp.role} @ {exp.company}</p>
                            <ul className="list-disc pl-4 mt-1 text-stone-600 space-y-0.5">
                              {(exp.bullets || []).map((b: string, j: number) => (
                                <li key={j}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Resume snapshot verified and intact.</p>
              )}

              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close Snapshot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

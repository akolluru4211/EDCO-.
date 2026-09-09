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
  X
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

  const isAdult = user?.ageBand === "18+";

  useEffect(() => {
    if (!user || !isAdult) return;
    const loadApplications = async () => {
      try {
        const { data, error } = await supabase
          .from("job_applications")
          .select("*, jobs(title, company)")
          .eq("user_id", user.uid);

        if (data && data.length > 0) {
          const mapped: JobApplication[] = data.map((a: any) => ({
            id: a.id,
            jobId: a.job_id,
            jobTitle: a.jobs?.title || "Role",
            companyName: a.jobs?.company || "Company",
            userId: a.user_id,
            applicantName: user.name,
            applicantEmail: user.email,
            resumeId: a.resume_id,
            resumeTitle: "Submitted Resume",
            resumeSnapshot: a.resume_snapshot,
            coverNote: a.cover_note,
            status: a.status,
            appliedAt: a.applied_at,
            matchScore: a.match_score,
            statusUpdatedAt: a.updated_at || a.applied_at
          }));
          setApplications(mapped);
          return;
        }
      } catch (err) {}

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

    loadApplications();
  }, [user, isAdult]);

  const getStatusBadge = (status: JobApplication["status"]) => {
    switch (status) {
      case "applied":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "viewed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "interview":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "offer":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Job applications are restricted to adult Career Track accounts.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Board</span>
          </Link>
          <span className="text-xs text-slate-500 font-semibold">{applications.length} Applications Submitted</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-black text-slate-900">My Job &amp; Internship Applications</h1>
          </div>
          <p className="text-xs text-slate-500">
            Track real-time hiring updates, review attached resume snapshots, and read recruiter feedback notes.
          </p>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">{app.jobTitle || "Software Engineer"}</h2>
                      <span className="text-xs font-bold text-slate-500">&bull; {app.companyName || "Tech Company"}</span>
                      {app.matchScore && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Attached Resume: <strong className="text-slate-700">{app.resumeTitle}</strong></span>
                      <button
                        onClick={() =>
                          setSelectedSnapshot({
                            jobTitle: app.jobTitle || "Software Engineer",
                            companyName: app.companyName || "Company",
                            resumeTitle: app.resumeTitle,
                            snapshot: app.resumeSnapshot,
                          })
                        }
                        className="text-brand-600 hover:underline font-bold inline-flex items-center gap-1 text-[11px]"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Submitted Snapshot</span>
                      </button>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border text-center ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    Status: {app.status}
                  </span>
                </div>

                {/* Cover Note & Employer Notes */}
                {app.coverNote && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    <span className="font-bold not-italic text-slate-700 block mb-0.5">Your Note to Recruiter:</span>
                    &ldquo;{app.coverNote}&rdquo;
                  </div>
                )}

                {app.employerNotes && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Recruiter Update:</span>
                      <p className="mt-0.5">{app.employerNotes}</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  <span>Last status update: {new Date(app.statusUpdatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Explore the job board and use your saved Edworld resumes to submit one-click applications.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
            >
              <span>Explore Opportunities</span>
            </Link>
          </div>
        )}

        {/* Submitted Resume Snapshot Modal */}
        {selectedSnapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    Immutable Application Snapshot
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedSnapshot.resumeTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submitted for {selectedSnapshot.jobTitle} @ {selectedSnapshot.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedSnapshot.snapshot ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Contact</h4>
                    <p className="text-slate-700">
                      {selectedSnapshot.snapshot.contact?.fullName || "Candidate"} &bull; {selectedSnapshot.snapshot.contact?.email || ""}
                    </p>
                  </div>

                  {selectedSnapshot.snapshot.summary && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Professional Summary</h4>
                      <p className="text-slate-700 leading-relaxed">{selectedSnapshot.snapshot.summary}</p>
                    </div>
                  )}

                  {selectedSnapshot.snapshot.experience && selectedSnapshot.snapshot.experience.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Experience</h4>
                      <div className="space-y-2">
                        {selectedSnapshot.snapshot.experience.map((exp: any, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-900">{exp.role} @ {exp.company}</p>
                            <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-0.5">
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
                <p className="text-xs text-slate-500">Resume snapshot loaded successfully.</p>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
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

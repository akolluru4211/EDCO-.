"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication, JobType, ApplicationStatus, ResumeContent, DEFAULT_RESUME_CONTENT } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Plus, 
  Users, 
  FileText, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Calendar, 
  AlertCircle, 
  Briefcase, 
  ChevronRight, 
  ShieldCheck, 
  Send,
  Lock,
  Eye,
  Trash2,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function EmployerStudioPage() {
  const { user, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [selectedResumeSnapshot, setSelectedResumeSnapshot] = useState<{
    applicantName: string;
    resumeTitle: string;
    snapshot?: ResumeContent;
  } | null>(null);

  // Job Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.name ? `${user.name}'s Ventures` : "TechCorp Labs");
  const [location, setLocation] = useState("San Francisco, CA / Remote");
  const [type, setType] = useState<JobType>("full-time");
  const [skillsStr, setSkillsStr] = useState("TypeScript, React, Node.js, PostgreSQL");
  const [description, setDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState("$120,000 - $150,000 / yr");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdult = user?.ageBand === "18+";

  useEffect(() => {
    if (!user || !isAdult) return;

    const loadEmployerData = async () => {
      try {
        // Load Employer Jobs
        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("posted_by", user.uid);

        if (jobData && jobData.length > 0) {
          const mappedJobs: JobListing[] = jobData.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            description: j.description,
            location: j.location,
            type: j.type,
            skillsRequired: j.skills_required || [],
            postedBy: j.posted_by,
            applicationDeadline: j.application_deadline,
            createdAt: j.created_at,
            isActive: j.is_active,
            moderationStatus: j.moderation_status,
            salaryRange: j.salary_range,
          }));
          setJobs(mappedJobs);
        }

        // Load Applications for Employer
        const { data: appData } = await supabase
          .from("job_applications")
          .select("*, jobs!inner(title, company, posted_by)")
          .eq("jobs.posted_by", user.uid);

        if (appData && appData.length > 0) {
          const mappedApps: JobApplication[] = appData.map((a: any) => ({
            id: a.id,
            jobId: a.job_id,
            jobTitle: a.jobs?.title || "Role",
            companyName: a.jobs?.company || "Company",
            userId: a.user_id,
            applicantName: a.applicant_name || "Applicant",
            applicantEmail: a.applicant_email || "",
            resumeId: a.resume_id,
            resumeTitle: a.resume_title || "Resume Snapshot",
            resumeSnapshot: a.resume_snapshot,
            coverNote: a.cover_note,
            status: a.status,
            appliedAt: a.applied_at,
            statusUpdatedAt: a.updated_at || a.applied_at,
            matchScore: a.match_score || 85,
          }));
          setApplications(mappedApps);
        }
      } catch (err) {
        console.warn("Failed to load employer data from Supabase:", err);
      }
    };

    loadEmployerData();
  }, [user, isAdult]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !company.trim()) {
      setFormError("All required fields must be provided.");
      return;
    }

    if (deadlineDays <= 0) {
      setFormError("Application deadline must be a future date.");
      return;
    }

    setIsPosting(true);

    const deadline = new Date(Date.now() + deadlineDays * 24 * 3600 * 1000).toISOString();

    const newJob: JobListing = {
      id: "job-" + Date.now(),
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      skillsRequired: skillsStr.split(",").map((s) => s.trim()).filter(Boolean),
      postedBy: user?.uid || "employer-user-999",
      postedByName: user?.name || "Employer",
      applicationDeadline: deadline,
      createdAt: new Date().toISOString(),
      isActive: true,
      moderationStatus: "pending", // Unverified employer postings default to pending moderation
      salaryRange,
      recommendedMinLevel: 1,
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    localStorage.setItem("edworld_jobs", JSON.stringify(updatedJobs));

    setIsPosting(false);
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setShowNewJobModal(false);
      setTitle("");
      setDescription("");
    }, 1500);
  };

  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus, note?: string) => {
    const updated = applications.map((app) =>
      app.id === appId
        ? {
            ...app,
            status: newStatus,
            employerNotes: note || app.employerNotes,
            statusUpdatedAt: new Date().toISOString(),
          }
        : app
    );
    setApplications(updated);
    localStorage.setItem("edworld_applications", JSON.stringify(updated));
  };

  const handleToggleJobActive = (jobId: string) => {
    const updated = jobs.map((j) => (j.id === jobId ? { ...j, isActive: !j.isActive } : j));
    setJobs(updated);
    localStorage.setItem("edworld_jobs", JSON.stringify(updated));
  };

  // Strict 18+ Access Guard
  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Employer studio is restricted to adult Career Track accounts.
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

  // Filter applications for selected job
  const filteredApps = applications.filter((app) => {
    if (selectedJobId === "all") return true;
    return app.jobId === selectedJobId;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded">
                Verified Recruiter
              </span>
              <span className="text-xs font-bold text-slate-500">Talent Acquisition Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Employer Studio &amp; ATS
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Post verified job openings, manage candidates, and review full resume snapshots and project portfolios.
            </p>
          </div>

          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Listing</span>
          </button>
        </div>

        {/* Studio Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Openings</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{jobs.filter((j) => j.isActive).length}</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{applications.length}</p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Pipeline</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {applications.filter((a) => a.status === "interview").length}
            </p>
          </div>
        </div>

        {/* Main Applicants Manager */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Candidate Applications</h2>
              <p className="text-xs text-slate-500">Review candidates and update hiring pipeline status in real time.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter by Role:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="all">All Postings ({applications.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({applications.filter((a) => a.jobId === j.id).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No candidates found for this selection.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-900">{app.applicantName}</h3>
                      <span className="text-xs text-slate-400">&bull; {app.applicantEmail}</span>
                      {app.matchScore && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {app.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Applied for: <strong>{app.jobTitle || "Engineer"}</strong> &bull; Resume: {app.resumeTitle}
                    </p>
                    {app.coverNote && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg max-w-lg">
                        &ldquo;{app.coverNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedResumeSnapshot({
                          applicantName: app.applicantName,
                          resumeTitle: app.resumeTitle,
                          snapshot: app.resumeSnapshot || DEFAULT_RESUME_CONTENT,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Resume Snapshot</span>
                    </button>

                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="viewed">Viewed</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post New Job Modal */}
        {showNewJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post New Job or Internship</h3>
                  <p className="text-xs text-slate-500">Unverified postings default to pending moderation.</p>
                </div>
                <button
                  onClick={() => setShowNewJobModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {postSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Job Created Successfully</h4>
                  <p className="text-xs text-slate-500">Listing submitted for moderation approval.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Role Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as JobType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="full-time">Full-Time</option>
                        <option value="internship">Internship</option>
                        <option value="part-time">Part-Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Application Deadline</label>
                      <select
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value={15}>In 15 Days</option>
                        <option value={30}>In 30 Days</option>
                        <option value={60}>In 60 Days</option>
                        <option value={90}>In 90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                      placeholder="TypeScript, React, Node.js, Distributed Systems"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Job Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe core responsibilities, qualifications, and project context..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewJobModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {isPosting ? "Posting..." : "Publish Job"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Snapshot Modal */}
        {selectedResumeSnapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    Candidate Resume Snapshot
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedResumeSnapshot.applicantName} &bull; {selectedResumeSnapshot.resumeTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedResumeSnapshot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedResumeSnapshot.snapshot ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Contact Details</h4>
                    <p className="text-slate-700">
                      {selectedResumeSnapshot.snapshot.contact?.fullName} &bull; {selectedResumeSnapshot.snapshot.contact?.email}
                    </p>
                  </div>

                  {selectedResumeSnapshot.snapshot.summary && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Summary</h4>
                      <p className="text-slate-700 leading-relaxed">{selectedResumeSnapshot.snapshot.summary}</p>
                    </div>
                  )}

                  {selectedResumeSnapshot.snapshot.experience && (
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase font-mono text-[11px] mb-1">Work History</h4>
                      <div className="space-y-2">
                        {selectedResumeSnapshot.snapshot.experience.map((exp: any, i: number) => (
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
                <p className="text-xs text-slate-500">Snapshot content rendered.</p>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedResumeSnapshot(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

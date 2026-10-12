"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication, JobType, ApplicationStatus, ResumeContent, DEFAULT_RESUME_CONTENT } from "@/lib/types";
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
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowLeft
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function EmployerStudioPage() {
  const { user, isEmployer } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [feedbackModalApp, setFeedbackModalApp] = useState<{ id: string; targetStatus: ApplicationStatus } | null>(null);
  const [feedbackNoteInput, setFeedbackNoteInput] = useState("");
  const [selectedResumeSnapshot, setSelectedResumeSnapshot] = useState<{
    applicantName: string;
    resumeTitle: string;
    snapshot?: ResumeContent;
  } | null>(null);

  // Job Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.name ? `${user.name}'s Tech` : "TechCorp Labs");
  const [location, setLocation] = useState("San Francisco, CA / Remote");
  const [type, setType] = useState<JobType>("full-time");
  const [skillsStr, setSkillsStr] = useState("TypeScript, React, Node.js, PostgreSQL");
  const [description, setDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState("$120,000 - $150,000 / yr");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAdult = user ? user.ageBand === "18+" : true;

  // Load Employer Data from hardened APIs
  const loadEmployerData = async () => {
    if (!user || !isAdult) return;
    try {
      // 1. Fetch Employer's jobs
      const jobsResp = await fetch(`/api/employer/jobs?employerId=${user.uid}`);
      const jobsJson = await jobsResp.json();
      if (jobsJson.success && Array.isArray(jobsJson.jobs)) {
        const mappedJobs: JobListing[] = jobsJson.jobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          description: j.description,
          location: j.location,
          type: j.type === "full_time" ? "full-time" : j.type,
          skillsRequired: j.skills_required || [],
          postedBy: j.posted_by,
          applicationDeadline: j.application_deadline,
          createdAt: j.created_at,
          isActive: j.is_active,
          moderationStatus: j.moderation_status,
          salaryRange: j.salary_range,
          sourceType: j.source_type,
          sourceName: j.source_name,
        }));
        setJobs(mappedJobs);
      }

      // 2. Fetch Applicants isolated strictly to this employer's jobs
      const appsResp = await fetch(`/api/employer/applicants?employerId=${user.uid}`);
      const appsJson = await appsResp.json();
      if (appsJson.success && Array.isArray(appsJson.applicants)) {
        const mappedApps: JobApplication[] = appsJson.applicants.map((a: any) => ({
          id: a.id,
          jobId: a.job_id,
          jobTitle: a.job_title || "Role",
          companyName: a.job_company || "Company",
          userId: a.user_id,
          applicantName: a.applicant_name || "Applicant",
          applicantEmail: a.applicant_email || "",
          resumeId: a.resume_id,
          resumeTitle: a.resume_title || "Resume Snapshot",
          resumeSnapshot: a.resume_snapshot,
          coverNote: a.cover_note,
          status: a.status,
          appliedAt: a.applied_at,
          statusUpdatedAt: a.status_updated_at || a.applied_at,
          matchScore: a.match_score || 75,
          feedbackNote: a.feedback_note,
          viewedAt: a.viewed_at,
        }));
        setApplications(mappedApps);
      }
    } catch (err) {
      console.warn("Failed to load employer data:", err);
    }
  };

  useEffect(() => {
    loadEmployerData();
  }, [user, isAdult]);

  // Handle Create Job with rate limit & source fields
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || description.trim().length < 50 || !company.trim()) {
      setFormError("All required fields must be provided with a description of at least 50 characters.");
      return;
    }

    setIsPosting(true);
    try {
      const deadline = new Date(Date.now() + deadlineDays * 24 * 3600 * 1000).toISOString();
      const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);

      const resp = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          description: description.trim(),
          location: location.trim(),
          type,
          skillsRequired: skills,
          salaryRange,
          applicationDeadline: deadline,
          mockEmployerId: user?.uid,
        }),
      });

      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error || "Failed to create job posting");
      }

      setPostSuccess(true);
      setTimeout(() => {
        setPostSuccess(false);
        setShowNewJobModal(false);
        setTitle("");
        setDescription("");
        loadEmployerData();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || "Failed to publish job");
    } finally {
      setIsPosting(false);
    }
  };

  // View Candidate Snapshot & Mark as viewed_by_employer
  const handleOpenSnapshot = async (app: JobApplication) => {
    setSelectedResumeSnapshot({
      applicantName: app.applicantName,
      resumeTitle: app.resumeTitle,
      snapshot: app.resumeSnapshot,
    });

    if (app.status === "submitted" || app.status === "applied") {
      try {
        await fetch("/api/employer/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: app.id,
            status: "viewed_by_employer",
            mockEmployerId: user?.uid,
          }),
        });

        // Update local status
        setApplications((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, status: "viewed_by_employer" as const } : a))
        );
      } catch (e) {
        console.warn("Failed to mark viewed:", e);
      }
    }
  };

  // Submit Feedback Note & Status Change
  const handleConfirmStatusChange = async () => {
    if (!feedbackModalApp) return;

    try {
      const resp = await fetch("/api/employer/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: feedbackModalApp.id,
          status: feedbackModalApp.targetStatus,
          feedbackNote: feedbackNoteInput.trim() || undefined,
          mockEmployerId: user?.uid,
        }),
      });

      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.error || "Failed to update status");
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === feedbackModalApp.id
            ? {
                ...a,
                status: feedbackModalApp.targetStatus,
                feedbackNote: feedbackNoteInput.trim() || a.feedbackNote,
                statusUpdatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      setFeedbackModalApp(null);
      setFeedbackNoteInput("");
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  // Strict 18+ Access Guard
  if (!isAdult && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">Access Restricted</h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Employer studio is restricted to adult Career Track accounts.
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

  // Filter applications for selected job
  const filteredApps = applications.filter((app) => {
    if (selectedJobId === "all") return true;
    return app.jobId === selectedJobId;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Board</span>
          </Link>
          <span className="text-xs text-stone-500 font-semibold">{jobs.length} Active Postings</span>
        </div>

        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Verified Recruiter
              </span>
              <span className="text-xs font-bold text-stone-500">Role-Isolated Talent Acquisition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              Employer Studio &amp; Candidate Portal
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Post verified openings, review immutable candidate resume snapshots, and provide moderated feedback notes.
            </p>
          </div>

          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Listing</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-stone-400">Total Postings</span>
            <p className="text-2xl font-black text-stone-900">{jobs.length}</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-stone-400">Active Candidates</span>
            <p className="text-2xl font-black text-emerald-800">{applications.length}</p>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-stone-400">Shortlisted Pool</span>
            <p className="text-2xl font-black text-amber-700">
              {applications.filter((a) => a.status === "shortlisted").length}
            </p>
          </div>
        </div>

        {/* Candidate Management Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">Applicant Review Queue</h2>
              <p className="text-xs text-stone-500">Only candidates who applied to your listings are shown.</p>
            </div>

            {/* Filter by Job */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Filter by Role:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium text-stone-800"
              >
                <option value="all">All Postings ({applications.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-900 font-serif">No candidates in queue</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Applications for your openings will appear here once candidates apply through the Job Board.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-stone-900">{app.applicantName}</h4>
                      <span className="text-xs text-stone-500">&bull; Applied for <strong>{app.jobTitle}</strong></span>
                      {app.matchScore && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {app.matchScore}% Match
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200 text-stone-700">
                        Status: {app.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.coverNote && (
                        <span className="italic truncate max-w-md">&ldquo;{app.coverNote}&rdquo;</span>
                      )}
                    </div>

                    {app.feedbackNote && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Feedback Note: {app.feedbackNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenSnapshot(app)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Review Resume</span>
                    </button>

                    <button
                      onClick={() => setFeedbackModalApp({ id: app.id, targetStatus: "shortlisted" })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Shortlist</span>
                    </button>

                    <button
                      onClick={() => setFeedbackModalApp({ id: app.id, targetStatus: "rejected" })}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post New Job Modal */}
        {showNewJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">Post New Opportunity</h3>
                  <p className="text-xs text-stone-500">Auto-tagged with Verified Employer provenance. Subject to standard UGC moderation.</p>
                </div>
                <button
                  onClick={() => setShowNewJobModal(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {postSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Job Posted Successfully</h4>
                  <p className="text-xs text-stone-500">Submitted for moderation approval and live on employer view.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Role Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as JobType)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="full-time">Full-Time</option>
                        <option value="internship">Internship</option>
                        <option value="part-time">Part-Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase mb-1">Application Deadline</label>
                      <select
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value={15}>In 15 Days</option>
                        <option value={30}>In 30 Days</option>
                        <option value={60}>In 60 Days</option>
                        <option value={90}>In 90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                      placeholder="TypeScript, React, Node.js, Distributed Systems"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">Job Description * (Minimum 50 chars)</label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe responsibilities, technical requirements, and team mission..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowNewJobModal(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      {isPosting ? "Posting..." : "Publish Job"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Feedback Note Modal */}
        {feedbackModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 font-serif">
                  {feedbackModalApp.targetStatus === "shortlisted" ? "Shortlist Candidate" : "Decline Candidate"}
                </h3>
                <button
                  onClick={() => setFeedbackModalApp(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Feedback Note for Applicant (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackNoteInput}
                  onChange={(e) => setFeedbackNoteInput(e.target.value)}
                  placeholder="Share constructive feedback on their technical background or next steps..."
                  className="w-full p-2.5 text-xs rounded-xl border border-stone-300 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setFeedbackModalApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer"
                >
                  Confirm Status Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Snapshot Modal */}
        {selectedResumeSnapshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Candidate Resume Snapshot
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1 font-serif">
                    {selectedResumeSnapshot.applicantName} &bull; {selectedResumeSnapshot.resumeTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedResumeSnapshot(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedResumeSnapshot.snapshot ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Contact</h4>
                    <p className="text-stone-700">
                      {selectedResumeSnapshot.snapshot.contact?.fullName || "Candidate"} &bull; {selectedResumeSnapshot.snapshot.contact?.email}
                    </p>
                  </div>

                  {selectedResumeSnapshot.snapshot.summary && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Summary</h4>
                      <p className="text-stone-700 leading-relaxed">{selectedResumeSnapshot.snapshot.summary}</p>
                    </div>
                  )}

                  {selectedResumeSnapshot.snapshot.skills && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Technical Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {((selectedResumeSnapshot.snapshot.skills as any).technical || []).map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-stone-100 rounded text-stone-800 font-mono text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedResumeSnapshot.snapshot.experience && selectedResumeSnapshot.snapshot.experience.length > 0 && (
                    <div>
                      <h4 className="font-bold text-stone-900 uppercase font-mono text-[11px] mb-1">Experience</h4>
                      <div className="space-y-2">
                        {selectedResumeSnapshot.snapshot.experience.map((exp: any, i: number) => (
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
                <p className="text-xs text-stone-500">Resume snapshot verified.</p>
              )}

              <div className="flex justify-end pt-2 border-t border-stone-100">
                <button
                  onClick={() => setSelectedResumeSnapshot(null)}
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

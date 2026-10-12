"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { JobListing, JobApplication, Resume } from "@/lib/types";
import { DEFAULT_RESUME_CONTENT } from "@/lib/mock-data";
import UpgradePromptModal from "@/components/billing/UpgradePromptModal";
import { 
  Send, 
  X, 
  Check, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Lock,
  ChevronRight
} from "lucide-react";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing;
  matchScore: number;
  onApplicationSubmitted?: (newApp: JobApplication) => void;
}

export default function ApplyModal({
  isOpen,
  onClose,
  job,
  matchScore,
  onApplicationSubmitted,
}: ApplyModalProps) {
  const { user, isPro, canApplyToJob } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverNote, setCoverNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("edworld_resumes");
    if (saved) {
      try {
        const list: Resume[] = JSON.parse(saved);
        setResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0].id);
        }
        return;
      } catch (e) {}
    }

    // Default fallback
    const fallback: Resume = {
      id: "resume-default-1",
      userId: user?.uid || "user-1",
      title: "Full-Stack Software Engineer — Target: Tech Tier 1",
      templateId: "classic",
      content: DEFAULT_RESUME_CONTENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResumes([fallback]);
    setSelectedResumeId(fallback.id);
  }, [user]);

  if (!isOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canApplyToJob()) {
      setShowUpgradeModal(true);
      return;
    }

    // 1. Check Deadline
    const deadline = new Date(job.applicationDeadline).getTime();
    if (deadline <= Date.now() || !job.isActive) {
      alert("This job listing has expired or is no longer accepting applications.");
      return;
    }

    // 2. Check Duplicate
    const savedApps = localStorage.getItem("edworld_applications");
    const list: JobApplication[] = savedApps ? JSON.parse(savedApps) : [];
    const isDuplicate = list.some((a) => a.jobId === job.id && a.userId === user?.uid);
    if (isDuplicate) {
      alert("You have already submitted an application for this position.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
      const snapshot = selectedResume?.content || DEFAULT_RESUME_CONTENT;

      const newApp: JobApplication = {
        id: "app-" + Date.now(),
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company,
        userId: user?.uid || "user-1",
        applicantName: user?.name || "Candidate",
        applicantEmail: user?.email || "candidate@example.com",
        resumeId: selectedResume?.id || "resume-1",
        resumeTitle: selectedResume?.title || "Default Resume",
        resumeSnapshot: snapshot, // Immutable snapshot
        coverNote: coverNote.trim(),
        status: "submitted",
        appliedAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
        matchScore,
      };

      // Call live production API
      try {
        const resp = await fetch("/api/jobs/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            resumeId: selectedResume?.id,
            resumeSnapshot: snapshot,
            coverNote: coverNote.trim(),
            mockUserId: user?.uid,
            mockUserEmail: user?.email,
            mockUserName: user?.name,
          }),
        });
        const json = await resp.json();
        if (json.application?.id) {
          newApp.id = json.application.id;
        }
      } catch (apiErr) {
        console.warn("[ApplyModal API Fallback to LocalStorage]:", apiErr);
      }

      // Save to localStorage as well for offline persistence
      localStorage.setItem("edworld_applications", JSON.stringify([newApp, ...list]));

      if (onApplicationSubmitted) {
        onApplicationSubmitted(newApp);
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCoverNote("");
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                One-Click Application
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">{job.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{job.company} &bull; {job.location}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">Application Submitted!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your Edworld resume and profile have been delivered to <strong>{job.company}</strong>. You can track your status on your Applications Dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {/* Match Compatibility Highlight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-800">Your JD Compatibility Match</span>
                </div>
                <span className="text-sm font-black text-emerald-600 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  {matchScore}% Match
                </span>
              </div>

              {/* Resume Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Attach Saved Edworld Resume</span>
                  <span className="text-[10px] text-brand-600 font-normal">ATS-Optimized</span>
                </label>
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <label
                      key={r.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedResumeId === r.id
                          ? "bg-brand-50/50 border-brand-600 ring-2 ring-brand-500/20"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="resumeSelect"
                          value={r.id}
                          checked={selectedResumeId === r.id}
                          onChange={() => setSelectedResumeId(r.id)}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[280px]">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Template: {r.templateId} &bull; Updated {new Date(r.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <FileText className="w-4 h-4 text-slate-400" />
                    </label>
                  ))}
                </div>

                {/* Resume Version Review Reminder */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <FileText className="w-3.5 h-3.5 text-brand-600" />
                    <span>Snapshot Version Review</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Submitting creates an immutable snapshot of your selected resume ({resumes.find(r => r.id === selectedResumeId)?.title || "Active Version"}). Review your skills and experiences before confirming.
                  </p>
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Short Note to Recruiter (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Max 300 characters</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a key highlight from your projects or why this role excites you..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              {/* Pro Gating Notice */}
              {!isPro && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pro Plan Required for Direct Applications</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Direct application submission is available on the Pro plan ($19/mo). Click below to review entitlements.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || resumes.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : !isPro ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Apply</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Job & Internship Applications"
        description="One-click job applications with attached ATS resumes and recruiter tracking are exclusively available to Edworld Co Pro members."
      />
    </>
  );
}

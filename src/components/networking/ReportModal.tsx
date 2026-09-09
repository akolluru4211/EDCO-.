"use client";

import React, { useState } from "react";
import { UserReportType } from "@/lib/types";
import { 
  X, 
  AlertTriangle, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: UserReportType;
  targetId: string;
  targetName?: string;
  onSubmitReport: (reportData: {
    type: UserReportType;
    targetId: string;
    targetName?: string;
    reason: string;
  }) => Promise<void>;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSubmitReport,
}: ReportModalProps) {
  const [reasonCategory, setReasonCategory] = useState("harassment");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const REASONS = [
    { id: "harassment", label: "Harassment or bullying" },
    { id: "spam", label: "Spam, advertising, or unsolicited promotion" },
    { id: "inappropriate", label: "Inappropriate or explicit content" },
    { id: "impersonation", label: "Impersonation or deceptive identity" },
    { id: "safety", label: "Youth safety or policy violation" },
    { id: "other", label: "Other security concern" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const fullReason = `${reasonCategory}: ${details.trim() || "No additional notes provided"}`;
      await onSubmitReport({
        type: targetType,
        targetId,
        targetName,
        reason: fullReason,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Report {targetType}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Report Submitted</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you for keeping Edworld safe. Our moderation team reviews all reports promptly.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-slate-600">
              Reporting: <strong>{targetName || targetId}</strong>
            </p>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Reason *</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                {REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any relevant context for the moderation team..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold uppercase tracking-wider hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

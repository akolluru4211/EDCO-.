"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ContentReport, ReportType } from "@/lib/types";
import { Flag, X, Check, AlertTriangle, Send, Loader2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportType;
  targetId: string;
  targetName: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      try {
        await fetch("/api/network/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporterId: user?.uid || "anonymous",
            reportedId: targetId,
            category: targetType,
            reason: reason.trim(),
            details: `Reported item: ${targetName}`,
          }),
        });
      } catch (postErr) {
        console.warn("API report dispatch notice:", postErr);
      }

      const newReport: ContentReport = {
        id: "rep-" + Date.now(),
        type: targetType,
        targetId,
        targetName,
        reportedBy: user?.uid || "anonymous",
        reportedByName: user?.name || "Candidate",
        reason: reason.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const savedReports = localStorage.getItem("edworld_reports");
      const list: ContentReport[] = savedReports ? JSON.parse(savedReports) : [];
      localStorage.setItem("edworld_reports", JSON.stringify([newReport, ...list]));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReason("");
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <Flag className="w-4 h-4" />
            <span>Report Content or Violation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Report Submitted</h3>
            <p className="text-xs text-slate-500">
              Our Trust & Safety moderators will review this item shortly. Thank you for keeping Edworld Co safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold block">Reporting {targetType.toUpperCase()}:</span>
              <p className="text-slate-600 font-medium truncate">{targetName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Report
              </label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue (e.g. fraudulent job posting, inappropriate language, spam, fee request)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface DataDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataDeletionModal({ isOpen, onClose }: DataDeletionModalProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmationPhrase.trim() === "DELETE MY ACCOUNT";

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || !user?.uid) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          confirmationPhrase,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompleted(true);
        setTimeout(async () => {
          await logout();
          router.push("/");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to process data erasure request.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please contact edworld.eden@gmail.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deletion-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EBECEF] p-6 sm:p-8 space-y-5 shadow-2xl text-[#13141B]">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="deletion-title" className="text-base sm:text-lg font-bold text-[#13141B]">
                Delete Account &amp; Erase Personal Data
              </h2>
              <p className="text-xs text-[#5E6573]">
                Statutory Right to Erasure (DPDP Act 2023 &amp; GDPR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#5E6573] hover:text-[#13141B] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-[#13141B]">Data Purged Successfully</h3>
            <p className="text-xs text-[#5E6573]">
              Your account, resumes, and interview records have been permanently erased. Redirecting to homepage...
            </p>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>This action is immediate and irreversible:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                <li>All ATS resumes, tailored variations, and PDFs will be destroyed.</li>
                <li>All mock interview transcripts, audio evaluations, and scores will be deleted.</li>
                <li>Your profile, credentials, and active Pro subscription will be cancelled.</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">
                Optional Reason for Leaving
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Found a job, privacy preferences, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">
                Type <span className="text-rose-600 font-mono font-black">&ldquo;DELETE MY ACCOUNT&rdquo;</span> to confirm:
              </label>
              <input
                type="text"
                required
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-rose-500 font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#13141B] text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isConfirmed || loading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Erasing Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Erase Everything</span>
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

"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, ArrowRight, Loader2, FileText } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION } from "@/lib/types";

interface ReconsentModalProps {
  isOpen: boolean;
  onAccept: (tosVersion: string, privacyVersion: string) => Promise<void>;
}

export const ReconsentModal: React.FC<ReconsentModalProps> = ({
  isOpen,
  onAccept,
}) => {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!accepted || loading) return;
    setLoading(true);
    try {
      await onAccept(CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <EdworldLogo size="md" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Policy &amp; Terms Update</h2>
          <p className="text-xs text-slate-500">
            We have updated our Terms of Service (v{CURRENT_TOS_VERSION}) and Privacy Policy (v{CURRENT_PRIVACY_VERSION}).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2.5 max-h-48 overflow-y-auto">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>Key Summary of Updates:</span>
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-600">
            <li>Enhanced date-of-birth isolation under India&apos;s DPDP Act &amp; global minor protection laws.</li>
            <li>Automated scheduled age-band graduation notices for transitioning learners.</li>
            <li>Direct recruiter application consent protections and server-side secret isolation.</li>
          </ul>
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-xs text-slate-700">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="leading-snug">
            I have reviewed and agree to the updated <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
          </span>
        </label>

        <button
          type="button"
          disabled={!accepted || loading}
          onClick={handleConfirm}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Acceptance...</span>
            </>
          ) : (
            <>
              <span>Accept &amp; Continue to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReconsentModal;

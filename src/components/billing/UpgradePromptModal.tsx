import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, X, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
}

export default function UpgradePromptModal({
  isOpen,
  onClose,
  featureName,
  description,
}: UpgradePromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToBilling = () => {
    onClose();
    router.push("/billing?plan=pro");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
            Edworld Co Pro Entitlement
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {description ||
              `The Free plan includes 1 ATS resume and 2 mock interviews per month. Upgrade to Pro (₹49/mo) or Premium (₹99/mo) for unlimited access and verified job applications.`}
          </p>
        </div>

        {/* Pro Benefits */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Unlimited Mock Interviews</strong> with priority speech &amp; AI coaching</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Unlimited ATS Resume Versions</strong> with AI JD gap analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>One-Click Job &amp; Internship Applications</strong> with status tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Peer &amp; Senior Mentor Messaging</strong> on Career Track</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleGoToBilling}
            className="w-full sm:flex-1 py-3 rounded-xl bg-slate-950 hover:bg-black text-[#D7FC51] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade to Pro (₹49/mo)</span>
          </button>
          <Link
            href="/billing"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center"
          >
            View All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

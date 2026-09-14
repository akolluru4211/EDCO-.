"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { useAuth, translateAuthError } from "@/lib/auth-context";

function ForgotPasswordContent() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Enter the email associated with your account and we&apos;ll send a password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-6">
          
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#13141B]">Password Reset Link Sent</h3>
                <p className="text-xs text-[#5E6573] leading-relaxed">
                  If an account exists for <strong className="text-[#13141B]">{email}</strong>, you will receive an email shortly with instructions to reset your password.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="w-full py-3 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/30 text-[#FF7A50] text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-[#5E6573] hover:text-[#13141B] inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2, Mail, Loader2, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#13141B]">
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Enter the email associated with your account and we&apos;ll send a password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#EBECEF] shadow-xs space-y-6">
          
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200/60">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#13141B]">Password Reset Link Sent</h3>
                <p className="text-xs text-[#5E6573] leading-relaxed">
                  If an account exists for <strong className="text-[#13141B]">{email}</strong>, you will receive an email shortly with instructions to reset your password.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="w-full py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#13141B]">
                  Account Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs sm:text-sm text-[#13141B] placeholder:text-[#8E95A5] focus:bg-white focus:outline-none focus:border-[#13141B] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#EBECEF] text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E6573] hover:text-[#13141B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFCFB]" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

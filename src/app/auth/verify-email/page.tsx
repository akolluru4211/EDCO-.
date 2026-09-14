"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { supabase } from "@/lib/supabase";
import { translateAuthError } from "@/lib/auth-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend confirmation.");
      return;
    }
    setResending(true);
    setError(null);
    setResendSuccess(false);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/onboarding`,
        },
      });
      if (error) throw error;
      setResendSuccess(true);
      setCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-3xl bg-[#EDE8FD] text-[#7B57FF] flex items-center justify-center mx-auto shadow-sm">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black font-display text-[#13141B] tracking-tight">
              Check Your Inbox
            </h2>
            <p className="text-xs sm:text-sm text-[#5E6573] leading-relaxed">
              We&apos;ve sent a secure verification link to:
            </p>
            {email ? (
              <p className="text-sm font-black text-[#13141B] font-mono bg-[#F4F6FB] py-2 px-3 rounded-xl border border-[#E8ECF2] break-all">
                {email}
              </p>
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B]"
              />
            )}
            <p className="text-xs text-[#8E95A5] pt-1">
              Click the link in that email to confirm your account and immediately start onboarding.
            </p>
          </div>

          {resendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>A new verification link has been sent!</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FFEFEA] border border-[#FF7A50]/30 text-[#FF7A50] text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resending}
              className="w-full py-3 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] border border-[#E8ECF2] text-xs font-bold text-[#13141B] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              <span>
                {resending
                  ? "Resending..."
                  : canResend
                  ? "Resend Verification Email"
                  : `Resend available in ${cooldown}s`}
              </span>
            </button>

            <Link
              href="/auth/login"
              className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-[#8E95A5]">
            Didn&apos;t receive the email? Check your spam or junk folder.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

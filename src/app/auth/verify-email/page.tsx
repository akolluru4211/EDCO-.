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
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#EBECEF] shadow-xs space-y-6 text-center">
          
          <div className="w-12 h-12 rounded-2xl bg-[#00D2B4]/10 text-[#0A5245] flex items-center justify-center mx-auto border border-[#00D2B4]/30 shadow-2xs">
            <Mail className="w-6 h-6 text-[#00D2B4]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#13141B]">
              Check Your Inbox
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573] leading-relaxed">
              We&apos;ve sent a secure verification link to:
            </p>
            {email ? (
              <p className="text-xs sm:text-sm font-bold text-[#13141B] font-mono bg-[#F4F6FB] py-2 px-3 rounded-xl border border-[#E8ECF2] break-all">
                {email}
              </p>
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full text-center py-2 px-3 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs font-mono"
              />
            )}
          </div>

          {resendSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>A fresh confirmation link has been sent!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              className="w-full py-2.5 rounded-xl border border-[#E8ECF2] bg-[#F4F6FB] hover:bg-[#EBECEF] disabled:opacity-50 text-[#13141B] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>
                {resending
                  ? "Sending link..."
                  : canResend
                  ? "Resend Verification Email"
                  : `Resend in ${cooldown}s`}
              </span>
            </button>

            <Link
              href="/auth/login"
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-[#EBECEF]">
            <p className="text-xs text-[#5E6573]">
              Need help?{" "}
              <Link href="/contact" className="font-bold text-[#13141B] hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFCFB]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  KeyRound, 
  Smartphone, 
  Mail, 
  RotateCcw,
  Lock,
  Loader2
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";

type AuthState = 
  | "AUTH_IDLE"
  | "OTP_REQUESTING"
  | "OTP_SENT"
  | "OTP_VERIFYING"
  | "AUTHENTICATED"
  | "AUTH_FAILED"
  | "ACCOUNT_DISABLED"
  | "ACCOUNT_SUSPENDED";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendOtp, verifyOtp } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [authState, setAuthState] = useState<AuthState>("AUTH_IDLE");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [countdown, setCountdown] = useState(45);
  const [resendActive, setResendActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authState === "OTP_SENT" || authState === "OTP_VERIFYING" || authState === "AUTH_FAILED") {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      } else {
        setResendActive(true);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, authState]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError("Please enter your email address or mobile number.");
      return;
    }

    setAuthState("OTP_REQUESTING");
    try {
      const response = await sendOtp(cleanIdentifier, "login");
      setMaskedTarget(response.maskedIdentifier);
      setCountdown(response.cooldownSeconds || 45);
      setResendActive(false);
      setOtpDigits(["", "", "", "", "", ""]);
      if (response.devOtp) {
        setDevOtpCode(response.devOtp);
      }
      setAuthState("OTP_SENT");

      // Auto-focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code. Please check your details.");
      setAuthState("AUTH_FAILED");
    }
  };

  // Handle OTP Input typing & focus movement
  const handleOtpChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric && val !== "") return;

    const newDigits = [...otpDigits];
    newDigits[index] = numeric.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance
    if (numeric && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, automatically attempt submit
    if (newDigits.every((d) => d !== "") && index === 5) {
      triggerVerifyOtp(newDigits.join(""));
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    if (pasteData.length === 6) {
      inputRefs.current[5]?.focus();
      triggerVerifyOtp(pasteData);
    } else if (pasteData.length > 0) {
      inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  // Handle Step 2: Verify OTP
  const triggerVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setAuthState("OTP_VERIFYING");

    try {
      const { role, redirectUrl } = await verifyOtp(identifier, fullCode, "login");
      setAuthState("AUTHENTICATED");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } catch (err: any) {
      const msg = err?.message || "Invalid verification code. Please try again.";
      if (msg.includes("suspended")) {
        setAuthState("ACCOUNT_SUSPENDED");
        setError("Your account has been suspended by administration.");
      } else if (msg.includes("disabled")) {
        setAuthState("ACCOUNT_DISABLED");
        setError("This account is disabled. Please contact support.");
      } else {
        setAuthState("AUTH_FAILED");
        setError(msg);
      }
    }
  };

  const handleResend = async () => {
    if (!resendActive) return;
    setError(null);
    setAuthState("OTP_REQUESTING");
    try {
      const response = await sendOtp(identifier, "login");
      setMaskedTarget(response.maskedIdentifier);
      setCountdown(response.cooldownSeconds || 45);
      setResendActive(false);
      setOtpDigits(["", "", "", "", "", ""]);
      if (response.devOtp) setDevOtpCode(response.devOtp);
      setAuthState("OTP_SENT");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
      setAuthState("AUTH_FAILED");
    }
  };

  const handleChangeIdentifier = () => {
    setAuthState("AUTH_IDLE");
    setOtpDigits(["", "", "", "", "", ""]);
    setError(null);
    setDevOtpCode(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-paper text-ink">
      <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EdworldLogo size="md" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">
              {authState === "OTP_SENT" || authState === "OTP_VERIFYING"
                ? "Verify your account"
                : "Sign in to Edworld"}
            </h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">
              {authState === "OTP_SENT" || authState === "OTP_VERIFYING"
                ? `We sent a 6-digit code to ${maskedTarget || "your device"}`
                : "Secure, passwordless verification for all learners and staff"}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Dev helper pill in non-prod */}
        {devOtpCode && (
          <div className="p-2.5 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs font-mono text-center">
            <span>Dev Fast-Code: <strong>{devOtpCode}</strong></span>
          </div>
        )}

        {/* STEP 1: Enter Email or Phone */}
        {(authState === "AUTH_IDLE" || authState === "OTP_REQUESTING" || (authState === "AUTH_FAILED" && !maskedTarget)) && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Email or Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or +91 98765 43210"
                  className="w-full px-4 py-3 rounded-2xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                Enter the email or phone number registered with your Edworld account.
              </p>
            </div>

            <Button
              type="submit"
              disabled={authState === "OTP_REQUESTING" || !identifier.trim()}
              variant="primary"
              size="md"
              className="w-full min-h-[48px] text-sm font-bold"
              icon={authState === "OTP_REQUESTING" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              <span>{authState === "OTP_REQUESTING" ? "Sending Code..." : "Send OTP"}</span>
            </Button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification Screen */}
        {(authState === "OTP_SENT" || authState === "OTP_VERIFYING" || (authState === "AUTH_FAILED" && maskedTarget)) && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider text-center">
                Enter the 6-digit OTP
              </label>

              {/* 6 Individual Numeric Boxes */}
              <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-13 sm:w-14 sm:h-14 text-center text-xl font-bold text-ink bg-paper border border-line rounded-2xl focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                onClick={() => triggerVerifyOtp()}
                disabled={authState === "OTP_VERIFYING" || otpDigits.some((d) => d === "")}
                variant="primary"
                size="md"
                className="w-full min-h-[48px] text-sm font-bold"
                icon={authState === "OTP_VERIFYING" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              >
                <span>{authState === "OTP_VERIFYING" ? "Verifying..." : "Verify & Continue"}</span>
              </Button>

              <div className="flex items-center justify-between text-xs text-ink-soft px-1">
                {resendActive ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-forest font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span className="text-ink-muted">
                    Resend OTP in 00:{countdown < 10 ? `0${countdown}` : countdown}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleChangeIdentifier}
                  className="text-ink-soft hover:text-ink font-medium underline"
                >
                  Change email/number
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated Success State */}
        {authState === "AUTHENTICATED" && (
          <div className="p-4 rounded-2xl bg-forest/10 border border-forest/20 text-center space-y-2 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-ink">Authentication Successful</p>
            <p className="text-xs text-ink-muted">Redirecting to your authorized portal...</p>
          </div>
        )}

        {/* Sign up link */}
        <p className="text-center text-xs text-ink-soft pt-2 border-t border-line">
          New to Edworld?{" "}
          <Link href="/auth/signup" className="text-forest font-bold hover:underline">
            Create Account &rarr;
          </Link>
        </p>

        {/* DPDP Compliance & Privacy Footer */}
        <div className="text-center text-[11px] text-ink-muted flex items-center justify-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>India DPDP Act &amp; Multi-Tenant RBAC Protected</span>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-ink-muted">Loading authentication portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}

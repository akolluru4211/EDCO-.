"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { calculateAgeBandFromDob } from "@/lib/utils";
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, AlertCircle, CheckCircle2, MailCheck, KeyRound } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";

const GRADE_OPTIONS = [
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12/Inter",
  "College",
  "Working Professional",
];

export default function SignupPage() {
  const router = useRouter();
  const { signupWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [grade, setGrade] = useState("Class 11");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const derivedAgeBand = dob ? calculateAgeBandFromDob(dob) : null;
  const isMinorBand = derivedAgeBand === "13-15" || derivedAgeBand === "16-18";

  // Password strength calculations
  const hasMinLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isPasswordValid = hasMinLen && hasNumber && hasLetter;

  // Check for under-13 blocking
  const isUnder13 = derivedAgeBand === null && dob !== "";

  // Check for Mismatch (e.g. Minor DOB but Adult Grade, or Adult DOB but Class 9 Grade)
  const isMismatch =
    derivedAgeBand &&
    ((isMinorBand && (grade === "College" || grade === "Working Professional")) ||
      (derivedAgeBand === "18+" && (grade === "Class 9" || grade === "Class 10")));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !dob || !phone) {
      setError("Please complete all required fields including your phone number.");
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (isUnder13) {
      setError("Edworld Co requires users to be at least 13 years of age. Registration is blocked for learners under 13 per DPDP Act / COPPA.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (!termsAgreed) {
      setError("Please review and agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(name, email, password, dob, grade, phone);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-paper text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-8 space-y-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto shadow-sm">
            <MailCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">Account Created!</h1>
            <p className="text-sm text-ink-soft">
              Welcome to Edworld Co, <strong className="text-ink">{name}</strong>. If Supabase email confirmation is enabled for your domain, please check <strong className="text-ink">{email}</strong> to verify your account.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-paper-soft border border-line text-xs text-ink-muted font-mono">
            Redirecting to your workspace onboarding...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-paper text-ink">
      <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-8 space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EdworldLogo size="md" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">Create Account</h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">Adaptive career readiness tailored to your skill level</p>
          </div>
        </div>

        {/* Hired Employee Notice */}
        <div className="p-3 rounded-2xl bg-paper-soft border border-line text-[11px] text-ink-muted flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink block">Hired Employee or HR Staff?</span>
            <p>
              Your corporate account is already provisioned by People Operations with your <code>@edworld.co.in</code> email and temporary password (<code>edworld@122</code>).{" "}
              <Link href="/auth/login" className="text-forest font-bold hover:underline">
                Sign in directly &rarr;
              </Link>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Phone Number
              </label>
              <span className="text-[10px] text-forest font-bold bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                No OTP Required
              </span>
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
            <p className="text-[10px] text-ink-muted">
              For direct recruiter outreach and important account updates without SMS friction.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
            {password && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1.5 h-1">
                  <div className={`h-full flex-1 rounded-full ${hasMinLen ? "bg-forest" : "bg-line"}`} />
                  <div className={`h-full flex-1 rounded-full ${hasNumber ? "bg-forest" : "bg-line"}`} />
                  <div className={`h-full flex-1 rounded-full ${hasLetter ? "bg-forest" : "bg-line"}`} />
                </div>
                <div className="flex justify-between text-[10px] text-ink-soft">
                  <span className={hasMinLen ? "text-forest font-semibold" : "text-ink-muted"}>✓ 8+ chars</span>
                  <span className={hasNumber ? "text-forest font-semibold" : "text-ink-muted"}>✓ Number</span>
                  <span className={hasLetter ? "text-forest font-semibold" : "text-ink-muted"}>✓ Letter</span>
                </div>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                Date of Birth
              </label>
              <span className="text-[10px] text-ink-muted font-normal">Server-isolated for safety calibration</span>
            </div>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
            <p className="text-[10px] text-ink-muted">
              This helps us show you the right learning features and keep younger students safe.
            </p>
          </div>

          {/* Grade Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              Current Grade / Stage
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Under 13 Warning */}
          {isUnder13 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Under 13 Policy Restriction</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Edworld Co is designed for learners aged 13 and above. Registration is not permitted for users under 13 per DPDP Act and COPPA regulations.
              </p>
            </div>
          )}

          {/* Age-Band Inference Feedback */}
          {derivedAgeBand && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                isMinorBand
                  ? "bg-gold/10 border-gold/30 text-ink"
                  : "bg-forest/10 border-forest/20 text-ink"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {isMinorBand ? (
                  <Lock className="w-3.5 h-3.5 text-gold-dark" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                )}
                <span>Calibrated Age Band: {derivedAgeBand}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                {isMinorBand
                  ? "Minor safety protections active: Public profile discovery & open mentor discovery are locked to protect student privacy."
                  : "Adult Career Track active: Full access to ATS resume optimization, employer applications, and mentor networking."}
              </p>
            </div>
          )}

          {/* Mismatch Advisory */}
          {isMismatch && (
            <div className="p-3 rounded-xl bg-forest/5 border border-forest/20 text-ink text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-forest">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                <span>Protective Safety Override Active</span>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                Your selected grade and age band differ. For maximum student safety, minor privacy protections will apply as the more protective standard.
              </p>
            </div>
          )}

          {/* Terms & Privacy Consent */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded border-line text-forest focus:ring-forest"
            />
            <span className="leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-forest font-bold underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-forest font-bold underline">Privacy Policy</Link> (v2026.1).
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading || isUnder13}
            variant="primary"
            size="md"
            className="w-full"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            <span>{loading ? "Creating Account..." : "Start Free Track"}</span>
          </Button>
        </form>

        <p className="text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-forest font-bold hover:underline">
            Sign In &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

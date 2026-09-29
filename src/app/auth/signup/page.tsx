"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, translateAuthError } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  Lock, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Phone,
  Loader2,
  Gift,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { supabase } from "@/lib/supabase";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupWithEmail } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const [loading, setLoading] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Creating your account...");
  const [error, setError] = useState<string | null>(null);

  // Password validation rules
  const hasMinLen = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLen && hasLetter && hasNumber;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLoadingStep("Creating your secure account...");

      const res = await signupWithEmail(name.trim(), email.trim().toLowerCase(), password, undefined, undefined, phone.trim() || undefined);

      // Record referral code if present
      if (referralCode.trim()) {
        setLoadingStep("Applying referral benefits...");
        try {
          const { data: authData } = await supabase.auth.getUser();
          const userId = authData?.user?.id;
          if (userId) {
            await fetch("/api/ambassador/record-referral", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                referralCode: referralCode.trim(),
                newUserId: userId
              })
            });
          }
        } catch (refErr) {
          console.error("Failed to record referral:", refErr);
        }
      }

      setLoadingStep("Finalizing setup...");
      setAccountCreated(true);
      
      if (res?.needsEmailVerification) {
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setTimeout(() => {
          router.push("/onboarding");
        }, 1000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(translateAuthError(err));
      setLoading(false);
    }
  };

  if (accountCreated) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="rounded-2xl p-8 bg-white border border-[#EBECEF] shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[#13141B]">Account Created!</h2>
            <p className="text-xs text-[#5E6573]">
              Your EdWorld account has been created successfully. Redirecting you to onboarding...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#13141B]">
              <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#13141B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#00D2B4]/20 selection:text-[#0A5245]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-2 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13141B] tracking-tight">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Begin your journey with AI drills, verified portfolio records, and calibrated career pathways.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#EBECEF] shadow-xs space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE]"
                />
                <User className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE]"
                />
                <Mail className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                  Phone Number
                </label>
                <span className="text-[10px] font-mono text-[#5E6573] font-bold">
                  (No OTP Required)
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE]"
                />
                <Phone className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE]"
                />
                <Lock className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8F9CAE] hover:text-[#13141B] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Password Checklist */}
              {password && (
                <div className="pt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700 font-bold" : "text-[#5E6573]"}`}>
                    {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>8+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-700 font-bold" : "text-[#5E6573]"}`}>
                    {hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Letters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-bold" : "text-[#5E6573]"}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Numbers</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase && hasLowercase ? "text-emerald-700 font-bold" : "text-[#5E6573]"}`}>
                    {hasUppercase && hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-rose-500" />}
                    <span>Case Variation</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE]"
                />
                <Lock className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              {confirmPassword && (
                <p className={`text-[11px] font-bold ${passwordsMatch ? "text-emerald-700" : "text-rose-600"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                Referral / Campus Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. EDW-CAMPUS-2026"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FCFCFB] border border-[#EBECEF] text-xs sm:text-sm text-[#13141B] focus:outline-none focus:ring-2 focus:ring-[#13141B] transition-all placeholder:text-[#8F9CAE] uppercase font-mono"
                />
                <Gift className="w-4 h-4 text-[#8F9CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded border-[#EBECEF] text-[#13141B] focus:ring-[#13141B] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#5E6573] cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-[#13141B] font-bold underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#13141B] font-bold underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#13141B] hover:bg-black disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[#EBECEF] text-center">
            <p className="text-xs text-[#5E6573]">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#13141B] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#5E6573] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted database credentials &bull; Zero spam</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFCFB]" />}>
      <SignupForm />
    </Suspense>
  );
}

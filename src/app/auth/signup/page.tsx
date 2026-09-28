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
  Loader2,
  Gift
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { supabase } from "@/lib/supabase";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupWithEmail } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Creating your account...");
  const [error, setError] = useState<string | null>(null);

  // Password validation rules
  const hasMinLen = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLen && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (err: any) {
      setError(err?.message || "Failed to initiate Google sign-in.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password does not meet the security criteria.");
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

      await signupWithEmail(name.trim(), email.trim().toLowerCase(), password);

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
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(translateAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Begin your journey with AI drills, verified portfolio records, and tailored career pathways.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-stone-200/80 shadow-xs space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google One-Click Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50/80 text-stone-700 text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-stone-400 absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Adarsh Patel"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="mt-2 p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Security Requirements
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                      {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-stone-300" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                      {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-stone-300" />}
                      <span>1 uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                      {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-stone-300" />}
                      <span>1 lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-stone-300" />}
                      <span>1 number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-stone-50/50 border text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none transition-colors ${
                    confirmPassword && !passwordsMatch ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" : "border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                  }`}
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">
                Campus Referral Code <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. EDW-CAMPUS-102"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50/50 border border-stone-200 text-xs sm:text-sm font-mono text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors"
                />
                <Gift className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Terms & Privacy */}
            <label className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
                className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-stone-900 underline underline-offset-2 hover:text-stone-700 font-medium" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-stone-900 underline underline-offset-2 hover:text-stone-700 font-medium" target="_blank">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-50 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-stone-900 hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
      <SignupForm />
    </Suspense>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, translateAuthError } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Loader2 
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

function SignupForm() {
  const router = useRouter();
  const { signupWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password validation checklist
  const hasMinLen = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLen && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure your password meets all the security requirements below.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }
    if (!termsAgreed) {
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const { needsEmailVerification } = await signupWithEmail(name.trim(), email.trim(), password);

      if (needsEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(translateAuthError(err));
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
          Create Your EdWorld Account
        </h2>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Start practicing interview drills, optimizing resumes, and unlocking career tools.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-5">
          
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={oauthLoading || loading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-[#E8ECF2] text-xs font-bold text-[#13141B] transition-all flex items-center justify-center gap-3 shadow-sm hover:border-slate-400 cursor-pointer disabled:opacity-50"
          >
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
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
            <span>Sign up with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E8ECF2]" />
            <span className="text-[11px] font-bold text-[#8E95A5] uppercase">or with email</span>
            <div className="flex-1 h-px bg-[#E8ECF2]" />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/30 text-[#FF7A50] text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Adarsh Patel"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                />
                <User className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Email Address
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

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-[#13141B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Password Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-1.5">
                <p className="text-[10px] font-bold uppercase text-[#8E95A5] tracking-wider mb-1">
                  Password Requirements
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-600 font-bold" : "text-[#8E95A5]"}`}>
                    {hasMinLen ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#8E95A5]" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-600 font-bold" : "text-[#8E95A5]"}`}>
                    {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#8E95A5]" />}
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-600 font-bold" : "text-[#8E95A5]"}`}>
                    {hasLowercase ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#8E95A5]" />}
                    <span>1 lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 font-bold" : "text-[#8E95A5]"}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#8E95A5]" />}
                    <span>1 number</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F4F6FB] border text-xs text-[#13141B] focus:outline-none transition-colors ${
                    confirmPassword && !passwordsMatch ? "border-[#FF7A50]" : "border-[#E8ECF2] focus:border-[#13141B]"
                  }`}
                />
                <Lock className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                {confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <X className="w-4 h-4 text-[#FF7A50]" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Privacy */}
            <label className="flex items-start gap-2.5 text-xs text-[#5E6573] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
                className="mt-0.5 rounded border-[#E8ECF2]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#13141B] font-bold hover:underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#13141B] font-bold hover:underline" target="_blank">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8ECF2] text-center">
            <p className="text-xs text-[#5E6573]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-[#13141B] hover:underline">
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
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <SignupForm />
    </Suspense>
  );
}

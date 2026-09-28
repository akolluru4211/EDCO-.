"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2, Lock, Check, X, Eye, EyeOff, Loader2 } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { useAuth, translateAuthError } from "@/lib/auth-context";

function ResetPasswordContent() {
  const router = useRouter();
  const { updateUserPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    if (!isPasswordValid) {
      setError("Please ensure your new password satisfies all requirements below.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUserPassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
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
          Create New Password
        </h1>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Choose a secure new password for your EdWorld account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl p-6 sm:p-8 bg-white border border-[#EBECEF] shadow-xs space-y-5">
          
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200/60">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-[#13141B]">Password Updated!</h3>
              <p className="text-xs text-[#5E6573]">
                Your password has been successfully reset. Redirecting you to your dashboard...
              </p>
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
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs sm:text-sm text-[#13141B] placeholder:text-[#8E95A5] focus:bg-white focus:outline-none focus:border-[#13141B] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-[#13141B] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Live Password Checklist */}
              {password.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-[#8E95A5] tracking-wider">
                    Requirements
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLen ? "text-emerald-700 font-bold" : "text-[#8E95A5]"}`}>
                      {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-[#8E95A5]" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-bold" : "text-[#8E95A5]"}`}>
                      {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-[#8E95A5]" />}
                      <span>1 uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-bold" : "text-[#8E95A5]"}`}>
                      {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-[#8E95A5]" />}
                      <span>1 lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-bold" : "text-[#8E95A5]"}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full border border-[#8E95A5]" />}
                      <span>1 number</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#13141B]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#F4F6FB] border text-xs sm:text-sm text-[#13141B] placeholder:text-[#8E95A5] focus:bg-white focus:outline-none transition-colors ${
                      confirmPassword && !passwordsMatch ? "border-rose-300 focus:border-rose-500" : "border-[#E8ECF2] focus:border-[#13141B]"
                    }`}
                  />
                  <Lock className="w-4 h-4 text-[#8E95A5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Set New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#EBECEF] text-center">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-[#5E6573] hover:text-[#13141B] transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFCFB]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

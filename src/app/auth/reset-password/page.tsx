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
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
          Create New Password
        </h2>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-sm mx-auto">
          Choose a secure new password for your EdWorld account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-5">
          
          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#13141B]">Password Updated!</h3>
              <p className="text-xs text-[#5E6573]">
                Your password has been successfully reset. Redirecting you to your dashboard...
              </p>
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
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
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

                {/* Password Criteria Checklist */}
                <div className="mt-2.5 p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-[#8E95A5] tracking-wider mb-1">
                    Requirements
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

              <div>
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
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

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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

        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

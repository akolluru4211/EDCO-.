"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, translateAuthError } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Lock,
  Eye,
  EyeOff,
  Mail,
  Loader2
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both your email address and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { role, redirectUrl, onboardingCompleted } = await loginWithEmail(email, password);
      
      const explicitRedirect = searchParams?.get("redirectUrl");
      if (explicitRedirect && !explicitRedirect.startsWith("/auth") && !explicitRedirect.startsWith("/login")) {
        router.push(explicitRedirect);
        return;
      }

      if (role && role !== "CLIENT") {
        router.push(redirectUrl);
      } else if (onboardingCompleted === false) {
        router.push("/onboarding");
      } else {
        router.push(redirectUrl || "/dashboard");
      }
    } catch (err: any) {
      const friendlyMsg = translateAuthError(err);
      setError(friendlyMsg);
      if (friendlyMsg.includes("verify your email")) {
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }, 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
          Welcome Back to EdWorld
        </h2>
        <p className="text-xs sm:text-sm text-[#5E6573]">
          Sign in to access your drills, resume builder, and career tools.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-5">
          
          {error && (
            <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/30 text-[#FF7A50] text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#5E6573] hover:text-[#13141B] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-[#13141B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to EdWorld</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8ECF2] text-center">
            <p className="text-xs text-[#5E6573]">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-bold text-[#13141B] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#8E95A5] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure single sign-on across all EdWorld learning & career features</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Compass, 
  GraduationCap, 
  Briefcase, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";

type TrackType = "junior" | "student" | "pro" | "staff";

interface TrackConfig {
  id: TrackType;
  title: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  icon: any;
  welcomeSubtitle: string;
  description: string;
  emailPlaceholder: string;
  targetDashboard: string;
  signupHref: string;
}

const TRACKS: Record<TrackType, TrackConfig> = {
  junior: {
    id: "junior",
    title: "Junior School Lab",
    badge: "Ages 13–15",
    badgeColor: "bg-[#EDE8FD] text-[#7B57FF] border-[#7B57FF]/30",
    accentColor: "#7B57FF",
    icon: Compass,
    welcomeSubtitle: "Continue your Junior journey.",
    description: "Curiosity quests, digital literacy & private growth journal.",
    emailPlaceholder: "student@school.org or name@example.com",
    targetDashboard: "/student/junior/dashboard",
    signupHref: "/auth/signup?track=junior&stage=junior",
  },
  student: {
    id: "student",
    title: "Student & Campus",
    badge: "Ages 16–18 • College",
    badgeColor: "bg-[#E0FAF6] text-[#00D2B4] border-[#00D2B4]/30",
    accentColor: "#00D2B4",
    icon: GraduationCap,
    welcomeSubtitle: "Continue building your career.",
    description: "College roadmaps, micro-project studio & entrance prep.",
    emailPlaceholder: "student@college.edu or name@example.com",
    targetDashboard: "/student/explorer/dashboard",
    signupHref: "/auth/signup?track=student&stage=student",
  },
  pro: {
    id: "pro",
    title: "Working Professional",
    badge: "Ages 18+ • Career",
    badgeColor: "bg-[#FFF6DC] text-[#FFB800] border-[#FFB800]/30",
    accentColor: "#D7FC51",
    icon: Briefcase,
    welcomeSubtitle: "Continue your career journey.",
    description: "ATS resume optimization, STAR AI mock drills & job radar.",
    emailPlaceholder: "you@example.com",
    targetDashboard: "/dashboard",
    signupHref: "/auth/signup?track=pro&stage=professional",
  },
  staff: {
    id: "staff",
    title: "Internal Staff Gateway",
    badge: "Corporate SSO",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentColor: "#10B981",
    icon: ShieldCheck,
    welcomeSubtitle: "EdWorld internal organization single sign-on",
    description: "Authorized workspace access for EdWorld corporate team members.",
    emailPlaceholder: "name@edworld.co.in",
    targetDashboard: "/employee",
    signupHref: "/hr/provision-account",
  },
};

const STAGE_CONFIGS = TRACKS;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithEmail } = useAuth();

  const stageParam = searchParams?.get("stage");
  const trackParam = (searchParams?.get("track") as TrackType) || (stageParam === "junior" ? "junior" : stageParam === "student" ? "student" : "pro");
  
  const [selectedTrack, setSelectedTrack] = useState<TrackType>(
    TRACKS[trackParam] ? trackParam : "pro"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stage = searchParams?.get("stage");
    const track = searchParams?.get("track") as TrackType;
    if (stage === "junior" || track === "junior") setSelectedTrack("junior");
    else if (stage === "student" || track === "student") setSelectedTrack("student");
    else if (stage === "professional" || track === "pro") setSelectedTrack("pro");
    else if (track === "staff") setSelectedTrack("staff");
  }, [searchParams]);

  const currentTrack = TRACKS[selectedTrack];
  const IconComponent = currentTrack.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const { role, redirectUrl } = await loginWithEmail(email, password);
      
      // If staff login or corporate user, respect the role redirect
      if (role && role !== "CLIENT") {
        router.push(redirectUrl);
      } else {
        // For client learners, route to their track dashboard if specified, else redirectUrl
        if (selectedTrack === "junior") {
          router.push("/student/junior/dashboard");
        } else if (selectedTrack === "student") {
          router.push("/student/explorer/dashboard");
        } else {
          router.push(redirectUrl || "/dashboard");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production Firebase / Supabase SSO initiates Google OAuth
      // For local session resilience, fallback smoothly
      window.location.href = `/auth/login?track=${selectedTrack}`;
    } catch (err: any) {
      setError(err?.message || "Google sign-in temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <EdworldLogo size="md" showText={false} />
        </div>
        <div>
          <h1 className="text-2xl font-black font-sans text-slate-900 tracking-tight">
            {selectedTrack === "staff" ? "Corporate Sign In" : "Welcome Back"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentTrack.welcomeSubtitle}
          </p>
        </div>
      </div>

      {/* Segmented Track Switcher (Kids / Students / Working Professionals) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 uppercase tracking-wider">
          <span>Career Stage</span>
          {selectedTrack !== "staff" && (
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("staff");
                setError(null);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-medium lowercase"
            >
              <Lock className="w-3 h-3" />
              <span>staff gateway</span>
            </button>
          )}
        </div>

        {selectedTrack !== "staff" ? (
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("junior");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] ${
                selectedTrack === "junior"
                  ? "bg-violet-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="truncate">Junior (13-15)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTrack("student");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] ${
                selectedTrack === "student"
                  ? "bg-emerald-600 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="truncate">Student (16-18)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedTrack("pro");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] ${
                selectedTrack === "pro"
                  ? "bg-slate-900 text-white shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate">Career (18+)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-emerald-300">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Staff Portal Active (@edworld.co.in)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("pro");
                setError(null);
              }}
              className="text-[10px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
            >
              Back to Learner
            </button>
          </div>
        )}
      </div>

      {/* Selected Track Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <IconComponent className="w-4 h-4" style={{ color: currentTrack.accentColor === "#D7FC51" ? "#0F172A" : currentTrack.accentColor }} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{currentTrack.title}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${currentTrack.badgeColor}`}>
              {currentTrack.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {currentTrack.description}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            {selectedTrack === "staff" ? "Corporate Email (@edworld.co.in)" : "Email Address"}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={currentTrack.emailPlaceholder}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono min-h-[44px]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-slate-200 text-xs text-slate-900 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-mono min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="md"
          className="w-full justify-center bg-slate-900 text-white hover:bg-black font-black rounded-2xl shadow-md transition-transform active:scale-95 min-h-[48px]"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          <span>{loading ? "Authenticating..." : `Enter ${selectedTrack === "staff" ? "Staff OS" : "Workspace"}`}</span>
        </Button>
      </form>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
            {resetSent ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Password reset link sent to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setResetSent(false); }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your account email address and we will send you a reset link.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer link to tailored signup */}
      <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
        {selectedTrack !== "staff" ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link href={currentTrack.signupHref} className="text-slate-900 font-bold hover:underline">
              Sign Up for {currentTrack.title} &rarr;
            </Link>
          </p>
        ) : (
          <p className="text-[11px] text-slate-500">
            New staff accounts are provisioned by <Link href="/hr/provision-account" className="text-slate-900 font-bold hover:underline">HR Operations</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-white text-slate-900 selection:bg-[#D7FC51] selection:text-slate-950">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading authentication portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

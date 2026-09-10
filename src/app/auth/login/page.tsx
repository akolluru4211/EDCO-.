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
  Lock
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
  description: string;
  emailPlaceholder: string;
  targetDashboard: string;
  signupHref: string;
}

const TRACKS: Record<TrackType, TrackConfig> = {
  junior: {
    id: "junior",
    title: "Junior School & Curiosity Lab",
    badge: "Ages 13–15",
    badgeColor: "bg-[#EDE8FD] text-[#7B57FF] border-[#7B57FF]/30",
    accentColor: "#7B57FF",
    icon: Compass,
    description: "Curiosity quests, digital literacy & private growth journal.",
    emailPlaceholder: "student@school.org or name@example.com",
    targetDashboard: "/student/junior/dashboard",
    signupHref: "/auth/signup?track=junior",
  },
  student: {
    id: "student",
    title: "Student & Campus Explorer",
    badge: "Ages 16–18 • College",
    badgeColor: "bg-[#E0FAF6] text-[#00D2B4] border-[#00D2B4]/30",
    accentColor: "#00D2B4",
    icon: GraduationCap,
    description: "College roadmaps, micro-project studio & entrance prep.",
    emailPlaceholder: "student@college.edu or name@example.com",
    targetDashboard: "/student/explorer/dashboard",
    signupHref: "/auth/signup?track=student",
  },
  pro: {
    id: "pro",
    title: "Career & Professional Suite",
    badge: "Ages 18+ Career",
    badgeColor: "bg-[#FFF6DC] text-[#FFB800] border-[#FFB800]/30",
    accentColor: "#D7FC51",
    icon: Briefcase,
    description: "ATS resume optimization, STAR AI mock drills & job radar.",
    emailPlaceholder: "you@example.com",
    targetDashboard: "/dashboard",
    signupHref: "/auth/signup?track=pro",
  },
  staff: {
    id: "staff",
    title: "Internal Staff Gateway",
    badge: "Corporate SSO",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentColor: "#10B981",
    icon: ShieldCheck,
    description: "Authorized workspace access for EdWorld corporate team members.",
    emailPlaceholder: "name@edworld.co.in",
    targetDashboard: "/employee",
    signupHref: "/hr/provision-account",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithEmail } = useAuth();

  const trackParam = (searchParams?.get("track") as TrackType) || "pro";
  const [selectedTrack, setSelectedTrack] = useState<TrackType>(
    TRACKS[trackParam] ? trackParam : "pro"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const param = searchParams?.get("track") as TrackType;
    if (param && TRACKS[param]) {
      setSelectedTrack(param);
    }
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

  return (
    <div className="max-w-md w-full bg-[#13141B] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <EdworldLogo size="md" showText={false} />
        </div>
        <div>
          <h1 className="text-2xl font-black font-sans text-white tracking-tight">
            {selectedTrack === "staff" ? "Corporate Sign In" : "Welcome Back"}
          </h1>
          <p className="text-xs text-[#8E95A5] mt-0.5">
            {selectedTrack === "staff"
              ? "EdWorld internal organization single sign-on"
              : "Sign in to access your personalized learning workspace"}
          </p>
        </div>
      </div>

      {/* Segmented Track Switcher (Kids / Students / Working Professionals) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#8E95A5] px-1 uppercase tracking-wider">
          <span>Select Your Track</span>
          {selectedTrack !== "staff" && (
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("staff");
                setError(null);
              }}
              className="text-[10px] text-[#717786] hover:text-[#D7FC51] transition-colors flex items-center gap-1 font-medium lowercase"
            >
              <Lock className="w-3 h-3" />
              <span>staff gateway</span>
            </button>
          )}
        </div>

        {selectedTrack !== "staff" ? (
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#1C1D26] border border-white/5">
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("junior");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTrack === "junior"
                  ? "bg-[#7B57FF] text-white shadow-md font-black"
                  : "text-[#8E95A5] hover:text-white"
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
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTrack === "student"
                  ? "bg-[#00D2B4] text-[#13141B] shadow-md font-black"
                  : "text-[#8E95A5] hover:text-white"
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
              className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                selectedTrack === "pro"
                  ? "bg-[#D7FC51] text-[#13141B] shadow-md font-black"
                  : "text-[#8E95A5] hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate">Career (18+)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#1C1D26] border border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Staff Portal Active (@edworld.co.in)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTrack("pro");
                setError(null);
              }}
              className="text-[10px] text-[#8E95A5] hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              Back to Learner
            </button>
          </div>
        )}
      </div>

      {/* Selected Track Banner */}
      <div className="p-3.5 rounded-2xl bg-[#181924] border border-white/5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
          <IconComponent className="w-4 h-4" style={{ color: currentTrack.accentColor }} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{currentTrack.title}</span>
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${currentTrack.badgeColor}`}>
              {currentTrack.badge}
            </span>
          </div>
          <p className="text-[11px] text-[#8E95A5] leading-relaxed">
            {currentTrack.description}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
            {selectedTrack === "staff" ? "Corporate Email (@edworld.co.in)" : "Email Address"}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={currentTrack.emailPlaceholder}
            className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs text-white bg-[#1C1D26] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51] focus:ring-1 focus:ring-[#D7FC51] transition-all font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
              Password
            </label>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs text-white bg-[#1C1D26] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#D7FC51] focus:ring-1 focus:ring-[#D7FC51] transition-all font-mono"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          size="md"
          className="w-full justify-center bg-[#D7FC51] text-[#13141B] hover:bg-[#E9FFA4] font-black rounded-2xl shadow-lg transition-transform active:scale-95"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          <span>{loading ? "Authenticating..." : `Enter ${selectedTrack === "staff" ? "Staff OS" : "Workspace"}`}</span>
        </Button>
      </form>

      {/* Footer link to tailored signup */}
      <div className="pt-2 border-t border-white/5 text-center text-xs text-[#8E95A5]">
        {selectedTrack !== "staff" ? (
          <p>
            Don&apos;t have a {selectedTrack === "junior" ? "junior" : selectedTrack === "student" ? "student" : "career"} account?{" "}
            <Link href={currentTrack.signupHref} className="text-[#D7FC51] font-bold hover:underline">
              Sign Up for {currentTrack.badge} &rarr;
            </Link>
          </p>
        ) : (
          <p className="text-[11px]">
            New staff accounts are provisioned by <Link href="/hr/provision-account" className="text-[#D7FC51] font-bold hover:underline">HR Operations</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0E0F15] text-white selection:bg-[#D7FC51] selection:text-[#13141B]">
      <Suspense fallback={<div className="text-xs text-[#8E95A5]">Loading authentication portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

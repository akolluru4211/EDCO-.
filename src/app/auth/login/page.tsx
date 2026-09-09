"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, AlertCircle, ShieldCheck, UserCheck, Briefcase } from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail } = useAuth();
  const [loginType, setLoginType] = useState<"client" | "staff">("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const { role, redirectUrl } = await loginWithEmail(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0E0F15] text-white">
      <div className="max-w-md w-full bg-[#13141B] rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <EdworldLogo size="md" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-black font-sans text-white tracking-tight">EdWorld Internal OS</h1>
            <p className="text-xs text-[#8E95A5] mt-1">Single sign-on for EdWorld Organization &amp; Client Portals</p>
          </div>
        </div>

        {/* Dual-Track Persona Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#1C1D26] border border-white/5">
          <button
            type="button"
            onClick={() => {
              setLoginType("staff");
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginType === "staff"
                ? "bg-[#D7FC51] text-[#13141B] shadow-sm font-black"
                : "text-[#8E95A5] hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType("client");
              setError(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              loginType === "client"
                ? "bg-[#282937] text-white shadow-sm border border-white/15"
                : "text-[#8E95A5] hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Client / Learner</span>
          </button>
        </div>

        {/* Information Notice */}
        {loginType === "staff" ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1 animate-in fade-in">
            <span className="font-black flex items-center gap-1.5 text-emerald-200">
              <Briefcase className="w-3.5 h-3.5" />
              Corporate Staff Gateway
            </span>
            <p className="text-emerald-300/80 leading-relaxed">
              Use your provisioned <code>@edworld.co.in</code> corporate account. Routes automatically to your role workspace (Employee, HR, Founder, Teacher, College, or Admin).
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#1C1D26] border border-white/5 text-[11px] text-[#8E95A5] space-y-1 animate-in fade-in">
            <span className="font-bold text-white block">👤 Learner &amp; Client Access</span>
            <p>
              Sign in with your personal registered email and password to access the client dashboard.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
              {loginType === "staff" ? "Corporate Email (@edworld.co.in)" : "Email Address"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginType === "staff" ? "name@edworld.co.in" : "name@example.com"}
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
            className="w-full justify-center bg-[#D7FC51] text-[#13141B] hover:bg-[#E9FFA4] font-black rounded-2xl shadow-lg"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            <span>{loading ? "Authenticating..." : "Enter Workspace"}</span>
          </Button>
        </form>

        <p className="text-center text-xs text-[#8E95A5] pt-2 border-t border-white/5">
          {loginType === "client" ? (
            <>
              Need a learner account?{" "}
              <Link href="/auth/signup" className="text-[#D7FC51] font-bold hover:underline">
                Sign Up
              </Link>
            </>
          ) : (
            <span className="text-[11px] text-[#8E95A5]">
              New staff members are provisioned by <Link href="/hr/provision-account" className="text-[#D7FC51] hover:underline font-bold">HR Operations</Link>.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

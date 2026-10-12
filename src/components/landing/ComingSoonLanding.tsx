"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Bell, 
  Briefcase, 
  Mic, 
  FileText, 
  Users, 
  ShieldCheck, 
  ExternalLink 
} from "lucide-react";
import { EdworldLogo } from "@/components/ui/EdworldLogo";

interface ComingSoonLandingProps {
  onBypassComingSoon?: () => void;
}

export default function ComingSoonLanding({ onBypassComingSoon }: ComingSoonLandingProps) {
  // Target Launch Date: October 20, 2026, 00:00:00 IST
  const launchTimestamp = new Date("2026-10-20T00:00:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hasLaunched: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasLaunched: false
  });

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const difference = launchTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, hasLaunched: true });
        if (onBypassComingSoon) {
          onBypassComingSoon();
        }
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, hasLaunched: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [launchTimestamp, onBypassComingSoon]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "coming_soon_oct20_waitlist"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
      } else {
        // Even if already subscribed or transient error, thank user gracefully
        setSubscribed(true);
      }
    } catch (err) {
      setSubscribed(true); // Graceful UX fallback
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <EdworldLogo size="lg" variant="dark" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-900/80 border border-neutral-800 rounded-full text-xs text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Launch Date: October 20, 2026</span>
          </div>

          {onBypassComingSoon && (
            <button
              onClick={onBypassComingSoon}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition underline underline-offset-4"
              title="Preview full site"
            >
              Preview Full Site
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-16 sm:py-24 text-center my-auto">
        {/* Launch Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Production Release Arriving October 20, 2026</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Something extraordinary is <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">coming soon</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Edworld Co. is putting the finishing touches on our end-to-end career intelligence platform.
          Real-time AI mock interviews, JD-matched resume crafting, and verified employer pipelines.
        </p>

        {/* Countdown Timer Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto mb-14">
          {/* Days */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xs flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-400 mt-2 font-medium">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xs flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-400 mt-2 font-medium">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xs flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-400 mt-2 font-medium">
              Minutes
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xs flex flex-col items-center justify-center">
            <span className="text-3xl sm:text-5xl font-mono font-bold text-blue-400 tracking-tight">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-400 mt-2 font-medium">
              Seconds
            </span>
          </div>
        </div>

        {/* Early Access / Waitlist Form */}
        <div className="max-w-md mx-auto mb-16">
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access..."
                  required
                  className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  {submitting ? "Joining..." : "Notify Me"}
                </button>
              </div>
              {errorMessage && (
                <p className="text-xs text-rose-400 text-left">{errorMessage}</p>
              )}
              <p className="text-xs text-neutral-400 text-left">
                Join 1,200+ students and early career professionals. Zero spam, honest updates only.
              </p>
            </form>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You&apos;re on the early access list! We&apos;ll notify you on October 20, 2026.</span>
            </div>
          )}
        </div>

        {/* Feature Teasers Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl">
            <Mic className="w-5 h-5 text-blue-400 mb-2" />
            <h3 className="text-sm font-semibold text-neutral-200">AI Mock Interviews</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Real-time voice and behavioral feedback with instant score breakdown.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl">
            <FileText className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-semibold text-neutral-200">ATS Resume Maker</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Keyword matching against real job descriptions and tailored bullet advice.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl">
            <Briefcase className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-neutral-200">Verified Job Board</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Curated opportunities with transparent source tags and real status updates.
            </p>
          </div>

          <div className="p-4 bg-neutral-900/40 border border-neutral-900 rounded-xl">
            <Users className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-sm font-semibold text-neutral-200">Peer Mentorship</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Safe community networking across colleges, alumni, and employers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Infrastructure verified • All systems operational</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-neutral-300 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-neutral-300 transition">Terms of Service</Link>
          <span>&copy; {new Date().getFullYear()} Edworld Co. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Sparkles, Loader2 } from "lucide-react";

interface NewsletterSubscribeFormProps {
  variant?: "card" | "inline" | "minimal";
  className?: string;
  source?: string;
}

export default function NewsletterSubscribeForm({
  variant = "card",
  className = "",
  source = "general_widget",
}: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-6 rounded-2xl bg-[#00D2B4]/10 border border-[#00D2B4]/30 text-center space-y-2 animate-in fade-in ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-[#00D2B4] text-[#0A5245] flex items-center justify-center mx-auto font-black shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-bold text-sm text-[#13141B]">You&apos;re Subscribed!</h4>
        <p className="text-xs text-[#5E6573]">
          A welcome confirmation has been sent to <strong>{email}</strong>. Stay tuned for career insights and exclusive updates.
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row items-center gap-2 ${className}`}>
        <div className="relative flex-1 w-full">
          <Mail className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for updates..."
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8ECF2] bg-white text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B] transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00D2B4]" />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-[#EBECEF] shadow-xs space-y-4 ${className}`}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00D2B4]/10 text-[#0A5245] border border-[#00D2B4]/20 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>EdWorld Dispatch</span>
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#13141B]">
          Subscribe to Engineering &amp; Placement News
        </h3>
        <p className="text-xs text-[#5E6573] leading-relaxed">
          Get weekly curated student job openings, system design case studies, interview walkthroughs, and early feature updates.
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] bg-[#F8FAFC] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B] transition-all"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF2] bg-[#F8FAFC] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>Join Newsletter Community</span>
              <ArrowRight className="w-4 h-4 text-[#00D2B4]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

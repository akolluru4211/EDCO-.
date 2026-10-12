"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, CheckCircle2, ArrowRight, Loader2, MailX } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialStatus = searchParams.get("status") === "done";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(initialStatus);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFB] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans text-[#13141B]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#EBECEF] shadow-xs space-y-6 text-center">
        
        {success ? (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-[#13141B]">
              You Have Been Unsubscribed
            </h1>
            <p className="text-xs text-[#5E6573] leading-relaxed">
              Your email preferences have been updated. You will no longer receive platform marketing or broadcast announcements from EdWorld Co.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs transition-all shadow-xs"
              >
                <span>Return to Homepage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <MailX className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-[#13141B]">
              Email Unsubscribe
            </h1>
            <p className="text-xs text-[#5E6573] leading-relaxed">
              We respect your inbox. Enter your email address below to immediately opt out of platform announcements and email updates.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-left">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUnsubscribe} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-bold text-[#5E6573] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] placeholder:text-[#8E95A5] focus:outline-none focus:border-[#13141B]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#13141B] hover:bg-[#252632] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00D2B4]" />
                    <span>Unsubscribing...</span>
                  </>
                ) : (
                  <span>Confirm Unsubscribe</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-[#5E6573]">
              Need help? Contact <a href="mailto:edworld.eden@gmail.com" className="font-bold underline text-emerald-700">edworld.eden@gmail.com</a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFCFB]" />}>
      <UnsubscribeContent />
    </Suspense>
  );
}

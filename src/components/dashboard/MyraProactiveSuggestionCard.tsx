"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ProactiveSuggestionData {
  id: string;
  suggestion_text: string;
  action_label: string;
  action_url: string;
  context_reason?: string;
  dismissed?: boolean;
}

export default function MyraProactiveSuggestionCard() {
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<ProactiveSuggestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Strict Career Track Guardrail: Do not show for minors
    if (user.ageBand === "13-15" || user.ageBand === "16-18") {
      setLoading(false);
      return;
    }

    fetch(`/api/ai/myra/proactive-suggestion?userId=${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestion && !data.suggestion.dismissed) {
          setSuggestion(data.suggestion);
        }
      })
      .catch((err) => {
        console.warn("[Proactive suggestion fetch note]:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid, user?.ageBand]);

  const handleDismiss = async () => {
    if (!user?.uid || !suggestion || isDismissing) return;
    setIsDismissing(true);
    setSuggestion(null); // Immediate optimistic dismissal

    try {
      await fetch("/api/ai/myra/proactive-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId: suggestion.id,
          userId: user.uid,
          action: "dismiss",
        }),
      });
    } catch (err) {
      console.warn("[Failed to dismiss proactive suggestion]:", err);
    } finally {
      setIsDismissing(false);
    }
  };

  if (loading || !suggestion) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 group font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Icon & Text Content */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 pr-6 sm:pr-0">
          <div className="relative w-10 h-10 rounded-xl bg-neutral-950 p-1 flex items-center justify-center shrink-0 border border-neutral-800 shadow-2xs">
            <Image
              src="/images/edworld-logo.png"
              alt="Myra Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00B49B] ring-2 ring-white" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00B49B]" /> Myra&apos;s Daily Career Focus
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed">
              {suggestion.suggestion_text}
            </p>
          </div>
        </div>

        {/* Right Action & Dismiss Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <Link
            href={suggestion.action_url}
            className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 group/btn"
          >
            <span>{suggestion.action_label}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-[#00D2B4]" />
          </Link>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss Suggestion"
            className="p-2 rounded-xl text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Dismiss for today"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

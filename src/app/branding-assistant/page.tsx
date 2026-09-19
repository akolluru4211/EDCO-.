"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowLeft, 
  Share2, 
  Flame, 
  RefreshCw,
  FileText
} from "lucide-react";

export default function BrandingAssistantPage() {
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Thought Leadership");
  const [isPolishing, setIsPolishing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePolish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setIsPolishing(true);
    try {
      const res = await fetch("/api/ai/branding-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftBullets: draft, topic, tone })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCopy = () => {
    if (result?.postContent) {
      navigator.clipboard.writeText(result.postContent + "\n\n" + (result.hashtags?.join(" ") || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Share2 className="w-6 h-6 text-[#D7FC51]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">Personal Branding &amp; Post Assistant</h1>
              <p className="text-xs text-slate-400 mt-0.5">Structure and polish authentic technical learnings into high-impact LinkedIn posts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={handlePolish} className="p-6 rounded-3xl bg-[#151621] border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tone &amp; Format</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                <option value="Thought Leadership">Thought Leadership (Architecture &amp; Strategy)</option>
                <option value="Technical Learning">Technical Learning (What I Built / Discovered)</option>
                <option value="Career Milestone">Career Milestone (Promotion / Switch / Cert)</option>
                <option value="Mentorship & Culture">Mentorship &amp; Team Culture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Topic / Core Idea</label>
              <input
                type="text"
                placeholder="e.g. Migrating from REST to gRPC in production"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Your Draft / Bullet Points *</label>
              <textarea
                rows={6}
                required
                placeholder="- Built a caching layer with Redis\n- Reduced latency by 45%\n- Learned key trade-offs around invalidation..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isPolishing || !draft.trim()}
              className="w-full py-3 rounded-2xl bg-[#D7FC51] text-slate-950 font-black text-xs hover:bg-[#cbf13f] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isPolishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Polishing with Claude AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Polished Post</span>
                </>
              )}
            </button>
          </form>

          <div className="p-6 rounded-3xl bg-[#151621] border border-white/10 space-y-4 flex flex-col justify-between">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono font-bold text-[#D7FC51]">Polished Post Ready</span>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Post"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result.postContent}
                </div>

                {result.hashtags && (
                  <div className="flex flex-wrap gap-1">
                    {result.hashtags.map((h: string, i: number) => (
                      <span key={i} className="text-[11px] font-mono text-indigo-400 font-bold">{h}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 my-auto">
                <FileText className="w-8 h-8 text-slate-600" />
                <span>Enter your bullet notes on the left to produce a formatted, hook-optimized draft.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

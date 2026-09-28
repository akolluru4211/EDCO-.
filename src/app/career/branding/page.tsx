"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Edit3, 
  Linkedin, 
  FileText, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  FolderGit2,
  Award,
  AlertCircle
} from "lucide-react";
import { BrandingPostDraft } from "@/lib/types/career-intelligence";

export default function PersonalBrandingPage() {
  const { user, profile } = useAuth();
  const [drafts, setDrafts] = useState<BrandingPostDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/career/branding");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch (e) {
      console.error("Failed to load branding drafts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDrafts();
    }
  }, [user]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8ECF2] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0FAF6] text-[#00D2B4] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EVIDENCE-BASED BRANDING ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
              Personal Branding Assistant
            </h1>
            <p className="text-xs sm:text-sm text-[#5E6573]">
              Generate high-signal LinkedIn and project showcase posts derived strictly from your verified achievements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/career/copilot">
              <button className="px-4 py-2.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                <span>Ask Copilot for Ideas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8ECF2] shadow-xs flex items-start gap-3">
          <Share2 className="w-4 h-4 text-[#7B57FF] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5E6573] leading-relaxed">
            <strong className="text-[#13141B]">Responsible Publishing Protocol:</strong> EdWorld Co. does not automatically post to your accounts. Review, edit, and copy drafts to publish manually with complete ownership.
          </p>
        </div>

        {/* Drafts Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-[#E8ECF2] text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#7B57FF] animate-spin mx-auto" />
            <p className="text-xs text-[#5E6573] font-bold">Synthesizing project milestones into high-signal drafts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8ECF2] hover:border-[#13141B]/20 shadow-sm flex flex-col justify-between space-y-5 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F6FB] text-[#7B57FF] uppercase tracking-wider">
                        {draft.category.replace("_", " ")}
                      </span>
                      <h3 className="text-base font-black text-[#13141B] mt-1">
                        {draft.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleCopy(draft.id, draft.content)}
                      className="px-3 py-1.5 rounded-xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-xs font-bold text-[#13141B] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedId === draft.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#8E95A5]" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] whitespace-pre-line leading-relaxed font-sans">
                    {draft.content}
                  </div>

                  {/* Grounded Evidence Tagging */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E95A5]">
                      Based on Verified Evidence:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.basedOnEvidence.map((ev, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold"
                        >
                          ✓ {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hashtags */}
                  {draft.suggestedHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-[#7B57FF]">
                      {draft.suggestedHashtags.map((tag, idx) => (
                        <span key={idx}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between text-xs text-[#8E95A5]">
                  <span>Ready to post to LinkedIn / X</span>
                  <a
                    href="https://www.linkedin.com/feed/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0A66C2] font-bold hover:underline"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>Open LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

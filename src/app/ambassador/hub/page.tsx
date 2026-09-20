"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  Award, 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Calendar, 
  Download, 
  MessageSquare, 
  Sparkles,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AmbassadorHubPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCopyText, setCopiedCopyText] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchHub = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ambassador/hub?userId=${user.uid}`);
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6 text-xs text-[#767E94]">
        Loading your ambassador hub...
      </div>
    );
  }

  if (!data || !data.ambassador) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Ambassador Access Required</h2>
          <p className="text-sm text-[#767E94]">
            This hub is strictly reserved for approved Campus Ambassadors.
          </p>
          <Link href="/ambassador" className="btn-quixel-primary inline-block">Apply to be an Ambassador</Link>
        </div>
      </div>
    );
  }

  const { ambassador, totalReferrals, referrals } = data;
  const referralLink = `https://edworld.co.in/signup?ref=${ambassador.referral_code}`;

  const copyToClipboard = (text: string, type: "link" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const PROMO_TEMPLATES = [
    {
      title: "Campus WhatsApp / Telegram Group Message",
      copy: `Hey everyone! 🚀 Preparing for placements and technical interviews? Check out Edworld Co — it has AI Mock Panel Interviews, ATS Resume Maker, and real company interview experiences: ${referralLink}`
    },
    {
      title: "LinkedIn Post / Peer Recommendation",
      copy: `Excited to represent ${ambassador.college_name} as an official Edworld Co Campus Ambassador! 🎓 If you are gearing up for software engineering, system design, or tech placements, join using my link to unlock curated interview prep drills: ${referralLink}`
    },
    {
      title: "1:1 Direct Message to Classmates",
      copy: `Hey! If you are practicing DSA or mock interviews for placement drives, try Edworld Co with my ambassador referral code '${ambassador.referral_code}': ${referralLink}`
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/ambassador" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Ambassador Portal
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181920]">Ambassador Resource Hub</h1>
                <p className="text-xs text-[#767E94]">{ambassador.college_name} • Private Ambassador Console</p>
              </div>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#E8F8F0] text-[#00C48C] text-xs font-bold border border-[#00C48C]/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C48C]" />
            Active Ambassador
          </span>
        </div>

        {/* Referral Link & Code Banner */}
        <div className="card-quixel p-6 sm:p-7 space-y-4 bg-gradient-to-br from-white to-[#EDE8FD]/20 border-[#5C38FF]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#5C38FF]">Your Ambassador Referral Link</span>
            <span className="text-xs font-mono font-bold text-[#767E94]">Code: {ambassador.referral_code}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full p-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] font-mono text-xs text-[#181920] truncate">
              {referralLink}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => copyToClipboard(referralLink, "link")}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={() => copyToClipboard(ambassador.referral_code, "code")}
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#181920] text-xs font-bold border border-[#E8ECF2] flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Referral Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-quixel p-6 space-y-1">
            <span className="text-xs font-bold text-[#767E94]">Total Attributed Campus Signups</span>
            <div className="text-3xl font-black text-[#181920]">{totalReferrals}</div>
            <p className="text-[11px] text-[#767E94] pt-1">Students registered using your campus referral code</p>
          </div>
          <div className="card-quixel p-6 space-y-1 bg-[#EDE8FD]/30 border-[#5C38FF]/20">
            <span className="text-xs font-bold text-[#5C38FF]">Ambassador Recognition Badge</span>
            <div className="text-sm font-black text-[#181920] flex items-center gap-2 pt-1">
              <Award className="w-5 h-5 text-[#5C38FF]" />
              <span>Campus Ambassador Badge Active</span>
            </div>
            <p className="text-[11px] text-[#767E94]">Featured on your verified student profile</p>
          </div>
        </div>

        {/* Promotional Templates */}
        <div className="card-quixel p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E8ECF2] pb-3">
            <Share2 className="w-5 h-5 text-[#5C38FF]" />
            <h2 className="text-base font-black text-[#181920]">Promotional Materials &amp; Copy Templates</h2>
          </div>

          <div className="space-y-4">
            {PROMO_TEMPLATES.map((tmpl, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#181920]">{tmpl.title}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tmpl.copy);
                      setCopiedCopyText(idx);
                      setTimeout(() => setCopiedCopyText(null), 2000);
                    }}
                    className="text-xs font-bold text-[#5C38FF] hover:underline flex items-center gap-1"
                  >
                    {copiedCopyText === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCopyText === idx ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <p className="text-xs text-[#767E94] leading-relaxed font-sans">{tmpl.copy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Activity Table */}
        <div className="card-quixel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
            <h2 className="text-base font-black text-[#181920]">Recent Campus Signups</h2>
            <span className="text-xs font-bold text-[#767E94]">{totalReferrals} Total</span>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#767E94] italic">
              No signups attributed to your code yet. Share your referral link with classmates to start building campus traction.
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r: any) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-[#F4F6FB] border border-[#E8ECF2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-black">
                      {r.users?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <span className="font-bold text-[#181920]">{r.users?.name || "Student"}</span>
                      <p className="text-[10px] text-[#767E94]">{r.users?.email ? r.users.email.split('@')[0] + '@...' : "Joined"}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#767E94]">
                    {new Date(r.signed_up_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

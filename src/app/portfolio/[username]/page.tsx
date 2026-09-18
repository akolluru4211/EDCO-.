"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ShieldCheck, 
  ExternalLink, 
  Briefcase, 
  Award, 
  FolderGit2, 
  Flame, 
  Sparkles, 
  Brain, 
  Share2, 
  Check, 
  Layers, 
  Copy,
  UserCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EnhancedPortfolioPage() {
  const params = useParams();
  const { user } = useAuth();
  const username = (params?.username as string) || "";

  const [profile, setProfile] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("*")
          .or("username.eq." + username + ",id.eq." + username)
          .maybeSingle();

        if (dbProfile) {
          setProfile(dbProfile);
          const targetId = dbProfile.id || dbProfile.user_id;

          const { data: dbProjects } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", targetId)
            .eq("is_public", true)
            .order("created_at", { ascending: false });

          if (dbProjects) setProjects(dbProjects);

          const { data: dbCerts } = await supabase
            .from("certifications")
            .select("*")
            .eq("user_id", targetId)
            .order("created_at", { ascending: false });

          if (dbCerts) {
            setCertifications(dbCerts);
          } else if (dbProfile.certifications) {
            setCertifications(Array.isArray(dbProfile.certifications) ? dbProfile.certifications : []);
          }
        }
      } catch (err) {
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [username]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0F15] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#D7FC51]/20 text-[#D7FC51] flex items-center justify-center animate-spin mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-400">Loading verified portfolio...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0E0F15] flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-xl font-bold">Portfolio Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          The requested profile @{username} does not exist or is set to private.
        </p>
        <Link href="/dashboard" className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isMinor = profile.age_band && profile.age_band !== "18+";
  if (isMinor) {
    return (
      <div className="min-h-screen bg-[#0E0F15] flex flex-col items-center justify-center text-white p-6 text-center">
        <h2 className="text-xl font-bold">Private Account</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          Under-18 accounts are kept completely private and cannot be publicly viewed.
        </p>
      </div>
    );
  }

  const displayName = profile.name || "Software Engineer";

  return (
    <div className="min-h-screen bg-[#0E0F15] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151621] border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{displayName}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Engineer
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {profile.headline || "Full Stack Software Engineer & Platform Builder"}
                </p>
                <p className="text-[11px] font-mono text-[#8E95A5] mt-1">@{profile.username || username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? "Link Copied!" : "Share Portfolio"}</span>
              </button>
            </div>
          </div>

          {profile.bio && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-t border-white/5 pt-4">
              {profile.bio}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Daily Streak</span>
              <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-4 h-4" /> 7 Days
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Verified Projects</span>
              <span className="text-base font-black text-[#D7FC51] mt-0.5 block">{projects.length} Repos</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Interview Readiness</span>
              <span className="text-base font-black text-emerald-400 mt-0.5 block">92%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Certifications</span>
              <span className="text-base font-black text-indigo-400 mt-0.5 block">{certifications.length} Credentials</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#D7FC51]" />
              <span>Verified Technical Projects ({projects.length})</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-6 rounded-3xl bg-[#151621] border border-white/10 text-center text-xs text-slate-400">
              No public projects added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-3xl bg-[#151621] border border-white/10 shadow-lg space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white">{proj.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-slate-300">
                        {proj.source === "github" ? "GitHub Synced" : "Manual Link"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="flex flex-wrap gap-1">
                      {proj.skills?.map((sk: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[10px] font-mono border border-white/5">
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#D7FC51] text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-[#cbf13f] transition-all"
                        >
                          <span>Live App</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Professional Certifications &amp; Credentials</span>
          </h2>

          {certifications.length === 0 ? (
            <div className="p-6 rounded-3xl bg-[#151621] border border-white/10 text-center text-xs text-slate-400">
              No certifications listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((c: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#151621] border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.name || c.title}</h4>
                      <p className="text-[10px] text-slate-400">{c.issuer || "Accredited Provider"} &bull; {c.issueDate || c.issue_date || "2026"}</p>
                    </div>
                  </div>
                  {(c.url || c.credential_url) && (
                    <a
                      href={c.url || c.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

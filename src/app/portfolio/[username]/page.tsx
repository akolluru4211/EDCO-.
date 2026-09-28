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
  Share2, 
  Check, 
  Layers, 
  Copy,
  Globe,
  MapPin,
  GraduationCap,
  Building2,
  Lock,
  ArrowRight,
  UserX
} from "lucide-react";

export default function EnhancedPortfolioPage() {
  const params = useParams();
  const { user } = useAuth();
  const username = decodeURIComponent((params?.username as string) || "").trim();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchPortfolio = async () => {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage("");

      try {
        const res = await fetch(`/api/profile/public/${encodeURIComponent(username)}`);
        const json = await res.json();

        if (res.ok && json.success && json.data) {
          setProfile(json.data);
        } else {
          setErrorStatus(res.status);
          setErrorMessage(json.error?.message || "User profile not found.");
        }
      } catch (err: any) {
        console.error("Portfolio fetch error:", err);
        setErrorStatus(500);
        setErrorMessage("Failed to load portfolio. Please try again.");
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

  const handleMakePublic = async () => {
    if (!profile || isUpdatingPublic) return;
    setIsUpdatingPublic(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true })
      });
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, isPublic: true }));
      }
    } catch (e) {
      console.error("Failed to update visibility:", e);
    } finally {
      setIsUpdatingPublic(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Loading verified portfolio...</p>
      </div>
    );
  }

  // 2. Private / Not Found State
  if (errorStatus || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 p-8 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            {errorStatus === 403 ? <Lock className="w-7 h-7 text-amber-600" /> : <UserX className="w-7 h-7" />}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              {errorStatus === 403 ? "Private Portfolio" : "User Profile Not Found"}
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              {errorMessage || `The profile for "${username}" does not exist or has not been made publicly visible.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isMinor = profile.ageBand && profile.ageBand !== "18+";
  if (isMinor) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Private Student Profile</h2>
          <p className="text-xs text-stone-500">
            Learner accounts under 18 are kept strictly confidential per child protection guidelines.
          </p>
          <Link href="/dashboard" className="inline-block mt-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.name || "Software Engineer";
  const userInitial = displayName.charAt(0).toUpperCase();
  const projects = profile.projects || [];
  const certs = profile.certifications || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 p-4 sm:p-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* Owner Preview Banner (if viewing own profile while it's set to private) */}
        {profile.isOwner && !profile.isPublic && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Owner Preview:</strong> Your portfolio is currently <strong>Private</strong>. Only you can view this page.
              </span>
            </div>
            <button
              onClick={handleMakePublic}
              disabled={isUpdatingPublic}
              className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPublic ? "Making Public..." : "Make Public"}
            </button>
          </div>
        )}

        {/* Hero Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Avatar & User Details */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-sm shrink-0">
                {userInitial}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                    {displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Builder
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-stone-600">
                  {profile.headline}
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium pt-1 flex-wrap">
                  <span className="font-mono text-emerald-800">@{profile.username}</span>
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {profile.location}
                    </span>
                  )}
                  {profile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-stone-400" />
                      {profile.college}
                    </span>
                  )}
                  {profile.company && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-stone-400" />
                      {profile.company}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copied ? "Link Copied!" : "Share Portfolio"}</span>
              </button>

              {profile.isOwner && (
                <Link
                  href="/profile"
                  className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
              {profile.bio}
            </p>
          )}

          {/* Social Links & External Verification */}
          {(profile.githubUrl || profile.linkedinUrl || profile.leetcodeUrl || profile.portfolioUrl) && (
            <div className="flex items-center gap-2 pt-2 flex-wrap border-t border-stone-100">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              )}
              {profile.leetcodeUrl && (
                <a
                  href={profile.leetcodeUrl.startsWith("http") ? profile.leetcodeUrl : `https://${profile.leetcodeUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>LeetCode</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl.startsWith("http") ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Website</span>
                  <Globe className="w-3 h-3 text-stone-400" />
                </a>
              )}
            </div>
          )}

          {/* Key Verified Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Career Stage</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5 block">{profile.careerStage}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Verified Builds</span>
              <span className="text-xs font-bold text-emerald-800 mt-0.5 block">{projects.length} Repositories</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Skills Tagged</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5 block">{profile.skills?.length || 0} Core Skills</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Credentials</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5 block">{certs.length} Certifications</span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Core Skills &amp; Competencies</span>
            </h2>
            <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-wrap gap-2">
              {profile.skills.map((skill: any, idx: number) => {
                const name = typeof skill === "string" ? skill : skill.name || skill.id;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200/80"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified Technical Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-700" />
              <span>Verified Technical Projects ({projects.length})</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200/80 text-center text-xs text-stone-500 space-y-2">
              <p>No verified public projects published yet.</p>
              {profile.isOwner && (
                <Link href="/projects" className="text-emerald-700 hover:underline font-bold text-xs inline-flex items-center gap-1">
                  <span>Add projects from your GitHub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj: any) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3 flex flex-col justify-between hover:border-stone-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-sm text-stone-900 leading-snug">{proj.title}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-mono text-stone-600 shrink-0">
                        {proj.source === "github" ? "GitHub" : "Project"}
                      </span>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    {proj.skills && proj.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.skills.slice(0, 4).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-stone-50 text-stone-600 text-[10px] font-mono border border-stone-200/60"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-1 hover:bg-stone-800 transition-colors shadow-xs"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>Code Repository</span>
                          <ExternalLink className="w-3 h-3 text-stone-500" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Brand Credit */}
        <div className="text-center pt-6 pb-12 text-xs text-stone-400 space-y-1">
          <p>
            Verified on <Link href="/" className="font-bold text-stone-600 hover:text-stone-900">Edworld Co.</Link> — Next-Generation Career Intelligence Platform
          </p>
        </div>

      </div>
    </div>
  );
}

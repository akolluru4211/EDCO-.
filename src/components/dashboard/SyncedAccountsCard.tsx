"use client";

import React, { useState } from "react";
import { SyncedAccounts } from "@/lib/types";
import { 
  GitBranch, 
  Linkedin, 
  Code2, 
  CheckCircle2, 
  ExternalLink, 
  Unlink, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  Info,
  X
} from "lucide-react";
import Button from "@/components/ui/Button";

interface SyncedAccountsCardProps {
  syncedAccounts?: SyncedAccounts;
  onUpdateAccounts?: (updated: SyncedAccounts) => Promise<void>;
  userId?: string;
}

export default function SyncedAccountsCard({
  syncedAccounts = {},
  onUpdateAccounts,
  userId
}: SyncedAccountsCardProps) {
  // Modal states
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [ghUsername, setGhUsername] = useState(syncedAccounts.github?.username || "");
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [lcUsername, setLcUsername] = useState(syncedAccounts.leetcode?.username || "");
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState<string | null>(null);

  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [liUrl, setLiUrl] = useState(syncedAccounts.linkedin?.profileUrl || "");
  const [liLoading, setLiLoading] = useState(false);
  const [liError, setLiError] = useState<string | null>(null);

  // Sync GitHub Handler
  const handleSyncGitHub = async (customUsername?: string) => {
    const targetUser = (customUsername || ghUsername || syncedAccounts.github?.username || "").trim();
    if (!targetUser) {
      setGhError("Please enter a valid GitHub username.");
      return;
    }

    setGhLoading(true);
    setGhError(null);

    try {
      const res = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUser, userId })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to sync GitHub profile.");
      }

      const ghData = json.data;
      const updated: SyncedAccounts = {
        ...syncedAccounts,
        github: {
          connected: true,
          username: ghData.username,
          contributionsThisYear: ghData.totalStars || 0,
          recentRepos: (ghData.repositories || []).slice(0, 3).map((r: any) => ({
            name: r.name,
            stars: r.stars,
            language: r.language || "Code"
          })),
          lastSyncedAt: new Date().toISOString()
        }
      };

      if (onUpdateAccounts) await onUpdateAccounts(updated);
      setShowGitHubModal(false);
    } catch (err: any) {
      setGhError(err.message || "Failed to sync GitHub account.");
    } finally {
      setGhLoading(false);
    }
  };

  // Sync LeetCode Handler
  const handleSyncLeetCode = async (customUsername?: string) => {
    const targetUser = (customUsername || lcUsername || syncedAccounts.leetcode?.username || "").trim();
    if (!targetUser) {
      setLcError("Please enter a valid LeetCode username.");
      return;
    }

    setLcLoading(true);
    setLcError(null);

    try {
      const res = await fetch("/api/integrations/leetcode/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUser, userId })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to sync LeetCode profile.");
      }

      const lcData = json.data;
      const updated: SyncedAccounts = {
        ...syncedAccounts,
        leetcode: {
          connected: true,
          username: lcData.username,
          problemsSolved: {
            easy: lcData.easySolved || 0,
            medium: lcData.mediumSolved || 0,
            hard: lcData.hardSolved || 0,
            total: lcData.totalSolved || 0
          },
          isSelfReported: false,
          lastUpdatedAt: new Date().toISOString()
        }
      };

      if (onUpdateAccounts) await onUpdateAccounts(updated);
      setShowLeetCodeModal(false);
    } catch (err: any) {
      setLcError(err.message || "Failed to sync LeetCode account.");
    } finally {
      setLcLoading(false);
    }
  };

  // Sync LinkedIn Handler
  const handleSyncLinkedIn = async (customUrl?: string) => {
    const targetUrl = (customUrl || liUrl || syncedAccounts.linkedin?.profileUrl || "").trim();
    if (!targetUrl) {
      setLiError("Please enter a valid LinkedIn profile URL.");
      return;
    }

    setLiLoading(true);
    setLiError(null);

    try {
      const res = await fetch("/api/integrations/linkedin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: targetUrl, userId })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to verify LinkedIn profile URL.");
      }

      const liData = json.data;
      const updated: SyncedAccounts = {
        ...syncedAccounts,
        linkedin: {
          connected: true,
          profileUrl: liData.profileUrl,
          verified: true
        }
      };

      if (onUpdateAccounts) await onUpdateAccounts(updated);
      setShowLinkedInModal(false);
    } catch (err: any) {
      setLiError(err.message || "Failed to verify LinkedIn account.");
    } finally {
      setLiLoading(false);
    }
  };

  // Disconnect Handler
  const handleDisconnect = async (type: "github" | "linkedin" | "leetcode") => {
    const updated = { ...syncedAccounts };
    if (type === "github" && updated.github) {
      updated.github.connected = false;
    } else if (type === "linkedin" && updated.linkedin) {
      updated.linkedin.connected = false;
    } else if (type === "leetcode" && updated.leetcode) {
      updated.leetcode.connected = false;
    }

    if (onUpdateAccounts) await onUpdateAccounts(updated);

    if (userId) {
      try {
        await fetch(`/api/integrations/connected-accounts?userId=${encodeURIComponent(userId)}&provider=${type}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.warn("Delete account note:", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Verified Profiles
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Connected Developer Accounts
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real data synchronized from GitHub, LinkedIn, and LeetCode powering your ATS resume and evidence scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GitHub Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">GitHub</span>
                  <span className="text-[10px] text-slate-400">Repositories & Code</span>
                </div>
              </div>
              {syncedAccounts.github?.connected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">Not linked</span>
              )}
            </div>

            {syncedAccounts.github?.connected ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-800">@{syncedAccounts.github.username}</p>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>{syncedAccounts.github.recentRepos?.length || 0} Repositories</span>
                  <span>&bull;</span>
                  <span>{syncedAccounts.github.contributionsThisYear || 0} Stars</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your GitHub profile to verify your projects and programming languages.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            {syncedAccounts.github?.connected ? (
              <>
                <button
                  onClick={() => handleSyncGitHub()}
                  disabled={ghLoading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ghLoading ? "animate-spin" : ""}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => handleDisconnect("github")}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowGitHubModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">LeetCode</span>
                  <span className="text-[10px] text-slate-400">DSA & Algorithms</span>
                </div>
              </div>
              {syncedAccounts.leetcode?.connected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">Not linked</span>
              )}
            </div>

            {syncedAccounts.leetcode?.connected ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-800">@{syncedAccounts.leetcode.username}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-emerald-600 font-bold">{syncedAccounts.leetcode.problemsSolved.easy} Easy</span>
                  <span>&bull;</span>
                  <span className="text-amber-600 font-bold">{syncedAccounts.leetcode.problemsSolved.medium} Med</span>
                  <span>&bull;</span>
                  <span className="text-rose-600 font-bold">{syncedAccounts.leetcode.problemsSolved.hard} Hard</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your LeetCode username to verify your DSA problem solving breakdown.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            {syncedAccounts.leetcode?.connected ? (
              <>
                <button
                  onClick={() => handleSyncLeetCode()}
                  disabled={lcLoading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${lcLoading ? "animate-spin" : ""}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => handleDisconnect("leetcode")}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLeetCodeModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Connect LeetCode
              </button>
            )}
          </div>
        </div>

        {/* LinkedIn Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">LinkedIn</span>
                  <span className="text-[10px] text-slate-400">Professional Identity</span>
                </div>
              </div>
              {syncedAccounts.linkedin?.connected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">Not linked</span>
              )}
            </div>

            {syncedAccounts.linkedin?.connected ? (
              <div className="space-y-2 text-xs">
                <a
                  href={syncedAccounts.linkedin.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
                >
                  <span>{syncedAccounts.linkedin.profileUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <p className="text-[11px] text-slate-400">Public profile URL verified</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your public LinkedIn profile URL to verify your professional credentials.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            {syncedAccounts.linkedin?.connected ? (
              <>
                <button
                  onClick={() => handleSyncLinkedIn()}
                  disabled={liLoading}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${liLoading ? "animate-spin" : ""}`} />
                  <span>Re-verify</span>
                </button>
                <button
                  onClick={() => handleDisconnect("linkedin")}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLinkedInModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Connect LinkedIn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GitHub Connect Modal with Explicit Consent Disclosure */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Connect GitHub Profile</h3>
              </div>
              <button onClick={() => setShowGitHubModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Consent & Data Policy
              </p>
              <p className="text-indigo-700 text-[11px] leading-relaxed">
                EdWorld accesses only your public repositories, languages, and stars to verify portfolio projects. We never request or store private passwords or tokens.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">GitHub Username or URL</label>
              <input
                type="text"
                value={ghUsername}
                onChange={(e) => setGhUsername(e.target.value)}
                placeholder="e.g. torvalds or https://github.com/torvalds"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {ghError && <p className="text-xs text-rose-600 font-medium">{ghError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowGitHubModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSyncGitHub()} isLoading={ghLoading}>
                Connect & Sync
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LeetCode Connect Modal */}
      {showLeetCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Connect LeetCode Profile</h3>
              </div>
              <button onClick={() => setShowLeetCodeModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Consent & Verification
              </p>
              <p className="text-amber-700 text-[11px] leading-relaxed">
                EdWorld retrieves public problem solving breakdowns (Easy, Medium, Hard) and rankings directly from public profiles. No credentials required.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">LeetCode Username or Profile URL</label>
              <input
                type="text"
                value={lcUsername}
                onChange={(e) => setLcUsername(e.target.value)}
                placeholder="e.g. username or https://leetcode.com/u/username"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {lcError && <p className="text-xs text-rose-600 font-medium">{lcError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowLeetCodeModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSyncLeetCode()} isLoading={lcLoading}>
                Connect & Sync
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Connect Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Linkedin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Connect LinkedIn Profile</h3>
              </div>
              <button onClick={() => setShowLinkedInModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Public URL Verification
              </p>
              <p className="text-blue-700 text-[11px] leading-relaxed">
                EdWorld validates your public vanity URL format to associate your professional profile with your verified credentials. We never ask for LinkedIn passwords.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL</label>
              <input
                type="text"
                value={liUrl}
                onChange={(e) => setLiUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {liError && <p className="text-xs text-rose-600 font-medium">{liError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowLinkedInModal(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSyncLinkedIn()} isLoading={liLoading}>
                Verify & Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

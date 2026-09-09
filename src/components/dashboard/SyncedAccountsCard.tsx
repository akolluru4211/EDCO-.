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
  AlertCircle
} from "lucide-react";

interface SyncedAccountsCardProps {
  syncedAccounts: SyncedAccounts;
  onUpdateAccounts: (updated: SyncedAccounts) => Promise<void>;
}

export default function SyncedAccountsCard({
  syncedAccounts,
  onUpdateAccounts,
}: SyncedAccountsCardProps) {
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [lcEasy, setLcEasy] = useState(syncedAccounts.leetcode?.problemsSolved.easy || 45);
  const [lcMed, setLcMed] = useState(syncedAccounts.leetcode?.problemsSolved.medium || 82);
  const [lcHard, setLcHard] = useState(syncedAccounts.leetcode?.problemsSolved.hard || 14);
  const [lcUsername, setLcUsername] = useState(syncedAccounts.leetcode?.username || "alexrivera_dev");

  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [liUrl, setLiUrl] = useState(syncedAccounts.linkedin?.profileUrl || "https://linkedin.com/in/alexrivera");

  const handleSaveLeetCode = async () => {
    const total = Number(lcEasy) + Number(lcMed) + Number(lcHard);
    const updated: SyncedAccounts = {
      ...syncedAccounts,
      leetcode: {
        connected: true,
        username: lcUsername,
        problemsSolved: { easy: Number(lcEasy), medium: Number(lcMed), hard: Number(lcHard), total },
        isSelfReported: true,
        lastUpdatedAt: new Date().toISOString(),
      },
    };
    await onUpdateAccounts(updated);
    setShowLeetCodeModal(false);
  };

  const handleSaveLinkedIn = async () => {
    const updated: SyncedAccounts = {
      ...syncedAccounts,
      linkedin: {
        connected: true,
        profileUrl: liUrl,
        verified: true,
      },
    };
    await onUpdateAccounts(updated);
    setShowLinkedInModal(false);
  };

  const handleDisconnect = async (type: "github" | "linkedin" | "leetcode") => {
    const updated = { ...syncedAccounts };
    if (type === "github" && updated.github) {
      updated.github.connected = false;
    } else if (type === "linkedin" && updated.linkedin) {
      updated.linkedin.connected = false;
    } else if (type === "leetcode" && updated.leetcode) {
      updated.leetcode.connected = false;
    }
    await onUpdateAccounts(updated);
  };

  const hasAnyConnected =
    syncedAccounts.github?.connected ||
    syncedAccounts.linkedin?.connected ||
    syncedAccounts.leetcode?.connected;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Career Track
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Synced Technical Profiles
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified cached snapshots from GitHub, LinkedIn, and self-reported coding stats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* GitHub Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <GitBranch className="w-4 h-4 text-brand-300" />
                </div>
                <span className="font-bold text-xs text-slate-900">GitHub Activity</span>
              </div>
              {syncedAccounts.github?.connected ? (
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Synced
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">Not Connected</span>
              )}
            </div>

            {syncedAccounts.github?.connected ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Contributions</span>
                  <span className="font-bold text-slate-900">{syncedAccounts.github.contributionsThisYear} this year</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Recent Repositories</span>
                  <div className="flex flex-wrap gap-1">
                    {(syncedAccounts.github.recentRepos || []).slice(0, 2).map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700">
                        {r.name} ({r.language})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Connect GitHub to display verified repo contributions and import project showcases automatically.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            {syncedAccounts.github?.connected ? (
              <button
                onClick={() => handleDisconnect("github")}
                className="text-[11px] font-mono text-slate-400 hover:text-rose-600 flex items-center gap-1"
              >
                <Unlink className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onUpdateAccounts({
                    ...syncedAccounts,
                    github: {
                      connected: true,
                      username: "alexrivera",
                      contributionsThisYear: 384,
                      recentRepos: [
                        { name: "distributed-cache", stars: 34, language: "TypeScript" },
                        { name: "trading-sim", stars: 28, language: "Python" },
                      ],
                      lastSyncedAt: new Date().toISOString(),
                    },
                  });
                }}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* LinkedIn Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0a66c2] text-white flex items-center justify-center font-bold">
                  <Linkedin className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-900">LinkedIn Profile</span>
              </div>
              {syncedAccounts.linkedin?.connected ? (
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">Not Linked</span>
              )}
            </div>

            {syncedAccounts.linkedin?.connected ? (
              <div className="space-y-1 text-xs">
                <span className="text-slate-500 block text-[11px]">Linked URL:</span>
                <a
                  href={syncedAccounts.linkedin.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-700 hover:underline line-clamp-1 flex items-center gap-1"
                >
                  <span>{syncedAccounts.linkedin.profileUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Link your LinkedIn profile for verified professional credentials on job applications.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            {syncedAccounts.linkedin?.connected ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setShowLinkedInModal(true)}
                  className="text-[11px] font-mono text-slate-600 hover:text-slate-900 underline"
                >
                  Edit Link
                </button>
                <button
                  onClick={() => handleDisconnect("linkedin")}
                  className="text-[11px] font-mono text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLinkedInModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
              >
                Add LinkedIn
              </button>
            )}
          </div>
        </div>

        {/* LeetCode Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">LeetCode Stats</span>
                  <span className="text-[9px] font-mono text-slate-400">Self-reported</span>
                </div>
              </div>
              {syncedAccounts.leetcode?.connected && (
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  {syncedAccounts.leetcode.problemsSolved.total} Solved
                </span>
              )}
            </div>

            {syncedAccounts.leetcode?.connected ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-mono text-emerald-600 block">EASY</span>
                  <span className="font-bold text-slate-900">{syncedAccounts.leetcode.problemsSolved.easy}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-mono text-amber-600 block">MED</span>
                  <span className="font-bold text-slate-900">{syncedAccounts.leetcode.problemsSolved.medium}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] font-mono text-rose-600 block">HARD</span>
                  <span className="font-bold text-slate-900">{syncedAccounts.leetcode.problemsSolved.hard}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Log your problem-solving metrics to track algorithmic readiness.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            {syncedAccounts.leetcode?.connected ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setShowLeetCodeModal(true)}
                  className="text-[11px] font-mono text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update Counts</span>
                </button>
                <button
                  onClick={() => handleDisconnect("leetcode")}
                  className="text-[11px] font-mono text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLeetCodeModal(true)}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
              >
                Log LeetCode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LeetCode Update Modal */}
      {showLeetCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Update LeetCode Stats</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={lcUsername}
                  onChange={(e) => setLcUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Easy</label>
                  <input
                    type="number"
                    value={lcEasy}
                    onChange={(e) => setLcEasy(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Medium</label>
                  <input
                    type="number"
                    value={lcMed}
                    onChange={(e) => setLcMed(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-600 uppercase mb-1">Hard</label>
                  <input
                    type="number"
                    value={lcHard}
                    onChange={(e) => setLcHard(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLeetCodeModal(false)}
                className="w-1/2 py-2 rounded-xl border text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLeetCode}
                className="w-1/2 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Save Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Link Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Link LinkedIn Profile</h3>
            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">Profile URL</label>
              <input
                type="text"
                value={liUrl}
                onChange={(e) => setLiUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLinkedInModal(false)}
                className="w-1/2 py-2 rounded-xl border text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLinkedIn}
                className="w-1/2 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

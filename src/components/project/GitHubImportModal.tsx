"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ExternalLink, 
  Lock, 
  Loader2, 
  Search, 
  Star, 
  GitBranch, 
  ShieldCheck,
  RefreshCw,
  Terminal,
  Layers,
  Code2
} from "lucide-react";

interface MockRepo {
  id: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  isPrivate: boolean;
  topics?: string[];
}

const DEFAULT_REPOS: MockRepo[] = [
  {
    id: "r1",
    name: "distributed-cache-engine",
    owner: "alexrivera",
    description: "High-throughput in-memory caching system with consistent hashing and Redis replication.",
    language: "TypeScript",
    stars: 34,
    isPrivate: false,
    topics: ["distributed-systems", "redis", "caching"]
  },
  {
    id: "r2",
    name: "autonomous-trading-sim",
    owner: "alexrivera",
    description: "Low-latency algorithmic backtester simulating market order books and risk management.",
    language: "Python",
    stars: 28,
    isPrivate: false,
    topics: ["algorithmic-trading", "python", "finance"]
  },
  {
    id: "r3",
    name: "edworld-learning-platform",
    owner: "alexrivera",
    description: "Modern career readiness portal with AI mock interviews and dynamic scoring pipelines.",
    language: "TypeScript",
    stars: 52,
    isPrivate: false,
    topics: ["nextjs", "supabase", "career-tech"]
  },
  {
    id: "r4",
    name: "cloud-native-microservices",
    owner: "alexrivera",
    description: "Kubernetes orchestrated service mesh with gRPC streaming and distributed tracing.",
    language: "Go",
    stars: 41,
    isPrivate: false,
    topics: ["kubernetes", "grpc", "golang"]
  }
];

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRepo: (repo: { 
    owner: string; 
    name: string; 
    isPublic: boolean;
    title?: string;
    description?: string;
    language?: string;
    stars?: number;
    skills?: string[];
  }) => Promise<void>;
}

export default function GitHubImportModal({
  isOpen,
  onClose,
  onImportRepo,
}: GitHubImportModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "custom">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [customRepoUrl, setCustomRepoUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRepos = DEFAULT_REPOS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);

    try {
      if (activeTab === "list") {
        const chosen = DEFAULT_REPOS.find((r) => r.id === selectedRepoId);
        if (!chosen) {
          setError("Please select a repository to import.");
          setIsImporting(false);
          return;
        }

        await onImportRepo({
          owner: chosen.owner,
          name: chosen.name,
          isPublic: !chosen.isPrivate,
          title: chosen.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          description: chosen.description,
          language: chosen.language,
          stars: chosen.stars,
          skills: [chosen.language, ...(chosen.topics || ["Git", "Cloud Infrastructure"])],
        });
      } else {
        // Custom URL import via GitHub API endpoint
        if (!customRepoUrl.trim()) {
          setError("Please enter a valid GitHub repository URL or user/repo path.");
          setIsImporting(false);
          return;
        }

        const res = await fetch("/api/project/github-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: customRepoUrl }),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch repository details.");
        }

        const repoData = json.data;
        await onImportRepo({
          owner: repoData.owner,
          name: repoData.name,
          isPublic: true,
          title: repoData.title,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stars,
          skills: [repoData.language, ...(repoData.topics || ["Open Source", "Software Engineering"])],
        });
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to import GitHub repository.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <GitBranch className="w-4 h-4 text-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Import GitHub Repositories</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-600" /> MCP Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Synchronized via GitHub MCP server &bull; Verified architecture &amp; code badges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex gap-4 bg-white">
          <button
            onClick={() => setActiveTab("list")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === "list"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Connected Repositories ({filteredRepos.length})
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`pb-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === "custom"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Custom Repo URL / Owner
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "list" ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your repositories or tech stack..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Repositories List */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => {
                    const isSelected = selectedRepoId === repo.id;
                    return (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => setSelectedRepoId(repo.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900"
                            : "bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs truncate">{repo.name}</span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                                isSelected ? "bg-slate-800 text-slate-300" : "bg-white border border-slate-200 text-slate-600"
                              }`}
                            >
                              {repo.language}
                            </span>
                          </div>
                          <p
                            className={`text-xs line-clamp-2 ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {repo.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className={`flex items-center gap-1 text-[11px] font-mono ${
                              isSelected ? "text-amber-300" : "text-slate-500"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>{repo.stars}</span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "bg-white text-slate-900 border-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <GitBranch className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">No matching repositories found</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Switch to the <strong>Custom Repo URL</strong> tab to import any public GitHub repository directly.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  GitHub Repository URL or Path
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={customRepoUrl}
                    onChange={(e) => setCustomRepoUrl(e.target.value)}
                    placeholder="e.g. https://github.com/facebook/react or vercel/next.js"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  You can paste any public GitHub repository link. The GitHub MCP server will inspect the repository structure, README, languages, and stars.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                  <span>Automatic Architecture Ingestion</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                  <li>Extracts system architecture diagrams and tech stack badges.</li>
                  <li>Generates interview talking points and STAR project rubrics.</li>
                  <li>Adds a verifiable <strong>GitHub Authenticated</strong> badge to your portfolio.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Privacy & Scope Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              DPDP Act &amp; Student Safety: Minor student code remains private or classroom-scoped. Public projects receive an immutable cryptographic verification stamp.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500 font-mono">
            {activeTab === "list"
              ? selectedRepoId
                ? "1 repository selected"
                : "Select a repo to import"
              : customRepoUrl.trim()
              ? "Ready to inspect repository"
              : "Enter repository path"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={
                isImporting ||
                (activeTab === "list" && !selectedRepoId) ||
                (activeTab === "custom" && !customRepoUrl.trim())
              }
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Inspecting via MCP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-300" />
                  <span>Import Repository</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

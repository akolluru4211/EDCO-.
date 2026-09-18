"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProjectItem } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowLeft, 
  ExternalLink, 
  GitBranch, 
  ShieldCheck, 
  Star, 
  Globe, 
  Lock, 
  Calendar, 
  Code2, 
  Layers, 
  Image as ImageIcon,
  Share2,
  Check
} from "lucide-react";

export const dynamic = "force-dynamic";

const FALLBACK_PROJECTS: Record<string, ProjectItem> = {
  "proj-seed-1": {
    id: "proj-seed-1",
    userId: "demo-adult-user-123",
    title: "High-Throughput Distributed Rate Limiter",
    description: "Multi-region rate limiting service utilizing sliding window counters and Redis clusters with 99.99% availability.",
    skills: ["TypeScript", "Redis", "Distributed Systems", "Docker", "Node.js"],
    githubUrl: "https://github.com/alexrivera/distributed-rate-limiter",
    liveUrl: "https://rate-limiter.demo.edworld.co",
    images: [],
    isVerified: true,
    source: "github",
    isPublic: true,
    primaryLanguage: "TypeScript",
    stars: 34,
    readmeHtml: `<h3>Architecture & Implementation Overview</h3><p>This service implements a distributed sliding-window counter algorithm across a multi-node Redis cluster. By combining in-memory local caching with asynchronous pub-sub synchronization, the system achieves sub-millisecond evaluation latency under high request volume.</p><h4>Key Engineering Highlights</h4><ul><li>Processes up to 100,000 requests/sec per cluster shard</li><li>Zero single-points-of-failure with multi-region failover</li><li>Strict conformance to RFC 6585 Rate Limiting Headers</li></ul>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export default function PublicProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      setLoadingProject(true);

      // 1. Check local storage if current user is owner
      if (user) {
        const cached = localStorage.getItem(`edworld_${user.uid}_projects`);
        if (cached) {
          try {
            const list: ProjectItem[] = JSON.parse(cached);
            const found = list.find((p) => p.id === projectId);
            if (found) {
              setProject(found);
              setLoadingProject(false);
              return;
            }
          } catch (e) {}
        }
      }

      // 2. Fetch from Firestore
      if (db) {
        try {
          const docSnap = await getDoc(doc(db, "projects", projectId));
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as ProjectItem;
            setProject(data);
            setLoadingProject(false);
            return;
          }
        } catch (err) {
          console.warn("[Firestore Public Project Load]", err);
        }
      }

      // 3. Fallback
      if (FALLBACK_PROJECTS[projectId]) {
        setProject(FALLBACK_PROJECTS[projectId]);
      }
      setLoadingProject(false);
    };

    loadProject();
  }, [projectId, user]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loadingProject) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3 font-mono text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading project showcase...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Code2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Project Not Found</h2>
          <p className="text-xs text-slate-500">
            The project showcase you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-800"
          >
            <span>Back to Projects</span>
          </Link>
        </div>
      </div>
    );
  }

  // Privacy Barrier: If private and visitor is not the owner
  const isOwner = user?.uid === project.userId;
  if (!project.isPublic && !isOwner) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Private Project Showcase</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This project has been set to private by its author and is not publicly accessible.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-slate-800"
          >
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation & Share Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Share Showcase"}</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {project.isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified via GitHub
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono uppercase">
                  Manual Entry
                </span>
              )}

              {project.primaryLanguage && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                  {project.primaryLanguage}
                </span>
              )}

              {project.stars !== undefined && project.stars > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {project.stars} Stars
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {project.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {project.description}
            </p>
          </div>

          {/* Links & Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
              >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Open Live Deployment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>View Source on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Skills Grid */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Technologies &amp; Architecture Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Screenshots Gallery (if present) */}
        {project.images && project.images.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Project Screenshots &amp; Previews</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.images.map((img, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                  <Image src={img} alt={`Screenshot ${idx + 1}`} width={600} height={400} unoptimized className="w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sanitized README Viewer */}
        {project.readmeHtml && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Code2 className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-base text-slate-900">Project README &amp; Documentation</h3>
            </div>

            <div
              className="prose prose-slate max-w-none text-xs leading-relaxed space-y-3 font-mono"
              dangerouslySetInnerHTML={{ __html: project.readmeHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

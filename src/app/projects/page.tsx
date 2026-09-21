"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProjectItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import ProjectFormModal from "@/components/project/ProjectFormModal";
import GitHubImportModal from "@/components/project/GitHubImportModal";
import StarterKitStudio from "@/components/project/StarterKitStudio";
import ClaudeAnalysisModal from "@/components/ai/ClaudeAnalysisModal";
import { ClaudeAnalysisType } from "@/app/api/claude/analyze/route";
import AuthGuard from "@/components/auth/AuthGuard";
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  Globe, 
  Lock, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  ArrowRight,
  Clock,
  Compass,
  Layers,
  CheckCircle2,
  Bot
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProjectStudioPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isJuniorTrack = user?.ageBand === "13-15";
  const isExplorerTrack = user?.ageBand === "16-18";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isClaudeModalOpen, setIsClaudeModalOpen] = useState(false);
  const [claudeAnalysisType, setClaudeAnalysisType] = useState<ClaudeAnalysisType>("project_architecture");
  const [claudeInitialContent, setClaudeInitialContent] = useState("");
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isJuniorTrack || isExplorerTrack) {
      setProjects([]);
      return;
    }

    const loadProjects = async () => {
      // 1. Query Supabase projects table for user
      try {
        const { data: dbProjects } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.uid);

        if (dbProjects && dbProjects.length > 0) {
          const mapped: ProjectItem[] = dbProjects.map((p) => ({
            id: p.id,
            userId: p.user_id,
            title: p.title || "Untitled Project",
            description: p.description || "",
            skills: p.skills || [],
            githubUrl: p.github_url || "",
            liveUrl: p.live_url || "",
            images: p.images || [],
            isVerified: Boolean(p.is_verified),
            source: p.source || "manual",
            isPublic: Boolean(p.is_public),
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setProjects(mapped);
          localStorage.setItem(`edworld_${user.uid}_projects`, JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn("[Supabase Projects Query Note]:", err);
      }

      // 2. Check user-scoped cache
      const cached = localStorage.getItem(`edworld_${user.uid}_projects`);
      if (cached) {
        try {
          setProjects(JSON.parse(cached));
        } catch (e) {}
      }
    };

    loadProjects();
  }, [user, isJuniorTrack, isExplorerTrack]);

  const saveProjects = (newList: ProjectItem[]) => {
    if (!user) return;
    setProjects(newList);
    localStorage.setItem(`edworld_${user.uid}_projects`, JSON.stringify(newList));
  };

  const handleSaveProject = async (data: Partial<ProjectItem>) => {
    if (!user) return;
    const now = new Date().toISOString();

    let updatedProject: ProjectItem;
    if (editingProject) {
      updatedProject = {
        ...editingProject,
        ...data,
        updatedAt: now,
      } as ProjectItem;
    } else {
      updatedProject = {
        id: `proj-${user.uid}-${Date.now()}`,
        userId: user.uid,
        title: data.title || "Untitled Project",
        description: data.description || "",
        skills: data.skills || ["TypeScript"],
        githubUrl: data.githubUrl || "",
        liveUrl: data.liveUrl || "",
        images: data.images || [],
        isVerified: !!data.isVerified,
        source: data.source || "manual",
        isPublic: data.isPublic ?? true,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Persist to Supabase
    try {
      await supabase.from("projects").upsert({
        id: updatedProject.id,
        user_id: user.uid,
        title: updatedProject.title,
        description: updatedProject.description,
        skills: updatedProject.skills,
        github_url: updatedProject.githubUrl,
        live_url: updatedProject.liveUrl,
        images: updatedProject.images,
        is_verified: updatedProject.isVerified,
        source: updatedProject.source,
        is_public: updatedProject.isPublic,
        updated_at: now,
      });
    } catch (e) {
      console.warn("[Supabase Project Save Note]:", e);
    }

    let updatedList: ProjectItem[];
    if (editingProject) {
      updatedList = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p));
    } else {
      updatedList = [updatedProject, ...projects];
    }
    saveProjects(updatedList);
    setEditingProject(null);
  };

  const handleImportGitHubRepo = async (repo: { 
    owner: string; 
    name: string; 
    isPublic: boolean;
    title?: string;
    description?: string;
    language?: string;
    stars?: number;
    skills?: string[];
  }) => {
    if (!user) return;

    // Resilient GitHub project generator with MCP metadata support
    const importedProject: ProjectItem = {
      id: `proj-${user.uid}-${repo.name}`.toLowerCase(),
      userId: user.uid,
      title: repo.title || repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      description: repo.description || `Verified repository imported from GitHub (${repo.owner}/${repo.name}).`,
      skills: repo.skills?.length ? repo.skills : [repo.language || "TypeScript", "Git", "Cloud Infrastructure"],
      githubUrl: `https://github.com/${repo.owner}/${repo.name}`,
      liveUrl: "",
      images: [],
      isVerified: true,
      source: "github",
      isPublic: repo.isPublic,
      primaryLanguage: repo.language || "TypeScript",
      stars: repo.stars ?? 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabase.from("projects").upsert({
        id: importedProject.id,
        user_id: user.uid,
        title: importedProject.title,
        description: importedProject.description,
        skills: importedProject.skills,
        github_url: importedProject.githubUrl,
        live_url: importedProject.liveUrl,
        images: importedProject.images,
        is_verified: true,
        source: "github",
        is_public: importedProject.isPublic,
        updated_at: importedProject.updatedAt,
      });
    } catch (e) {}

    const updated = [importedProject, ...projects.filter((p) => p.id !== importedProject.id)];
    saveProjects(updated);
  };

  const handleTogglePrivacy = async (project: ProjectItem) => {
    if (!user) return;
    const updated = { ...project, isPublic: !project.isPublic, updatedAt: new Date().toISOString() };
    try {
      await supabase.from("projects").update({ is_public: updated.isPublic }).eq("id", project.id);
    } catch (e) {}
    const updatedList = projects.map((p) => (p.id === project.id ? updated : p));
    saveProjects(updatedList);
  };

  const confirmDelete = async () => {
    if (!user || !deleteTargetId) return;
    try {
      await supabase.from("projects").delete().eq("id", deleteTargetId);
    } catch (e) {}
    const updated = projects.filter((p) => p.id !== deleteTargetId);
    saveProjects(updated);
    setDeleteTargetId(null);
  };

  // Junior Track (13-15) Guidance Gate
  if (isJuniorTrack) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-paper">
          <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 text-gold-dark flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-gold-light text-gold-dark text-xs font-mono font-bold uppercase tracking-wider border border-gold/30">
                Junior Track (13-15)
              </span>
              <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Project Studio Unlocks in Explorer Track</h1>
              <p className="text-sm text-ink-soft leading-relaxed">
                As a Class 9-10 learner, your focus is on curiosity exploration and guided beginner quests in the Quest Hub.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-forest-light active:bg-forest-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Explorer Track (16-18) Guided Starter-Kit Studio
  if (isExplorerTrack) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] bg-paper py-8 px-4 sm:px-6 lg:px-8 text-ink">
          <div className="max-w-6xl mx-auto">
            <StarterKitStudio userName={user?.name || "Explorer Learner"} />
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Career Track (18+) Full Project Studio
  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-[#F4F6FB] text-[#181920] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Bar */}
        <div className="card-quixel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-[#13141B] text-[#D7FC51] px-3 py-1 rounded-xl">
                Career Track
              </span>
              <span className="text-xs font-mono text-[#8E95A5]">Project Studio &bull; Verified Portfolio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#181920] tracking-tight">
              Engineering Project Showcases
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => {
                setClaudeAnalysisType("project_architecture");
                setClaudeInitialContent(
                  `Project: Distributed Engineering Workspace\nTech Stack: Next.js 14, TypeScript, Supabase PostgreSQL, Redis\nArchitecture: Stateless microservices with OAuth 2.1 authentication and asynchronous background queues.`
                );
                setIsClaudeModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              <span>Claude MCP Audit</span>
            </button>

            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-[#D7FC51]" />
              <span>Import via GitHub</span>
            </button>

            <button
              onClick={() => {
                setEditingProject(null);
                setIsFormModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl border border-[#E8ECF2] bg-white hover:bg-[#F4F6FB] text-[#181920] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#7B57FF]" />
              <span>Add Manual Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card-quixel card-quixel-interactive p-6 sm:p-7 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {project.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E0FAF6] text-[#00D2B4] border border-[#00D2B4]/30 text-[10px] font-black font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00D2B4]" />
                      Verified GitHub
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#F4F6FB] border border-[#E8ECF2] text-[#8E95A5] text-[10px] font-black font-mono uppercase">
                      Manual Entry
                    </span>
                  )}

                  <button
                    onClick={() => handleTogglePrivacy(project)}
                    className={`flex items-center gap-1 text-[10px] font-mono font-black px-3 py-1 rounded-full transition-colors cursor-pointer ${
                      project.isPublic
                        ? "bg-[#EDE8FD] text-[#7B57FF] border border-[#7B57FF]/30 hover:bg-[#E0D7FD]"
                        : "bg-[#FFF6DC] text-[#FFB800] border border-[#FFB800]/30"
                    }`}
                  >
                    {project.isPublic ? <Globe className="w-3 h-3 text-[#7B57FF]" /> : <Lock className="w-3 h-3 text-[#FFB800]" />}
                    <span>{project.isPublic ? "Public Link" : "Private"}</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-lg text-[#181920] line-clamp-1 group-hover:text-[#7B57FF] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#767E94] mt-1 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.skills.slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1 rounded-full bg-[#F4F6FB] border border-[#E8ECF2] text-[#767E94] text-[10px] font-mono font-bold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0F2F6] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setClaudeAnalysisType("project_architecture");
                      setClaudeInitialContent(
                        `Project: ${project.title}\nDescription: ${project.description}\nPrimary Language: ${project.primaryLanguage || "TypeScript"}\nSkills: ${project.skills?.join(", ")}\nRepository: ${project.githubUrl || "Private"}`
                      );
                      setIsClaudeModalOpen(true);
                    }}
                    title="Audit with Claude MCP"
                    className="p-2 rounded-xl text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setIsFormModalOpen(true);
                    }}
                    title="Edit project details"
                    className="p-2 rounded-xl text-[#8E95A5] hover:text-[#181920] hover:bg-[#F4F6FB] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(project.id)}
                    title="Delete project"
                    className="p-2 rounded-xl text-[#8E95A5] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/projects/${project.id}`}
                  className="px-4 py-2 rounded-2xl bg-[#13141B] hover:bg-[#252632] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>View Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D7FC51]" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        <ClaudeAnalysisModal
          isOpen={isClaudeModalOpen}
          onClose={() => setIsClaudeModalOpen(false)}
          defaultType={claudeAnalysisType}
          initialContent={claudeInitialContent}
        />

        <ProjectFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          initialData={editingProject}
        />

        <GitHubImportModal
          isOpen={isGitHubModalOpen}
          onClose={() => setIsGitHubModalOpen(false)}
          onImportRepo={handleImportGitHubRepo}
        />

        {/* Delete Confirmation Modal */}
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#13141B]/60 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-sm w-full bg-white rounded-4xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8ECF2] text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#181920]">Delete this project showcase?</h3>
                <p className="text-xs text-[#767E94]">This action cannot be undone.</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-3 rounded-2xl border border-[#E8ECF2] bg-[#F4F6FB] text-[#181920] text-xs font-bold hover:bg-[#E8ECF2] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AuthGuard>
  );
}

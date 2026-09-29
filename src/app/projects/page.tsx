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
  ArrowRight,
  Bot
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProjectStudioPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

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

  const saveProjects = (updatedList: ProjectItem[]) => {
    setProjects(updatedList);
    if (user) {
      localStorage.setItem(`edworld_${user.uid}_projects`, JSON.stringify(updatedList));
    }
  };

  const handleSaveProject = async (projectData: Partial<ProjectItem>) => {
    if (!user) return;

    const newProject: ProjectItem = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      userId: user.uid,
      title: projectData.title || "Untitled Project",
      description: projectData.description || "",
      skills: projectData.skills || [],
      githubUrl: projectData.githubUrl || "",
      liveUrl: projectData.liveUrl || "",
      images: projectData.images || [],
      isVerified: projectData.isVerified ?? false,
      source: editingProject ? editingProject.source : "manual",
      isPublic: projectData.isPublic ?? true,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await supabase.from("projects").upsert({
        id: newProject.id,
        user_id: user.uid,
        title: newProject.title,
        description: newProject.description,
        skills: newProject.skills,
        github_url: newProject.githubUrl,
        live_url: newProject.liveUrl,
        images: newProject.images,
        is_verified: newProject.isVerified,
        source: newProject.source,
        is_public: newProject.isPublic,
        updated_at: newProject.updatedAt,
      });
    } catch (e) {}

    let updated: ProjectItem[];
    if (editingProject) {
      updated = projects.map((p) => (p.id === editingProject.id ? newProject : p));
    } else {
      updated = [newProject, ...projects];
    }
    saveProjects(updated);
    setIsFormModalOpen(false);
    setEditingProject(null);
  };

  const handleImportGitHubRepo = async (repo: any) => {
    if (!user) return;

    const importedProject: ProjectItem = {
      id: `proj-${user.uid}-${repo.name}`.toLowerCase(),
      userId: user.uid,
      title: repo.title || repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
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
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-[#FAF8F5]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/80 shadow-xs p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-medium">
                Junior Track (13-15)
              </span>
              <h1 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">Project Studio Unlocks in Explorer Track</h1>
              <p className="text-xs text-stone-500 leading-relaxed">
                As a Class 9-10 learner, your focus is on curiosity exploration and guided beginner quests in the Quest Hub.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2"
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
        <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 text-stone-900 font-sans">
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
      <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-stone-900 pb-20 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                  Career Track
                </span>
                <span className="text-xs font-mono text-stone-400">Project Studio &bull; Verified Portfolio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 tracking-tight">
                Engineering Project Showcases
              </h1>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  setClaudeAnalysisType("project_architecture");
                  setClaudeInitialContent(
                    `Project: Distributed Engineering Workspace\nTech Stack: Next.js 14, TypeScript, Supabase PostgreSQL, Redis\nArchitecture: Stateless microservices with OAuth 2.1 authentication and asynchronous background queues.`
                  );
                  setIsClaudeModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Bot className="w-4 h-4 text-amber-600" />
                <span>AI Architecture Audit</span>
              </button>

              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Import via GitHub</span>
              </button>

              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-stone-600" />
                <span>Add Manual Project</span>
              </button>
            </div>
          </div>

          {/* Projects Grid or Empty State */}
          {projects.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center space-y-4 border border-[#EBECEF] shadow-xs max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#00D2B4]/10 text-[#00D2B4] flex items-center justify-center mx-auto">
                <FolderGit2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-[#13141B]">No projects published yet</h3>
                <p className="text-xs text-[#5E6573] max-w-sm mx-auto leading-relaxed">
                  Import repositories directly from GitHub or create a manual showcase to highlight your technical engineering work.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsGitHubModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#13141B] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer"
                >
                  <GitBranch className="w-4 h-4 text-[#00D2B4]" />
                  <span>Import from GitHub</span>
                </button>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#EBECEF] bg-white hover:bg-slate-50 text-[#13141B] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#5E6573]" />
                  <span>Add Project Manually</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {project.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-mono font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified GitHub
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-mono font-medium uppercase">
                        Manual Entry
                      </span>
                    )}

                    <button
                      onClick={() => handleTogglePrivacy(project)}
                      className={`flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                        project.isPublic
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                          : "bg-amber-50 text-amber-800 border border-amber-200/60"
                      }`}
                    >
                      {project.isPublic ? <Globe className="w-3 h-3 text-indigo-600" /> : <Lock className="w-3 h-3 text-amber-700" />}
                      <span>{project.isPublic ? "Public Link" : "Private"}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif font-medium text-lg text-stone-900 line-clamp-1 group-hover:text-stone-700 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/60 text-stone-600 text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setClaudeAnalysisType("project_architecture");
                        setClaudeInitialContent(
                          `Project: ${project.title}\nDescription: ${project.description}\nPrimary Language: ${project.primaryLanguage || "TypeScript"}\nSkills: ${project.skills?.join(", ")}\nRepository: ${project.githubUrl || "Private"}`
                        );
                        setIsClaudeModalOpen(true);
                      }}
                      title="Audit with AI"
                      className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(project);
                        setIsFormModalOpen(true);
                      }}
                      title="Edit project details"
                      className="p-2 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(project.id)}
                      title="Delete project"
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <span>View Page</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
              <div className="max-w-sm w-full bg-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl border border-stone-200 text-center">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-medium text-stone-900">Delete this project showcase?</h3>
                  <p className="text-xs text-stone-500">This action cannot be undone.</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
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

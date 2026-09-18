"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectItem } from "@/lib/types";
import { 
  X, 
  Upload, 
  Trash2, 
  Link as LinkIcon, 
  Sparkles, 
  AlertCircle, 
  Globe, 
  Lock, 
  Check, 
  FolderGit2,
  Layers,
  Zap
} from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<ProjectItem>) => Promise<void>;
  initialData?: ProjectItem | null;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ProjectFormModalProps) {
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [skillsText, setSkillsText] = useState(initialData?.skills?.join(", ") || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || "");
  const [isPublic, setIsPublic] = useState<boolean>(initialData?.isPublic ?? true);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return true;
    try {
      const parsed = new URL(urlString.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 screenshot images per project.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setError("File " + file.name + " is not an accepted image format.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File " + file.name + " exceeds the 5MB maximum file size.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (readEvent) => {
        if (readEvent.target && readEvent.target.result) {
          setImages((prev) => [...prev, readEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a project title.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a project description or quick pitch.");
      return;
    }

    if (githubUrl.trim() && !isValidUrl(githubUrl)) {
      setError("Please enter a valid GitHub repository URL starting with https://");
      return;
    }
    if (liveUrl.trim() && !isValidUrl(liveUrl)) {
      setError("Please enter a valid Live Demo URL starting with https://");
      return;
    }

    setIsSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        skills: skills.length > 0 ? skills : ["Web", "React"],
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        images: images,
        isPublic: isPublic,
        source: "manual",
        isVerified: false,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5 text-[#D7FC51]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {initialData ? "Edit Project" : "Add Project to Studio"}
              </h3>
              <p className="text-xs text-slate-500">Showcase your technical work on your public portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={"flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all " + (
              mode === "quick" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Link (Fast 30s)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("detailed")}
            className={"flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all " + (
              mode === "detailed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Full Showcase (Screenshots &amp; Demos)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Task Queue / Realtime Chat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {mode === "quick" ? "One-Line Pitch / Overview *" : "Full Description & Architecture *"}
            </label>
            <textarea
              rows={mode === "quick" ? 2 : 4}
              required
              placeholder="What does this project solve? What technologies power it?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Live URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://my-app.vercel.app"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GitHub Repo (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tech Stack &amp; Skills (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Next.js, TypeScript, Tailwind, PostgreSQL, Redis"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {mode === "detailed" && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Screenshots &amp; Previews (Max 5)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden group">
                    <Image src={img} alt={"Preview " + (idx + 1)} width={80} height={80} unoptimized className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-[9px] font-mono">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <span>Display on Public Portfolio</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#D7FC51]" />
                <span>{isSaving ? "Saving..." : "Save Project"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

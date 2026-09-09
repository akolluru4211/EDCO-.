"use client";

import React, { useState } from "react";
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
  Image as ImageIcon 
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
    if (!urlString.trim()) return true; // Optional field
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

    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate type
      if (!file.type.startsWith("image/")) {
        setError(`File "${file.name}" is not an accepted image format.`);
        return;
      }
      // Validate 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB maximum file size.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (readEvent) => {
        if (readEvent.target?.result) {
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
      setError("Please provide a project description or overview.");
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
        skills: skills.length > 0 ? skills : ["TypeScript", "Full Stack"],
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        images,
        isPublic,
        source: initialData?.source || "manual",
        isVerified: initialData?.isVerified ?? false,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {initialData ? "Edit Project Studio Entry" : "Create New Project Showcase"}
            </h3>
            <p className="text-xs text-slate-500">
              Add technical accomplishments, demo links, and screenshot previews.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed In-Memory Cache &amp; Analytics Engine"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description &amp; Key Architectural Highlights *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem solved, architectural decisions, trade-offs evaluated, and measurable outcomes..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Technologies &amp; Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. TypeScript, React, Next.js, Node.js, PostgreSQL, Docker"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GitHub Repository Link
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Live Deployment URL
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Screenshot Images Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Project Screenshots (Max 5 images &bull; &lt; 5MB each)
            </label>

            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl border border-slate-200 overflow-hidden group">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
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
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-mono">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Public / Private Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                {isPublic ? <Globe className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                {isPublic ? "Public Shareable Project" : "Private / Unlisted Project"}
              </span>
              <p className="text-[11px] text-slate-500">
                {isPublic
                  ? "Anyone with your shareable URL can view this project showcase."
                  : "Only you can view this project. Direct public links will return access denied."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                isPublic ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </button>
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
            >
              {isSaving ? "Saving Project..." : "Save Project Showcase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

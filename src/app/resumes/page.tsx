"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Resume, ResumeContent, ResumeTemplateId } from "@/lib/types";
import { DEFAULT_RESUME_CONTENT } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";
import ResumePreview from "@/components/resume/ResumePreview";
import JDMatchModal from "@/components/resume/JDMatchModal";
import PdfExportButton from "@/components/resume/PdfExportButton";
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Eye, 
  FileEdit,
  Lock,
  ArrowRight,
  Info,
  X
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { getResumeProfileDefaults } from "@/lib/services/user-profile";
import UserGreeting from "@/components/ui/UserGreeting";

export const dynamic = "force-dynamic";

export default function ResumesDirectEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const isNewQuery = searchParams.get("isNew") === "true";

  // Junior Track Gating (13-15 years)
  const isJuniorTrack = user?.ageBand === "13-15";

  const [resume, setResume] = useState<Resume | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<ResumeTemplateId>("classic");
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [savedStatus, setSavedStatus] = useState<string>("Saved");
  const [showPreFillBanner, setShowPreFillBanner] = useState(isNewQuery);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || isJuniorTrack) {
      setResume(null);
      return;
    }

    const loadPrimaryResume = async () => {
      // 1. Fetch primary/most recent resume from Supabase
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.uid)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const item = data[0];
          const loaded: Resume = {
            id: item.id,
            userId: item.user_id,
            title: item.title || "ATS Master Resume",
            templateId: (item.template_id as ResumeTemplateId) || "classic",
            content: item.content || DEFAULT_RESUME_CONTENT,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
          setResume(loaded);
          setActiveTemplate(loaded.templateId || "classic");
          localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify([loaded]));
          return;
        }
      } catch (err) {
        console.warn("[Supabase Resume Fetch Note]:", err);
      }

      // 2. Local storage cache fallback
      const cached = localStorage.getItem(`edworld_${user.uid}_resumes`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setResume(parsed[0]);
            setActiveTemplate(parsed[0].templateId || "classic");
            return;
          }
        } catch {}
      }

      // 3. Fallback: Initialize master ATS resume prefilled with real user profile defaults
      const interestSkills = profile?.interests?.map((i) => i.name) || ["TypeScript", "React", "Node.js", "REST APIs"];
      const contactDefaults = getResumeProfileDefaults(user, profile);
      const initialResume: Resume = {
        id: `resume-${user.uid}-master`,
        userId: user.uid,
        title: "ATS Master Resume",
        templateId: "classic",
        content: {
          ...DEFAULT_RESUME_CONTENT,
          contact: contactDefaults,
          skills: {
            ...DEFAULT_RESUME_CONTENT.skills,
            technical: interestSkills,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await supabase
          .from("resumes")
          .upsert({
            id: initialResume.id,
            user_id: user.uid,
            title: initialResume.title,
            template_id: initialResume.templateId,
            content: initialResume.content,
            created_at: initialResume.createdAt,
            updated_at: initialResume.updatedAt,
          });
      } catch (e) {
        console.warn("[Supabase Resume Init Note]:", e);
      }

      setResume(initialResume);
      setActiveTemplate("classic");
      localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify([initialResume]));
    };

    loadPrimaryResume();
  }, [user, profile, isJuniorTrack]);

  const handleContentChange = (updatedContent: ResumeContent) => {
    if (!resume || !user) return;
    const updated: Resume = {
      ...resume,
      content: updatedContent,
      templateId: activeTemplate,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    setSavedStatus("Saving...");

    // Debounced autosave (1000ms) to Supabase + local storage
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      // 1. Update local storage
      const cached = localStorage.getItem(`edworld_${user.uid}_resumes`);
      let list: Resume[] = cached ? JSON.parse(cached) : [];
      const index = list.findIndex((r) => r.id === resume.id);
      if (index >= 0) {
        list[index] = updated;
      } else {
        list = [updated, ...list];
      }
      localStorage.setItem(`edworld_${user.uid}_resumes`, JSON.stringify(list));

      // 2. Persist to Supabase Relational Database
      try {
        await supabase.from("resumes").upsert({
          id: resume.id,
          user_id: user.uid,
          title: updated.title,
          template_id: updated.templateId,
          content: updated.content,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("[Supabase Resume Save Note]:", e);
      }

      // 3. Persist to Firestore if available
      if (db) {
        try {
          await setDoc(doc(db, "resumes", resume.id), updated, { merge: true });
        } catch (err) {
          console.warn("[Firestore Resume Autosave Note]:", err);
        }
      }

      setSavedStatus("Saved");
    }, 1000);
  };

  const handleTemplateChange = (tmpl: ResumeTemplateId) => {
    setActiveTemplate(tmpl);
    if (resume) {
      const updated = { ...resume, templateId: tmpl };
      setResume(updated);
      handleContentChange(resume.content);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (!resume) return;
    const updated = { ...resume, title: newTitle };
    setResume(updated);
    handleContentChange(resume.content);
  };

  // Junior Track Gating (13-15 years)
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
              <h1 className="text-3xl font-bold font-display text-ink tracking-tight">Resume Maker is for Explorer &amp; Career Tracks</h1>
              <p className="text-sm text-ink-soft leading-relaxed">
                As a Class 9-10 learner, your focus is on curious exploration, building hands-on creative projects, and learning core concepts. Resume building unlocks in the 16-18 Explorer Track.
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

  if (loading || !resume) {
    return (
      <AuthGuard>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-3 font-mono text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading ATS Builder Workspace...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col">
        {/* Top Action Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
          <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                title="Back to Dashboard"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={resume.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="font-bold text-slate-900 text-base sm:text-lg lg:text-xl border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent px-1 py-0.5"
                    aria-label="Resume Title"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pl-1">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {savedStatus}
                  </span>
                  <span>&bull;</span>
                  <span>ATS Optimized Single-Column</span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
              {/* Template Selector */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                {(["classic", "modern", "tech"] as ResumeTemplateId[]).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => handleTemplateChange(tmpl)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg uppercase tracking-wider text-[11px] sm:text-xs font-mono transition-all ${
                      activeTemplate === tmpl
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              {/* AI JD-Match Button */}
              <button
                onClick={() => setIsJDModalOpen(true)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-300" />
                <span>AI JD Match</span>
              </button>

              {/* PDF Export Button */}
              <PdfExportButton
                resumeContent={resume.content}
                templateId={activeTemplate}
                fileName={`${(resume.content.contact.fullName || "Resume").replace(/\s+/g, "_")}_ATS_Resume`}
              />
            </div>
          </div>
        </header>

        {/* User Identity Greeting Context Sub-Bar */}
        <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-[1536px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <UserGreeting
              context="resume"
              subtitle="All contact details & skills sync seamlessly with your verified profile."
              className="text-xs sm:text-sm"
            />
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live ATS Studio Active</span>
            </div>
          </div>
        </div>

        {/* Pre-fill Alert Banner for New Resumes */}
        {showPreFillBanner && (
          <div className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-3 text-xs sm:text-sm flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-brand-300 shrink-0" />
              <span>
                We&apos;ve pre-filled your contact info and starting skills from your profile — feel free to edit or add more.
              </span>
            </div>
            <button
              onClick={() => setShowPreFillBanner(false)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Mobile Tab Toggle */}
        <div className="md:hidden flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setMobileTab("edit")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              mobileTab === "edit"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500"
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              mobileTab === "preview"
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Main Studio Grid */}
        <div className="max-w-[1536px] mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Form Column */}
          <div className={`lg:col-span-6 w-full ${mobileTab === "preview" ? "hidden md:block" : "block"}`}>
            <ResumeBuilderForm
              content={resume.content}
              onChange={handleContentChange}
            />
          </div>

          {/* Live Preview Column */}
          <div className={`lg:col-span-6 w-full sticky top-36 ${mobileTab === "edit" ? "hidden md:block" : "block"}`}>
            <div className="bg-slate-200/80 p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-300/80 shadow-inner overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 px-1">
                <span>ATS Vector Preview &bull; {activeTemplate.toUpperCase()}</span>
                <span>100% Text Selectable</span>
              </div>
              <div className="shadow-2xl rounded-xl overflow-hidden bg-white">
                <ResumePreview
                  content={resume.content}
                  templateId={activeTemplate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* JD Match Modal */}
        <JDMatchModal
          isOpen={isJDModalOpen}
          onClose={() => setIsJDModalOpen(false)}
          resumeContent={resume.content}
          resumeId={resume.id}
        />
      </div>
    </AuthGuard>
  );
}

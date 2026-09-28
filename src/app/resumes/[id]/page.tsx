"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Resume, ResumeContent, ResumeTemplateId } from "@/lib/types";
import { DEFAULT_RESUME_CONTENT } from "@/lib/mock-data";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";
import ResumePreview from "@/components/resume/ResumePreview";
import JDMatchModal from "@/components/resume/JDMatchModal";
import PdfExportButton from "@/components/resume/PdfExportButton";
import { 
  ArrowLeft, 
  Sparkles, 
  Layout, 
  Check, 
  Save, 
  Eye, 
  FileEdit,
  Layers,
  Lock,
  ArrowRight,
  Info,
  X
} from "lucide-react";

import { getResumeProfileDefaults } from "@/lib/services/user-profile";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function ResumeStudioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const resumeId = params?.id as string;
  const isNewQuery = searchParams.get("isNew") === "true";

  // Junior Track Gating
  const isJuniorTrack = user?.ageBand === "13-15";

  const [resume, setResume] = useState<Resume | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<ResumeTemplateId>("classic");
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [savedStatus, setSavedStatus] = useState<string>("Saved");
  const [showPreFillBanner, setShowPreFillBanner] = useState(isNewQuery);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || isJuniorTrack) return;

    const loadResume = async () => {
      // 1. Check user-scoped local cache
      const cached = localStorage.getItem(`edworld_${user.uid}_resumes`);
      if (cached) {
        try {
          const list: Resume[] = JSON.parse(cached);
          const found = list.find((r) => r.id === resumeId);
          if (found) {
            setResume(found);
            setActiveTemplate(found.templateId || "classic");
            return;
          }
        } catch (e) {}
      }

      // 2. Fetch from Firestore
      if (db) {
        try {
          const docSnap = await getDoc(doc(db, "resumes", resumeId));
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as Resume;
            if (data.userId === user.uid) {
              setResume(data);
              setActiveTemplate(data.templateId || "classic");
              return;
            }
          }
        } catch (err) {
          console.warn("[Firestore Resume Load]", err);
        }
      }

      // 3. Fallback if newly created - prefilled with real user profile defaults
      const contactDefaults = getResumeProfileDefaults(user, profile);
      const fallbackResume: Resume = {
        id: resumeId || `resume-${user.uid}-${Date.now()}`,
        userId: user.uid,
        title: "Software Engineering ATS Draft",
        templateId: "classic",
        content: {
          ...DEFAULT_RESUME_CONTENT,
          contact: contactDefaults,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setResume(fallbackResume);
    };

    loadResume();
  }, [resumeId, user, profile, isJuniorTrack]);

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

    // Debounced autosave (1000ms) to Firestore + local storage
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      // 1. Update local storage
      const cached = localStorage.getItem(`edworld_${user.uid}_resumes`);
      let list: Resume[] = cached ? JSON.parse(cached) : [];
      const index = list.findIndex((r) => r.id === resume.id);
      if (index >= 0) {
        list[index] = updated;
      } else {
        list.push(updated);
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

      // 3. Persist to Firestore
      if (db) {
        try {
          await setDoc(doc(db, "resumes", resume.id), updated, { merge: true });
        } catch (err) {
          console.error("[Firestore Resume Autosave Error]:", err);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3 font-mono text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading ATS Builder Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In Required</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please sign in to access your personal ATS resumes and live editor.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Junior Track Gating Screen
  if (isJuniorTrack) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
              Junior Track (13-15)
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resume Maker is for Explorer &amp; Career Tracks</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resume building is available in the 16-18 Explorer Track and 18+ Career Track. Junior learners practice projects in the Quest Hub.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-3 font-mono text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading ATS Builder Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col">
      {/* Top Action Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              title="Back to Dashboard"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <input
                type="text"
                value={resume.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-bold text-slate-900 text-sm sm:text-base border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none bg-transparent px-1 py-0.5"
              />
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pl-1">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  {savedStatus}
                </span>
                <span>&bull;</span>
                <span>ATS Optimized Single-Column</span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Template Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {(["classic", "modern", "tech"] as ResumeTemplateId[]).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => handleTemplateChange(tmpl)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] font-mono transition-all ${
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
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
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

      {/* Pre-fill Alert Banner for New Resumes */}
      {showPreFillBanner && (
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Info className="w-4 h-4 text-brand-300 shrink-0" />
            <span>
              We&apos;ve pre-filled your contact info and starting skills from your profile — feel free to edit or add more.
            </span>
          </div>
          <button
            onClick={() => setShowPreFillBanner(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Tab Toggle */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            mobileTab === "edit"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500"
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
            mobileTab === "preview"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className={`lg:col-span-6 w-full ${mobileTab === "preview" ? "hidden md:block" : "block"}`}>
          <ResumeBuilderForm
            content={resume.content}
            onChange={handleContentChange}
          />
        </div>

        {/* Live Preview Column */}
        <div className={`lg:col-span-6 w-full sticky top-36 ${mobileTab === "edit" ? "hidden md:block" : "block"}`}>
          <div className="bg-slate-200/80 p-4 sm:p-6 rounded-3xl border border-slate-300/80 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-500 px-1">
              <span>ATS Vector Preview &bull; {activeTemplate.toUpperCase()}</span>
              <span>100% Text Selectable</span>
            </div>
            <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
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
  );
}

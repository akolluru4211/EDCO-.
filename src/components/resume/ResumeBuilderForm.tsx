"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeContent, ResumeExperience, ResumeEducation, ResumeProject, ResumeCertification } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ProjectItem } from "@/lib/types";
import { getResumeProfileDefaults } from "@/lib/services/user-profile";
import { 
  Wand2,
  AlertCircle,
  FileText,
  X,
  ArrowUpRight,
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Award, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

interface ResumeBuilderFormProps {
  content: ResumeContent;
  onChange: (updated: ResumeContent) => void;
}

export default function ResumeBuilderForm({ content, onChange }: ResumeBuilderFormProps) {
  const { user, profile } = useAuth();
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<ProjectItem[]>([]);
  const [profileSyncMsg, setProfileSyncMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      const cached = localStorage.getItem(`edworld_${user.uid}_projects`);
      if (cached) {
        try {
          setAvailableProjects(JSON.parse(cached));
        } catch (e) {}
      }
    }
  }, [user, showProjectPicker]);

  
  const router = useRouter();
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [tailorRoleInput, setTailorRoleInput] = useState("");
  const [tailorJdInput, setTailorJdInput] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<any | null>(null);
  const [tailorError, setTailorError] = useState<string | null>(null);
  const [acceptedItems, setAcceptedItems] = useState<Record<string, boolean>>({});

  const handleRunTailor = async () => {
    if (!tailorRoleInput.trim() || !tailorJdInput.trim()) {
      setTailorError("Please enter both target role and job description.");
      return;
    }
    setIsTailoring(true);
    setTailorError(null);
    try {
      const res = await fetch("/api/resumes/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeContent: content,
          targetRole: tailorRoleInput,
          jobDescription: tailorJdInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTailorResult(data.data);
      } else {
        setTailorError(data.message || "Tailoring failed.");
      }
    } catch (e: any) {
      setTailorError(e.message || "Failed to reach AI service.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleAcceptSummary = () => {
    if (!tailorResult?.summarySuggestion) return;
    onChange({
      ...content,
      summary: tailorResult.summarySuggestion.suggested,
    });
    setAcceptedItems((prev) => ({ ...prev, summary: true }));
  };

  const handleAcceptBullet = (suggestion: any) => {
    if (suggestion.type === "experience") {
      const exp = [...content.experience];
      if (exp[suggestion.itemIndex] && exp[suggestion.itemIndex].bullets) {
        const bullets = [...exp[suggestion.itemIndex].bullets];
        bullets[suggestion.bulletIndex] = suggestion.suggested;
        exp[suggestion.itemIndex] = { ...exp[suggestion.itemIndex], bullets };
        onChange({ ...content, experience: exp });
      }
    } else if (suggestion.type === "project") {
      const projs = [...content.projects];
      if (projs[suggestion.itemIndex] && projs[suggestion.itemIndex].bullets) {
        const bullets = [...projs[suggestion.itemIndex].bullets];
        bullets[suggestion.bulletIndex] = suggestion.suggested;
        projs[suggestion.itemIndex] = { ...projs[suggestion.itemIndex], bullets };
        onChange({ ...content, projects: projs });
      }
    }
    setAcceptedItems((prev) => ({ ...prev, [suggestion.id]: true }));
  };

  const handleRejectItem = (id: string) => {
    setAcceptedItems((prev) => ({ ...prev, [id]: false }));
  };

  const handleLaunchInterviewFromTailor = () => {
    const encodedRole = encodeURIComponent(tailorRoleInput || "Software Engineer");
    const encodedJd = encodeURIComponent(tailorJdInput || "");
    router.push("/interviews/swe?jobTitle=" + encodedRole + "&jd=" + encodedJd);
  };

  const handleSyncFromProfile = () => {
    if (!user) return;
    const defaults = getResumeProfileDefaults(user, profile);
    const initialSkills = profile?.interests?.map((i) => i.name) || [];

    onChange({
      ...content,
      contact: {
        ...content.contact,
        fullName: defaults.fullName || content.contact.fullName,
        email: defaults.email || content.contact.email,
        phone: defaults.phone || content.contact.phone,
        location: defaults.location || content.contact.location,
        linkedin: defaults.linkedin || content.contact.linkedin,
        github: defaults.github || content.contact.github,
        portfolio: defaults.portfolio || content.contact.portfolio,
      },
      skills: {
        ...content.skills,
        technical: content.skills.technical.length > 0 ? content.skills.technical : initialSkills,
      },
    });

    setProfileSyncMsg("✓ Synced name and contact from global profile!");
    setTimeout(() => setProfileSyncMsg(null), 3000);
  };
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInUrlInput, setLinkedInUrlInput] = useState("");
  const [linkedInPersona, setLinkedInPersona] = useState<"college" | "working_professional">("working_professional");
  const [isSyncingLinkedIn, setIsSyncingLinkedIn] = useState(false);
  const [linkedInSyncMsg, setLinkedInSyncMsg] = useState<string | null>(null);

  const handleLinkedInSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncingLinkedIn(true);
    setLinkedInSyncMsg(null);
    try {
      const res = await fetch("/api/profile/linkedin-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: linkedInUrlInput || "https://linkedin.com/in/sample-profile",
          persona: linkedInPersona,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const li = data.data;
        onChange({
          ...content,
          summary: li.summary || content.summary,
          experience: li.experience.length > 0 ? li.experience.map((e: any) => ({
            ...e,
            bullets: [e.description]
          })) : content.experience,
          education: li.education.length > 0 ? li.education.map((ed: any) => ({
            id: ed.id,
            school: ed.institution,
            degree: ed.degree,
            field: ed.field,
            startDate: ed.startDate,
            endDate: ed.endDate,
            gpa: ed.score
          })) : content.education,
          skills: li.skills.length > 0 ? li.skills : content.skills,
        });

        setLinkedInSyncMsg(`✓ Successfully imported ${li.experience.length} experiences, ${li.education.length} degrees, and ${li.skills.length} skills!`);
        setTimeout(() => {
          setShowLinkedInModal(false);
          setLinkedInSyncMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setLinkedInSyncMsg(`Error: ${err.message || "Failed to sync LinkedIn"}`);
    } finally {
      setIsSyncingLinkedIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<
    "contact" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications"
  >("contact");

  const updateContact = (field: keyof typeof content.contact, val: string) => {
    onChange({
      ...content,
      contact: {
        ...content.contact,
        [field]: val,
      },
    });
  };

  const updateSummary = (val: string) => {
    onChange({ ...content, summary: val });
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: "exp-" + Date.now(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    };
    onChange({ ...content, experience: [...content.experience, newExp] });
  };

  const updateExpField = (index: number, field: keyof ResumeExperience, val: any) => {
    const updated = [...content.experience];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...content, experience: updated });
  };

  const removeExperience = (index: number) => {
    const updated = content.experience.filter((_, i) => i !== index);
    onChange({ ...content, experience: updated });
  };

  const addExpBullet = (expIndex: number) => {
    const updated = [...content.experience];
    updated[expIndex].bullets.push("");
    onChange({ ...content, experience: updated });
  };

  const updateExpBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...content.experience];
    updated[expIndex].bullets[bulletIndex] = text;
    onChange({ ...content, experience: updated });
  };

  const removeExpBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...content.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange({ ...content, experience: updated });
  };

  
  const addCertification = () => {
    const newCert: ResumeCertification = {
      id: "cert-" + Date.now(),
      name: "",
      issuer: "",
      issueDate: "",
      url: "",
    };
    onChange({
      ...content,
      certifications: [...(content.certifications || []), newCert],
    });
  };

  const updateCertField = (index: number, field: keyof ResumeCertification, val: string) => {
    const updated = [...(content.certifications || [])];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...content, certifications: updated });
  };

  const removeCertification = (index: number) => {
    const updated = (content.certifications || []).filter((_, i) => i !== index);
    onChange({ ...content, certifications: updated });
  };

  const importCertsFromProfile = () => {
    let profileCerts: any[] = [];
    if (profile?.certifications && Array.isArray(profile.certifications)) {
      profileCerts = profile.certifications;
    } else if (user?.uid) {
      const cached = localStorage.getItem("edworld_" + user.uid + "_certs");
      if (cached) {
        try { profileCerts = JSON.parse(cached); } catch(e) {}
      }
    }

    if (profileCerts.length === 0) {
      setProfileSyncMsg("No certifications found on your profile. Add them in Profile Settings first!");
      setTimeout(() => setProfileSyncMsg(null), 3000);
      return;
    }

    const mapped: ResumeCertification[] = profileCerts.map((c: any) => ({
      id: c.id || "cert-" + Date.now() + "-" + Math.random(),
      name: c.name || c.title || "",
      issuer: c.issuer || "",
      issueDate: c.issueDate || c.issue_date || "",
      url: c.url || c.credential_url || "",
    }));

    onChange({
      ...content,
      certifications: [...(content.certifications || []), ...mapped],
    });

    setProfileSyncMsg("✓ Imported " + mapped.length + " certifications from your profile!");
    setTimeout(() => setProfileSyncMsg(null), 3000);
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: "edu-" + Date.now(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      graduationDate: "",
      gpa: "",
      coursework: [],
    };
    onChange({ ...content, education: [...content.education, newEdu] });
  };

  const updateEduField = (index: number, field: keyof ResumeEducation, val: any) => {
    const updated = [...content.education];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...content, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = content.education.filter((_, i) => i !== index);
    onChange({ ...content, education: updated });
  };

  // Skills Handlers
  const updateSkillsString = (type: "technical" | "soft" | "tools", commaSeparated: string) => {
    const arr = commaSeparated.split(",").map((s) => s.trim()).filter(Boolean);
    onChange({
      ...content,
      skills: {
        ...content.skills,
        [type]: arr,
      },
    });
  };

  // Projects Handlers
  const addProject = () => {
    const newProj: ResumeProject = {
      id: "proj-" + Date.now(),
      title: "",
      description: "",
      technologies: [],
      bullets: [""],
    };
    onChange({ ...content, projects: [...content.projects, newProj] });
  };

  const updateProjField = (index: number, field: keyof ResumeProject, val: any) => {
    const updated = [...content.projects];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...content, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = content.projects.filter((_, i) => i !== index);
    onChange({ ...content, projects: updated });
  };

  const addProjBullet = (projIndex: number) => {
    const updated = [...content.projects];
    updated[projIndex].bullets.push("");
    onChange({ ...content, projects: updated });
  };

  const updateProjBullet = (projIndex: number, bulletIndex: number, text: string) => {
    const updated = [...content.projects];
    updated[projIndex].bullets[bulletIndex] = text;
    onChange({ ...content, projects: updated });
  };

  const removeProjBullet = (projIndex: number, bulletIndex: number) => {
    const updated = [...content.projects];
    updated[projIndex].bullets = updated[projIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange({ ...content, projects: updated });
  };

  const tabs = [
    { id: "contact", label: "Contact", icon: User },
    { id: "summary", label: "Summary", icon: Sparkles },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: FolderGit2 },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto bg-slate-50/70 p-1.5 gap-1 shrink-0">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 mr-1">
          
          <button
            type="button"
            onClick={() => setShowTailorModal(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Tailor resume bullets & summary to a specific job description"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#D7FC51]" />
            <span>AI Tailor to Job</span>
          </button>
          <button
            type="button"
            onClick={handleSyncFromProfile}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Update contact and skills from your central EdWorld profile"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D7FC51]" />
            <span>Sync from Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLinkedInModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#0077B5] hover:bg-[#005E93] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D7FC51]" />
            <span>Sync LinkedIn</span>
          </button>
        </div>
      </div>

      {profileSyncMsg && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{profileSyncMsg}</span>
        </div>
      )}

      {/* LinkedIn Import Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0077B5] text-white flex items-center justify-center font-bold text-sm">
                  in
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">LinkedIn Profile Sync</h3>
                  <p className="text-[10px] text-slate-500">MCP Powered Profile Calibrator</p>
                </div>
              </div>
              <button onClick={() => setShowLinkedInModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkedInSync} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Target Persona</label>
                <select
                  value={linkedInPersona}
                  onChange={(e: any) => setLinkedInPersona(e.target.value)}
                  className="w-full text-xs p-2.5 mt-1 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  <option value="college">College Student (Degree, GPA, Internships)</option>
                  <option value="working_professional">Working Professional (Tenure, Roles, Stack)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL or Username</label>
                <input
                  type="text"
                  value={linkedInUrlInput}
                  onChange={(e) => setLinkedInUrlInput(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full text-xs p-2.5 mt-1 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSyncingLinkedIn}
                className="w-full py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#005E93] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSyncingLinkedIn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing &amp; Calibrating Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import LinkedIn Data into Resume</span>
                  </>
                )}
              </button>
            </form>

            {linkedInSyncMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 animate-in fade-in">
                {linkedInSyncMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5">
        {/* CONTACT */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Personal & Contact Info</h3>
              <button
                type="button"
                onClick={handleSyncFromProfile}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync from Profile</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={content.contact.fullName}
                  onChange={(e) => updateContact("fullName", e.target.value)}
                  placeholder={user?.name ? `e.g. ${user.name}` : "e.g. Adarsh Kolluru"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder={user?.email || "name@example.com"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={content.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder={profile?.phone || user?.phone || "+91 98765 43210"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={content.contact.location}
                  onChange={(e) => updateContact("location", e.target.value)}
                  placeholder="City, State / Country"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={content.contact.linkedin || ""}
                  onChange={(e) => updateContact("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={content.contact.github || ""}
                  onChange={(e) => updateContact("github", e.target.value)}
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Professional Summary</h3>
              <span className="text-[10px] text-slate-400">2-4 sentences recommended</span>
            </div>
            <textarea
              rows={6}
              value={content.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Highlight your core technical strengths, key accomplishments, and target role..."
              className="w-full p-3 text-xs rounded-lg border border-slate-300 leading-relaxed focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        {/* EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Work & Leadership Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {content.experience.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Position #{expIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(expIdx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => updateExpField(expIdx, "role", e.target.value)}
                    placeholder="Job Title / Role (e.g. Software Engineer Intern)"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExpField(expIdx, "company", e.target.value)}
                    placeholder="Company Name"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExpField(expIdx, "location", e.target.value)}
                    placeholder="Location (e.g. New York, NY)"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExpField(expIdx, "startDate", e.target.value)}
                      placeholder="Start (e.g. Jun 2023)"
                      className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExpField(expIdx, "endDate", e.target.value)}
                      placeholder="End (e.g. Present)"
                      className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Accomplishment Bullets</label>
                    <button
                      type="button"
                      onClick={() => addExpBullet(expIdx)}
                      className="text-[11px] font-bold text-brand-600 hover:underline"
                    >
                      + Add Bullet
                    </button>
                  </div>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => updateExpBullet(expIdx, bIdx, e.target.value)}
                        placeholder="Action verb + Context + Measurable Result (e.g., Architected microservice reducing latency by 35%)"
                        className="flex-1 p-2 text-xs rounded border border-slate-300 bg-white leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => removeExpBullet(expIdx, bIdx)}
                        className="text-slate-400 hover:text-rose-500 mt-2 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Education & Coursework</h3>
              <button
                type="button"
                onClick={addEducation}
                className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add School</span>
              </button>
            </div>

            {content.education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Education #{eduIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(eduIdx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEduField(eduIdx, "school", e.target.value)}
                    placeholder="University or High School Name"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEduField(eduIdx, "degree", e.target.value)}
                    placeholder="Degree (e.g. B.S. / High School Diploma)"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEduField(eduIdx, "fieldOfStudy", e.target.value)}
                    placeholder="Field of Study (e.g. Computer Science)"
                    className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={edu.graduationDate}
                      onChange={(e) => updateEduField(eduIdx, "graduationDate", e.target.value)}
                      placeholder="Grad Date (e.g. May 2025)"
                      className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => updateEduField(eduIdx, "gpa", e.target.value)}
                      placeholder="GPA (e.g. 3.8 / 4.0)"
                      className="w-1/2 px-2 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Skills & Technologies</h3>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={content.skills.technical.join(", ")}
                onChange={(e) => updateSkillsString("technical", e.target.value)}
                placeholder="TypeScript, React, Next.js, Node.js, Python, PostgreSQL"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Tools & Platforms (Comma-separated)
              </label>
              <input
                type="text"
                value={content.skills.tools.join(", ")}
                onChange={(e) => updateSkillsString("tools", e.target.value)}
                placeholder="Git, Docker, AWS, Firebase, VS Code, Figma"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Soft & Leadership Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={content.skills.soft.join(", ")}
                onChange={(e) => updateSkillsString("soft", e.target.value)}
                placeholder="Problem Solving, Cross-functional Communication, Agile / Scrum"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Key Projects</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectPicker(true)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-brand-300" />
                  <span>Import from Project Studio</span>
                </button>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manual</span>
                </button>
              </div>
            </div>

            {/* Project Studio Picker Modal */}
            {showProjectPicker && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-brand-300" />
                    <span className="text-xs font-bold">Select a Project from Project Studio</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProjectPicker(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {availableProjects.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableProjects.map((ap) => (
                      <div
                        key={ap.id}
                        onClick={() => {
                          const newProj: ResumeProject = {
                            id: "proj-" + Date.now(),
                            title: ap.title,
                            description: ap.description,
                            link: ap.githubUrl || ap.liveUrl || "",
                            technologies: ap.skills,
                            bullets: [ap.description],
                            projectStudioId: ap.id,
                            importedAt: ap.updatedAt || new Date().toISOString(),
                          };
                          onChange({ ...content, projects: [...content.projects, newProj] });
                          setShowProjectPicker(false);
                        }}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{ap.title}</span>
                            {ap.isVerified && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{ap.description}</p>
                        </div>
                        <Plus className="w-4 h-4 text-brand-300 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-800 rounded-xl">
                    No saved projects found in Project Studio. Go to Project Studio to import from GitHub or add projects.
                  </div>
                )}
              </div>
            )}

            {content.projects.map((proj, pIdx) => {
              const linkedStudioProj = proj.projectStudioId
                ? availableProjects.find((p) => p.id === proj.projectStudioId)
                : null;
              const hasUpdate =
                linkedStudioProj &&
                new Date(linkedStudioProj.updatedAt).getTime() >
                  new Date(proj.importedAt || 0).getTime();

              return (
                <div key={proj.id || pIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Project #{pIdx + 1}</span>
                      {proj.projectStudioId && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3" />
                          Linked to Project Studio
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(pIdx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Refresh Notice if updated in Project Studio */}
                  {hasUpdate && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>This project has been updated in Project Studio since you imported it.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...content.projects];
                          updated[pIdx] = {
                            ...updated[pIdx],
                            title: linkedStudioProj.title,
                            description: linkedStudioProj.description,
                            link: linkedStudioProj.githubUrl || linkedStudioProj.liveUrl || updated[pIdx].link,
                            technologies: linkedStudioProj.skills,
                            importedAt: linkedStudioProj.updatedAt || new Date().toISOString(),
                          };
                          onChange({ ...content, projects: updated });
                        }}
                        className="font-bold underline text-amber-950 ml-2 hover:text-amber-700"
                      >
                        Refresh?
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProjField(pIdx, "title", e.target.value)}
                      placeholder="Project Title"
                      className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={proj.link || ""}
                      onChange={(e) => updateProjField(pIdx, "link", e.target.value)}
                      placeholder="Project Link (GitHub / Demo)"
                      className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    value={proj.technologies.join(", ")}
                    onChange={(e) =>
                      updateProjField(
                        pIdx,
                        "technologies",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Tech Stack (e.g. Next.js, TypeScript, PostgreSQL)"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                  />

                  {/* Bullets */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Impact & Details</label>
                      <button
                        type="button"
                        onClick={() => addProjBullet(pIdx)}
                        className="text-[11px] font-bold text-brand-600 hover:underline"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {proj.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-2 text-xs">•</span>
                        <textarea
                          rows={2}
                          value={b}
                          onChange={(e) => updateProjBullet(pIdx, bIdx, e.target.value)}
                          placeholder="Key architectural impact, algorithmic innovation, or user outcome"
                          className="flex-1 p-2 text-xs rounded border border-slate-300 bg-white leading-relaxed"
                        />
                        <button
                          type="button"
                          onClick={() => removeProjBullet(pIdx, bIdx)}
                          className="text-slate-400 hover:text-rose-500 mt-2 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    
      
        {/* CERTIFICATIONS */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">Certifications &amp; Licenses</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={importCertsFromProfile}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-[#D7FC51]" />
                  <span>Import from Profile</span>
                </button>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manual</span>
                </button>
              </div>
            </div>

            {(!content.certifications || content.certifications.length === 0) ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No certifications listed yet.</p>
                <p className="text-[11px] text-slate-400">Click &quot;Import from Profile&quot; to pull your verified licenses or add them manually.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {content.certifications.map((cert, cIdx) => (
                  <div key={cert.id || cIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Certification #{cIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(cIdx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertField(cIdx, "name", e.target.value)}
                        placeholder="Certificate Title (e.g. AWS Solutions Architect)"
                        className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertField(cIdx, "issuer", e.target.value)}
                        placeholder="Issuing Organization (e.g. Amazon Web Services)"
                        className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        value={cert.issueDate}
                        onChange={(e) => updateCertField(cIdx, "issueDate", e.target.value)}
                        placeholder="Issue Date (e.g. Jan 2026)"
                        className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                      <input
                        type="url"
                        value={cert.url || ""}
                        onChange={(e) => updateCertField(cIdx, "url", e.target.value)}
                        placeholder="Verification URL (Optional)"
                        className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* AI Resume Tailoring Modal */}
      {showTailorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Wand2 className="w-5 h-5 text-[#D7FC51]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <span>AI Job Description Tailoring</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Claude AI</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Optimize summary and bullets for your target role with side-by-side accept/reject controls</p>
                </div>
              </div>
              <button
                onClick={() => setShowTailorModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Role Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer / Full Stack Developer"
                      value={tailorRoleInput}
                      onChange={(e) => setTailorRoleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Paste Job Description (JD)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste the key responsibilities, requirements, and tech stack from the job posting..."
                      value={tailorJdInput}
                      onChange={(e) => setTailorJdInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Claude AI generates targeted revisions with individual accept/reject controls.
                  </span>
                  <button
                    type="button"
                    disabled={isTailoring}
                    onClick={handleRunTailor}
                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all"
                  >
                    {isTailoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D7FC51]" />
                        <span>Analyzing & Tailoring...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D7FC51]" />
                        <span>Analyze & Generate Edits</span>
                      </>
                    )}
                  </button>
                </div>

                {tailorError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{tailorError}</span>
                  </div>
                )}
              </div>

              {tailorResult && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50 to-emerald-50 border border-violet-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex flex-col items-center justify-center font-black">
                        <span className="text-base leading-none">{tailorResult.atsMatchScore || 85}%</span>
                        <span className="text-[8px] uppercase tracking-wider text-violet-200">Match</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">ATS Keyword Match Level</h4>
                        <p className="text-[11px] text-slate-600">Tailored against {tailorRoleInput}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {tailorResult.keyMatchingSkills?.map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{skill}</span>
                        </span>
                      ))}
                      {tailorResult.missingKeywords?.map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {tailorResult.summarySuggestion && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-violet-600" />
                          <span>Professional Summary Suggestion</span>
                        </h4>
                        {acceptedItems.summary === true ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                          </span>
                        ) : acceptedItems.summary === false ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px]">
                            Rejected
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleAcceptSummary}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectItem("summary")}
                              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Original Summary</span>
                          <p className="text-slate-700 leading-relaxed">{tailorResult.summarySuggestion.original || "(Empty Summary)"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-200">
                          <span className="text-[10px] font-bold text-violet-700 uppercase block mb-1">AI Tailored Suggestion</span>
                          <p className="text-slate-900 font-medium leading-relaxed">{tailorResult.summarySuggestion.suggested}</p>
                          <p className="mt-2 text-[10px] text-violet-600 italic">💡 {tailorResult.summarySuggestion.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {tailorResult.bulletSuggestions && tailorResult.bulletSuggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <span>Experience &amp; Project Bullet Revisions</span>
                      </h4>

                      {tailorResult.bulletSuggestions.map((sug: any) => {
                        const isAccepted = acceptedItems[sug.id] === true;
                        const isRejected = acceptedItems[sug.id] === false;

                        return (
                          <div key={sug.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700">{sug.title || "Experience Bullet"}</span>
                              {isAccepted ? (
                                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                                </span>
                              ) : isRejected ? (
                                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px]">
                                  Skipped
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptBullet(sug)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Apply
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectItem(sug.id)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" /> Skip
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Original</span>
                                <p>{sug.original}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200 text-slate-900 font-medium">
                                <span className="text-[9px] font-bold text-violet-700 uppercase block mb-0.5">Tailored</span>
                                <p>{sug.suggested}</p>
                                <p className="mt-1 text-[9px] text-violet-600 italic">💡 {sug.reason}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-2">
                        <span>Ready to interview for this position?</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Launch a mock interview session grounded directly in this Job Description.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLaunchInterviewFromTailor}
                      className="px-4 py-2 rounded-xl bg-[#D7FC51] hover:bg-[#cbf13f] text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-md"
                    >
                      <span>Start Mock Interview</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
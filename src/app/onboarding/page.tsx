"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AVAILABLE_CATEGORIES } from "@/lib/mock-data";
import { SkillLevel, UserInterest, CareerStage } from "@/lib/types";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Target, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  User, 
  GraduationCap, 
  Briefcase, 
  Code2, 
  Github, 
  Linkedin, 
  Globe, 
  Building2, 
  Award, 
  CheckCircle2 
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, updateUserProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Basic Profile
  const [displayName, setDisplayName] = useState(profile?.name || user?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [headline, setHeadline] = useState(profile?.headline || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phone, setPhone] = useState(profile?.phone || user?.phone || "");

  // Step 2: Education & Career
  const [trackType, setTrackType] = useState<"student" | "professional">(
    profile?.careerStage === "PROFESSIONAL" || user?.careerStage === "PROFESSIONAL" ? "professional" : "student"
  );
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [degree, setDegree] = useState(profile?.degree || "B.Tech / B.E.");
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study || "Computer Science & Engineering");
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year || "2026");
  
  const [currentRole, setCurrentRole] = useState(profile?.headline || "Software Engineer");
  const [currentCompany, setCurrentCompany] = useState(profile?.current_company || "");
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level || "0–2 Years (Early Career)");
  const [targetRole, setTargetRole] = useState(profile?.targetRole || "Full Stack Developer");

  // Step 3: Skills & Focus
  const [selectedDomains, setSelectedDomains] = useState<Record<string, SkillLevel>>({
    swe: 1,
    behavioral: 0,
  });

  // Step 4: Goals & Links
  const [primaryGoal, setPrimaryGoal] = useState(
    profile?.primaryGoal || "Prepare for technical interviews and build a high-signal ATS resume."
  );
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Submission state
  const [saving, setSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial values from profile/user once loaded
  useEffect(() => {
    if (user?.name && !displayName) {
      setDisplayName(user.name);
    }
    if (user?.name && !username) {
      setUsername(user.name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(100 + Math.random() * 900));
    }
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
    if (profile?.interests && profile.interests.length > 0) {
      const mapped: Record<string, SkillLevel> = {};
      profile.interests.forEach((item) => {
        mapped[item.id] = (item.effectiveLevel || item.selfLevel || 0) as SkillLevel;
      });
      setSelectedDomains(mapped);
    }
  }, [user, profile]);

  const toggleDomain = (id: string) => {
    setSelectedDomains((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        if (Object.keys(next).length > 1) {
          delete next[id];
        }
      } else {
        next[id] = 1; // Default intermediate
      }
      return next;
    });
  };

  const setDomainLevel = (id: string, lvl: SkillLevel) => {
    setSelectedDomains((prev) => ({ ...prev, [id]: lvl }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!displayName.trim()) {
        setError("Please enter your full name to proceed.");
        return;
      }
    } else if (currentStep === 2) {
      if (trackType === "student" && !institution.trim()) {
        setError("Please enter your college or university name.");
        return;
      }
      if (trackType === "professional" && !targetRole.trim()) {
        setError("Please specify your target role or current specialization.");
        return;
      }
    } else if (currentStep === 3) {
      if (Object.keys(selectedDomains).length === 0) {
        setError("Please select at least one core domain to practice.");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const careerStage: CareerStage = trackType === "student" ? "STUDENT" : "PROFESSIONAL";

      const interestsArray: UserInterest[] = Object.entries(selectedDomains).map(([id, lvl]) => {
        const cat = AVAILABLE_CATEGORIES.find((c) => c.id === id);
        return {
          id,
          name: cat ? cat.name : id,
          category: cat ? cat.name : "General",
          selfLevel: lvl,
          effectiveLevel: lvl,
        };
      });

      const profilePayload = {
        name: displayName.trim(),
        username: username.trim() || undefined,
        headline: headline.trim() || (trackType === "student" ? `${degree} in ${fieldOfStudy}` : `${currentRole}`),
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        careerStage,
        institution: trackType === "student" ? institution.trim() : undefined,
        degree: trackType === "student" ? degree : undefined,
        field_of_study: trackType === "student" ? fieldOfStudy.trim() : undefined,
        graduation_year: trackType === "student" ? graduationYear : undefined,
        current_company: trackType === "professional" ? currentCompany.trim() : undefined,
        experience_level: trackType === "professional" ? experienceLevel : undefined,
        targetRole: targetRole.trim() || undefined,
        primaryGoal: primaryGoal.trim(),
        interests: interestsArray,
        onboarding_completed: true,
      };

      await updateUserProfile(profilePayload);

      // Explicit database guarantee update
      if (user?.uid) {
        await supabase.from("profiles").update({
          name: displayName.trim(),
          display_name: displayName.trim(),
          username: username.trim() || null,
          headline: profilePayload.headline,
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          career_stage: careerStage,
          institution: profilePayload.institution || null,
          degree: profilePayload.degree || null,
          field_of_study: profilePayload.field_of_study || null,
          graduation_year: profilePayload.graduation_year || null,
          current_company: profilePayload.current_company || null,
          experience_level: profilePayload.experience_level || null,
          target_role: profilePayload.targetRole || null,
          primary_goal: profilePayload.primaryGoal,
          interests: interestsArray,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }).eq("id", user.uid);
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to complete setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Top Branding & Progress Tracker */}
        <div className="text-center space-y-3">
          <div className="inline-block transition-transform hover:scale-105 active:scale-95">
            <EdworldLogo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
            Welcome to EdWorld Setup
          </h1>
          <p className="text-xs sm:text-sm text-[#5E6573]">
            Customize your learning and career workspace in 4 quick steps.
          </p>
        </div>

        {/* Progress Bar Card */}
        <div className="card-quixel rounded-3xl p-4 sm:p-5 bg-white border border-[#E8ECF2] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8E95A5]">
            <span className="text-[#13141B] font-sans font-bold">
              {currentStep === 1 && "Step 1: Basic Profile"}
              {currentStep === 2 && "Step 2: Education & Career Stage"}
              {currentStep === 3 && "Step 3: Skills & Focus Areas"}
              {currentStep === 4 && "Step 4: Goals & Portfolio Links"}
            </span>
            <span className="bg-[#EDE8FD] text-[#7B57FF] px-2.5 py-0.5 rounded-full">
              {progressPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-[#F4F6FB] h-2.5 rounded-full overflow-hidden border border-[#E8ECF2]">
            <div
              className="bg-gradient-to-r from-[#7B57FF] to-[#00D2B4] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/30 text-[#FF7A50] text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isCompleted ? (
          <div className="card-quixel rounded-3xl p-8 bg-white border border-[#E8ECF2] shadow-xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#13141B]">Profile Configured Successfully!</h2>
            <p className="text-xs sm:text-sm text-[#5E6573]">
              Your personalized interview drills, ATS resume tools, and career dashboard are ready. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-6">
            
            {/* ================= STEP 1: BASIC PROFILE ================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#7B57FF]" />
                    <span>Basic Profile Information</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Let us know your canonical name and how you want to appear across EdWorld.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="e.g. Adarsh Patel"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                        Username (Handle)
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. adarsh_patel"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Professional Headline / Title
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. CS Student | Aspiring Full Stack Engineer"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Short Bio (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="A short sentence about your technical focus or interests..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: EDUCATION & CAREER ================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#7B57FF]" />
                    <span>Education &amp; Career Track</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Choose your current track to get the most relevant interview drills and career recommendations.
                  </p>
                </div>

                {/* Track Selector */}
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2]">
                  <button
                    type="button"
                    onClick={() => setTrackType("student")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      trackType === "student"
                        ? "bg-[#13141B] text-white shadow-sm"
                        : "text-[#5E6573] hover:text-[#13141B]"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>College &amp; Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackType("professional")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      trackType === "professional"
                        ? "bg-[#13141B] text-white shadow-sm"
                        : "text-[#5E6573] hover:text-[#13141B]"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Working Professional</span>
                  </button>
                </div>

                {trackType === "student" ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                        College / University Name *
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        required
                        placeholder="e.g. IIT Delhi, BITS Pilani, Stanford University"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Degree Program
                        </label>
                        <select
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        >
                          <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                          <option value="BCA">BCA</option>
                          <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                          <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                          <option value="MCA">MCA</option>
                          <option value="MBA">MBA</option>
                          <option value="Other Degree">Other Degree</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Graduation Year
                        </label>
                        <select
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        >
                          <option value="2025">2025 (Final Year / Graduating)</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="Graduated">Graduated (Alumni)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                        Field of Study / Branch
                      </label>
                      <input
                        type="text"
                        value={fieldOfStudy}
                        onChange={(e) => setFieldOfStudy(e.target.value)}
                        placeholder="e.g. Computer Science, AI & ML, Electronics"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Current / Most Recent Role
                        </label>
                        <input
                          type="text"
                          value={currentRole}
                          onChange={(e) => setCurrentRole(e.target.value)}
                          placeholder="e.g. Frontend Developer"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Current Company / Employer
                        </label>
                        <input
                          type="text"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="e.g. Acme Corp or Freelance"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Total Experience
                        </label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        >
                          <option value="0–2 Years (Early Career)">0–2 Years (Early Career)</option>
                          <option value="3–5 Years (Mid-Level)">3–5 Years (Mid-Level)</option>
                          <option value="6–10 Years (Senior)">6–10 Years (Senior)</option>
                          <option value="10+ Years (Staff / Lead / Executive)">10+ Years (Staff / Lead / Executive)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                          Target Role *
                        </label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g. Senior Backend Engineer"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= STEP 3: SKILLS & FOCUS ================= */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#00D2B4]" />
                    <span>Skills &amp; Practice Focus Areas</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Select the technical domains and topics you want EdWorld to calibrate your drills for.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isSelected = selectedDomains[cat.id] !== undefined;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleDomain(cat.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                          isSelected
                            ? "bg-[#13141B] text-white border-[#13141B] shadow-md scale-[1.01]"
                            : "bg-[#F4F6FB] border-[#E8ECF2] text-[#13141B] hover:bg-slate-100"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-xs">{cat.name}</p>
                          <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-slate-300" : "text-[#5E6573]"}`}>
                            {cat.desc}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D7FC51] shrink-0 mt-0.5 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Calibration Level per selected category */}
                <div className="space-y-3 pt-3 border-t border-[#E8ECF2]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8E95A5]">
                    Baseline Skill Level Calibrations:
                  </p>
                  {Object.keys(selectedDomains).map((id) => {
                    const cat = AVAILABLE_CATEGORIES.find((c) => c.id === id);
                    const currentLvl = selectedDomains[id];
                    return (
                      <div key={id} className="p-3 bg-[#F4F6FB] rounded-2xl border border-[#E8ECF2] flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#13141B]">{cat?.name || id}</span>
                        <div className="flex gap-1.5">
                          {[
                            { lvl: 0 as SkillLevel, label: "Beginner" },
                            { lvl: 1 as SkillLevel, label: "Intermediate" },
                            { lvl: 2 as SkillLevel, label: "Advanced" },
                          ].map((item) => (
                            <button
                              key={item.lvl}
                              type="button"
                              onClick={() => setDomainLevel(id, item.lvl)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                                currentLvl === item.lvl
                                  ? "bg-[#7B57FF] text-white shadow-sm"
                                  : "bg-white text-[#5E6573] border border-[#E8ECF2] hover:bg-slate-50"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= STEP 4: GOALS & LINKS ================= */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#FF7A50]" />
                    <span>Goals &amp; Professional Links</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Set your target outcome and optionally link your GitHub, LinkedIn, or portfolio for ATS audits.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Primary Goal on EdWorld
                    </label>
                    <textarea
                      rows={2}
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      placeholder="e.g. Ace upcoming technical interviews and optimize ATS resume keyword score."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      GitHub Profile URL (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                      <Github className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      LinkedIn Profile URL (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                      <Linkedin className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Portfolio / LeetCode URL (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.dev or https://leetcode.com/username"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                      />
                      <Globe className="w-4 h-4 text-[#8E95A5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Action Buttons */}
            <div className="pt-4 border-t border-[#E8ECF2] flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className="px-5 py-3 rounded-2xl bg-[#F4F6FB] hover:bg-[#E8ECF2] text-xs font-bold text-[#13141B] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="px-6 py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 ml-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finalizing Setup...</span>
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <span>Complete &amp; Enter Dashboard</span>
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        <div className="text-center text-xs text-[#8E95A5] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>All settings can be updated anytime from your Profile Settings</span>
        </div>

      </div>
    </div>
  );
}


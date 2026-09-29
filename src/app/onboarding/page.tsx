"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SkillLevel, UserInterest, CareerStage, UserDomainPriority } from "@/lib/types";
import { DOMAIN_CATALOG } from "@/lib/services/career-learning-os";
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
  CheckCircle2,
  Clock,
  Layers,
  Star
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { supabase } from "@/lib/supabase";

interface DomainSelectionState {
  domainId: string;
  domainName: string;
  priority: UserDomainPriority;
  selfLevel: SkillLevel;
}

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

  // Step 3: Multi-Domain Selection with Priorities & Time Allocation
  const [selectedDomains, setSelectedDomains] = useState<Record<string, DomainSelectionState>>({
    swe: { domainId: "swe", domainName: "Software Engineering & Full Stack", priority: "primary", selfLevel: 1 },
    ai_ml: { domainId: "ai_ml", domainName: "Artificial Intelligence & Machine Learning", priority: "secondary", selfLevel: 1 },
    behavioral: { domainId: "behavioral", domainName: "Leadership & Behavioral Mastery", priority: "supporting", selfLevel: 0 },
  });

  const [targetTimeframe, setTargetTimeframe] = useState<number>(6);
  const [dailyHours, setDailyHours] = useState<number>(2);

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
  }, [user, profile]);

  const toggleDomain = (domainId: string, domainName: string) => {
    setSelectedDomains((prev) => {
      const next = { ...prev };
      if (next[domainId]) {
        // Prevent deleting if it's the only one left
        if (Object.keys(next).length > 1) {
          delete next[domainId];
        }
      } else {
        const count = Object.keys(next).length;
        const priority: UserDomainPriority = count === 0 ? "primary" : count === 1 ? "secondary" : "supporting";
        next[domainId] = {
          domainId,
          domainName,
          priority,
          selfLevel: 1
        };
      }
      return next;
    });
  };

  const setDomainPriority = (domainId: string, priority: UserDomainPriority) => {
    setSelectedDomains((prev) => {
      if (!prev[domainId]) return prev;
      return {
        ...prev,
        [domainId]: { ...prev[domainId], priority }
      };
    });
  };

  const setDomainLevel = (domainId: string, selfLevel: SkillLevel) => {
    setSelectedDomains((prev) => {
      if (!prev[domainId]) return prev;
      return {
        ...prev,
        [domainId]: { ...prev[domainId], selfLevel }
      };
    });
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
      // Ensure there is at least one primary domain
      const hasPrimary = Object.values(selectedDomains).some(d => d.priority === "primary");
      if (!hasPrimary) {
        // Auto-assign first as primary
        const firstKey = Object.keys(selectedDomains)[0];
        setSelectedDomains(prev => ({
          ...prev,
          [firstKey]: { ...prev[firstKey], priority: "primary" }
        }));
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

      const interestsArray: UserInterest[] = Object.values(selectedDomains).map((d) => ({
        id: d.domainId,
        name: d.domainName,
        category: d.domainName,
        selfLevel: d.selfLevel,
        effectiveLevel: d.selfLevel,
      }));

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
        targetRole: targetRole.trim() || "Full Stack Software Engineer",
        primaryGoal: primaryGoal.trim(),
        interests: interestsArray,
        onboarding_completed: true,
      };

      await updateUserProfile(profilePayload);

      // Save to Career Learning OS API to build unified roadmap & daily timetable
      if (user?.uid) {
        const domainItems = Object.values(selectedDomains).map(d => ({
          domain_id: d.domainId,
          domain_name: d.domainName,
          priority: d.priority,
          self_level: d.selfLevel,
          effective_level: d.selfLevel
        }));

        await fetch("/api/career-os", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            targetRole: targetRole.trim() || "Full Stack Software Engineer",
            targetIndustry: "Technology & High Growth Startups",
            timeframeMonths: targetTimeframe,
            availableHoursPerDay: dailyHours,
            preferredScheduleBlocks: ["morning", "evening"],
            domains: domainItems,
            regenerateRoadmap: true
          })
        });

        // Also update profiles table explicitly
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
            Configure your personalized Career Learning OS in 4 quick steps.
          </p>
        </div>

        {/* Progress Bar Card */}
        <div className="card-quixel rounded-3xl p-4 sm:p-5 bg-white border border-[#E8ECF2] shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8E95A5]">
            <span className="text-[#13141B] font-sans font-bold">
              {currentStep === 1 && "Step 1: Basic Profile"}
              {currentStep === 2 && "Step 2: Education & Experience"}
              {currentStep === 3 && "Step 3: Multi-Domain Career Track"}
              {currentStep === 4 && "Step 4: Goals & Verified Evidence"}
            </span>
            <span>{currentStep} of {totalSteps} ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-[#F0F2F6] h-2.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D7FC51] via-[#7B57FF] to-[#00D2B4] rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Completed Splash Card */}
        {isCompleted ? (
          <div className="card-quixel rounded-3xl p-8 bg-white border border-[#E8ECF2] shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#E0FAF6] text-[#00D2B4] mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#13141B]">Career Learning OS Ready!</h2>
              <p className="text-xs text-[#5E6573] max-w-md mx-auto">
                We've synthesized your multi-domain learning track, generated your personalized roadmap, and scheduled today's timetable.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#7B57FF] pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to your dashboard...</span>
            </div>
          </div>
        ) : (
          /* Form Step Container */
          <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-lg space-y-6">
            
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs font-bold text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ================= STEP 1: BASIC PROFILE ================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#7B57FF]" />
                    <span>Personal Profile Details</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Your display identity on the EdWorld student networking feed and career leaderboards.
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
                      placeholder="e.g. Adarsh Sharma"
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
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Aspiring Full Stack Developer | Class of 2026"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                      Brief Bio
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a short summary of your background, passions, and career interests..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= STEP 2: EDUCATION & EXPERIENCE ================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#7B57FF]" />
                    <span>Education &amp; Experience Stage</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Select your primary track mode to tailor campus placement prep or industry career acceleration.
                  </p>
                </div>

                {/* Track Switcher Segment */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrackType("student")}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      trackType === "student"
                        ? "bg-[#13141B] text-white border-[#13141B] shadow-md"
                        : "bg-[#F4F6FB] border-[#E8ECF2] text-[#13141B] hover:bg-slate-100"
                    }`}
                  >
                    <GraduationCap className={`w-6 h-6 ${trackType === "student" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
                    <div>
                      <p className="font-bold text-xs">College Student</p>
                      <p className={`text-[11px] ${trackType === "student" ? "text-slate-300" : "text-[#5E6573]"}`}>
                        Campus prep, aptitude drills &amp; starter projects
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTrackType("professional")}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      trackType === "professional"
                        ? "bg-[#13141B] text-white border-[#13141B] shadow-md"
                        : "bg-[#F4F6FB] border-[#E8ECF2] text-[#13141B] hover:bg-slate-100"
                    }`}
                  >
                    <Briefcase className={`w-6 h-6 ${trackType === "professional" ? "text-[#D7FC51]" : "text-[#767E94]"}`} />
                    <div>
                      <p className="font-bold text-xs">Working Professional</p>
                      <p className={`text-[11px] ${trackType === "professional" ? "text-slate-300" : "text-[#5E6573]"}`}>
                        Role transition, system design &amp; ATS tuning
                      </p>
                    </div>
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
                        placeholder="e.g. National Institute of Technology"
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
                          <option value="B.Sc / BCA">B.Sc / BCA</option>
                          <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                          <option value="MCA / M.Sc">MCA / M.Sc</option>
                          <option value="MBA / Business">MBA / Business</option>
                          <option value="High School (11th/12th)">High School (11th/12th)</option>
                          <option value="Other">Other Degree</option>
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

            {/* ================= STEP 3: MULTI-DOMAIN CAREER TRACK ================= */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[#13141B] flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-[#00D2B4]" />
                    <span>Multi-Domain Career Path &amp; Priorities</span>
                  </h2>
                  <p className="text-xs text-[#5E6573]">
                    Select multiple domains (e.g. Software Dev + AI/ML + Security) to generate your unified, de-duplicated roadmap.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {DOMAIN_CATALOG.map((cat) => {
                    const isSelected = !!selectedDomains[cat.id];
                    const selectedMeta = selectedDomains[cat.id];

                    return (
                      <div
                        key={cat.id}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? "bg-[#13141B] text-white border-[#13141B] shadow-md"
                            : "bg-[#F4F6FB] border-[#E8ECF2] text-[#13141B] hover:bg-slate-100"
                        }`}
                      >
                        <div 
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => toggleDomain(cat.id, cat.name)}
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-xs">{cat.name}</p>
                            <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-slate-300" : "text-[#5E6573]"}`}>
                              {cat.description}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ml-2 ${
                            isSelected ? "bg-[#D7FC51] text-[#13141B]" : "border border-[#D1D5DB]"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Priority & Level Controls if selected */}
                        {isSelected && (
                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Priority:</span>
                              <div className="flex gap-1">
                                {(["primary", "secondary", "supporting"] as const).map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setDomainPriority(cat.id, p)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                                      selectedMeta?.priority === p
                                        ? "bg-[#D7FC51] text-[#13141B]"
                                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Level:</span>
                              <div className="flex gap-1">
                                {[
                                  { lvl: 0 as SkillLevel, label: "Beginner" },
                                  { lvl: 1 as SkillLevel, label: "Intermediate" },
                                  { lvl: 2 as SkillLevel, label: "Advanced" }
                                ].map((item) => (
                                  <button
                                    key={item.lvl}
                                    type="button"
                                    onClick={() => setDomainLevel(cat.id, item.lvl)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      selectedMeta?.selfLevel === item.lvl
                                        ? "bg-[#7B57FF] text-white"
                                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                                    }`}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Target Timeframe & Daily Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E8ECF2]">
                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#7B57FF]" />
                      Target Timeframe
                    </label>
                    <select
                      value={targetTimeframe}
                      onChange={(e) => setTargetTimeframe(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    >
                      <option value={3}>3 Months (Fast-Track Placement)</option>
                      <option value={6}>6 Months (Standard Comprehensive)</option>
                      <option value={12}>12 Months (Deep Mastery Track)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00D2B4]" />
                      Daily Available Hours
                    </label>
                    <select
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B]"
                    >
                      <option value={1}>1 Hour / day (Light Pace)</option>
                      <option value={2}>2 Hours / day (Recommended)</option>
                      <option value={3}>3 Hours / day (Accelerated)</option>
                      <option value={4}>4+ Hours / day (Intensive Boot Camp)</option>
                    </select>
                  </div>
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
                    Set your target outcome and link your developer profiles for automatic evidence calibration.
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
                    <span>Building Career Plan...</span>
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <span>Generate Career OS &amp; Enter</span>
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
          <span>Your roadmap &amp; daily timetable adapt automatically based on your real performance</span>
        </div>

      </div>
    </div>
  );
}

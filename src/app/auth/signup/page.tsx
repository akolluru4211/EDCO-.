"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Shield, 
  Lock, 
  AlertTriangle,
  Compass,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  User,
  Sparkles,
  ChevronDown,
  MailCheck,
  KeyRound
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";
import { calculateAgeBandFromDob } from "@/lib/utils";
import { CareerStage } from "@/lib/types";

type StageKey = "junior" | "student" | "pro";

interface StageConfig {
  key: StageKey;
  stageEnum: CareerStage;
  badge: string;
  badgeColor: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  icon: any;
  title: string;
  subtitle: string;
}

const STAGE_CONFIGS: Record<StageKey, StageConfig> = {
  junior: {
    key: "junior",
    stageEnum: "JUNIOR",
    badge: "Ages 13–15",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    accentBorder: "border-violet-500 ring-violet-500",
    accentBg: "bg-violet-600 text-white",
    accentText: "text-violet-700",
    icon: Compass,
    title: "Start Your Junior Journey",
    subtitle: "A safe space to explore skills, curiosity, and your future.",
  },
  student: {
    key: "student",
    stageEnum: "STUDENT",
    badge: "Ages 16–18 • College",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentBorder: "border-emerald-500 ring-emerald-500",
    accentBg: "bg-emerald-600 text-white",
    accentText: "text-emerald-800",
    icon: GraduationCap,
    title: "Build Your Student Career Profile",
    subtitle: "Turn your skills, projects, and goals into a stronger career profile.",
  },
  pro: {
    key: "pro",
    stageEnum: "PROFESSIONAL",
    badge: "Ages 18+ • Career",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    accentBorder: "border-amber-500 ring-amber-500",
    accentBg: "bg-amber-600 text-white",
    accentText: "text-amber-900",
    icon: Briefcase,
    title: "Build Your Career OS",
    subtitle: "Strengthen your professional profile and accelerate your next career move.",
  },
};

const JUNIOR_GRADES = ["Class 8", "Class 9", "Class 10"];
const STUDENT_DEGREES = ["B.Tech / B.E.", "B.Sc", "BCA", "BBA / B.Com", "M.Tech / M.E.", "MCA", "MBA", "Other Degree"];
const STUDENT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year / Final Year", "Graduated"];
const PRO_EXPERIENCE = ["0–2 Years (Early Career)", "3–5 Years (Mid-Level)", "6–10 Years (Senior)", "10+ Years (Lead / Executive)"];
const PRO_INDUSTRIES = ["Technology & Software", "FinTech & Banking", "Healthcare & BioTech", "E-Commerce & Retail", "Consulting & Services", "Other"];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupWithEmail, submitGuardianConsent } = useAuth();
  
  const rawStage = searchParams?.get("stage") || searchParams?.get("track") || "student";
  const initialStage: StageKey = rawStage === "junior" ? "junior" : rawStage === "pro" || rawStage === "professional" ? "pro" : "student";
  
  const [selectedStage, setSelectedStage] = useState<StageKey>(initialStage);

  // Common credentials state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Junior specific state
  const [schoolName, setSchoolName] = useState("");
  const [juniorGrade, setJuniorGrade] = useState("Class 9");
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConsentAgreed, setGuardianConsentAgreed] = useState(false);

  // Student specific state
  const [collegeName, setCollegeName] = useState("");
  const [degree, setDegree] = useState("B.Tech / B.E.");
  const [branch, setBranch] = useState("");
  const [gradYear, setGradYear] = useState("2027");
  const [currentYear, setCurrentYear] = useState("2nd Year");
  const [careerInterests, setCareerInterests] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [leetcode, setLeetcode] = useState("");

  // Professional specific state
  const [currentRole, setCurrentRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("3–5 Years (Mid-Level)");
  const [industry, setIndustry] = useState("Technology & Software");
  const [coreSkills, setCoreSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  // UI state
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    const stage = searchParams?.get("stage") || searchParams?.get("track");
    if (stage === "junior") setSelectedStage("junior");
    else if (stage === "student") setSelectedStage("student");
    else if (stage === "pro" || stage === "professional") setSelectedStage("pro");
  }, [searchParams]);

  const activeStage = STAGE_CONFIGS[selectedStage];
  const IconComponent = activeStage.icon;

  const derivedAgeBand = dob ? calculateAgeBandFromDob(dob) : null;
  const isMinorBand = derivedAgeBand === "13-15" || derivedAgeBand === "16-18";
  const isUnder13 = derivedAgeBand === null && dob !== "";

  // Password strength calculations
  const hasMinLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isPasswordValid = hasMinLen && hasNumber && hasLetter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !dob || !phone) {
      setError("Please complete all required fields including your phone number.");
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (isUnder13) {
      setError("Edworld Co requires users to be at least 13 years of age. Registration is blocked for learners under 13 per DPDP Act / COPPA.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (selectedStage === "junior" && !guardianConsentAgreed) {
      setError("Guardian consent is required for junior learners under 16 per DPDP Act regulations.");
      return;
    }

    if (!termsAgreed) {
      setError("Please review and agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const stageEnum = activeStage.stageEnum;
      const gradeLevel = selectedStage === "junior" ? juniorGrade : selectedStage === "student" ? `${degree} - ${currentYear}` : "Working Professional";
      
      await signupWithEmail(name, email, password, dob, gradeLevel, phone, stageEnum);

      if (selectedStage === "junior" && guardianName && guardianEmail) {
        try {
          await submitGuardianConsent(guardianName, guardianEmail, "parent");
        } catch {
          // Non-blocking for local dev
        }
      }

      // Save custom stage profile data locally for seamless onboarding hydration
      if (typeof window !== "undefined") {
        const stageProfileData = {
          stage: selectedStage,
          schoolName: selectedStage === "junior" ? schoolName : undefined,
          juniorGrade: selectedStage === "junior" ? juniorGrade : undefined,
          collegeName: selectedStage === "student" ? collegeName : undefined,
          degree: selectedStage === "student" ? degree : undefined,
          branch: selectedStage === "student" ? branch : undefined,
          gradYear: selectedStage === "student" ? gradYear : undefined,
          careerInterests: selectedStage === "student" ? careerInterests : undefined,
          github: selectedStage === "student" ? github : undefined,
          linkedin: selectedStage === "student" ? linkedin : selectedStage === "pro" ? linkedin : undefined,
          leetcode: selectedStage === "student" ? leetcode : undefined,
          currentRole: selectedStage === "pro" ? currentRole : undefined,
          experienceYears: selectedStage === "pro" ? experienceYears : undefined,
          industry: selectedStage === "pro" ? industry : undefined,
          coreSkills: selectedStage === "pro" ? coreSkills : undefined,
          careerGoal: selectedStage === "pro" ? careerGoal : undefined,
          portfolioUrl: selectedStage === "pro" ? portfolioUrl : undefined,
          resumeUrl: selectedStage === "pro" ? resumeUrl : undefined,
        };
        localStorage.setItem("edworld_pending_stage_profile", JSON.stringify(stageProfileData));
      }

      setSignupSuccess(true);
      setTimeout(() => {
        if (selectedStage === "junior") {
          router.push("/onboarding/junior");
        } else if (selectedStage === "pro") {
          router.push("/onboarding/professional");
        } else {
          router.push("/onboarding/student");
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-paper text-ink">
        <div className="max-w-md w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-8 space-y-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 border border-forest/20 text-forest flex items-center justify-center mx-auto shadow-sm">
            <MailCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">Account Created!</h1>
            <p className="text-sm text-ink-soft">
              Welcome to Edworld Co, <strong className="text-ink">{name}</strong>. Initializing your {activeStage.badge} workspace.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-paper-soft border border-line text-xs text-ink-muted font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-forest animate-spin" />
            <span>Redirecting to personalized onboarding...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-paper text-ink">
      <div className="max-w-xl w-full bg-paper-raised rounded-3xl border border-line shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <EdworldLogo size="md" showText={false} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 border transition-colors duration-200" style={{
              backgroundColor: selectedStage === "junior" ? "rgba(139, 92, 246, 0.1)" : selectedStage === "pro" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
              borderColor: selectedStage === "junior" ? "rgba(139, 92, 246, 0.3)" : selectedStage === "pro" ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)",
              color: selectedStage === "junior" ? "#7c3aed" : selectedStage === "pro" ? "#b45309" : "#059669"
            }}>
              <IconComponent className="w-3.5 h-3.5" />
              <span>{activeStage.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">{activeStage.title}</h1>
            <p className="text-xs sm:text-sm text-ink-soft mt-1">{activeStage.subtitle}</p>
          </div>
        </div>

        {/* Stage Switcher Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider text-center">
            Select Your Track / Stage
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-paper-soft rounded-2xl border border-line">
            {(Object.keys(STAGE_CONFIGS) as StageKey[]).map((key) => {
              const cfg = STAGE_CONFIGS[key];
              const isSelected = selectedStage === key;
              const StageIcon = cfg.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedStage(key)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? key === "junior"
                        ? "bg-violet-600 text-white shadow-sm"
                        : key === "pro"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-emerald-600 text-white shadow-sm"
                      : "text-ink-soft hover:text-ink hover:bg-paper"
                  }`}
                >
                  <StageIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{key === "junior" ? "Junior School" : key === "student" ? "Student" : "Professional"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corporate Notice */}
        <div className="p-3 rounded-2xl bg-paper-soft border border-line text-[11px] text-ink-muted flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-ink block">Hired Employee or HR Staff?</span>
            <p>
              Your corporate account is provisioned by People Operations with your <code>@edworld.co.in</code> email.{" "}
              <Link href="/auth/login" className="text-forest font-bold hover:underline">
                Sign in directly &rarr;
              </Link>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Credentials */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-ink uppercase tracking-wider pb-1 border-b border-line flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-forest" />
              <span>Basic Account Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-ink">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-forest font-bold bg-forest/10 px-1.5 py-0.5 rounded border border-forest/20">
                    No OTP Required
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-ink">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-ink-muted">Safety</span>
                </div>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-ink">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1.5 h-1">
                    <div className={`h-full flex-1 rounded-full ${hasMinLen ? "bg-forest" : "bg-line"}`} />
                    <div className={`h-full flex-1 rounded-full ${hasNumber ? "bg-forest" : "bg-line"}`} />
                    <div className={`h-full flex-1 rounded-full ${hasLetter ? "bg-forest" : "bg-line"}`} />
                  </div>
                  <div className="flex justify-between text-[10px] text-ink-soft">
                    <span className={hasMinLen ? "text-forest font-semibold" : "text-ink-muted"}>✓ 8+ chars</span>
                    <span className={hasNumber ? "text-forest font-semibold" : "text-ink-muted"}>✓ Number</span>
                    <span className={hasLetter ? "text-forest font-semibold" : "text-ink-muted"}>✓ Letter</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Under 13 Warning */}
          {isUnder13 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Under 13 Policy Restriction</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Edworld Co is designed for learners aged 13 and above. Registration is not permitted for users under 13 per DPDP Act and COPPA regulations.
              </p>
            </div>
          )}

          {/* Age-Band Inference Feedback */}
          {derivedAgeBand && !isUnder13 && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isMinorBand
                  ? "bg-violet-50/50 border-violet-200 text-ink"
                  : "bg-forest/10 border-forest/20 text-ink"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {isMinorBand ? (
                  <Lock className="w-3.5 h-3.5 text-violet-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                )}
                <span>Calibrated Age Band: {derivedAgeBand}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                {isMinorBand
                  ? "Minor safety protections active: Public recruiter discovery is restricted per DPDP Act."
                  : "Career Track active: Full access to ATS benchmarks, mock interviews, and skill certifications."}
              </p>
            </div>
          )}

          {/* Section 2: Stage-Adaptive Specific Fields */}
          {selectedStage === "junior" && (
            <div className="p-4 rounded-2xl bg-violet-50/40 border border-violet-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-violet-600" />
                <span>Junior School Details (Ages 13–15)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. St. Xavier's High School"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Class / Grade</label>
                  <select
                    value={juniorGrade}
                    onChange={(e) => setJuniorGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  >
                    {JUNIOR_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guardian Details & Consent */}
              <div className="pt-2 border-t border-violet-200/60 space-y-3">
                <div className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-violet-600" />
                  <span>Guardian Consent (DPDP Act Compliance)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink">Guardian Name</label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Parent / Legal Guardian Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-ink">Guardian Email</label>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="guardian@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-xs text-ink-soft">
                  <input
                    type="checkbox"
                    checked={guardianConsentAgreed}
                    onChange={(e) => setGuardianConsentAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-line text-violet-600 focus:ring-violet-500"
                  />
                  <span className="leading-snug text-ink">
                    I confirm that I am a parent/guardian or have obtained guardian consent to create this learning account under India DPDP Act & COPPA guidelines.
                  </span>
                </label>
              </div>
            </div>
          )}

          {selectedStage === "student" && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>College & Academic Details (Ages 16–18 • College)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. National Institute of Tech"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Degree Program</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {STUDENT_DEGREES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-xs font-bold text-ink">Branch / Major</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science, ECE..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Current Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    {STUDENT_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Graduation Year</label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink">Primary Career Interests</label>
                <input
                  type="text"
                  value={careerInterests}
                  onChange={(e) => setCareerInterests(e.target.value)}
                  placeholder="e.g. Full-Stack Development, AI/ML, Cloud Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Optional Links Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 hover:underline"
                >
                  <span>{showOptionalFields ? "Hide" : "Add"} Portfolio & Coding Links (Optional)</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptionalFields ? "rotate-180" : ""}`} />
                </button>

                {showOptionalFields && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60">
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="GitHub URL"
                      className="px-3 py-2 rounded-xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="LinkedIn URL"
                      className="px-3 py-2 rounded-xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="url"
                      value={leetcode}
                      onChange={(e) => setLeetcode(e.target.value)}
                      placeholder="LeetCode / Codeforces"
                      className="px-3 py-2 rounded-xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedStage === "pro" && (
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Professional Career OS (Ages 18+ • Career)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Current Job Title / Role</label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Experience Level</label>
                  <select
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    {PRO_EXPERIENCE.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Industry / Domain</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  >
                    {PRO_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-ink">Core Skills</label>
                  <input
                    type="text"
                    value={coreSkills}
                    onChange={(e) => setCoreSkills(e.target.value)}
                    placeholder="e.g. React, Go, System Design, AWS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink">Immediate Career Goal</label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. FAANG Interview Prep, Transition to Engineering Lead, Remote Roles"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Optional Links Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="text-xs font-bold text-amber-900 flex items-center gap-1.5 hover:underline"
                >
                  <span>{showOptionalFields ? "Hide" : "Add"} Portfolio & Resume Links (Optional)</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptionalFields ? "rotate-180" : ""}`} />
                </button>

                {showOptionalFields && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="Portfolio / Website URL"
                      className="px-3 py-2 rounded-xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="Resume / LinkedIn URL"
                      className="px-3 py-2 rounded-xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terms & Privacy Consent */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 rounded border-line text-forest focus:ring-forest"
            />
            <span className="leading-snug">
              I agree to the{" "}
              <Link href="/terms" className="text-forest font-bold underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-forest font-bold underline">Privacy Policy</Link> (v2026.1).
            </span>
          </label>

          <Button
            type="submit"
            disabled={loading || isUnder13}
            variant="primary"
            size="md"
            className="w-full"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            <span>
              {loading
                ? "Creating Account..."
                : selectedStage === "junior"
                ? "Start Junior Learning Track →"
                : selectedStage === "pro"
                ? "Build My Career OS →"
                : "Build Student Profile →"}
            </span>
          </Button>
        </form>

        <p className="text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-forest font-bold hover:underline">
            Sign In &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-ink-muted">Loading signup portal...</div>}>
      <SignupForm />
    </Suspense>
  );
}

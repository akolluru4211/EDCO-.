"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
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
  Info
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";
import Button from "@/components/ui/Button";
import { calculateAgeBandFromDob } from "@/lib/utils";
import { CareerStage } from "@/lib/types";

type StageKey = "student" | "pro";

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
  student: {
    key: "student",
    stageEnum: "STUDENT",
    badge: "College Student & Graduate",
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
    badge: "Working Professional",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    accentBorder: "border-amber-500 ring-amber-500",
    accentBg: "bg-amber-600 text-white",
    accentText: "text-amber-900",
    icon: Briefcase,
    title: "Build Your Career OS",
    subtitle: "Strengthen your professional profile and accelerate your next career move.",
  },
};

const STUDENT_DEGREES = ["B.Tech / B.E.", "B.Sc", "BCA", "BBA / B.Com", "M.Tech / M.E.", "MCA", "MBA", "Other Degree"];
const STUDENT_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year / Final Year", "Graduated"];
const PRO_EXPERIENCE = ["0–2 Years (Early Career)", "3–5 Years (Mid-Level)", "6–10 Years (Senior)", "10+ Years (Lead / Executive)"];
const PRO_INDUSTRIES = ["Technology & Software", "FinTech & Banking", "Healthcare & BioTech", "E-Commerce & Retail", "Consulting & Services", "Other"];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupWithEmail, submitGuardianConsent } = useAuth();
  
  const intentParam = searchParams?.get("intent") || searchParams?.get("stage") || searchParams?.get("track") || "student";
  
  const initialStage: StageKey = 
    intentParam === "pro" || intentParam === "professional" || intentParam === "working_professional" || intentParam === "for-professionals"
      ? "pro" 
      : "student";
  
  const [selectedStage, setSelectedStage] = useState<StageKey>(initialStage);

  // Common credentials state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

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
    const raw = searchParams?.get("intent") || searchParams?.get("stage") || searchParams?.get("track");
    if (raw === "pro" || raw === "professional" || raw === "working_professional" || raw === "for-professionals") {
      setSelectedStage("pro");
    } else {
      setSelectedStage("student");
    }
  }, [searchParams]);

  const activeStage = STAGE_CONFIGS[selectedStage];

  // Age band strictly calculated from entered DOB
  const derivedAgeBand = dob ? calculateAgeBandFromDob(dob) : null;
  const isUnder13 = derivedAgeBand === null && dob !== "";

  // Tone adjustment helper
  const getIntentGreeting = () => {
    switch (intentParam) {
      case "college":
      case "for-college":
        return "Welcome to EdWorld. Let's get your college profile set up.";
      case "working_professional":
      case "for-professionals":
      case "pro":
        return "Welcome to EdWorld. Let's get your professional career profile set up.";
      default:
        return "Create your EdWorld account to start practicing and building your career.";
    }
  };

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
      setError("Edworld Co requires users to be at least 13 years of age.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    if (!termsAgreed) {
      setError("Please review and agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const stageEnum: CareerStage = activeStage.stageEnum;

      const gradeLevel = 
        stageEnum === "STUDENT" 
          ? `${degree} - ${currentYear}` 
          : "Working Professional";

      await signupWithEmail(name, email, password, dob, gradeLevel, phone, stageEnum);

      setSignupSuccess(true);
      
      // Route directly to the verified dashboard matching account profile
      setTimeout(() => {
        if (stageEnum === "STUDENT") {
          router.push("/dashboard");
        } else {
          router.push("/career/dashboard");
        }
      }, 1500);

    } catch (err: any) {
      setError(err?.message || "Could not complete signup. Please try again or use another email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#D7FC51] selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl space-y-4 text-center">
        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <EdworldLogo />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-[#13141B] tracking-tight">
          {activeStage.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#5E6573] max-w-lg mx-auto">
          {getIntentGreeting()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="card-quixel rounded-3xl p-6 sm:p-8 bg-white border border-[#E8ECF2] shadow-xl space-y-6">
          
          {/* Stage Default Switcher */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
              Select Your Profile Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2]">
              {(["student", "pro"] as StageKey[]).map((stg) => {
                const conf = STAGE_CONFIGS[stg];
                const isCurrent = selectedStage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSelectedStage(stg)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? "bg-[#13141B] text-white shadow-sm"
                        : "text-[#5E6573] hover:text-[#13141B] hover:bg-white/60"
                    }`}
                  >
                    <span>{conf.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FF7A50]/20 text-[#FF7A50] text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {signupSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Account created successfully! Preparing your personalized workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Morgan"
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
              />
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
                />
              </div>
            </div>

            {/* DOB (Strict verification) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider">
                  Date of Birth
                </label>
                {derivedAgeBand && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EDE8FD] text-[#7B57FF]">
                    Age Band: {derivedAgeBand}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors"
              />
              <p className="text-[11px] text-[#8E95A5] mt-1">
                Required for safety compliance. Used strictly to configure age-appropriate features.
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#13141B] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters with letters & numbers"
                  className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FB] border border-[#E8ECF2] text-xs text-[#13141B] focus:outline-none focus:border-[#13141B] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-[#13141B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms & Privacy */}
            <label className="flex items-start gap-2.5 text-xs text-[#5E6573] cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
                className="mt-0.5 rounded border-[#E8ECF2]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#13141B] font-bold hover:underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#13141B] font-bold hover:underline" target="_blank">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#13141B] hover:bg-[#2A2C38] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-98 cursor-pointer mt-2"
            >
              <span>{loading ? "Creating Account..." : "Create Account & Get Started"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8ECF2] text-center">
            <p className="text-xs text-[#5E6573]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#13141B] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6FB]" />}>
      <SignupForm />
    </Suspense>
  );
}

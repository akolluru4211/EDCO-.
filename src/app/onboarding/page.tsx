"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AVAILABLE_CATEGORIES } from "@/lib/mock-data";
import { SkillLevel, UserInterest } from "@/lib/types";
import { calculateAgeBandFromDob } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Lock, 
  Sparkles,
  Loader2,
  AlertCircle,
  Compass,
  Briefcase,
  Calendar
} from "lucide-react";
import EdworldLogo from "@/components/ui/EdworldLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isMinor, updateUserProfile, submitGuardianConsent } = useAuth();

  // Auto-route to dedicated stage onboarding if known
  useEffect(() => {
    if (user?.careerStage === "JUNIOR") {
      router.replace("/onboarding/junior");
      return;
    } else if (user?.careerStage === "PROFESSIONAL") {
      router.replace("/onboarding/professional");
      return;
    } else if (user?.careerStage === "STUDENT") {
      router.replace("/onboarding/student");
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("edworld_pending_stage_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.stage === "junior") router.replace("/onboarding/junior");
          else if (parsed.stage === "pro") router.replace("/onboarding/professional");
          else if (parsed.stage === "student") router.replace("/onboarding/student");
        }
      } catch {}
    }
  }, [user?.careerStage, router]);

  // Active DOB State for Google Sign-In or users with missing DOB
  const hasRegisteredDob = Boolean(user?.dob);
  const [dob, setDob] = useState("");
  const [dobSubmitted, setDobSubmitted] = useState(hasRegisteredDob);

  const derivedAgeBand = dobSubmitted
    ? user?.ageBand || (dob ? calculateAgeBandFromDob(dob) : "18+")
    : dob
    ? calculateAgeBandFromDob(dob)
    : null;

  const isJuniorTrack = derivedAgeBand === "13-15";
  const isExplorerTrack = derivedAgeBand === "16-18";
  const isCareerTrack = derivedAgeBand === "18+";

  const [step, setStep] = useState<number>(hasRegisteredDob ? 1 : 0);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, SkillLevel>>({
    swe: 0,
    behavioral: 0,
  });
  const [gradeLevel, setGradeLevel] = useState(
    user?.gradeLevel || user?.grade || (isJuniorTrack ? "Class 9" : isExplorerTrack ? "Class 11" : "College")
  );
  const [primaryGoal, setPrimaryGoal] = useState(
    isJuniorTrack
      ? "Explore technology and science concepts through curious project discovery."
      : isExplorerTrack
      ? "Build foundational coding projects and prepare for upcoming college and internship tracks."
      : "Prepare for competitive full-time industry interviews and optimize ATS resume keyword alignment."
  );
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState<"parent" | "legal_guardian">("parent");
  const [guardianConsentConfirmed, setGuardianConsentConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnder13 = dob !== "" && derivedAgeBand === null;

  const handleDobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dob) {
      setError("Please enter your date of birth to proceed.");
      return;
    }

    if (isUnder13) {
      setError("Edworld Co requires users to be at least 13 years of age. Registration is blocked for learners under 13 per DPDP Act / COPPA.");
      return;
    }

    const calculatedBand = calculateAgeBandFromDob(dob);
    if (!calculatedBand) {
      setError("Invalid date of birth provided.");
      return;
    }

    setSaving(true);
    try {
      // Save DOB and ageBand explicitly
      await updateUserProfile({
        dob,
        ageBand: calculatedBand,
      });

      // Update local storage record
      if (user) {
        const stored = JSON.parse(localStorage.getItem(`edworld_${user.uid}_user`) || "{}");
        localStorage.setItem(
          `edworld_${user.uid}_user`,
          JSON.stringify({ ...stored, dob, ageBand: calculatedBand })
        );
      }

      setDobSubmitted(true);
      setStep(1);
    } catch (err: any) {
      setError(err?.message || "Failed to save date of birth.");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        if (Object.keys(next).length > 1) {
          delete next[id];
        }
      } else {
        next[id] = 0;
      }
      return next;
    });
  };

  const setLevelForInterest = (id: string, level: SkillLevel) => {
    setSelectedInterests((prev) => ({
      ...prev,
      [id]: level,
    }));
  };

  const handleCompleteOnboarding = async () => {
    setError(null);
    const effectiveIsMinor = isJuniorTrack || isExplorerTrack;

    if (effectiveIsMinor && (!guardianName.trim() || !guardianEmail.trim() || !guardianConsentConfirmed)) {
      setError("Please provide complete parent/guardian details and confirm consent authorization.");
      return;
    }

    setSaving(true);
    try {
      if (effectiveIsMinor) {
        await submitGuardianConsent(guardianName.trim(), guardianEmail.trim(), guardianRelationship);
      }

      const interestsArray: UserInterest[] = Object.entries(selectedInterests).map(([id, selfLevel]) => {
        const cat = AVAILABLE_CATEGORIES.find((c) => c.id === id);
        return {
          id,
          name: cat ? cat.name : id,
          category: cat ? cat.name : "General",
          selfLevel: isJuniorTrack ? 0 : selfLevel,
          effectiveLevel: isJuniorTrack ? 0 : selfLevel,
        };
      });

      await updateUserProfile({
        interests: interestsArray,
        primaryGoal,
        gradeLevel,
        isPublic: false,
        isMentor: false,
        mentorTags: [],
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to finalize personalization. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Tracker */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>
              {step === 0
                ? "Identity & Safety Verification"
                : isJuniorTrack
                ? "Junior Track (13-15)"
                : isExplorerTrack
                ? "Explorer Track (16-18)"
                : "Career Track (18+)"}
            </span>
            <span className="text-slate-900">
              Step {step} of {isJuniorTrack ? "2" : "3"}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(15, (step / (isJuniorTrack ? 2 : 3)) * 100)}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 0: Active Explicit DOB Entry (Google Sign-In & Missing DOB Flow) */}
        {step === 0 && (
          <form onSubmit={handleDobSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mb-3 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                What is your Date of Birth?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                This helps us show you the right features and keep younger students safe.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3.5 bg-slate-100 rounded-2xl border border-slate-300 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 italic">
                DOB is never inferred or pulled from third parties. We use it solely for age-band gating and DPDP minor safety compliance.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={saving || !dob}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>{saving ? "Verifying..." : "Continue to Personalization"}</span>
              </Button>
            </div>
          </form>
        )}

        {/* STEP 1: Core Focus Areas & Interests */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Select Your Core Focus Areas
              </h2>
              <p className="text-xs text-slate-500">
                Choose the technical and professional domains you want to practice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_CATEGORIES.map((cat) => {
                const isSelected = selectedInterests[cat.id] !== undefined;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs">{cat.name}</p>
                      <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {cat.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-300 shrink-0 mt-0.5 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                variant="primary"
                size="md"
                disabled={Object.keys(selectedInterests).length === 0}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>Continue</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Goal & Baseline Skill Self-Report (Career Track) or Quests (Junior Track) */}
        {step === 2 && !isJuniorTrack && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Current Level &amp; Primary Goal
              </h2>
              <p className="text-xs text-slate-500">
                Calibrate your baseline difficulty (Level 0: Basics, Level 1: Core, Level 2: Advanced Concurrency/System Design).
              </p>
            </div>

            <div className="space-y-4">
              {Object.keys(selectedInterests).map((id) => {
                const cat = AVAILABLE_CATEGORIES.find((c) => c.id === id);
                const currentLevel = selectedInterests[id];

                return (
                  <div key={id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <p className="font-bold text-xs text-slate-900">{cat?.name || id}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 0 as SkillLevel, label: "Level 0", desc: "Foundational / Basics" },
                        { level: 1 as SkillLevel, label: "Level 1", desc: "Intermediate / Standard" },
                        { level: 2 as SkillLevel, label: "Level 2", desc: "Advanced / System Design" },
                      ].map((lvl) => (
                        <button
                          key={lvl.level}
                          type="button"
                          onClick={() => setLevelForInterest(id, lvl.level)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            currentLevel === lvl.level
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <p className="font-bold text-xs">{lvl.label}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">{lvl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Primary Goal / Target Outcome
              </label>
              <textarea
                rows={2}
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                size="md"
                icon={null}
              >
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (isExplorerTrack) {
                    setStep(3); // Minor consent step
                  } else {
                    handleCompleteOnboarding();
                  }
                }}
                variant="primary"
                size="md"
                disabled={saving}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                <span>{isExplorerTrack ? "Continue to Consent" : saving ? "Saving..." : "Enter Workspace"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 for Junior Track or STEP 3 for Explorer Track: Guardian Consent */}
        {((step === 2 && isJuniorTrack) || (step === 3 && (isJuniorTrack || isExplorerTrack))) && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Parent / Guardian Consent (DPDP Act Compliance)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Guardian Authorization Required
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Because your account is registered for learners under 18 ({user?.ageBand || derivedAgeBand}), India&apos;s DPDP Act and minor safety standards require verified guardian confirmation.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Parent / Guardian Full Name *</label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Parent / Guardian Email Address *</label>
                <input
                  type="email"
                  required
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Relationship</label>
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="parent">Parent</option>
                  <option value="legal_guardian">Legal Guardian</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardianConsentConfirmed}
                  onChange={(e) => setGuardianConsentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px] text-amber-900 leading-relaxed">
                  I confirm that my parent/guardian has authorized my registration on Edworld Co. A verification link will be sent to the guardian email provided above.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <Button
                type="button"
                onClick={() => setStep(step === 3 ? 2 : 1)}
                variant="outline"
                size="md"
                icon={null}
              >
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={handleCompleteOnboarding}
                variant="primary"
                size="md"
                disabled={saving || !guardianConsentConfirmed}
                icon={<Check className="w-4 h-4" />}
              >
                <span>{saving ? "Finalizing..." : "Complete Setup"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

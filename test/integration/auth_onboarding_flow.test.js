const assert = require("assert");

/**
 * Integration Test: Auth, DOB Age-Banding, Parental Consent, and Onboarding Lifecycle
 */

function calculateAge(dobString) {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function determineUserTrack(dobString) {
  const age = calculateAge(dobString);
  if (age < 13) {
    throw new Error("COPPA_RESTRICTED: Under 13 accounts are prohibited.");
  }
  if (age <= 15) {
    return {
      ageBand: "13-15",
      requiresParentalConsent: true,
      allowedFeatures: ["coding_arena", "curated_drills", "learning_os"],
      restrictedFeatures: ["adult_jobs_board", "direct_messaging_unvetted", "employer_studio"]
    };
  }
  if (age <= 17) {
    return {
      ageBand: "16-17",
      requiresParentalConsent: false,
      allowedFeatures: ["coding_arena", "internship_board", "learning_os", "mentor_chats"],
      restrictedFeatures: ["adult_jobs_board", "employer_studio"]
    };
  }
  return {
    ageBand: "18+",
    requiresParentalConsent: false,
    allowedFeatures: ["adult_jobs_board", "full_ats_studio", "interviews", "employer_studio"],
    restrictedFeatures: []
  };
}

function processOnboardingStep(userSession, stepData) {
  const updatedSession = { ...userSession };

  switch (stepData.step) {
    case "dob_verification": {
      const track = determineUserTrack(stepData.dob);
      updatedSession.dob = stepData.dob;
      updatedSession.ageBand = track.ageBand;
      updatedSession.requiresParentalConsent = track.requiresParentalConsent;
      updatedSession.consentStatus = track.requiresParentalConsent ? "pending" : "not_required";
      break;
    }

    case "parental_consent": {
      if (updatedSession.requiresParentalConsent) {
        if (!stepData.parentEmail || !stepData.consentToken) {
          throw new Error("Missing required parental consent credentials");
        }
        updatedSession.consentStatus = "verified";
      }
      break;
    }

    case "career_stage_selection": {
      if (updatedSession.requiresParentalConsent && updatedSession.consentStatus !== "verified") {
        throw new Error("Cannot complete onboarding without verified parental consent");
      }
      updatedSession.careerStage = stepData.careerStage; // e.g. "STUDENT", "COLLEGE", "EARLY_CAREER"
      updatedSession.dreamJob = stepData.dreamJob;
      updatedSession.onboardingCompleted = true;
      break;
    }

    default:
      throw new Error(`Unknown onboarding step: ${stepData.step}`);
  }

  return updatedSession;
}

console.log("=== RUNNING AUTH & ONBOARDING INTEGRATION TESTS ===");

// 1. Adult Flow (18+)
let adultUser = { id: "user-adult-1", email: "adult@edworld.co", onboardingCompleted: false };
adultUser = processOnboardingStep(adultUser, { step: "dob_verification", dob: "2000-01-15" });
assert.strictEqual(adultUser.ageBand, "18+", "Expected 18+ age band for adult birthdate");
assert.strictEqual(adultUser.requiresParentalConsent, false, "Adult must not require parental consent");

adultUser = processOnboardingStep(adultUser, {
  step: "career_stage_selection",
  careerStage: "EARLY_CAREER",
  dreamJob: "Senior Software Engineer"
});
assert.strictEqual(adultUser.onboardingCompleted, true, "Adult onboarding should complete without consent step");
console.log("[PASS] Adult 18+ onboarding lifecycle completed successfully");

// 2. Minor Flow (13-15) with Required Consent Gate
let minorUser = { id: "user-minor-1", email: "minor@edworld.co", onboardingCompleted: false };
minorUser = processOnboardingStep(minorUser, { step: "dob_verification", dob: "2012-05-20" });
assert.strictEqual(minorUser.ageBand, "13-15", "Expected 13-15 age band for minor birthdate");
assert.strictEqual(minorUser.requiresParentalConsent, true, "13-15 age band must require parental consent");
assert.strictEqual(minorUser.consentStatus, "pending", "Initial consent status must be pending");

// Attempt to bypass consent to complete onboarding
assert.throws(() => {
  processOnboardingStep(minorUser, {
    step: "career_stage_selection",
    careerStage: "STUDENT",
    dreamJob: "Junior Coder"
  });
}, /Cannot complete onboarding without verified parental consent/, "Bypass attempt must fail");
console.log("[PASS] Minor consent gate prevented premature onboarding completion");

// Complete consent then finalize
minorUser = processOnboardingStep(minorUser, {
  step: "parental_consent",
  parentEmail: "parent@family.com",
  consentToken: "tok-consent-valid-99"
});
assert.strictEqual(minorUser.consentStatus, "verified", "Consent status must become verified");

minorUser = processOnboardingStep(minorUser, {
  step: "career_stage_selection",
  careerStage: "STUDENT",
  dreamJob: "Junior Coder"
});
assert.strictEqual(minorUser.onboardingCompleted, true, "Minor onboarding completed after verified consent");
console.log("[PASS] Minor 13-15 flow completed with verified parental consent");

// 3. Prohibit Under 13 accounts
assert.throws(() => {
  determineUserTrack("2018-01-01");
}, /COPPA_RESTRICTED/, "Under 13 registration must be strictly rejected");
console.log("[PASS] COPPA under 13 prohibition asserted");

console.log("ALL AUTH & ONBOARDING INTEGRATION TESTS PASSED!\n");

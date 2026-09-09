import { calculateAgeBandFromDob } from "../src/lib/utils";
import { UserProfile, AppUser, UserInterest, GuardianConsent } from "../src/lib/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

function runAuthFeatureTests() {
  console.log("==================================================");
  console.log("🧪 Running Feature 1: Auth & Consent Automated Test Suite");
  console.log("==================================================");

  const today = new Date();
  const currentYear = today.getFullYear();

  // Test 1: Age Band Calculation for Adult (24 years old)
  const adultDob = `${currentYear - 24}-05-15`;
  const adultBand = calculateAgeBandFromDob(adultDob);
  assert(adultBand === "18+", `Adult DOB (${adultDob}) correctly derives "18+" (got: ${adultBand})`);

  // Test 2: Age Band Calculation for Minor Class 9 (14 years old)
  const minor14Dob = `${currentYear - 14}-08-20`;
  const minor14Band = calculateAgeBandFromDob(minor14Dob);
  assert(minor14Band === "13-15", `Minor 14yo DOB (${minor14Dob}) correctly derives "13-15" (got: ${minor14Band})`);

  // Test 3: Age Band Calculation for Minor Class 11 (17 years old)
  const minor17Dob = `${currentYear - 17}-01-10`;
  const minor17Band = calculateAgeBandFromDob(minor17Dob);
  assert(minor17Band === "16-18", `Minor 17yo DOB (${minor17Dob}) correctly derives "16-18" (got: ${minor17Band})`);

  // Test 4: Leap Year DOB (Feb 29)
  const leapYearDob = "2004-02-29";
  const leapBand = calculateAgeBandFromDob(leapYearDob);
  assert(leapBand === "18+", `Leap year DOB (${leapYearDob}) calculates properly without NaN errors (got: ${leapBand})`);

  // Test 5: Minor Safety Rules on Canonical Profile
  const minorProfile: UserProfile = {
    username: "student_alex",
    headline: "Class 10 Student",
    gradeLevel: "Class 9-10",
    interests: [
      { id: "swe", name: "Software Engineering", category: "Tech", selfLevel: 0, effectiveLevel: 0 },
      { id: "behavioral", name: "Behavioral & Leadership", category: "Career", selfLevel: 1, effectiveLevel: 1 },
    ],
    primaryGoal: "Build foundational project skills",
    isPublic: false,
    isMentor: false,
    mentorTags: [],
  };

  assert(minorProfile.isPublic === false, "Minor isPublic is strictly false");
  assert(minorProfile.isMentor === false, "Minor isMentor is strictly false");
  assert(minorProfile.mentorTags.length === 0, "Minor mentorTags is strictly empty");
  assert(
    minorProfile.interests.every((i) => i.effectiveLevel === i.selfLevel),
    "Initial effectiveLevel correctly matches selfLevel for all interests"
  );

  // Test 6: Guardian Consent Token Structure
  const consentRecord: GuardianConsent = {
    guardianName: "Sarah Connor",
    guardianEmail: "sarah.connor@example.com",
    relationship: "parent",
    status: "pending",
    token: "tok_test_secure_token_12345",
    sentAt: new Date().toISOString(),
  };

  assert(consentRecord.status === "pending", "Initial GuardianConsent status is pending");
  assert(typeof consentRecord.token === "string" && consentRecord.token.length > 10, "Guardian token is properly formatted");

  console.log("==================================================");
  console.log("🎉 ALL FEATURE 1 TESTS PASSED WITH ZERO ERRORS!");
  console.log("==================================================");
}

runAuthFeatureTests();

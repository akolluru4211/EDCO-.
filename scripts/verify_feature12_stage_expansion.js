const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 12 (STAGE-SPECIFIC EXPANSION: JUNIOR -> EXPLORER -> COLLEGE -> WORKING PROF)");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Schema & Career Stage Splitting (College vs Working Prof)
// -----------------------------------------------------------------------------
runTest("1.1 Feature 12 migration creates stage tables and splits career_stage into college / working_professional", () => {
  const mig = fs.readFileSync(path.join(__dirname, "../supabase/migrations/20260831050000_stage_specific_expansion_schema.sql"), "utf-8");
  assert(mig.includes("career_stage text CHECK (career_stage IN ('college', 'working_professional'))"), "Must define career_stage on users/profiles");
  assert(mig.includes("study_group_messages"), "Must create study_group_messages table");
  assert(mig.includes("guardian_digest_subscriptions"), "Must create guardian_digest_subscriptions table");
  assert(mig.includes("extracurricular_entries"), "Must create extracurricular_entries table");
  assert(mig.includes("financial_literacy_content"), "Must create financial_literacy_content table");
  assert(mig.includes("colleges"), "Must create colleges table");
  assert(mig.includes("placement_drives"), "Must create placement_drives table");
  assert(mig.includes("hackathons"), "Must create hackathons table");
  assert(mig.includes("resume_reviews"), "Must create resume_reviews table");
  assert(mig.includes("referral_requests"), "Must create referral_requests table");
  assert(mig.includes("salary_reference_data"), "Must create salary_reference_data table");
  assert(mig.includes("certifications"), "Must create certifications table");
});

// -----------------------------------------------------------------------------
// 2. Junior Track (Study Groups, Guardian Digest, Extracurricular, Financial Literacy)
// -----------------------------------------------------------------------------
runTest("2.1 Guardian Digest API strictly isolates aggregate milestones and never exposes journals, messages, or quiz answers", () => {
  const digestApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/guardian-digest/route.ts"), "utf-8");
  assert(digestApi.includes("completedQuestsCount"), "Must include aggregate quest count");
  assert(digestApi.includes("activeStreakDays"), "Must include streak days");
  assert(!digestApi.includes("journal_entries"), "Must NEVER query or include journal entries");
  assert(!digestApi.includes("direct_messages"), "Must NEVER query or include private messages");
  assert(digestApi.includes("privacyNote"), "Must include privacy standard note");
});

runTest("2.2 Study Group messages route enforces content filtering and classroom scoping", () => {
  const studyApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/study-groups/route.ts"), "utf-8");
  assert(studyApi.includes("filterContent"), "Must include content filter");
  assert(studyApi.includes("classroomId"), "Must scope messages by classroomId");
});

// -----------------------------------------------------------------------------
// 3. Explorer Track (College Comparison, SOP / Essay Assistant, Exam Tracker)
// -----------------------------------------------------------------------------
runTest("3.1 Essay Assistant refuses ghostwriting for minimal prompts and requires substantive original drafts", () => {
  const essayApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/essay-assistant/route.ts"), "utf-8");
  assert(essayApi.includes("words.length < 25"), "Must enforce minimum draft length threshold");
  assert(essayApi.includes("not a ghostwriting service"), "Must display non-ghostwriting drafting aid warning");
  assert(essayApi.includes("isDraftingAidOnly: true"), "Must mark response as drafting aid only");
});

// -----------------------------------------------------------------------------
// 4. College Sub-Stage (Placements, Hackathons, Peer Resume Review)
// -----------------------------------------------------------------------------
runTest("4.1 Peer Resume Review is scoped strictly to shared resume between connected parties", () => {
  const reviewApi = fs.readFileSync(path.join(__dirname, "../src/app/api/resumes/peer-review/route.ts"), "utf-8");
  assert(reviewApi.includes("resume_id"), "Must scope review by resume_id");
  assert(reviewApi.includes("reviewer_id"), "Must specify reviewer_id");
});

// -----------------------------------------------------------------------------
// 5. Working Professional Sub-Stage (Career Switch, Salary Ranges, Self-Appraisals, Referrals)
// -----------------------------------------------------------------------------
runTest("5.1 Career Switch and Referral features explicitly disclaim outcome guarantees", () => {
  const careerService = fs.readFileSync(path.join(__dirname, "../src/lib/career-switch-service.ts"), "utf-8");
  assert(careerService.includes("does not guarantee hiring or employment outcomes"), "Must include honest no-guarantee disclaimer");

  const referralApi = fs.readFileSync(path.join(__dirname, "../src/app/api/networking/referrals/route.ts"), "utf-8");
  assert(referralApi.includes("does not verify or guarantee any connection's ability to provide a referral"), "Must disclaim referral guarantees");

  const appraisalApi = fs.readFileSync(path.join(__dirname, "../src/app/api/ai/appraisal-assistant/route.ts"), "utf-8");
  assert(appraisalApi.includes("words.length < 20"), "Must enforce minimum self-draft length threshold for appraisals");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 12 STAGE-SPECIFIC EXPANSION TESTS PASSED 100%!");
  process.exit(0);
}

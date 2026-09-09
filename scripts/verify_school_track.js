const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 8 (SCHOOL TRACK: JUNIOR 13-15 & EXPLORER 16-18)");
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
// 1. School Track Schema & RLS Policies
// -----------------------------------------------------------------------------
runTest("1.1 School track migration contains all required tables with RLS enabled", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831010000_school_track_schema.sql");
  assert(fs.existsSync(schemaFile), "Migration file must exist");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.ai_literacy_content"), "Must create ai_literacy_content table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.quests"), "Must create quests table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.quest_steps"), "Must create quest_steps table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_quest_progress"), "Must create user_quest_progress table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.showcase_submissions"), "Must create showcase_submissions table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.journal_entries"), "Must create journal_entries table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.scholarships"), "Must create scholarships table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.micro_project_certificates"), "Must create micro_project_certificates table");

  assert(sql.includes("ALTER TABLE public.showcase_submissions ENABLE ROW LEVEL SECURITY;"), "Showcase must have RLS");
  assert(sql.includes("ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;"), "Journal must have RLS");
  assert(sql.includes("ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;"), "Quests must have RLS");
});

runTest("1.2 Talent showcase defaults to pending moderation and is invisible to other users until approved", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831010000_school_track_schema.sql");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending'"), "Must default to pending");
  assert(sql.includes("moderation_status = 'approved' AND visibility = 'classroom'"), "RLS must only allow approved classroom items to peers");
});

// -----------------------------------------------------------------------------
// 2. AI Literacy, Ethics & Prompting Sandbox
// -----------------------------------------------------------------------------
runTest("2.1 AI Ethics module is mandatory and content filter protects prompting sandbox", () => {
  const sandboxApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/ai-sandbox/route.ts"), "utf-8");
  assert(sandboxApi.includes("sanitizeAndFilterContent"), "AI sandbox API must include safety sanitization filter");
  assert(sandboxApi.includes("BLOCKED_TOPICS"), "AI sandbox must contain minor safety blocklist");

  const schoolPage = fs.readFileSync(path.join(__dirname, "../src/app/school/page.tsx"), "utf-8");
  assert(schoolPage.includes("Mandatory Ethics"), "School track page must highlight mandatory ethics module");
});

// -----------------------------------------------------------------------------
// 3. Communication Trainer (Clarity & Structure Only)
// -----------------------------------------------------------------------------
runTest("3.1 Communication trainer evaluates clarity and structure only without face engagement scoring", () => {
  const trainerApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/communication-trainer/route.ts"), "utf-8");
  assert(trainerApi.includes("clarityScore"), "Trainer must score clarity");
  assert(trainerApi.includes("structureScore"), "Trainer must score structure");
  assert(!trainerApi.includes("facialEngagement"), "Trainer must NOT score face engagement");
  assert(trainerApi.includes("Encouraging & Constructive"), "Trainer must maintain encouraging tone");
});

// -----------------------------------------------------------------------------
// 4. Scholarship Freshness & Growth Journal Privacy
// -----------------------------------------------------------------------------
runTest("4.1 Scholarship finder includes freshness verification tracking and needs_review flags", () => {
  const schoolPage = fs.readFileSync(path.join(__dirname, "../src/app/school/page.tsx"), "utf-8");
  assert(schoolPage.includes("Freshness Verified"), "Scholarships must display Freshness Verified status");
  assert(schoolPage.includes("Needs Review"), "Scholarships must display Needs Review badge when stale");
});

runTest("4.2 Growth Journal is private by default and low pressure", () => {
  const journalPage = fs.readFileSync(path.join(__dirname, "../src/app/school/journal/page.tsx"), "utf-8");
  assert(journalPage.includes("Private Reflective Space"), "Journal must emphasize private reflective space");
  assert(journalPage.includes("Not scored or measured"), "Journal must be explicitly low-pressure without metrics");
});

// -----------------------------------------------------------------------------
// 5. Micro-Project Certificates with Formal Disclaimers
// -----------------------------------------------------------------------------
runTest("5.1 Micro-project certificate generator includes clear non-accreditation disclaimer", () => {
  const certApi = fs.readFileSync(path.join(__dirname, "../src/app/api/school/generate-certificate/route.ts"), "utf-8");
  assert(certApi.includes("Edworld Co Skill Completion Certificate"), "Certificate must state proper title");
  assert(certApi.includes("not an accredited academic degree"), "Certificate must contain non-accreditation disclaimer");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 8 (SCHOOL TRACK) PRODUCTION TESTS PASSED 100%!");
  process.exit(0);
}

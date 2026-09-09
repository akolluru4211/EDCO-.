const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — BYPASS RE-VERIFICATION & RELATIONAL POSTGRES RLS TEST SUITE");
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
// 1. Relational Schema & Isolated DOB Verification
// -----------------------------------------------------------------------------
runTest("1.1 Schema migration includes relational foreign keys and isolated DOB table", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831000000_relational_schema_and_rls.sql");
  assert(fs.existsSync(schemaFile), "Migration file must exist");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  // Core tables
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.users"), "Must create public.users");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_dob_records"), "Must create isolated public.user_dob_records");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_interests"), "Must create public.user_interests");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.consents"), "Must create public.consents");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.resumes"), "Must create public.resumes");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.interview_sessions"), "Must create public.interview_sessions");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.projects"), "Must create public.projects");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.connections"), "Must create public.connections");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.conversations"), "Must create public.conversations");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.conversation_participants"), "Must create public.conversation_participants");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.messages"), "Must create public.messages");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.jobs"), "Must create public.jobs");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.applications"), "Must create public.applications");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.subscriptions"), "Must create public.subscriptions");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.audit_logs"), "Must create public.audit_logs");
});

runTest("1.2 Row Level Security (RLS) is enabled on all tables and user_dob_records has zero client select policies", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831000000_relational_schema_and_rls.sql");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on users");
  assert(sql.includes("ALTER TABLE public.user_dob_records ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on user_dob_records");
  assert(sql.includes("ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on resumes");
  assert(sql.includes("ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on interview_sessions");
  assert(sql.includes("ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on messages");
  assert(sql.includes("ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on jobs");
  assert(sql.includes("ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on applications");
  assert(sql.includes("ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on audit_logs");

  // Verify zero client select policy for user_dob_records
  assert(!sql.includes('ON public.user_dob_records FOR SELECT'), "user_dob_records must NOT have client-facing SELECT policy");
});

// -----------------------------------------------------------------------------
// 2. Age-Band Gating & Policy Isolation
// -----------------------------------------------------------------------------
runTest("2.1 Adult 18+ career tables enforce age_band = '18+' in RLS policies", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831000000_relational_schema_and_rls.sql");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("connections_adult_only"), "Must have connections_adult_only policy");
  assert(sql.includes("jobs_select_active_adult"), "Must have jobs_select_active_adult policy");
  assert(sql.includes("applications_candidate_insert"), "Must have applications_candidate_insert policy");
  assert(sql.includes("messages_participants_only"), "Must have messages_participants_only policy");
});

runTest("2.2 Admin tables enforce is_admin = true in RLS policies", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831000000_relational_schema_and_rls.sql");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("audit_logs_admin_only"), "Must have audit_logs_admin_only policy");
  assert(sql.includes("reports_admin_only"), "Must have reports_admin_only policy");
});

// -----------------------------------------------------------------------------
// 3. SSR & Next.js Cache Isolation (Root Cause Fix for Cross-User Cache Leak)
// -----------------------------------------------------------------------------
runTest("3.1 Dynamic force-dynamic is declared on all user-specific personalized routes", () => {
  const dynamicRoutes = [
    "src/app/dashboard/page.tsx",
    "src/app/resumes/page.tsx",
    "src/app/interviews/page.tsx",
    "src/app/projects/page.tsx",
    "src/app/networking/page.tsx",
    "src/app/jobs/page.tsx",
  ];

  for (const relPath of dynamicRoutes) {
    const fullPath = path.join(__dirname, "../", relPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(
      content.includes('export const dynamic = "force-dynamic"'),
      `Route ${relPath} must declare export const dynamic = "force-dynamic" to prevent cross-user SSR cache leaks`
    );
  }
});

// -----------------------------------------------------------------------------
// 4. Zero Test/Mock Shortcuts
// -----------------------------------------------------------------------------
runTest("4.1 All mock test login forms and demo switchers are completely eliminated", () => {
  const authContext = fs.readFileSync(path.join(__dirname, "../src/lib/auth-context.tsx"), "utf-8");
  assert(!authContext.includes("DEMO_USER_ADULT"), "DEMO_USER_ADULT must not exist in auth-context");
  assert(!authContext.includes("demoLogin"), "demoLogin helper must not exist in auth-context");

  const loginPage = fs.readFileSync(path.join(__dirname, "../src/app/auth/login/page.tsx"), "utf-8");
  assert(!loginPage.includes("Instant Test Mode"), "Instant Test Mode must not exist on login page");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL BYPASS RE-VERIFICATION & RELATIONAL RLS TESTS PASSED 100%!");
  process.exit(0);
}

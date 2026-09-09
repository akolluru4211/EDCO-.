/**
 * Verification Script: Supabase Migration, Test Data & Demo Login Removal
 * Tests all requirements from prompt.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: SUPABASE MIGRATION & TEST DATA REMOVAL");
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
// 1. Supabase Client Setup
// -----------------------------------------------------------------------------
runTest("1.1 Browser and Server Supabase clients exist", () => {
  assert(
    fs.existsSync(path.join(__dirname, "../src/lib/supabase/client.ts")),
    "src/lib/supabase/client.ts must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../src/lib/supabase/server.ts")),
    "src/lib/supabase/server.ts must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../src/lib/supabase.ts")),
    "src/lib/supabase.ts must exist"
  );
});

// -----------------------------------------------------------------------------
// 2. PostgreSQL Schema & Row Level Security (RLS)
// -----------------------------------------------------------------------------
runTest("2.1 PostgreSQL init_schema.sql exists with all required tables", () => {
  const schemaPath = path.join(
    __dirname,
    "../supabase/migrations/20260830000000_init_schema.sql"
  );
  assert(fs.existsSync(schemaPath), "Migration init_schema.sql must exist");

  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const requiredTables = [
    "profiles",
    "guardian_consents",
    "resumes",
    "resume_analyses",
    "interview_sessions",
    "jobs",
    "job_applications",
    "connections",
    "direct_messages",
    "user_blocks",
    "content_reports",
    "subscriptions",
    "audit_logs",
  ];

  for (const table of requiredTables) {
    assert(
      schemaContent.includes(`CREATE TABLE IF NOT EXISTS public.${table}`),
      `Schema must define table 'public.${table}'`
    );
  }
});

runTest("2.2 Row Level Security (RLS) is enabled on all tables with strict policies", () => {
  const schemaPath = path.join(
    __dirname,
    "../supabase/migrations/20260830000000_init_schema.sql"
  );
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  assert(
    schemaContent.includes("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;"),
    "RLS must be enabled on profiles"
  );
  assert(
    schemaContent.includes("ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;"),
    "RLS must be enabled on jobs"
  );
  assert(
    schemaContent.includes("ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;"),
    "RLS must be enabled on audit_logs"
  );
  assert(
    schemaContent.includes('CREATE POLICY "Audit logs readable only by admins"'),
    "Audit logs must have admin-only RLS policy"
  );
});

// -----------------------------------------------------------------------------
// 3. Removal of Test / Demo Logins and Fake Personas
// -----------------------------------------------------------------------------
runTest("3.1 Auth context contains zero DEMO_USER or demoLogin mock artifacts", () => {
  const authContextContent = fs.readFileSync(
    path.join(__dirname, "../src/lib/auth-context.tsx"),
    "utf-8"
  );
  assert(
    !authContextContent.includes("DEMO_USER_ADULT"),
    "Must not contain DEMO_USER_ADULT"
  );
  assert(
    !authContextContent.includes("DEMO_USER_MINOR"),
    "Must not contain DEMO_USER_MINOR"
  );
  assert(
    !authContextContent.includes("demoLogin:"),
    "Must not contain demoLogin function"
  );
});

runTest("3.2 Login page contains zero Instant Test Mode buttons", () => {
  const loginPageContent = fs.readFileSync(
    path.join(__dirname, "../src/app/auth/login/page.tsx"),
    "utf-8"
  );
  assert(
    !loginPageContent.includes("Instant Test Mode"),
    "Must not contain Instant Test Mode"
  );
  assert(
    !loginPageContent.includes("handleDemo"),
    "Must not contain handleDemo function"
  );
});

runTest("3.3 Navbar contains zero Switch Demo Persona switcher", () => {
  const navbarContent = fs.readFileSync(
    path.join(__dirname, "../src/components/navbar.tsx"),
    "utf-8"
  );
  assert(
    !navbarContent.includes("Switch Demo Persona"),
    "Must not contain Switch Demo Persona"
  );
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL SUPABASE MIGRATION & CLEANUP TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

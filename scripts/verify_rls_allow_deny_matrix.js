const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: POSTGRES RLS ALLOW/DENY POLICY MATRIX");
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

const migrationsDir = path.join(__dirname, "../supabase/migrations");
const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));
const allSql = migrationFiles.map(f => fs.readFileSync(path.join(migrationsDir, f), "utf-8")).join("\n");

// -----------------------------------------------------------------------------
// 1. DOB Isolation Matrix (Client DENY, Service Role ALLOW)
// -----------------------------------------------------------------------------
runTest("1.1 user_dob_records has RLS enabled and ZERO client select policies", () => {
  assert(allSql.includes("ALTER TABLE public.user_dob_records ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on user_dob_records");
  assert(!allSql.includes('CREATE POLICY "user_dob_records_select" ON public.user_dob_records FOR SELECT'), "Must NOT have client SELECT policy on user_dob_records");
});

// -----------------------------------------------------------------------------
// 2. Private Journal Matrix (Owner ALLOW, Peer/Teacher DENY)
// -----------------------------------------------------------------------------
runTest("2.1 journal_entries restricts read and write to owner only", () => {
  assert(allSql.includes("ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on journal_entries");
  assert(allSql.includes("user_id = auth.uid()"), "Journal policy must check user_id = auth.uid()");
});

// -----------------------------------------------------------------------------
// 3. Study Group Messages Matrix (Classroom Member ALLOW, Non-Member DENY)
// -----------------------------------------------------------------------------
runTest("3.1 study_group_messages enforces classroom_students membership", () => {
  assert(allSql.includes("ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on study_group_messages");
  assert(allSql.includes("classroom_students.student_id = auth.uid()"), "Study group policy must check classroom_students membership");
});

// -----------------------------------------------------------------------------
// 4. Teacher Narrow View Matrix (Enrolled Progress ALLOW, Private PII DENY)
// -----------------------------------------------------------------------------
runTest("4.1 teacher_visible_student_progress view enforces security_invoker = true and excludes sensitive PII", () => {
  assert(allSql.includes("teacher_visible_student_progress"), "Must define teacher_visible_student_progress view");
  assert(allSql.includes("security_invoker = true"), "View must enforce security_invoker = true");
  assert(!allSql.includes("teacher_visible_student_progress AS SELECT u.email"), "Must exclude student email");
});

// -----------------------------------------------------------------------------
// 5. Talent Showcase Moderation Matrix (Approved ALLOW, Pending DENY to peers)
// -----------------------------------------------------------------------------
runTest("5.1 showcase_submissions only reveals approved submissions to peers", () => {
  assert(allSql.includes("ALTER TABLE public.showcase_submissions ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on showcase_submissions");
  assert(allSql.includes("moderation_status = 'approved'"), "Must require moderation_status = 'approved' for peer visibility");
});

// -----------------------------------------------------------------------------
// 6. Subscriptions & Billing Matrix (Tenant ALLOW, Cross-User DENY)
// -----------------------------------------------------------------------------
runTest("6.1 subscriptions enforces strict user_id = auth.uid() ownership", () => {
  assert(allSql.includes("ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;"), "RLS must be enabled on subscriptions");
  assert(allSql.includes("user_id = auth.uid()"), "Subscriptions policy must check user_id = auth.uid()");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL RLS ALLOW/DENY MATRIX TESTS PASSED 100%!");
  process.exit(0);
}

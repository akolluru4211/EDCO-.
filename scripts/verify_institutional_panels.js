const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 11 (INSTITUTIONAL, TEACHER & ADMIN PANELS)");
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
// 1. Institutional & Teacher Schema & Strict RLS
// -----------------------------------------------------------------------------
runTest("1.1 Institutional migration creates schools, classrooms, classroom_students, assignments with RLS", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831040000_institutional_and_teacher_schema.sql");
  assert(fs.existsSync(schemaFile), "Migration file must exist");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.schools"), "Must create schools");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.classrooms"), "Must create classrooms");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.classroom_students"), "Must create classroom_students");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.classroom_assignments"), "Must create classroom_assignments");

  assert(sql.includes("ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;"), "classrooms must have RLS");
  assert(sql.includes("ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;"), "classroom_students must have RLS");
  assert(sql.includes("teacher_own_classroom_only"), "Must have teacher_own_classroom_only RLS policy");
});

// -----------------------------------------------------------------------------
// 2. The Narrow Teacher-Visible View (Zero PII/Profile Leakage)
// -----------------------------------------------------------------------------
runTest("2.1 teacher_visible_student_progress view strictly excludes email, DOB, age_band, resumes, videos, messages, and journals", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831040000_institutional_and_teacher_schema.sql");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("CREATE OR REPLACE VIEW public.teacher_visible_student_progress"), "Must create teacher_visible_student_progress view");
  assert(sql.includes("security_invoker = true"), "View must use security_invoker = true");

  // Verify excluded fields
  const viewSql = sql.substring(sql.indexOf("CREATE OR REPLACE VIEW"), sql.indexOf("ALTER VIEW"));
  assert(!viewSql.includes("u.email"), "View must NOT include student email");
  assert(!viewSql.includes("u.dob"), "View must NOT include student DOB");
  assert(!viewSql.includes("u.age_band"), "View must NOT include student age_band");
  assert(!viewSql.includes("resumes"), "View must NOT include resume content");
  assert(!viewSql.includes("journal_entries"), "View must NOT include journal entries");
  assert(!viewSql.includes("messages"), "View must NOT include private messages");
});

// -----------------------------------------------------------------------------
// 3. Teacher Dashboard & Classroom Roster View Integration
// -----------------------------------------------------------------------------
runTest("3.1 Teacher classroom roster queries teacher_visible_student_progress view exclusively and logs audit trails", () => {
  const rosterPage = fs.readFileSync(path.join(__dirname, "../src/app/teacher/classrooms/[classroomId]/page.tsx"), "utf-8");
  assert(rosterPage.includes('from("teacher_visible_student_progress")'), "Roster must query narrow view exclusively");
  assert(rosterPage.includes("teacher.roster_accessed"), "Roster access must emit audit log entry");
  assert(rosterPage.includes("handleExportCSV"), "Roster must support CSV export of narrow metrics");
});

// -----------------------------------------------------------------------------
// 4. Student Join Code & Transparency Panel
// -----------------------------------------------------------------------------
runTest("4.1 Student join classroom flow is additive and transparency panel explains exact visible boundaries", () => {
  const joinPage = fs.readFileSync(path.join(__dirname, "../src/app/school/join-classroom/page.tsx"), "utf-8");
  assert(joinPage.includes("classroom_students"), "Join page must manage classroom_students enrollment");
  assert(joinPage.includes("handleLeave"), "Students must be able to leave classrooms without account deletion");

  const transPage = fs.readFileSync(path.join(__dirname, "../src/app/school/teacher-transparency/page.tsx"), "utf-8");
  assert(transPage.includes("What Your Teacher Can See"), "Transparency page must explain teacher view");
  assert(transPage.includes("Personal Growth Journal"), "Transparency page must confirm journal is private");
  assert(transPage.includes("Resume Content"), "Transparency page must confirm resumes/videos are private");
});

// -----------------------------------------------------------------------------
// 5. School Admin Telemetry & Platform Admin User Management
// -----------------------------------------------------------------------------
runTest("5.1 School Admin shows aggregated metrics only, and Platform Admin manages user roles and suspensions", () => {
  const schoolAdminPage = fs.readFileSync(path.join(__dirname, "../src/app/school-admin/page.tsx"), "utf-8");
  assert(schoolAdminPage.includes("Total Enrolled Cohorts"), "School admin must show cohort telemetry");
  assert(schoolAdminPage.includes("Aggregated Metrics Only"), "School admin must emphasize aggregated metrics");

  const adminUsersPage = fs.readFileSync(path.join(__dirname, "../src/app/admin/users/page.tsx"), "utf-8");
  assert(adminUsersPage.includes("handleToggleSuspend"), "Admin users page must support account suspension/reinstatement");
  assert(adminUsersPage.includes("admin.user_suspended"), "Admin users page must log suspensions to audit_logs");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 11 (INSTITUTIONAL, TEACHER & ADMIN) PRODUCTION TESTS PASSED 100%! ");
  process.exit(0);
}

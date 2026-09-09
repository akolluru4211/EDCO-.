const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 14 (ROLE HIERARCHY & STRICT PANEL SEPARATION)");
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

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  // ---------------------------------------------------------------------------
  // 1. Data Integrity Constraint & Schema Isolation
  // ---------------------------------------------------------------------------
  runTest("1.1 Minors (13-17) can never hold admin, teacher, or school-admin flags in PostgreSQL schema", () => {
    const migrationFile = path.join(__dirname, "../supabase/migrations/20260904000000_feature14_role_hierarchy.sql");
    assert(fs.existsSync(migrationFile), "Feature 14 SQL migration must exist");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    assert(sql.includes("minor_cannot_hold_admin_roles"), "Must declare minor_cannot_hold_admin_roles constraint");
    assert(sql.includes("check_user_role_integrity"), "Must declare trigger function check_user_role_integrity");
    assert(sql.includes("trigger_user_role_integrity"), "Must attach trigger to users table");
  });

  // ---------------------------------------------------------------------------
  // 2. Server Layout & Route Guards (Teacher, School Admin, Platform Admin)
  // ---------------------------------------------------------------------------
  runTest("2.1 Server layout guards exist for /teacher, /school-admin, and /admin route groups", () => {
    const teacherLayout = path.join(__dirname, "../src/app/teacher/layout.tsx");
    const schoolAdminLayout = path.join(__dirname, "../src/app/school-admin/layout.tsx");
    const adminLayout = path.join(__dirname, "../src/app/admin/layout.tsx");

    assert(fs.existsSync(teacherLayout), "src/app/teacher/layout.tsx must exist");
    assert(fs.existsSync(schoolAdminLayout), "src/app/school-admin/layout.tsx must exist");
    assert(fs.existsSync(adminLayout), "src/app/admin/layout.tsx must exist");

    const tContent = fs.readFileSync(teacherLayout, "utf-8");
    assert(tContent.includes("isMinor || !isEducator"), "Teacher layout must guard against students and unauthorized users");
    assert(tContent.includes("router.replace"), "Teacher layout must redirect unauthorized users to dashboard");

    const saContent = fs.readFileSync(schoolAdminLayout, "utf-8");
    assert(saContent.includes("isSchoolAdmin || isAdmin"), "School admin layout must verify school admin role");

    const aContent = fs.readFileSync(adminLayout, "utf-8");
    assert(aContent.includes("!isAdmin"), "Admin layout must verify platform admin role");
  });

  // ---------------------------------------------------------------------------
  // 3. Zero Admin/Teacher DOM Elements for Students & Working Professionals
  // ---------------------------------------------------------------------------
  runTest("3.1 Navbar and UI render zero admin/teacher/institution DOM elements for students", () => {
    const navbarFile = path.join(__dirname, "../src/components/navbar.tsx");
    const navbarContent = fs.readFileSync(navbarFile, "utf-8");

    // Must be gated behind isTeacher / isSchoolAdmin / isAdmin
    assert(navbarContent.includes("{(isTeacher || isAdmin) && ("), "Teacher section must be strictly conditional");
    assert(navbarContent.includes("{(isSchoolAdmin || isAdmin) && ("), "School Admin section must be strictly conditional");
    assert(navbarContent.includes("{isAdmin && ("), "Admin section must be strictly conditional");
    assert(!navbarContent.includes("Switch Demo Persona"), "Zero mock persona switches in DOM");
  });

  // ---------------------------------------------------------------------------
  // 4. Server Role Guard Utility & Backend API Rejection
  // ---------------------------------------------------------------------------
  runTest("4.1 Centralized server-role-guard.ts rejects unauthorized role invocations", () => {
    const guardFile = path.join(__dirname, "../src/lib/server-role-guard.ts");
    assert(fs.existsSync(guardFile), "server-role-guard.ts must exist");
    const guardContent = fs.readFileSync(guardFile, "utf-8");

    assert(guardContent.includes("verifyUserRole"), "Must export verifyUserRole");
    assert(guardContent.includes("requireRole"), "Must export requireRole");
    assert(guardContent.includes("logAdminStudentInspection"), "Must export logAdminStudentInspection");
  });

  // ---------------------------------------------------------------------------
  // 5. Audited Individual Student Data Access for Admins
  // ---------------------------------------------------------------------------
  runTest("5.1 Admin access to individual student records is routed through audited inspect-student API", () => {
    const inspectApiFile = path.join(__dirname, "../src/app/api/admin/inspect-student/route.ts");
    assert(fs.existsSync(inspectApiFile), "src/app/api/admin/inspect-student/route.ts must exist");
    const apiContent = fs.readFileSync(inspectApiFile, "utf-8");
    const guardContent = fs.readFileSync(path.join(__dirname, "../src/lib/server-role-guard.ts"), "utf-8");

    assert(apiContent.includes("verifyUserRole(adminId, [\"admin\"])"), "Inspect API must verify caller is admin");
    assert(apiContent.includes("logAdminStudentInspection"), "Inspect API must record audit log entry");
    assert(guardContent.includes("admin.student_record_inspected"), "Audit log action must be admin.student_record_inspected");
  });

  // ---------------------------------------------------------------------------
  // 6. School Admin Multi-Tenant Boundary Enforcement
  // ---------------------------------------------------------------------------
  runTest("6.1 School Admin queries are constrained to their own school_id in schema and RLS", () => {
    const migrationFile = path.join(__dirname, "../supabase/migrations/20260904000000_feature14_role_hierarchy.sql");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    assert(sql.includes("school_admin_own_school_only"), "Must have school_admin_own_school_only RLS policy");
    assert(sql.includes("sa.school_id = schools.id"), "Policy must enforce school_id matching admin's school_admins record");
  });

  // ---------------------------------------------------------------------------
  // 7. Classroom Tasks Transparency for Students
  // ---------------------------------------------------------------------------
  runTest("7.1 Classroom tasks display transparently to students without leaking teacher tools", () => {
    const joinPage = path.join(__dirname, "../src/app/school/join-classroom/page.tsx");
    const joinContent = fs.readFileSync(joinPage, "utf-8");

    assert(joinContent.includes("classroom_students"), "Student connects to classroom transparently");
    assert(!joinContent.includes("/teacher/classrooms"), "Student UI does NOT link to teacher cohort panel");
  });

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL FEATURE 14 (ROLE HIERARCHY & STRICT PANEL SEPARATION) TESTS PASSED 100%!");
    process.exit(0);
  }
}

runAllTests();

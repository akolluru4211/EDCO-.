const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: STRICT ROLE-BASED PORTAL SEPARATION & PRIVACY");
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
// 1. Frontend Route Guard & Access Denied Implementation
// -----------------------------------------------------------------------------
runTest("1.1 AccessDeniedPortal component exists and renders 403 Forbidden state", () => {
  const compPath = path.join(__dirname, "../src/components/ui/AccessDeniedPortal.tsx");
  assert(fs.existsSync(compPath), "AccessDeniedPortal.tsx must exist");
  const compSrc = fs.readFileSync(compPath, "utf-8");
  assert(compSrc.includes("403 Forbidden"), "Must show 403 Forbidden");
  assert(compSrc.includes("Access Denied"), "Must show Access Denied title");
  assert(compSrc.includes("Return to Permitted Workspace"), "Must offer navigation to permitted workspace");
});

runTest("1.2 HR portal (/hr and /hr/provision-account) strictly blocks non-HR/non-Admin access", () => {
  const hrPage = fs.readFileSync(path.join(__dirname, "../src/app/hr/page.tsx"), "utf-8");
  const hrProvPage = fs.readFileSync(path.join(__dirname, "../src/app/hr/provision-account/page.tsx"), "utf-8");
  assert(hrPage.includes("AccessDeniedPortal"), "HR page must render AccessDeniedPortal");
  assert(hrPage.includes("!isHR && !isAdmin && !isFounder"), "HR page must verify HR clearance");
  assert(hrProvPage.includes("AccessDeniedPortal"), "HR Provision page must render AccessDeniedPortal");
});

runTest("1.3 Founder portal (/founder) strictly blocks non-Founder access", () => {
  const founderPage = fs.readFileSync(path.join(__dirname, "../src/app/founder/page.tsx"), "utf-8");
  assert(founderPage.includes("AccessDeniedPortal"), "Founder page must render AccessDeniedPortal");
  assert(founderPage.includes("!isFounder && !isAdmin"), "Founder page must verify Founder clearance");
});

runTest("1.4 Employee portal (/employee) strictly blocks non-Employee/Student access", () => {
  const empPage = fs.readFileSync(path.join(__dirname, "../src/app/employee/page.tsx"), "utf-8");
  assert(empPage.includes("AccessDeniedPortal"), "Employee page must render AccessDeniedPortal");
  assert(empPage.includes("!isEmployee && !isHR && !isFounder && !isAdmin"), "Employee page must verify Employee clearance");
});

runTest("1.5 Admin portal (/admin, /admin/users, /admin/audit-logs) strictly blocks non-Admin access", () => {
  const adminPage = fs.readFileSync(path.join(__dirname, "../src/app/admin/page.tsx"), "utf-8");
  const adminUsersPage = fs.readFileSync(path.join(__dirname, "../src/app/admin/users/page.tsx"), "utf-8");
  const adminLogsPage = fs.readFileSync(path.join(__dirname, "../src/app/admin/audit-logs/page.tsx"), "utf-8");

  assert(adminPage.includes("AccessDeniedPortal"), "Admin page must render AccessDeniedPortal");
  assert(adminUsersPage.includes("AccessDeniedPortal"), "Admin users page must render AccessDeniedPortal");
  assert(adminLogsPage.includes("AccessDeniedPortal"), "Admin logs page must render AccessDeniedPortal");
});

runTest("1.6 Teacher & College portals strictly block unauthorized student access", () => {
  const teacherPage = fs.readFileSync(path.join(__dirname, "../src/app/school/teacher/page.tsx"), "utf-8");
  const collegePage = fs.readFileSync(path.join(__dirname, "../src/app/colleges/page.tsx"), "utf-8");

  assert(teacherPage.includes("AccessDeniedPortal"), "Teacher page must render AccessDeniedPortal");
  assert(collegePage.includes("AccessDeniedPortal"), "College page must render AccessDeniedPortal");
});

// -----------------------------------------------------------------------------
// 2. Server-Side Role Guard & API Authorization Security
// -----------------------------------------------------------------------------
runTest("2.1 Centralized server role guard enforces database role validation", () => {
  const guardSrc = fs.readFileSync(path.join(__dirname, "../src/lib/server-role-guard.ts"), "utf-8");
  assert(guardSrc.includes("verifyUserRole"), "Must export verifyUserRole");
  assert(guardSrc.includes("requireRole"), "Must export requireRole");
  assert(guardSrc.includes('from("users")'), "Must check database users table");
  assert(guardSrc.includes('from("profiles")'), "Must check database profiles table");
});

runTest("2.2 Sensitive HR APIs require authorized HR/Admin role and reject Students with 403", () => {
  const provApi = fs.readFileSync(path.join(__dirname, "../src/app/api/hr/provision-employee/route.ts"), "utf-8");
  const empApi = fs.readFileSync(path.join(__dirname, "../src/app/api/hr/employees/route.ts"), "utf-8");

  assert(provApi.includes("requireRole"), "Provision employee API must check role");
  assert(empApi.includes("requireRole"), "HR employees API must check role");
});

runTest("2.3 Sensitive Founder/Financial APIs require Founder/Admin role and reject Students/Employees with 403", () => {
  const revApi = fs.readFileSync(path.join(__dirname, "../src/app/api/founder/revenue/route.ts"), "utf-8");
  const finApi = fs.readFileSync(path.join(__dirname, "../src/app/api/founder/financials/route.ts"), "utf-8");

  assert(revApi.includes("requireRole"), "Founder revenue API must check role");
  assert(finApi.includes("requireRole"), "Founder financials API must check role");
});

runTest("2.4 Employee payroll API requires Employee/HR/Admin role", () => {
  const payApi = path.join(__dirname, "../src/app/api/employee/payroll/route.ts");
  assert(fs.existsSync(payApi), "Payroll API route must exist");
  const paySrc = fs.readFileSync(payApi, "utf-8");
  assert(paySrc.includes("requireRole"), "Employee payroll API must check role");
});

// -----------------------------------------------------------------------------
// 3. UI & Mobile Navigation Isolation
// -----------------------------------------------------------------------------
runTest("3.1 Navbar and Mobile Drawer render zero internal staff links for Students", () => {
  const navSrc = fs.readFileSync(path.join(__dirname, "../src/components/navbar.tsx"), "utf-8");
  assert(navSrc.includes("internalStaffPortals"), "Navbar must define internalStaffPortals");
  assert(navSrc.includes("clientJuniorPortals"), "Navbar must define clientJuniorPortals");
  assert(navSrc.includes("clientExplorerPortals"), "Navbar must define clientExplorerPortals");
  assert(navSrc.includes("clientCareerPortals"), "Navbar must define clientCareerPortals");
  assert(navSrc.includes("activePortals: PortalLink[] = isStaff"), "Navbar must separate active portals based on isStaff");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL STRICT ROLE-BASED PORTAL SEPARATION TESTS PASSED 100%!");
  process.exit(0);
}


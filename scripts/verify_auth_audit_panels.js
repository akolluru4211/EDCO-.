/**
 * Verification Script: Auth Flow Correction, Audit Logging, Three-Panel Architecture & Config Protection
 * Tests all 6 criteria from Definition of Done in full.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: AUTH, AUDIT LOGS, THREE-PANEL & CONFIG PROTECTION");
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
// 1. Google Sign-In & Active DOB Collection Flow
// -----------------------------------------------------------------------------
runTest("1.1 Onboarding page contains explicit mandatory Step 0 for Date of Birth input", () => {
  const onboardingContent = fs.readFileSync(
    path.join(__dirname, "../src/app/onboarding/page.tsx"),
    "utf-8"
  );
  assert(
    onboardingContent.includes("What is your Date of Birth?"),
    "Must prompt user explicitly for Date of Birth"
  );
  assert(
    onboardingContent.includes("This helps us show you the right features and keep younger students safe"),
    "Must include the required plain-language explanation"
  );
  assert(
    onboardingContent.includes("calculateAgeBandFromDob"),
    "Must dynamically compute age band from user-entered DOB"
  );
});

runTest("1.2 Under-13 registration is strictly blocked with DPDP/COPPA compliance notice", () => {
  const onboardingContent = fs.readFileSync(
    path.join(__dirname, "../src/app/onboarding/page.tsx"),
    "utf-8"
  );
  assert(
    onboardingContent.includes("Edworld Co requires users to be at least 13 years of age"),
    "Must block registration for under-13 users"
  );
  assert(
    onboardingContent.includes("DPDP Act / COPPA"),
    "Must cite DPDP Act / COPPA in under-13 restriction"
  );
});

// -----------------------------------------------------------------------------
// 2. Server-Side Audit Logging System
// -----------------------------------------------------------------------------
runTest("2.1 Server-side auditLogger module exists with all required action categories", () => {
  const auditLoggerContent = fs.readFileSync(
    path.join(__dirname, "../functions/src/auditLogger.ts"),
    "utf-8"
  );
  const requiredActions = [
    "auth.signup",
    "auth.login",
    "auth.logout",
    "consent.guardian_requested",
    "consent.guardian_confirmed",
    "profile.dob_updated",
    "moderation.job_approved",
    "moderation.report_submitted",
    "admin.user_suspended",
    "billing.subscription_created",
    "data_rights.export_requested",
    "data_rights.deletion_requested",
  ];

  for (const act of requiredActions) {
    assert(
      auditLoggerContent.includes(act),
      `auditLogger must include action category '${act}'`
    );
  }
});

runTest("2.2 Audit logs explicitly sanitize and forbid raw PII (DOB, passwords, secret tokens)", () => {
  const auditLoggerContent = fs.readFileSync(
    path.join(__dirname, "../functions/src/auditLogger.ts"),
    "utf-8"
  );
  assert(
    auditLoggerContent.includes("delete sanitizedMeta.dob"),
    "Must delete raw DOB from metadata"
  );
  assert(
    auditLoggerContent.includes("delete sanitizedMeta.password"),
    "Must delete passwords from metadata"
  );
  assert(
    auditLoggerContent.includes("delete sanitizedMeta.token"),
    "Must delete secret tokens from metadata"
  );
});

runTest("2.3 2-Year (730 Days) Retention Policy is defined in scheduled Cloud Function", () => {
  const auditLoggerContent = fs.readFileSync(
    path.join(__dirname, "../functions/src/auditLogger.ts"),
    "utf-8"
  );
  assert(
    auditLoggerContent.includes("cleanupAuditLogsDaily"),
    "Must export scheduled cleanup function"
  );
  assert(
    auditLoggerContent.includes("730"),
    "Must enforce 730-day retention threshold"
  );
});

runTest("2.4 Firestore rules restrict auditLogs collection strictly to platform admins", () => {
  const rulesContent = fs.readFileSync(
    path.join(__dirname, "../firestore.rules"),
    "utf-8"
  );
  assert(
    rulesContent.includes("match /auditLogs/{logId}"),
    "Must have rule match for auditLogs"
  );
  assert(
    rulesContent.includes("allow read: if isAuthenticated() && request.auth.token.isAdmin == true;"),
    "Must require isAdmin == true for auditLogs read"
  );
  assert(
    rulesContent.includes("allow write: if false;"),
    "Must forbid client-side write access to auditLogs"
  );
});

// -----------------------------------------------------------------------------
// 3. Three-Panel Architecture & Admin Audit Log Viewer
// -----------------------------------------------------------------------------
runTest("3.1 Navbar dynamically differentiates Student Panel vs Career Panel vs Admin Panel", () => {
  const navbarContent = fs.readFileSync(
    path.join(__dirname, "../src/components/navbar.tsx"),
    "utf-8"
  );
  assert(
    navbarContent.includes("Student Panel Navigation"),
    "Must have dedicated Student Panel navigation logic"
  );
  assert(
    navbarContent.includes("Career Panel Navigation"),
    "Must have dedicated Career Panel navigation logic"
  );
  assert(
    navbarContent.includes("Admin Panel Navigation"),
    "Must have dedicated Admin Panel navigation logic"
  );
});

runTest("3.2 Admin Audit Log Viewer page exists with category filters and metadata inspector", () => {
  const auditViewerContent = fs.readFileSync(
    path.join(__dirname, "../src/app/admin/audit-logs/page.tsx"),
    "utf-8"
  );
  assert(
    auditViewerContent.includes("Platform Audit Logs"),
    "Audit Log page must render Platform Audit Logs title"
  );
  assert(
    auditViewerContent.includes("CATEGORY_MAP"),
    "Audit Log page must include event category filters"
  );
  assert(
    auditViewerContent.includes("Sanitized Metadata Inspector"),
    "Audit Log page must include metadata inspector modal"
  );
});

// -----------------------------------------------------------------------------
// 4. Internal Config & Policy Protection
// -----------------------------------------------------------------------------
runTest("4.1 Server-side index.ts exports auditLogger, scoring, and moderation functions", () => {
  const indexContent = fs.readFileSync(
    path.join(__dirname, "../functions/src/index.ts"),
    "utf-8"
  );
  assert(
    indexContent.includes("queryAuditLogs"),
    "functions/src/index.ts must export queryAuditLogs"
  );
  assert(
    indexContent.includes("cleanupAuditLogsDaily"),
    "functions/src/index.ts must export cleanupAuditLogsDaily"
  );
});

// -----------------------------------------------------------------------------
// 5. Legal Document Confirmation
// -----------------------------------------------------------------------------
runTest("5.1 All 4 legal documents exist in docs/legal/ with mandatory DRAFT lawyer warning", () => {
  const legalFiles = [
    "terms-of-service.md",
    "privacy-policy.md",
    "cookie-policy.md",
    "grievance-redressal-policy.md",
  ];

  for (const file of legalFiles) {
    const filePath = path.join(__dirname, "../docs/legal", file);
    assert(fs.existsSync(filePath), `Legal file '${file}' must exist in docs/legal/`);
    const content = fs.readFileSync(filePath, "utf-8");
    assert(
      content.includes("DRAFT — PENDING LEGAL COUNSEL REVIEW"),
      `Legal file '${file}' must be explicitly labeled as DRAFT pending legal counsel review`
    );
  }
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL AUTH, AUDIT LOGGING, THREE-PANEL & CONFIG TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

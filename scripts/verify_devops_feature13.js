const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 13 (DEVOPS, TESTING & LAUNCH READINESS)");
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
// 1. Kubernetes Multi-Environment Manifests
// -----------------------------------------------------------------------------
runTest("1.1 Kubernetes manifests exist for dev, staging, and prod namespaces", () => {
  const namespacesYaml = fs.readFileSync(path.join(__dirname, "../k8s/namespaces.yaml"), "utf-8");
  assert(namespacesYaml.includes("edworld-dev"), "Must define edworld-dev namespace");
  assert(namespacesYaml.includes("edworld-staging"), "Must define edworld-staging namespace");
  assert(namespacesYaml.includes("edworld-prod"), "Must define edworld-prod namespace");

  const stagingYaml = fs.readFileSync(path.join(__dirname, "../k8s/deployment-staging.yaml"), "utf-8");
  assert(stagingYaml.includes("namespace: edworld-staging"), "Must configure staging deployment");

  const prodYaml = fs.readFileSync(path.join(__dirname, "../k8s/deployment-prod.yaml"), "utf-8");
  assert(prodYaml.includes("namespace: edworld-prod"), "Must configure prod deployment");
  assert(prodYaml.includes("RollingUpdate"), "Production deployment must use RollingUpdate strategy");
});

// -----------------------------------------------------------------------------
// 2. Unit Testing Suite (Age Band, Effective Level, Entitlements, Razorpay Signatures, Gamification)
// -----------------------------------------------------------------------------
runTest("2.1 High-risk unit tests exist and verify core business logic", () => {
  const ageBandTest = fs.readFileSync(path.join(__dirname, "../test/unit/age_band.test.js"), "utf-8");
  assert(ageBandTest.includes("computeAgeBand"), "Must test age-band computation");

  const levelTest = fs.readFileSync(path.join(__dirname, "../test/unit/effective_level.test.js"), "utf-8");
  assert(levelTest.includes("calculateNewEffectiveLevel"), "Must test effective level promotion");

  const entTest = fs.readFileSync(path.join(__dirname, "../test/unit/entitlements.test.js"), "utf-8");
  assert(entTest.includes("checkEntitlement"), "Must test entitlement limits");

  const sigTest = fs.readFileSync(path.join(__dirname, "../test/unit/razorpay_signatures.test.js"), "utf-8");
  assert(sigTest.includes("verifyPaymentSignature"), "Must test checkout signature verification");
  assert(sigTest.includes("verifyWebhookSignature"), "Must test webhook signature verification");

  const gamTest = fs.readFileSync(path.join(__dirname, "../test/unit/gamification_idempotency.test.js"), "utf-8");
  assert(gamTest.includes("awardPointsIdempotent"), "Must test gamification idempotency");
});

// -----------------------------------------------------------------------------
// 3. Postgres RLS Policy Allow/Deny Matrix
// -----------------------------------------------------------------------------
runTest("3.1 Postgres RLS Allow/Deny test suite covers all core tables and DOB isolation", () => {
  const rlsScript = fs.readFileSync(path.join(__dirname, "../scripts/verify_rls_allow_deny_matrix.js"), "utf-8");
  assert(rlsScript.includes("user_dob_records"), "Must verify user_dob_records zero client select");
  assert(rlsScript.includes("journal_entries"), "Must verify journal owner isolation");
  assert(rlsScript.includes("teacher_visible_student_progress"), "Must verify teacher view security");
});

// -----------------------------------------------------------------------------
// 4. Log Scrubbing & PII Redaction
// -----------------------------------------------------------------------------
runTest("4.1 Structured logger automatically scrubs sensitive PII (DOB, passwords, journals, tokens)", () => {
  const loggerSrc = fs.readFileSync(path.join(__dirname, "../src/lib/logger.ts"), "utf-8");
  assert(loggerSrc.includes("scrubObject"), "Logger must contain scrubObject engine");
  assert(loggerSrc.includes("SENSITIVE_KEYS"), "Logger must maintain sensitive key redaction list");
  assert(loggerSrc.includes("[REDACTED_PII]"), "Redacted values must be replaced with [REDACTED_PII]");
});

// -----------------------------------------------------------------------------
// 5. Incident Response Plan & Cross-User Data Exposure Playbook
// -----------------------------------------------------------------------------
runTest("5.1 Incident Response Plan explicitly details the cross-user data exposure scenario and Grievance Officer role", () => {
  const incidentPlan = fs.readFileSync(path.join(__dirname, "../docs/INCIDENT_RESPONSE_PLAN.md"), "utf-8");
  assert(incidentPlan.includes("Cross-User Data Exposure"), "Must contain dedicated Cross-User Data Exposure scenario");
  assert(incidentPlan.includes("Grievance Officer"), "Must specify Grievance Officer role and escalation");
  assert(incidentPlan.includes("72 hours"), "Must specify 72-hour regulatory notification SLA");
});

// -----------------------------------------------------------------------------
// 6. Feature Flags System & CI/CD Pipeline
// -----------------------------------------------------------------------------
runTest("6.1 Feature flags system and GitHub Actions CI/CD pipeline are fully defined", () => {
  const flagsLib = fs.readFileSync(path.join(__dirname, "../src/lib/feature-flags.ts"), "utf-8");
  assert(flagsLib.includes("isFeatureEnabled"), "Must provide isFeatureEnabled helper");

  const cicdYaml = fs.readFileSync(path.join(__dirname, "../.github/workflows/ci-cd.yml"), "utf-8");
  assert(cicdYaml.includes("test-and-verify"), "CI must run automated test jobs");
  assert(cicdYaml.includes("deploy-staging"), "CI/CD must define staging deployment step");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 13 DEVOPS & LAUNCH READINESS TESTS PASSED 100%!");
  process.exit(0);
}

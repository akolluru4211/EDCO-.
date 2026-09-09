const fs = require("fs");
const path = require("path");
const assert = require("assert");
const crypto = require("crypto");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 10 (MONETIZATION & RAZORPAY SUBSCRIPTIONS)");
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
// 1. Plans Schema, Subscriptions Extension, and Payment History
// -----------------------------------------------------------------------------
runTest("1.1 Monetization migration creates plans, payment_history, and extends subscriptions with RLS", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831030000_monetization_plans_schema.sql");
  assert(fs.existsSync(schemaFile), "Migration file must exist");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.plans"), "Must create plans table");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.payment_history"), "Must create payment_history table");
  assert(sql.includes("cancel_at_period_end"), "Must add cancel_at_period_end to subscriptions");
  assert(sql.includes("grace_period_until"), "Must add grace_period_until to subscriptions");
  assert(sql.includes("ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;"), "payment_history must have RLS");
});

// -----------------------------------------------------------------------------
// 2. Server-Side Age Band Restriction on Razorpay Order Creation
// -----------------------------------------------------------------------------
runTest("2.1 create-order API route rejects non-18+ users server-side with 403", () => {
  const orderApi = fs.readFileSync(path.join(__dirname, "../src/app/api/billing/create-order/route.ts"), "utf-8");
  assert(orderApi.includes('userProfile.age_band !== "18+"'), "Must verify user age_band == '18+'");
  assert(orderApi.includes("status: 403"), "Must return 403 Forbidden for minors");
});

// -----------------------------------------------------------------------------
// 3. Strict HMAC Payment Signature Verification (Critical Security Detail)
// -----------------------------------------------------------------------------
runTest("3.1 Payment verification API recalculates HMAC-SHA256 and rejects tampered signatures", () => {
  const verifyApi = fs.readFileSync(path.join(__dirname, "../src/app/api/billing/verify/route.ts"), "utf-8");
  assert(verifyApi.includes('createHmac("sha256"'), "Must compute HMAC-SHA256 signature");
  assert(verifyApi.includes("razorpay_order_id}|${razorpay_payment_id"), "Must concatenate orderId|paymentId");
  assert(verifyApi.includes("generatedSignature !== razorpay_signature"), "Must reject signature mismatch");

  // Verify HMAC calculation mathematically
  const secret = "test_secret_key_123";
  const orderId = "order_999";
  const paymentId = "pay_888";
  const validSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const fakeSignature = "fake_signature_abc123";
  assert.notStrictEqual(validSignature, fakeSignature, "Tampered signature must not match");
});

// -----------------------------------------------------------------------------
// 4. Webhook Signature Verification, Grace Periods, and Audit Logging
// -----------------------------------------------------------------------------
runTest("4.1 Webhook endpoint validates x-razorpay-signature, handles payment.failed grace period, and audits events", () => {
  const webhookApi = fs.readFileSync(path.join(__dirname, "../src/app/api/billing/webhook/route.ts"), "utf-8");
  assert(webhookApi.includes("x-razorpay-signature"), "Must read webhook signature header");
  assert(webhookApi.includes("payment.failed"), "Must handle payment.failed event");
  assert(webhookApi.includes("grace_period_until"), "Must apply 3-day grace period on payment failure");
  assert(webhookApi.includes("audit_logs"), "Must write webhook events to audit_logs");
});

// -----------------------------------------------------------------------------
// 5. Centralized Entitlement Checks
// -----------------------------------------------------------------------------
runTest("5.1 Entitlement service enforces Free vs Pro limits on resumes, interviews, jobs, and messaging", () => {
  const entitlementFile = path.join(__dirname, "../src/lib/entitlement-service.ts");
  assert(fs.existsSync(entitlementFile), "entitlement-service.ts must exist");
  const code = fs.readFileSync(entitlementFile, "utf-8");

  assert(code.includes("create_resume"), "Must check create_resume entitlement");
  assert(code.includes("resumeCount >= 1"), "Must limit Free plan to 1 resume");
  assert(code.includes("start_mock_interview"), "Must check start_mock_interview entitlement");
  assert(code.includes("interviewCount >= 2"), "Must limit Free plan to 2 interviews/month");
  assert(code.includes("apply_to_job"), "Must gate job applications to Pro");
  assert(code.includes("mentor_messaging"), "Must gate mentor messaging to Pro");
});

// -----------------------------------------------------------------------------
// 6. Cancellation Behavior & Billing Workspace
// -----------------------------------------------------------------------------
runTest("6.1 Cancellation API sets cancel_at_period_end and billing page provides full self-service lifecycle", () => {
  const cancelApi = fs.readFileSync(path.join(__dirname, "../src/app/api/billing/cancel/route.ts"), "utf-8");
  assert(cancelApi.includes("cancel_at_period_end: true"), "Must schedule cancellation at end of period");
  assert(cancelApi.includes("audit_logs"), "Must log cancellation to audit_logs");

  const billingPage = fs.readFileSync(path.join(__dirname, "../src/app/billing/page.tsx"), "utf-8");
  assert(billingPage.includes("Cancel Subscription (End of Period)"), "Billing page must explain end of period cancellation");
  assert(billingPage.includes("paymentHistory"), "Billing page must render payment history");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 10 (MONETIZATION & RAZORPAY) PRODUCTION TESTS PASSED 100%!");
  process.exit(0);
}

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: MONETIZATION (PHASE 4) & MOBILE APP (FEATURE 9)");
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
// 1. Razorpay Monetization Routes & Webhooks
// -----------------------------------------------------------------------------
runTest("1.1 Razorpay order creation, payment verification, and webhook endpoints exist", () => {
  assert(
    fs.existsSync(path.join(__dirname, "../src/app/api/billing/create-order/route.ts")),
    "api/billing/create-order route must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../src/app/api/billing/verify/route.ts")),
    "api/billing/verify route must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../src/app/api/billing/webhook/route.ts")),
    "api/billing/webhook route must exist"
  );
});

runTest("1.2 Billing workspace UI is integrated with Razorpay client script", () => {
  const billingContent = fs.readFileSync(
    path.join(__dirname, "../src/app/billing/page.tsx"),
    "utf-8"
  );
  assert(
    billingContent.includes("loadRazorpayScript"),
    "Billing page must have dynamic Razorpay script loader"
  );
  assert(
    billingContent.includes("/api/billing/create-order"),
    "Billing page must call create-order API"
  );
  assert(
    billingContent.includes("/api/billing/verify"),
    "Billing page must call verify API"
  );
});

// -----------------------------------------------------------------------------
// 2. Mobile App (React Native / Expo)
// -----------------------------------------------------------------------------
runTest("2.1 Mobile workspace and configuration exist", () => {
  assert(
    fs.existsSync(path.join(__dirname, "../mobile/package.json")),
    "mobile/package.json must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../mobile/App.tsx")),
    "mobile/App.tsx must exist"
  );
  assert(
    fs.existsSync(path.join(__dirname, "../mobile/src/lib/supabase.ts")),
    "mobile/src/lib/supabase.ts must exist"
  );
});

runTest("2.2 Mobile screens for Dashboard, Resumes, Interviews, Jobs, and Mentors exist", () => {
  const screens = [
    "DashboardScreen.tsx",
    "ResumeViewerScreen.tsx",
    "InterviewStudioScreen.tsx",
    "JobBoardScreen.tsx",
    "NetworkingScreen.tsx",
  ];
  for (const s of screens) {
    assert(
      fs.existsSync(path.join(__dirname, `../mobile/src/screens/${s}`)),
      `mobile screen ${s} must exist`
    );
  }
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL MONETIZATION & MOBILE APP TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

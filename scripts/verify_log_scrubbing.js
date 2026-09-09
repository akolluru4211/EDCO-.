const assert = require("assert");

const SENSITIVE_KEYS = new Set([
  "dob",
  "date_of_birth",
  "password",
  "password_hash",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "service_role_key",
  "razorpay_signature",
  "credit_card",
  "journal_content",
  "transcript",
  "direct_message_content",
  "video_url"
]);

function scrubObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj.map(scrubObject);
  if (typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        cleaned[key] = "[REDACTED_PII]";
      } else if (typeof value === "object" && value !== null) {
        cleaned[key] = scrubObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return obj;
}

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: AUTOMATED LOG SCRUBBING & PII LEAK PREVENTION");
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
// 1. Log Scrubbing Tests
// -----------------------------------------------------------------------------
runTest("1.1 DOB and Date of Birth fields are automatically redacted", () => {
  const sensitivePayload = {
    userId: "usr_123",
    dob: "2010-05-15",
    date_of_birth: "2010-05-15",
    ageBand: "13-15"
  };

  const scrubbed = scrubObject(sensitivePayload);
  assert.strictEqual(scrubbed.dob, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.date_of_birth, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.ageBand, "13-15"); // Non-sensitive
});

runTest("1.2 Passwords, auth tokens, and secret keys are automatically redacted", () => {
  const authPayload = {
    email: "student@school.edu",
    password: "SuperSecretPassword123!",
    token: "jwt.header.payload.signature",
    secret: "razorpay_secret_live_9999"
  };

  const scrubbed = scrubObject(authPayload);
  assert.strictEqual(scrubbed.password, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.token, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.secret, "[REDACTED_PII]");
});

runTest("1.3 Video URLs, transcripts, and private journal contents are automatically redacted", () => {
  const studentMediaPayload = {
    sessionId: "sess_456",
    video_url: "https://blob.storage/private_minor_video.mp4",
    transcript: "I solved this problem using recursion...",
    journal_content: "Today was stressful but I completed my math quest."
  };

  const scrubbed = scrubObject(studentMediaPayload);
  assert.strictEqual(scrubbed.video_url, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.transcript, "[REDACTED_PII]");
  assert.strictEqual(scrubbed.journal_content, "[REDACTED_PII]");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL LOG SCRUBBING TESTS PASSED 100%!");
  process.exit(0);
}

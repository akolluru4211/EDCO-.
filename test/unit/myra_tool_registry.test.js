const assert = require("assert");

// Mocking the authoritative Myra Tool Registry
const MYRA_TOOL_REGISTRY = {
  update_resume_section: { name: "update_resume_section", isReadOnly: false, requiresConfirmation: true },
  start_mock_interview: { name: "start_mock_interview", isReadOnly: false, requiresConfirmation: true },
  schedule_task: { name: "schedule_task", isReadOnly: false, requiresConfirmation: true },
  reorder_dashboard: { name: "reorder_dashboard", isReadOnly: false, requiresConfirmation: true },
  search_jobs: { name: "search_jobs", isReadOnly: true, requiresConfirmation: false },
  update_dashboard_goal: { name: "update_dashboard_goal", isReadOnly: false, requiresConfirmation: true }
};

const OFF_LIMITS_PATTERNS = [
  /apply.*job/i,
  /submit.*application/i,
  /withdraw.*application/i,
  /change.*password/i,
  /update.*email/i,
  /send.*connection/i,
  /post.*message/i,
  /charge.*payment/i,
  /subscribe/i,
  /delete.*account/i,
  /reset.*credentials/i
];

function isToolAllowed(toolName) {
  return typeof toolName === "string" && toolName in MYRA_TOOL_REGISTRY;
}

function isActionOffLimits(userPrompt) {
  if (!userPrompt || typeof userPrompt !== "string") return false;
  return OFF_LIMITS_PATTERNS.some((pattern) => pattern.test(userPrompt));
}

function validateToolProposal(toolName, userPrompt) {
  if (isActionOffLimits(userPrompt)) {
    return {
      allowed: false,
      reason: "Security Refusal: Autonomous user-facing actions or credential modifications are strictly off-limits."
    };
  }

  if (!isToolAllowed(toolName)) {
    return {
      allowed: false,
      reason: `Security Refusal: Tool '${toolName}' is not on the server-side allowlist.`
    };
  }

  const def = MYRA_TOOL_REGISTRY[toolName];
  return {
    allowed: true,
    isReadOnly: def.isReadOnly,
    requiresConfirmation: def.requiresConfirmation
  };
}

console.log("=== RUNNING MYRA TOOL REGISTRY UNIT TESTS ===");

// 1. Assert allowlisted tools pass validation
const validSearch = validateToolProposal("search_jobs", "Can you search for React jobs in Bengaluru?");
assert.strictEqual(validSearch.allowed, true, "search_jobs should be allowed");
assert.strictEqual(validSearch.isReadOnly, true, "search_jobs must be read-only");
assert.strictEqual(validSearch.requiresConfirmation, false, "search_jobs does not require confirmation modal");
console.log("[PASS] Allowlisted read-only tool validation passed");

const validUpdate = validateToolProposal("update_resume_section", "Please add Next.js to my skills");
assert.strictEqual(validUpdate.allowed, true, "update_resume_section should be allowed");
assert.strictEqual(validUpdate.isReadOnly, false, "update_resume_section is a write tool");
assert.strictEqual(validUpdate.requiresConfirmation, true, "update_resume_section MUST require confirmation");
console.log("[PASS] Allowlisted write tool confirmation requirement passed");

// 2. Assert unlisted tools are strictly blocked
const illegalTool = validateToolProposal("delete_database_row", "delete row");
assert.strictEqual(illegalTool.allowed, false, "Unlisted tool must be blocked");
assert.ok(illegalTool.reason.includes("not on the server-side allowlist"), "Reason must mention server allowlist");
console.log("[PASS] Unlisted tool rejection test passed");

// 3. Assert off-limits actions are strictly blocked (e.g. Autonomous applying or payments)
const applyPrompt = validateToolProposal("search_jobs", "Apply to all software engineer jobs for me immediately");
assert.strictEqual(applyPrompt.allowed, false, "Autonomous apply request must be blocked");
assert.ok(applyPrompt.reason.includes("Security Refusal"), "Must issue security refusal");
console.log("[PASS] Autonomous job application request blocked");

const passwordPrompt = validateToolProposal("update_dashboard_goal", "change my password to admin123");
assert.strictEqual(passwordPrompt.allowed, false, "Credential modification must be blocked");
assert.ok(passwordPrompt.reason.includes("Security Refusal"), "Must issue security refusal");
console.log("[PASS] Credential modification request blocked");

console.log("ALL MYRA TOOL REGISTRY UNIT TESTS PASSED SUCCESSFULLY!\n");

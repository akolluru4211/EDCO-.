const assert = require("assert");

function checkEntitlement(feature, plan, currentUsage) {
  const limits = {
    free: {
      resumes: 1,
      mock_interviews_per_month: 2,
      can_apply_to_jobs: false,
      can_message_mentors: false
    },
    pro: {
      resumes: 9999,
      mock_interviews_per_month: 9999,
      can_apply_to_jobs: true,
      can_message_mentors: true
    }
  };

  const planLimits = limits[plan] || limits.free;

  if (feature === "create_resume") {
    return (currentUsage.resumesCount || 0) < planLimits.resumes;
  }
  if (feature === "mock_interview") {
    return (currentUsage.interviewsThisMonth || 0) < planLimits.mock_interviews_per_month;
  }
  if (feature === "apply_job") {
    return planLimits.can_apply_to_jobs;
  }
  if (feature === "message_mentor") {
    return planLimits.can_message_mentors;
  }
  return false;
}

console.log("Running Entitlement Limits Unit Tests...");

// Test 1: Free user with 0 resumes can create resume
assert.strictEqual(checkEntitlement("create_resume", "free", { resumesCount: 0 }), true);

// Test 2: Free user with 1 resume cannot create a second resume
assert.strictEqual(checkEntitlement("create_resume", "free", { resumesCount: 1 }), false);

// Test 3: Pro user with 5 resumes can create more resumes
assert.strictEqual(checkEntitlement("create_resume", "pro", { resumesCount: 5 }), true);

// Test 4: Free user cannot apply to jobs directly
assert.strictEqual(checkEntitlement("apply_job", "free", {}), false);

// Test 5: Pro user can apply to jobs directly
assert.strictEqual(checkEntitlement("apply_job", "pro", {}), true);

console.log("✅ All Entitlement Limits unit tests passed!");

const assert = require("assert");

function calculateNewEffectiveLevel(currentEffectiveLevel, interviewScore) {
  if (interviewScore >= 80) {
    return Math.min(2, currentEffectiveLevel + 1);
  }
  return currentEffectiveLevel;
}

console.log("Running Effective Level Adjustment Unit Tests...");

// Test 1: Level 0 scoring 85% -> Promotes to Level 1
assert.strictEqual(calculateNewEffectiveLevel(0, 85), 1);

// Test 2: Level 1 scoring 92% -> Promotes to Level 2 (Max)
assert.strictEqual(calculateNewEffectiveLevel(1, 92), 2);

// Test 3: Level 2 scoring 95% -> Remains at Level 2 (Max Cap)
assert.strictEqual(calculateNewEffectiveLevel(2, 95), 2);

// Test 4: Level 0 scoring 65% -> Remains at Level 0
assert.strictEqual(calculateNewEffectiveLevel(0, 65), 0);

console.log("✅ All Effective Level unit tests passed!");

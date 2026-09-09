const assert = require("assert");

// Simulated In-Memory Point Events Store
const pointEventsDB = new Set();
let userPointsBalance = 0;

function awardPointsIdempotent({ userId, sourceFeature, sourceId, points }) {
  const idempotencyKey = `${userId}_${sourceFeature}_${sourceId}`;

  // Double-award prevention check
  if (pointEventsDB.has(idempotencyKey)) {
    return {
      awarded: false,
      reason: "ALREADY_AWARDED",
      pointsAwarded: 0,
      currentBalance: userPointsBalance
    };
  }

  pointEventsDB.add(idempotencyKey);
  userPointsBalance += points;

  return {
    awarded: true,
    pointsAwarded: points,
    currentBalance: userPointsBalance
  };
}

console.log("Running Gamification Idempotency Unit Tests...");

// 1. Initial Award
const res1 = awardPointsIdempotent({
  userId: "user-123",
  sourceFeature: "mock_interview",
  sourceId: "session-abc",
  points: 50
});
assert.strictEqual(res1.awarded, true);
assert.strictEqual(res1.currentBalance, 50);

// 2. Duplicate Award Attempt (Should be prevented)
const res2 = awardPointsIdempotent({
  userId: "user-123",
  sourceFeature: "mock_interview",
  sourceId: "session-abc",
  points: 50
});
assert.strictEqual(res2.awarded, false);
assert.strictEqual(res2.reason, "ALREADY_AWARDED");
assert.strictEqual(res2.currentBalance, 50, "Balance must not increase on duplicate call");

// 3. Different session award
const res3 = awardPointsIdempotent({
  userId: "user-123",
  sourceFeature: "mock_interview",
  sourceId: "session-xyz",
  points: 50
});
assert.strictEqual(res3.awarded, true);
assert.strictEqual(res3.currentBalance, 100);

console.log("✅ All Gamification Idempotency unit tests passed!");

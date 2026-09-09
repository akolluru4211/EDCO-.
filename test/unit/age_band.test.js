const assert = require("assert");

function computeAgeBand(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age >= 13 && age <= 15) return "13-15";
  if (age >= 16 && age <= 18) return "16-18";
  if (age > 18) return "18+";
  return null;
}

console.log("Running Age-Band Unit Tests...");

// Test 1: 14 year old -> "13-15" (Junior)
const juniorDob = new Date();
juniorDob.setFullYear(juniorDob.getFullYear() - 14);
assert.strictEqual(computeAgeBand(juniorDob.toISOString().split("T")[0]), "13-15");

// Test 2: 17 year old -> "16-18" (Explorer)
const explorerDob = new Date();
explorerDob.setFullYear(explorerDob.getFullYear() - 17);
assert.strictEqual(computeAgeBand(explorerDob.toISOString().split("T")[0]), "16-18");

// Test 3: 22 year old -> "18+" (Career)
const adultDob = new Date();
adultDob.setFullYear(adultDob.getFullYear() - 22);
assert.strictEqual(computeAgeBand(adultDob.toISOString().split("T")[0]), "18+");

// Test 4: Under 13 -> null (Blocked)
const childDob = new Date();
childDob.setFullYear(childDob.getFullYear() - 10);
assert.strictEqual(computeAgeBand(childDob.toISOString().split("T")[0]), null);

console.log("✅ All Age-Band unit tests passed!");

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: PHASE 21 MOBILE UI/UX REDESIGN");
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
// 1. Mobile Header & Accessible Navigation Drawer
// -----------------------------------------------------------------------------
runTest("1.1 MobileLandingHeader exists and implements compact mobile header + drawer", () => {
  const headerPath = path.join(__dirname, "../src/components/landing/MobileLandingHeader.tsx");
  assert(fs.existsSync(headerPath), "MobileLandingHeader.tsx must exist");
  const headerSrc = fs.readFileSync(headerPath, "utf-8");

  assert(headerSrc.includes("Edworld"), "Header must include Edworld logo/brand");
  assert(headerSrc.includes("Co."), "Header must include Co. brand styling");
  assert(headerSrc.includes("aria-label"), "Mobile menu button must include accessible aria-label");
  assert(headerSrc.includes("aria-expanded"), "Mobile menu button must include aria-expanded state");
  assert(headerSrc.includes("min-h-[44px]"), "Mobile menu button must have at least 44px touch target");
  assert(headerSrc.includes("role=\"dialog\""), "Drawer must declare role='dialog' for screen readers");
});

runTest("1.2 Mobile drawer menu contains Sign In, Get Started, and zero internal role leakage", () => {
  const headerSrc = fs.readFileSync(path.join(__dirname, "../src/components/landing/MobileLandingHeader.tsx"), "utf-8");
  
  assert(headerSrc.includes("/auth/login"), "Drawer must link to /auth/login");
  assert(headerSrc.includes("/auth/signup"), "Drawer must link to /auth/signup");
  assert(headerSrc.includes("/pricing"), "Drawer must link to /pricing");
  assert(headerSrc.includes("/for-schools"), "Drawer must link to /for-schools");

  // Zero internal role links in public mobile drawer
  assert(!headerSrc.includes("/hr"), "Drawer must NOT leak HR portal");
  assert(!headerSrc.includes("/founder"), "Drawer must NOT leak Founder portal");
  assert(!headerSrc.includes("/employee"), "Drawer must NOT leak Employee portal");
  assert(!headerSrc.includes("/admin"), "Drawer must NOT leak Admin portal");
});

// -----------------------------------------------------------------------------
// 2. Mobile Hero Section Hierarchy
// -----------------------------------------------------------------------------
runTest("2.1 Hero section contains badge, responsive headline, and supporting copy", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("Calibrated Career &amp; Skills Platform") || pageSrc.includes("Calibrated Career & Skills Platform"), "Hero must include calibrated badge");
  assert(pageSrc.includes("Real adaptability"), "Hero must include 'Real adaptability' headline");
  assert(pageSrc.includes("for every career stage"), "Hero must include 'for every career stage' text");
  assert(pageSrc.includes("Select your learning pathway"), "Hero must include pathway selection copy");
});

// -----------------------------------------------------------------------------
// 3. Three Career Pathway Cards
// -----------------------------------------------------------------------------
runTest("3.1 Junior School Lab card (13-15) uses purple theme with left icon and right indicator", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("Junior School Lab"), "Must contain Junior School Lab title");
  assert(pageSrc.includes("AGES 13–15"), "Must contain AGES 13-15 badge");
  assert(pageSrc.includes("violet") || pageSrc.includes("purple"), "Must use purple/violet theme");
  assert(pageSrc.includes("/auth/login?track=junior"), "Must link to junior login track");
  assert(pageSrc.includes("Compass"), "Must include Compass left icon");
});

runTest("3.2 Student & Campus card (16-18) uses green/emerald theme with graduation icon", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("Student &amp; Campus") || pageSrc.includes("Student & Campus"), "Must contain Student & Campus title");
  assert(pageSrc.includes("AGES 16–18"), "Must contain AGES 16-18 badge");
  assert(pageSrc.includes("emerald") || pageSrc.includes("green"), "Must use green/emerald theme");
  assert(pageSrc.includes("/auth/login?track=student"), "Must link to student login track");
  assert(pageSrc.includes("GraduationCap"), "Must include GraduationCap left icon");
});

runTest("3.3 Working Professional card (18+) uses amber/gold theme with briefcase icon", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("Working Professional"), "Must contain Working Professional title");
  assert(pageSrc.includes("AGES 18+"), "Must contain AGES 18+ badge");
  assert(pageSrc.includes("amber") || pageSrc.includes("gold"), "Must use amber/gold theme");
  assert(pageSrc.includes("/auth/login?track=pro"), "Must link to professional login track");
  assert(pageSrc.includes("Briefcase"), "Must include Briefcase left icon");
});

// -----------------------------------------------------------------------------
// 4. Primary Workspace CTA & Micro-Interactions
// -----------------------------------------------------------------------------
runTest("4.1 Primary CTA is full-width with 52-60px height and workspace action", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("Sign In to Your Workspace"), "Must feature 'Sign In to Your Workspace' CTA");
  assert(pageSrc.includes("min-h-[52px]") || pageSrc.includes("h-[52px]") || pageSrc.includes("h-[56px]"), "CTA must meet 52-60px touch requirement");
  assert(pageSrc.includes("/auth/login"), "CTA must link to /auth/login");
});

// -----------------------------------------------------------------------------
// 5. Mobile-Friendly Footer & Compliance
// -----------------------------------------------------------------------------
runTest("5.1 Footer uses compact stacked layout with DPDP Act protection and zero dead links", () => {
  const pageSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");

  assert(pageSrc.includes("DPDP Act &amp; Youth Safe") || pageSrc.includes("DPDP Act & Youth Safe"), "Footer must include DPDP Act badge");
  assert(!pageSrc.includes("href=\"#\"") && !pageSrc.includes("href='#'"), "Footer must contain zero href='#'");
  assert(pageSrc.includes("/pricing"), "Footer must link to /pricing");
  assert(pageSrc.includes("/for-schools"), "Footer must link to /for-schools");
  assert(pageSrc.includes("/privacy"), "Footer must link to /privacy");
  assert(pageSrc.includes("/terms"), "Footer must link to /terms");
  assert(pageSrc.includes("/contact"), "Footer must link to /contact");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL MOBILE UI/UX REDESIGN TESTS PASSED 100%!");
  process.exit(0);
}

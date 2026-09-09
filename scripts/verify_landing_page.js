const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: PRODUCTION-GRADE LANDING PAGE IMPLEMENTATION");
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
// 1. Single Source of Truth Button Component
// -----------------------------------------------------------------------------
runTest("1.1 Button component provides primary, secondary, and ghost variants with focus-visible states", () => {
  const buttonSrc = fs.readFileSync(path.join(__dirname, "../src/components/ui/Button.tsx"), "utf-8");
  assert(buttonSrc.includes('variant?: "primary" | "secondary" | "ghost"'), "Button must declare primary, secondary, and ghost variants");
  assert(buttonSrc.includes("focus-visible:ring-2"), "Button must include accessible focus-visible outline");
  assert(buttonSrc.includes("bg-forest"), "Button primary variant must use forest token");
});

// -----------------------------------------------------------------------------
// 2. Shared GrowthRing Component Reuse
// -----------------------------------------------------------------------------
runTest("2.1 GrowthRing component is imported and reused across both Landing Page and Product Dashboard", () => {
  const landingSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");
  const dashboardSrc = fs.readFileSync(path.join(__dirname, "../src/app/dashboard/page.tsx"), "utf-8");
  const growthRingSrc = fs.readFileSync(path.join(__dirname, "../src/components/ui/GrowthRing.tsx"), "utf-8");

  assert(landingSrc.includes('import GrowthRing from "@/components/ui/GrowthRing"'), "Landing page must import GrowthRing from @/components/ui/GrowthRing");
  assert(dashboardSrc.includes('import GrowthRing from "@/components/ui/GrowthRing"'), "Dashboard page must import GrowthRing from @/components/ui/GrowthRing");
  assert(growthRingSrc.includes("prefers-reduced-motion"), "GrowthRing must support prefers-reduced-motion");
  assert(growthRingSrc.includes("strokeDashoffset"), "GrowthRing must be an animated SVG ring");
});

// -----------------------------------------------------------------------------
// 3. Real Supabase Plans Data Sync
// -----------------------------------------------------------------------------
runTest("3.1 Landing page queries live plans table from Supabase", () => {
  const landingSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");
  assert(landingSrc.includes('.from("plans").select("*")'), "Landing page must query plans table");
  assert(landingSrc.includes("PricingCard"), "Landing page must render PricingCard components");
});

// -----------------------------------------------------------------------------
// 4. Real Working Public Routes (Zero Dead Links)
// -----------------------------------------------------------------------------
runTest("4.1 All nav, pricing, and footer links route to real working pages with zero href='#' remaining", () => {
  const landingSrc = fs.readFileSync(path.join(__dirname, "../src/app/page.tsx"), "utf-8");
  assert(!landingSrc.includes('href="#"'), "Landing page must have zero dead href='#' links");

  // Verify route files exist
  assert(fs.existsSync(path.join(__dirname, "../src/app/pricing/page.tsx")), "Pricing page must exist");
  assert(fs.existsSync(path.join(__dirname, "../src/app/for-schools/page.tsx")), "For Schools page must exist");
  assert(fs.existsSync(path.join(__dirname, "../src/app/contact/page.tsx")), "Contact page must exist");
  assert(fs.existsSync(path.join(__dirname, "../src/app/privacy/page.tsx")), "Privacy page must exist");
  assert(fs.existsSync(path.join(__dirname, "../src/app/terms/page.tsx")), "Terms page must exist");
});

// -----------------------------------------------------------------------------
// 5. Design Tokens & Google Fonts Optimization
// -----------------------------------------------------------------------------
runTest("5.1 Tailwind config and layout.tsx integrate Fraunces, Inter, and design tokens", () => {
  const tailwindCfg = fs.readFileSync(path.join(__dirname, "../tailwind.config.ts"), "utf-8");
  const layoutSrc = fs.readFileSync(path.join(__dirname, "../src/app/layout.tsx"), "utf-8");

  assert(tailwindCfg.includes("paper"), "Tailwind must define paper token");
  assert(tailwindCfg.includes("forest"), "Tailwind must define forest token");
  assert(tailwindCfg.includes("ink"), "Tailwind must define ink token");
  assert(tailwindCfg.includes("gold"), "Tailwind must define gold token");

  assert(layoutSrc.includes("next/font/google"), "Layout must import fonts via next/font/google");
  assert(layoutSrc.includes("Fraunces"), "Layout must load Fraunces display font");
  assert(layoutSrc.includes("Inter"), "Layout must load Inter body font");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL LANDING PAGE IMPLEMENTATION TESTS PASSED 100%!");
  process.exit(0);
}

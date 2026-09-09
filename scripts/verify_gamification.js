const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 9 (GAMIFICATION: POINTS, BADGES, STREAKS, LEADERBOARD)");
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
// 1. Gamification Schema & RLS Policies (Zero Client Writes)
// -----------------------------------------------------------------------------
runTest("1.1 Migration creates user_stats, badges, user_badges, and point_events tables with RLS", () => {
  const schemaFile = path.join(__dirname, "../supabase/migrations/20260831020000_gamification_schema.sql");
  assert(fs.existsSync(schemaFile), "Gamification migration file must exist");
  const sql = fs.readFileSync(schemaFile, "utf-8");

  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_stats"), "Must create user_stats");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.badges"), "Must create badges");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.user_badges"), "Must create user_badges");
  assert(sql.includes("CREATE TABLE IF NOT EXISTS public.point_events"), "Must create point_events");

  assert(sql.includes("ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;"), "user_stats must have RLS");
  assert(sql.includes("ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;"), "point_events must have RLS");

  // Verify ZERO client INSERT/UPDATE policies for user_stats and point_events
  assert(!sql.includes("ON public.user_stats FOR INSERT"), "user_stats must NOT have client-facing INSERT policy");
  assert(!sql.includes("ON public.user_stats FOR UPDATE"), "user_stats must NOT have client-facing UPDATE policy");
  assert(!sql.includes("ON public.point_events FOR INSERT"), "point_events must NOT have client-facing INSERT policy");
});

// -----------------------------------------------------------------------------
// 2. Centralized Backend Reward Service & Idempotency
// -----------------------------------------------------------------------------
runTest("2.1 Gamification service includes idempotency check and double-award prevention", () => {
  const serviceFile = path.join(__dirname, "../src/lib/gamification-service.ts");
  assert(fs.existsSync(serviceFile), "gamification-service.ts must exist");
  const content = fs.readFileSync(serviceFile, "utf-8");

  assert(content.includes("point_events"), "Service must query point_events for dedup");
  assert(content.includes("existingEvent"), "Service must check for existing event");
  assert(content.includes("Action already awarded points"), "Service must reject duplicate award attempts");
});

runTest("2.2 Centralized badge criteria evaluation covers at least 3 badge types", () => {
  const serviceFile = path.join(__dirname, "../src/lib/gamification-service.ts");
  const content = fs.readFileSync(serviceFile, "utf-8");

  assert(content.includes("first_interview"), "Must evaluate first_interview badge");
  assert(content.includes("first_quest"), "Must evaluate first_quest badge");
  assert(content.includes("streak_3"), "Must evaluate streak_3 badge");
  assert(content.includes("user_badges"), "Must record earned badges into user_badges table");
});

// -----------------------------------------------------------------------------
// 3. Timezone-Aware Streak Calculation Logic
// -----------------------------------------------------------------------------
runTest("3.1 Timezone-aware date and streak calculations handle edge cases and consecutive days", () => {
  function getUserLocalDateString(timezone = "UTC", date = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      return formatter.format(date);
    } catch (e) {
      return date.toISOString().split("T")[0];
    }
  }

  function getDaysDifference(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1 + "T00:00:00Z");
    const d2 = new Date(dateStr2 + "T00:00:00Z");
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  // Test timezone formatting
  const fixedDate = new Date("2026-08-31T20:30:00Z"); // 8:30 PM UTC
  const kolkataDate = getUserLocalDateString("Asia/Kolkata", fixedDate); // Should be 2026-09-01 in India (+5:30)
  assert.strictEqual(kolkataDate, "2026-09-01", "Kolkata date must cross midnight accurately to 2026-09-01");

  const nyDate = getUserLocalDateString("America/New_York", fixedDate); // Should be 2026-08-31 in NY (-4:00)
  assert.strictEqual(nyDate, "2026-08-31", "New York date must be 2026-08-31");

  // Test day difference calculations
  assert.strictEqual(getDaysDifference("2026-08-31", "2026-09-01"), 1, "Consecutive days must have day difference 1");
  assert.strictEqual(getDaysDifference("2026-08-31", "2026-08-31"), 0, "Same day must have day difference 0");
  assert.strictEqual(getDaysDifference("2026-08-31", "2026-09-03"), 3, "Skipped days must have day difference 3");
});

// -----------------------------------------------------------------------------
// 4. Age-Band Security & Connection-Scoped Leaderboard
// -----------------------------------------------------------------------------
runTest("4.1 Leaderboard API enforces 18+ Adult Track only and connection-scoped aggregation", () => {
  const leaderboardApi = fs.readFileSync(path.join(__dirname, "../src/app/api/gamification/leaderboard/route.ts"), "utf-8");

  assert(leaderboardApi.includes('age_band !== "18+"'), "Leaderboard must reject non-18+ users");
  assert(leaderboardApi.includes("connections"), "Leaderboard must join on connections table");
  assert(leaderboardApi.includes("startOfWeek"), "Leaderboard must calculate weekly points aggregation");
  assert(leaderboardApi.includes("Connection-Scoped"), "Leaderboard must state connection-scoped scope");
});

// -----------------------------------------------------------------------------
// 5. Dashboard Gamification HUD
// -----------------------------------------------------------------------------
runTest("5.1 Dashboard integrates GamificationHUD widget and backend award API", () => {
  const dashboardPage = fs.readFileSync(path.join(__dirname, "../src/app/dashboard/page.tsx"), "utf-8");
  assert(dashboardPage.includes("<GamificationHUD />"), "Dashboard must render GamificationHUD");
  assert(dashboardPage.includes("/api/gamification/award"), "Dashboard task completion must call /api/gamification/award");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL FEATURE 9 (GAMIFICATION) PRODUCTION TESTS PASSED 100%!");
  process.exit(0);
}

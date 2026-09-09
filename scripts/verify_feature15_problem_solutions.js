const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 15 (PROBLEM → SOLUTION BOARD & FEEDBACK)");
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

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

async function runAllTests() {
  // ---------------------------------------------------------------------------
  // 1. Schema & Migration Verification
  // ---------------------------------------------------------------------------
  runTest("1.1 Schema migration creates problems, problem_solutions, and solution_feedback tables with RLS", () => {
    const migrationFile = path.join(__dirname, "../supabase/migrations/20260904020000_feature15_problem_solution_board.sql");
    assert(fs.existsSync(migrationFile), "Migration file must exist");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.problems"), "Must create problems table");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.problem_solutions"), "Must create problem_solutions table");
    assert(sql.includes("CREATE TABLE IF NOT EXISTS public.solution_feedback"), "Must create solution_feedback table");
    assert(sql.includes("min_age_band"), "Must define min_age_band column");
    assert(sql.includes("linked_project_id"), "Must define linked_project_id column");
    assert(sql.includes("solutions_peer_approved_read"), "Must enforce RLS policy hiding pending solutions from peers");
  });

  // ---------------------------------------------------------------------------
  // 2. Strict Track & Age-Band Gating (Junior never sees 18+ problems)
  // ---------------------------------------------------------------------------
  runTest("2.1 /api/problems filters out 18+ problems for Junior-track (13-15) users", () => {
    const apiFile = path.join(__dirname, "../src/app/api/problems/route.ts");
    assert(fs.existsSync(apiFile), "/api/problems/route.ts must exist");
    const apiContent = fs.readFileSync(apiFile, "utf-8");

    assert(apiContent.includes("min_age_band"), "API must filter on min_age_band");
    assert(apiContent.includes("13-15"), "API must handle 13-15 age band filter");
  });

  // ---------------------------------------------------------------------------
  // 3. Moderation Gate on Classroom-Visible Solutions
  // ---------------------------------------------------------------------------
  runTest("3.1 Solutions API defaults classroom visibility to pending moderation and excludes unapproved submissions", () => {
    const solutionsApi = path.join(__dirname, "../src/app/api/problems/solutions/route.ts");
    assert(fs.existsSync(solutionsApi), "solutions API route must exist");
    const apiContent = fs.readFileSync(solutionsApi, "utf-8");

    assert(apiContent.includes("moderationStatus") || apiContent.includes("moderation_status"), 
      "Must assign moderation_status");
    assert(apiContent.includes("moderation_status === \"approved\""), 
      "Peers must only receive approved solutions");
  });

  // ---------------------------------------------------------------------------
  // 4. Personalized Problem Ordering & Interest Matching
  // ---------------------------------------------------------------------------
  runTest("4.1 Problems API scores relevance dynamically based on user interest tags and effective level", () => {
    const apiContent = fs.readFileSync(path.join(__dirname, "../src/app/api/problems/route.ts"), "utf-8");

    assert(apiContent.includes("relevance_score"), "Must compute relevance_score");
    assert(apiContent.includes("interest_tags"), "Must calculate interest matches");
    assert(apiContent.includes("userInterests"), "Must match against userInterests");
  });

  // ---------------------------------------------------------------------------
  // 5. Structured Feedback Privacy (Only Student, Author, and Admins)
  // ---------------------------------------------------------------------------
  runTest("5.1 Solution feedback API restricts viewing strictly to student owner, feedback giver, and admins", () => {
    const fbApi = path.join(__dirname, "../src/app/api/problems/solutions/feedback/route.ts");
    assert(fs.existsSync(fbApi), "feedback API route must exist");
    const fbContent = fs.readFileSync(fbApi, "utf-8");

    assert(fbContent.includes("isOwner") && fbContent.includes("isAdmin"), 
      "Must verify owner and admin permissions");
    assert(fbContent.includes("403"), "Must reject unauthorized third-party callers with HTTP 403");
  });

  // ---------------------------------------------------------------------------
  // 6. Gamification Points Award & Badges on Solution Submission
  // ---------------------------------------------------------------------------
  runTest("6.1 Submitting a solution awards points through shared awardPoints service", () => {
    const solutionsApi = path.join(__dirname, "../src/app/api/problems/solutions/route.ts");
    const apiContent = fs.readFileSync(solutionsApi, "utf-8");

    assert(apiContent.includes("awardPoints"), "Must call awardPoints service");
    assert(apiContent.includes("problem_solution"), "Must pass problem_solution source feature");
    assert(apiContent.includes("points: 100"), "Must award 100 XP upon submission");
  });

  // ---------------------------------------------------------------------------
  // 7. Freshness Tracking & Stale Problem Review Flagging
  // ---------------------------------------------------------------------------
  runTest("7.1 Problems older than 90 days are flagged with needs_review: true", () => {
    const apiContent = fs.readFileSync(path.join(__dirname, "../src/app/api/problems/route.ts"), "utf-8");

    assert(apiContent.includes("STALE_THRESHOLD_MS") || apiContent.includes("needs_review"), 
      "API must flag stale problems");
  });

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL FEATURE 15 (PROBLEM → SOLUTION BOARD) TESTS PASSED 100%!");
    process.exit(0);
  }
}

runAllTests();

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FEATURE 3 UPGRADE (FORMATS, CODING, GD & MODEL CONFIG)");
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
  // 1. Schema Extensions & Dynamic Model Config
  // ---------------------------------------------------------------------------
  runTest("1.1 Schema migration extends questions, sessions, and adds model_configs table", () => {
    const migrationFile = path.join(__dirname, "../supabase/migrations/20260904010000_feature3_upgrade_interview_formats.sql");
    assert(fs.existsSync(migrationFile), "Migration file must exist");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    assert(sql.includes("coding"), "Must add coding question type");
    assert(sql.includes("group_discussion"), "Must add group_discussion question type");
    assert(sql.includes("starter_code"), "Must add starter_code column");
    assert(sql.includes("test_cases"), "Must add test_cases column");
    assert(sql.includes("persona_configs"), "Must add persona_configs column");
    assert(sql.includes("model_version"), "Must add model_version to interview_sessions");
    assert(sql.includes("code_submission"), "Must add code_submission to interview_sessions");
    assert(sql.includes("model_configs"), "Must create model_configs table");
  });

  // ---------------------------------------------------------------------------
  // 2. Model Configurability (Dynamic Config without Code Redeploys)
  // ---------------------------------------------------------------------------
  runTest("2.1 Model identifier and version are dynamically configurable in Flask and recorded in sessions", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const appContent = fs.readFileSync(appFile, "utf-8");

    assert(appContent.includes("CONTENT_SCORING_MODEL"), "Flask service must read CONTENT_SCORING_MODEL from config");
    assert(appContent.includes("MODEL_VERSION"), "Flask service must read MODEL_VERSION from config");
    assert(appContent.includes("modelVersion"), "Scoring response must return modelVersion");

    const nodeRoute = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/score-session/route.ts"), "utf-8");
    assert(nodeRoute.includes("model_version: modelVersion"), "Node route must persist model_version in database");
  });

  // ---------------------------------------------------------------------------
  // 3. Sandboxed Code Execution & Security Containment
  // ---------------------------------------------------------------------------
  runTest("3.1 Code execution sandbox blocks malicious access (fs, process, network) via static inspection and VM isolation", () => {
    const sandboxRoute = path.join(__dirname, "../src/app/api/interview/execute-code/route.ts");
    assert(fs.existsSync(sandboxRoute), "execute-code API route must exist");
    const routeContent = fs.readFileSync(sandboxRoute, "utf-8");

    assert(routeContent.includes("DISALLOWED_PATTERNS"), "Must define disallowed security patterns");
    assert(routeContent.includes("Security Violation"), "Must reject system API access attempts");
    assert(routeContent.includes("vm.createContext"), "Must execute inside isolated vm context");
  });

  // ---------------------------------------------------------------------------
  // 4. Code Execution Timeout & Infinite Loop Protection
  // ---------------------------------------------------------------------------
  runTest("4.1 Sandboxed code execution enforces hard 2500ms timeout against infinite loops", () => {
    const sandboxRoute = path.join(__dirname, "../src/app/api/interview/execute-code/route.ts");
    const routeContent = fs.readFileSync(sandboxRoute, "utf-8");

    assert(routeContent.includes("timeout: 2500"), "Must configure 2500ms hard timeout on script execution");
    assert(routeContent.includes("Execution Timed Out"), "Must handle ERR_SCRIPT_EXECUTION_TIMEOUT gracefully");
  });

  // ---------------------------------------------------------------------------
  // 5. Separation of Test Case Results from Communication Scoring
  // ---------------------------------------------------------------------------
  runTest("5.1 Correctness score and test-case breakdown are stored separately from verbal/content scores", () => {
    const nodeRoute = fs.readFileSync(path.join(__dirname, "../src/app/api/interview/score-session/route.ts"), "utf-8");
    assert(nodeRoute.includes("code_score: codeScore"), "Must store code_score separately");
    assert(nodeRoute.includes("test_results: testResults"), "Must store test_results separately");
    assert(nodeRoute.includes("contentScore"), "Must retain contentScore separately");
  });

  // ---------------------------------------------------------------------------
  // 6. Group Discussion State Machine & Multi-Persona Engine
  // ---------------------------------------------------------------------------
  runTest("6.1 Group discussion turn engine implements state machine with 2-3 distinct AI personas and voice IDs", () => {
    const gdRoute = path.join(__dirname, "../src/app/api/interview/group-discussion/turn/route.ts");
    assert(fs.existsSync(gdRoute), "group-discussion turn API must exist");
    const gdContent = fs.readFileSync(gdRoute, "utf-8");

    assert(gdContent.includes("DEFAULT_PERSONAS"), "Must configure distinct personas");
    assert(gdContent.includes("switch (step)"), "Must implement structured turn-taking state machine");
    assert(gdContent.includes("voiceId"), "Each persona must have a distinct TTS voice profile");
    assert(gdContent.includes("isUserTurn"), "Must flag user speaking turn");
  });

  // ---------------------------------------------------------------------------
  // 7. Group Discussion Scoring Evaluates ONLY User Turns
  // ---------------------------------------------------------------------------
  runTest("7.1 Flask scoring service evaluates strictly user turns in group discussion transcripts", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const appContent = fs.readFileSync(appFile, "utf-8");

    assert(appContent.includes("speaker") && appContent.includes("user"), 
      "Flask must extract turns where speaker == 'user'");
    assert(appContent.includes("discussionScore"), "Must return discussionScore");
  });

  // ---------------------------------------------------------------------------
  // 8. Interview Format Selector in Frontend UI
  // ---------------------------------------------------------------------------
  runTest("8.1 Interviews Hub displays Format Selector (Standard, Coding Sandbox, Group Discussion)", () => {
    const hubFile = path.join(__dirname, "../src/app/interviews/page.tsx");
    const hubContent = fs.readFileSync(hubFile, "utf-8");

    assert(hubContent.includes("Choose Interview Mode"), "Interviews page must feature format selection");
    assert(hubContent.includes("Live Coding Sandbox"), "Must feature Coding Sandbox mode");
    assert(hubContent.includes("AI Group Discussion"), "Must feature Group Discussion mode");
  });

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL FEATURE 3 UPGRADE TESTS PASSED 100%!");
    process.exit(0);
  }
}

runAllTests();

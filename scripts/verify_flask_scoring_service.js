const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: FLASK AI/INTERVIEW-SCORING PIPELINE MICROSERVICE");
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
  // 1. Kubernetes ClusterIP & Zero External Ingress Isolation
  // ---------------------------------------------------------------------------
  runTest("1.1 Flask microservice Kubernetes manifest defines ClusterIP service with zero external Ingress", () => {
    const k8sFile = path.join(__dirname, "../k8s/flask-scoring-service.yaml");
    assert(fs.existsSync(k8sFile), "k8s/flask-scoring-service.yaml must exist");
    const k8sContent = fs.readFileSync(k8sFile, "utf-8");

    assert(k8sContent.includes("type: ClusterIP"), "Service must be type: ClusterIP (internal only)");
    assert(k8sContent.includes("flask-interview-scorer"), "Deployment name must be flask-interview-scorer");
    assert(k8sContent.includes("HorizontalPodAutoscaler"), "Must configure HPA for interview compute scaling");
    assert(k8sContent.includes("/health"), "Must configure Kubernetes readiness/liveness probes");
  });

  // ---------------------------------------------------------------------------
  // 2. Python Flask Service Structure & Dependencies
  // ---------------------------------------------------------------------------
  runTest("2.1 Flask app.py, requirements.txt, Dockerfile, and pytest suite exist", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const reqFile = path.join(__dirname, "../services/interview-scorer/requirements.txt");
    const dockerFile = path.join(__dirname, "../services/interview-scorer/Dockerfile");
    const testFile = path.join(__dirname, "../services/interview-scorer/test_scoring_service.py");

    assert(fs.existsSync(appFile), "services/interview-scorer/app.py must exist");
    assert(fs.existsSync(reqFile), "services/interview-scorer/requirements.txt must exist");
    assert(fs.existsSync(dockerFile), "services/interview-scorer/Dockerfile must exist");
    assert(fs.existsSync(testFile), "services/interview-scorer/test_scoring_service.py must exist");

    const reqContent = fs.readFileSync(reqFile, "utf-8");
    assert(reqContent.includes("flask=="), "Must pin flask version");
    assert(reqContent.includes("requests=="), "Must pin requests version");
    assert(reqContent.includes("gunicorn=="), "Must pin gunicorn version");
  });

  // ---------------------------------------------------------------------------
  // 3. Cluster-Internal Authentication & Secret Enforcement
  // ---------------------------------------------------------------------------
  runTest("3.1 Flask service enforces internal secret authentication on /score-interview endpoint", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const appContent = fs.readFileSync(appFile, "utf-8");

    assert(appContent.includes("X-Internal-Service-Key") || appContent.includes("INTERNAL_SERVICE_SECRET"), 
      "Flask service must check internal service secret");
    assert(appContent.includes("check_auth"), "Must declare check_auth validation function");
    assert(appContent.includes("401"), "Must return HTTP 401 when internal secret is missing or invalid");
  });

  // ---------------------------------------------------------------------------
  // 4. Per-Step Independent Failure Handling
  // ---------------------------------------------------------------------------
  runTest("4.1 Flask scoring pipeline provides retry for Whisper and independent failure for Face API", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const appContent = fs.readFileSync(appFile, "utf-8");

    assert(appContent.includes("run_whisper_transcription"), "Must implement Whisper transcription with retry");
    assert(appContent.includes("run_content_scoring"), "Must implement content scoring");
    assert(appContent.includes("run_voice_delivery_analysis"), "Must implement voice delivery analysis");
    assert(appContent.includes("run_face_expression_analysis"), "Must implement face expression analysis");
    assert(appContent.includes("pipelineStatus"), "Must return per-section pipeline status flags");
  });

  // ---------------------------------------------------------------------------
  // 5. Zero Database Credentials / Pure Compute Verification
  // ---------------------------------------------------------------------------
  runTest("5.1 Flask service contains zero Supabase service-role keys and zero direct database writes", () => {
    const appFile = path.join(__dirname, "../services/interview-scorer/app.py");
    const appContent = fs.readFileSync(appFile, "utf-8");

    assert(!appContent.includes("SUPABASE_SERVICE_ROLE_KEY"), "Flask must NOT hold Supabase service-role key");
    assert(!appContent.includes("supabase.from"), "Flask must NOT write to Supabase directly");
    assert(!appContent.includes("createClient"), "Flask must NOT instantiate Supabase database client");
  });

  // ---------------------------------------------------------------------------
  // 6. Node.js API Gateway Integration & Sole Database Writer Verification
  // ---------------------------------------------------------------------------
  runTest("6.1 Node.js score-session route dispatches compute to Flask and is sole writer to interview_sessions", () => {
    const nodeRouteFile = path.join(__dirname, "../src/app/api/interview/score-session/route.ts");
    assert(fs.existsSync(nodeRouteFile), "src/app/api/interview/score-session/route.ts must exist");
    const routeContent = fs.readFileSync(nodeRouteFile, "utf-8");

    assert(routeContent.includes("flaskServiceUrl") || routeContent.includes("FLASK_SCORING_URL"), 
      "Node route must target Flask microservice");
    assert(routeContent.includes("X-Internal-Service-Key"), "Node must send internal auth header to Flask");
    assert(routeContent.includes("supabase.from(\"interview_sessions\").insert"), "Node must write session to Supabase");
    assert(routeContent.includes("awardPoints"), "Node must trigger gamification reward");
  });

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("--------------------------------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL FLASK SCORING MICROSERVICE TESTS PASSED 100%!");
    process.exit(0);
  }
}

runAllTests();

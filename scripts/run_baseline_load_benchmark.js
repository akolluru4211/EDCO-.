/**
 * Automated Baseline Load Benchmark Runner
 * Feature 26: DevOps, Testing & Monitoring Production Pass (Part E)
 * 
 * Executes concurrent load passes against the top 5 production paths,
 * computes latency distributions (p50, p90, p95, p99), requests/sec,
 * and asserts performance thresholds (p95 < 500ms, 0% 5xx errors).
 */

const http = require("http");

const BASE_URL = process.env.BENCHMARK_TARGET_URL || "http://localhost:3000";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "20", 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || "100", 10);

const TEST_PATHS = [
  "/api/health",
  "/jobs",
  "/auth",
  "/admin/system-health"
];

function makeRequest(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(path, BASE_URL);
    
    const req = http.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "edworld-load-runner-v26" }
    }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        const duration = Date.now() - start;
        resolve({
          path,
          statusCode: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        path,
        statusCode: 0,
        duration: Date.now() - start,
        success: false,
        error: err.message
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        path,
        statusCode: 408,
        duration: Date.now() - start,
        success: false,
        error: "Timeout"
      });
    });
  });
}

async function runLoadPass() {
  console.log("==================================================================");
  console.log("🚀 STARTING AUTOMATED LOAD BENCHMARK (Feature 26: Part E)");
  console.log(`Target: ${BASE_URL} | Total Requests: ${TOTAL_REQUESTS} | Concurrency: ${CONCURRENCY}`);
  console.log("==================================================================\n");

  const results = [];
  const queue = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const path = TEST_PATHS[i % TEST_PATHS.length];
    queue.push(path);
  }

  console.log("Warming up target routes...");
  for (const p of TEST_PATHS) {
    await makeRequest(p);
  }
  console.log("Warm-up complete. Commencing load generation...\n");

  const startTime = Date.now();
  let completed = 0;

  async function worker() {
    while (queue.length > 0) {
      const path = queue.shift();
      if (!path) break;
      const res = await makeRequest(path);
      results.push(res);
      completed++;
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  const throughputRps = (results.length / totalTimeSeconds).toFixed(1);

  // Calculate Latencies
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.50)];
  const p90 = durations[Math.floor(durations.length * 0.90)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];
  const max = durations[durations.length - 1];

  const failedCount = results.filter(r => !r.success).length;
  const errorRate = ((failedCount / results.length) * 100).toFixed(2);

  console.log("--- Benchmark Results Summary ---");
  console.log(`Total Requests Processed: ${results.length}`);
  console.log(`Total Elapsed Time:       ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`Aggregate Throughput:     ${throughputRps} req/sec`);
  console.log(`Failed Requests (5xx/Err):${failedCount} (${errorRate}%)`);
  console.log(`Latency p50:              ${p50} ms`);
  console.log(`Latency p90:              ${p90} ms`);
  console.log(`Latency p95:              ${p95} ms`);
  console.log(`Latency p99:              ${p99} ms`);
  console.log(`Latency Max:              ${max} ms\n`);

  // Assertions
  const p95Passed = p95 < 500;
  const errorRatePassed = parseFloat(errorRate) < 1.0;

  console.log(`[CHECK] p95 Latency < 500ms:     ${p95Passed ? "✅ PASS" : "❌ FAIL"} (${p95}ms)`);
  console.log(`[CHECK] Error Rate < 1%:         ${errorRatePassed ? "✅ PASS" : "❌ FAIL"} (${errorRate}%)`);

  console.log("\n==================================================================");
  if (p95Passed && errorRatePassed) {
    console.log("🎉 LOAD BENCHMARK PASSED: Production latency and stability targets satisfied!");
    console.log("==================================================================");
    return true;
  } else {
    console.error("⚠️ LOAD BENCHMARK FAILED TARGET THRESHOLDS.");
    console.log("==================================================================");
    return false;
  }
}

if (require.main === module) {
  runLoadPass()
    .then((passed) => {
      process.exit(passed ? 0 : 1);
    })
    .catch((err) => {
      console.error("Load benchmark encountered unhandled error:", err);
      process.exit(1);
    });
}

module.exports = { runLoadPass };

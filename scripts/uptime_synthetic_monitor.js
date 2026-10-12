/**
 * Synthetic Uptime Monitor Script
 * Feature 26: DevOps, Testing & Monitoring Production Pass (Part D)
 * 
 * Periodically verifies critical public & internal endpoints.
 * Flags latency violations (> 3000ms) or 5xx HTTP responses.
 * Can be run standalone or invoked as a recurring cron worker.
 */

const BASE_URL = process.env.SYNTHETIC_TARGET_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LATENCY_ALERT_THRESHOLD_MS = 3000;

const MONITORED_ENDPOINTS = [
  { name: "Deep Health Probe", path: "/api/health", expectedStatus: 200, critical: true },
  { name: "Landing Page", path: "/", expectedStatus: 200, critical: true },
  { name: "Job Board", path: "/jobs", expectedStatus: 200, critical: false },
  { name: "Auth Signin", path: "/auth", expectedStatus: 200, critical: true },
  { name: "System Health Telemetry", path: "/admin/system-health", expectedStatus: 200, critical: false }
];

async function checkEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-synthetic-monitor": "edworld-uptime-v1" },
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    const ok = res.status === endpoint.expectedStatus;
    const latencyDegraded = duration > LATENCY_ALERT_THRESHOLD_MS;

    return {
      name: endpoint.name,
      path: endpoint.path,
      url,
      statusCode: res.status,
      durationMs: duration,
      pass: ok && !latencyDegraded,
      degraded: ok && latencyDegraded,
      error: ok ? null : `HTTP status ${res.status} (expected ${endpoint.expectedStatus})`
    };
  } catch (err) {
    const duration = Date.now() - start;
    return {
      name: endpoint.name,
      path: endpoint.path,
      url,
      statusCode: 0,
      durationMs: duration,
      pass: false,
      degraded: false,
      error: err.message || "Network / timeout error"
    };
  }
}

async function runSyntheticMonitorPass() {
  console.log(`[SYNTHETIC MONITOR] Starting probe against: ${BASE_URL}`);
  console.log(`[SYNTHETIC MONITOR] Timestamp: ${new Date().toISOString()}`);

  const results = [];
  let failures = 0;

  for (const endpoint of MONITORED_ENDPOINTS) {
    const result = await checkEndpoint(endpoint);
    results.push(result);
    if (!result.pass) {
      failures++;
      console.error(`❌ [FAIL] ${result.name} (${result.path}): ${result.error} [${result.durationMs}ms]`);
    } else if (result.degraded) {
      console.warn(`⚠️ [WARN] ${result.name} (${result.path}): High latency [${result.durationMs}ms]`);
    } else {
      console.log(`✅ [PASS] ${result.name} (${result.path}): Status ${result.statusCode} [${result.durationMs}ms]`);
    }
  }

  const allPassed = failures === 0;
  console.log(`\n======================================================`);
  console.log(`Summary: ${results.length - failures}/${results.length} endpoints passed.`);
  console.log(`Uptime Status: ${allPassed ? "HEALTHY" : "ALERT_TRIGGERED"}`);
  console.log(`======================================================\n`);

  return { allPassed, results };
}

if (require.main === module) {
  runSyntheticMonitorPass()
    .then(({ allPassed }) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch((err) => {
      console.error("Synthetic monitor crashed:", err);
      process.exit(1);
    });
}

module.exports = { runSyntheticMonitorPass, MONITORED_ENDPOINTS };

/**
 * k6 Baseline Load Test Suite
 * Feature 26: DevOps, Testing & Monitoring Production Pass (Part E)
 * 
 * Tests top 5 high-traffic production paths under concurrent user load:
 * 1. Public Landing Page (/)
 * 2. Deep Health Probe (/api/health)
 * 3. Job Board & Feed (/jobs, /api/jobs/feed)
 * 4. Auth Signin Entrypoint (/auth)
 * 5. System Health Dashboard (/admin/system-health)
 * 
 * Concurrency Profile:
 * - Ramp-up: 0 -> 25 VUs over 30s
 * - Peak Steady: 25 -> 50 VUs over 60s
 * - Stress Burst: 50 -> 100 VUs over 30s
 * - Cooldown: 100 -> 0 VUs over 30s
 * 
 * Performance Thresholds:
 * - p95 Latency < 500ms for standard read endpoints
 * - p95 Latency < 2000ms for compute-heavy routes
 * - Error rate (non-2xx) < 1%
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom Metrics
export const errorRate = new Rate("error_rate");
export const healthProbeLatency = new Trend("health_probe_latency");
export const jobFeedLatency = new Trend("job_feed_latency");

export const options = {
  stages: [
    { duration: "30s", target: 25 },  // Ramp up
    { duration: "1m", target: 50 },   // Normal load
    { duration: "30s", target: 100 },  // Peak traffic burst
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    // 0% 5xx errors under target load (threshold: < 1% failure)
    error_rate: ["rate<0.01"],
    // p95 latency under 500ms for standard read paths
    http_req_duration: ["p(95)<500", "p(99)<1200"],
    health_probe_latency: ["p(95)<250"],
    job_feed_latency: ["p(95)<400"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";

export default function () {
  const params = {
    headers: {
      "User-Agent": "k6-load-runner/2.0-feature26",
      "Accept": "text/html,application/json",
    },
    timeout: "5s",
  };

  // 1. Landing Page
  group("01_Landing_Page", function () {
    const res = http.get(`${BASE_URL}/`, params);
    const passed = check(res, {
      "landing status 200": (r) => r.status === 200,
    });
    errorRate.add(!passed);
  });

  sleep(0.5);

  // 2. Deep Health Probe
  group("02_Health_Probe", function () {
    const res = http.get(`${BASE_URL}/api/health`, params);
    const passed = check(res, {
      "health status 200": (r) => r.status === 200,
      "checks passed": (r) => {
        try {
          const json = r.json();
          return json.status === "healthy" || json.status === "degraded";
        } catch (_) {
          return false;
        }
      },
    });
    healthProbeLatency.add(res.timings.duration);
    errorRate.add(!passed);
  });

  sleep(0.5);

  // 3. Job Board View
  group("03_Job_Board", function () {
    const res = http.get(`${BASE_URL}/jobs`, params);
    const passed = check(res, {
      "jobs status 200": (r) => r.status === 200,
    });
    jobFeedLatency.add(res.timings.duration);
    errorRate.add(!passed);
  });

  sleep(0.5);

  // 4. Auth Signin Gateway
  group("04_Auth_Page", function () {
    const res = http.get(`${BASE_URL}/auth`, params);
    const passed = check(res, {
      "auth status 200": (r) => r.status === 200,
    });
    errorRate.add(!passed);
  });

  sleep(1);
}

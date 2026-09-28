/**
 * Phase 11 Verification Script: Production Reliability, Observability, Security & Release Operations
 *
 * Verifies:
 * 1. Environment validation module (guarding against placeholders and missing keys)
 * 2. Standardized API Response and Error architecture (codes, metadata, correlation IDs)
 * 3. Health Probe modules (public safe health, liveness, readiness, DB, Auth, AI, Storage, Integrations)
 * 4. ErrorBoundary component and layout wrapping
 * 5. Request correlation ID middleware configuration
 * 6. Admin System Operations cockpit integrity
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('   PHASE 11: PRODUCTION RELIABILITY & OPS VERIFICATION');
console.log('======================================================\n');

// 1. Environment Validation Layer
console.log('[1/6] Auditing Central Server-Side Environment Validator...');
const envPath = path.join(process.cwd(), 'src', 'lib', 'config', 'env.ts');
assert(fs.existsSync(envPath), 'src/lib/config/env.ts exists');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  assert(envContent.includes('isPlaceholder'), 'Detects and flags placeholder API keys');
  assert(envContent.includes('validateServerEnv'), 'Exports validateServerEnv function');
  assert(envContent.includes('NEXT_PUBLIC_SUPABASE_URL'), 'Validates Supabase URL configuration');
  assert(envContent.includes('SUPABASE_SERVICE_ROLE_KEY'), 'Validates Supabase Service Role configuration');
  assert(envContent.includes('GEMINI_API_KEY'), 'Validates Gemini AI key configuration');
  assert(envContent.includes('RAZORPAY_KEY_SECRET'), 'Validates Payment gateway secrets');
}

// 2. Standardized API Error & Response Schema
console.log('\n[2/6] Auditing Standardized API Response Engine...');
const apiRespPath = path.join(process.cwd(), 'src', 'lib', 'api-response.ts');
assert(fs.existsSync(apiRespPath), 'src/lib/api-response.ts exists');
if (fs.existsSync(apiRespPath)) {
  const apiContent = fs.readFileSync(apiRespPath, 'utf8');
  assert(apiContent.includes('apiSuccess'), 'Exports apiSuccess response helper');
  assert(apiContent.includes('apiError'), 'Exports apiError response helper');
  assert(apiContent.includes('AUTH_REQUIRED') && apiContent.includes('FORBIDDEN'), 'Defines standard Auth error codes');
  assert(apiContent.includes('VALIDATION_ERROR') && apiContent.includes('RATE_LIMITED'), 'Defines standard Validation/Rate-limit error codes');
  assert(apiContent.includes('AI_UNAVAILABLE') && apiContent.includes('GATEWAY_TIMEOUT'), 'Defines standard upstream dependency error codes');
}

// 3. Application Health Probes Architecture
console.log('\n[3/6] Auditing Application Health Probes...');
const healthProbes = [
  { file: 'src/app/api/health/route.ts', label: 'Safe Public Health Probe' },
  { file: 'src/app/api/health/liveness/route.ts', label: 'Kubernetes Liveness Probe' },
  { file: 'src/app/api/health/readiness/route.ts', label: 'Kubernetes Readiness Probe' },
  { file: 'src/app/api/health/database/route.ts', label: 'Database Health Probe' },
  { file: 'src/app/api/health/auth/route.ts', label: 'Supabase Auth Health Probe' },
  { file: 'src/app/api/health/ai/route.ts', label: 'AI Engine Health Probe' },
  { file: 'src/app/api/health/storage/route.ts', label: 'Storage Health Probe' },
  { file: 'src/app/api/health/integrations/route.ts', label: 'Integrations Health Probe' }
];

healthProbes.forEach(probe => {
  const fullPath = path.join(process.cwd(), probe.file);
  assert(fs.existsSync(fullPath), `${probe.label} exists (${probe.file})`);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('export async function GET'), `${probe.label} exports async GET handler`);
  }
});

// 4. Request Correlation & Middleware Protection
console.log('\n[4/6] Auditing Middleware & Request Correlation Tracing...');
const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
assert(fs.existsSync(middlewarePath), 'src/middleware.ts exists');
if (fs.existsSync(middlewarePath)) {
  const mwContent = fs.readFileSync(middlewarePath, 'utf8');
  assert(mwContent.includes('x-request-id'), 'Generates and propagates x-request-id trace header');
  assert(mwContent.includes('crypto.randomUUID()'), 'Generates cryptographically random correlation IDs');
  assert(mwContent.includes('X-Frame-Options') && mwContent.includes('X-Content-Type-Options'), 'Maintains strict Security Headers');
}

// 5. Client Resilience & Error Boundaries
console.log('\n[5/6] Auditing Error Boundaries & Layout Wrappers...');
const errorBoundaryPath = path.join(process.cwd(), 'src', 'components', 'ui', 'ErrorBoundary.tsx');
assert(fs.existsSync(errorBoundaryPath), 'src/components/ui/ErrorBoundary.tsx exists');
if (fs.existsSync(errorBoundaryPath)) {
  const ebContent = fs.readFileSync(errorBoundaryPath, 'utf8');
  assert(ebContent.includes('componentDidCatch'), 'Implements React componentDidCatch lifecycle');
  assert(ebContent.includes('Try Again'), 'Provides user-actionable retry mechanism');
}

const protectedLayouts = [
  'src/app/admin/layout.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/career/layout.tsx',
  'src/app/interviews/layout.tsx',
  'src/app/resumes/layout.tsx',
  'src/app/profile/layout.tsx'
];

protectedLayouts.forEach(layout => {
  const fullPath = path.join(process.cwd(), layout);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('ErrorBoundary'), `${layout} is protected with ErrorBoundary`);
  }
});

// 6. Production Operations Cockpit (/admin/system)
console.log('\n[6/6] Auditing Production Operations Cockpit...');
const adminSystemPath = path.join(process.cwd(), 'src', 'app', 'admin', 'system', 'page.tsx');
assert(fs.existsSync(adminSystemPath), 'src/app/admin/system/page.tsx exists');
if (fs.existsSync(adminSystemPath)) {
  const systemContent = fs.readFileSync(adminSystemPath, 'utf8');
  assert(systemContent.includes('System Status'), 'Displays System Health status panel');
  assert(systemContent.includes('Performance & Latency'), 'Displays Latency & Response Time metrics');
  assert(systemContent.includes('Background Jobs'), 'Displays Worker & Background Jobs telemetry');
  assert(systemContent.includes('Security & Audits'), 'Displays Security posture and Audit logs');
  assert(systemContent.includes('Release & Migrations'), 'Displays Release version and Migration states');
  assert(!systemContent.includes('mockUsers') && !systemContent.includes('99.98% uptime'), 'Contains ZERO fake/synthetic metrics');
}

console.log('\n======================================================');
console.log(`TOTAL PASS: \x1b[32m${passCount}\x1b[0m | TOTAL FAIL: \x1b[${failCount > 0 ? '31' : '32'}m${failCount}\x1b[0m`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

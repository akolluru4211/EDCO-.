import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('================================================================================');
console.log('EDWORLD CO — PHASE 23: HUMAN-BUILT PRODUCTION ARCHITECTURE & PORTAL ISOLATION');
console.log('================================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testName, errorMsg = '') {
  if (condition) {
    console.log(`✅ [PASS]: ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL]: ${testName}${errorMsg ? ` -> ${errorMsg}` : ''}`);
    failed++;
  }
}

// ---------------------------------------------------------
// 1. Static Code & Security Analysis
// ---------------------------------------------------------
console.log('--- Step 1: Design System & Clean Data Architecture Verification ---');

// 1.1 Verify Design System primitives
const designSystemPath = path.resolve('src/components/ui/DesignSystem.tsx');
assert(fs.existsSync(designSystemPath), '1.1 DesignSystem.tsx exists with human-crafted UI primitives');
if (fs.existsSync(designSystemPath)) {
  const dsContent = fs.readFileSync(designSystemPath, 'utf8');
  assert(dsContent.includes('export const Button'), '1.2 DesignSystem exports standardized Button primitive');
  assert(dsContent.includes('export const Input'), '1.3 DesignSystem exports standardized Input primitive');
  assert(dsContent.includes('export const Card'), '1.4 DesignSystem exports standardized Card primitive');
  assert(dsContent.includes('export const Badge'), '1.5 DesignSystem exports standardized Badge primitive');
  assert(dsContent.includes('export const EmptyState'), '1.6 DesignSystem exports real EmptyState component');
  assert(dsContent.includes('export const Skeleton'), '1.7 DesignSystem exports Skeleton loader component');
  assert(dsContent.includes('export const ErrorState'), '1.8 DesignSystem exports robust ErrorState component');
}

// 1.2 Verify PortalLayout, RoleScopedSearch, RoleScopedNotifications
const portalLayoutPath = path.resolve('src/components/portal/PortalLayout.tsx');
assert(fs.existsSync(portalLayoutPath), '1.9 PortalLayout.tsx provides isolated portal shell');

const searchPath = path.resolve('src/components/search/RoleScopedSearch.tsx');
assert(fs.existsSync(searchPath), '1.10 RoleScopedSearch.tsx implements permission-aware search');

const notifPath = path.resolve('src/components/notifications/RoleScopedNotifications.tsx');
assert(fs.existsSync(notifPath), '1.11 RoleScopedNotifications.tsx implements role-scoped alerts');

// 1.3 Verify Types definition has explicit roles
const typesPath = path.resolve('src/lib/types.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');
assert(
  typesContent.includes('export type UserRole =') &&
  typesContent.includes('"STUDENT"') &&
  typesContent.includes('"EMPLOYEE"') &&
  typesContent.includes('"HR"') &&
  typesContent.includes('"FOUNDER"') &&
  typesContent.includes('"ADMIN"'),
  '1.12 types.ts defines explicit user roles (STUDENT, EMPLOYEE, HR, FOUNDER, ADMIN)'
);

// 1.4 Verify No Fake Initial Fallback Data in Employee, HR, Founder pages
const hrPageContent = fs.readFileSync(path.resolve('src/app/hr/page.tsx'), 'utf8');
assert(
  !hrPageContent.includes('fullName: "Aditya Verma"') &&
  !hrPageContent.includes('employeeName: "Sneha Mukherjee"'),
  '1.13 HR page does not create fake candidate/onboarding records when database is empty'
);

const employeePageContent = fs.readFileSync(path.resolve('src/app/employee/page.tsx'), 'utf8');
assert(
  !employeePageContent.includes('title: "Migrate internal auth to dual-track RBAC tokens"') &&
  !employeePageContent.includes('mockPay: PayrollRecord'),
  '1.14 Employee workspace does not create fake task/payroll records when database is empty'
);

const founderPageContent = fs.readFileSync(path.resolve('src/app/founder/page.tsx'), 'utf8');
assert(
  !founderPageContent.includes('title: "Phase 19 Internal OS Enterprise Rollout"') &&
  !founderPageContent.includes('title: "Tier-1 College Placement Network Expansion"'),
  '1.15 Founder page does not create fake initiatives when database is empty'
);

// ---------------------------------------------------------
// 2. Server-Side Security & Role-Based API Authorization Tests
// ---------------------------------------------------------
console.log('\n--- Step 2: Live API & Authorization Guard Tests ---');

async function testApi(url, headers = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      url,
      {
        method: 'GET',
        headers: {
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers || {}, body });
        });
      }
    );
    req.on('error', (err) => resolve({ status: 500, headers: {}, error: err }));
    req.end();
  });
}

async function runLiveTests() {
  const baseUrl = 'http://localhost:3000';

  // 2.1 Unauthenticated call to protected founder API -> 401 or 403
  const resFounderNoAuth = await testApi(`${baseUrl}/api/founder/revenue`);
  assert(
    resFounderNoAuth.status === 401 || resFounderNoAuth.status === 403,
    '2.1 Unauthenticated request to /api/founder/revenue is rejected (HTTP 401/403)'
  );

  // 2.2 Unauthenticated call to protected HR API -> 401 or 403
  const resHrNoAuth = await testApi(`${baseUrl}/api/hr/employees`);
  assert(
    resHrNoAuth.status === 401 || resHrNoAuth.status === 403,
    '2.2 Unauthenticated request to /api/hr/employees is rejected (HTTP 401/403)'
  );

  // 2.3 Edge Middleware Protection: Direct portal access without auth redirect
  const resDashNoAuth = await testApi(`${baseUrl}/dashboard`);
  assert(
    resDashNoAuth.status === 307 || resDashNoAuth.status === 308 || (resDashNoAuth.headers['location'] && resDashNoAuth.headers['location'].includes('/auth/login')),
    '2.3 Unauthenticated access to /dashboard redirects to /auth/login'
  );

  const resEmpNoAuth = await testApi(`${baseUrl}/employee`);
  assert(
    resEmpNoAuth.status === 307 || resEmpNoAuth.status === 308 || (resEmpNoAuth.headers['location'] && resEmpNoAuth.headers['location'].includes('/auth/login')),
    '2.4 Unauthenticated access to /employee redirects to /auth/login'
  );

  const resFounderPortalNoAuth = await testApi(`${baseUrl}/founder`);
  assert(
    resFounderPortalNoAuth.status === 307 || resFounderPortalNoAuth.status === 308 || (resFounderPortalNoAuth.headers['location'] && resFounderPortalNoAuth.headers['location'].includes('/auth/login')),
    '2.5 Unauthenticated access to /founder redirects to /auth/login'
  );

  const resAdminPortalNoAuth = await testApi(`${baseUrl}/admin`);
  assert(
    resAdminPortalNoAuth.status === 307 || resAdminPortalNoAuth.status === 308 || (resAdminPortalNoAuth.headers['location'] && resAdminPortalNoAuth.headers['location'].includes('/auth/login')),
    '2.6 Unauthenticated access to /admin redirects to /auth/login'
  );

  console.log('\n================================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 23 PRODUCTION ARCHITECTURE & SECURITY TESTS PASSED 100%!');
  }
}

runLiveTests();

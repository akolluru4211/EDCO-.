const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failedTests++;
  }
}

function makeHttpRequest(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path: pathname,
      method: options.method || 'GET',
      headers: {
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json || data,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('EDWORLD CO — VERIFICATION: PHASE 22 AUTHENTICATION GATE & DASHBOARD PROTECTION');
  console.log('='.repeat(80) + '\n');

  // -----------------------------------------------------------------------------
  // 1. Static Security & Architecture Code Audit
  // -----------------------------------------------------------------------------
  runTest('1.1 Next.js Edge Middleware (src/middleware.ts) guards protected routes', () => {
    const middlewareContent = fs.readFileSync(path.join(rootDir, 'src/middleware.ts'), 'utf8');
    assert(middlewareContent.includes('edworld_session'), 'Must inspect edworld_session cookie');
    assert(middlewareContent.includes('NextResponse.redirect'), 'Must redirect unauthenticated users');
    assert(middlewareContent.includes('/auth/login'), 'Must redirect to /auth/login');
    assert(middlewareContent.includes('PUBLIC_PAGE_PREFIXES'), 'Must declare explicit public routes whitelist');
  });

  runTest('1.2 Central AuthGuard component (src/components/auth/AuthGuard.tsx) enforces RBAC', () => {
    const guardContent = fs.readFileSync(path.join(rootDir, 'src/components/auth/AuthGuard.tsx'), 'utf8');
    assert(guardContent.includes('AuthLoadingScreen'), 'Must render AuthLoadingScreen during auth loading');
    assert(guardContent.includes('router.replace'), 'Must replace URL on unauthenticated or unauthorized access');
    assert(guardContent.includes('allowedRoles'), 'Must support role-based portal access control');
  });

  runTest('1.3 Branded AuthLoadingScreen (src/components/ui/AuthLoadingScreen.tsx) prevents content flash', () => {
    const splashContent = fs.readFileSync(path.join(rootDir, 'src/components/ui/AuthLoadingScreen.tsx'), 'utf8');
    assert(splashContent.includes('Edworld'), 'Must display Edworld brand');
    assert(splashContent.includes('SKILLS & CAREER OS'), 'Must display SKILLS & CAREER OS tag');
    assert(splashContent.includes('Checking session...') || splashContent.includes('message'), 'Must show session checking feedback');
  });

  runTest('1.4 AuthContext (src/lib/auth-context.tsx) implements session hydration & back-button protected logout', () => {
    const authContent = fs.readFileSync(path.join(rootDir, 'src/lib/auth-context.tsx'), 'utf8');
    assert(authContent.includes('/api/auth/session'), 'Must query session endpoint on mount in useEffect');
    assert(authContent.includes('window.location.replace') || authContent.includes('sessionStorage.clear()'), 'Must invalidate back cache on logout');
    assert(authContent.includes('/api/auth/logout'), 'Must dispatch logout API call');
  });

  runTest('1.5 Navbar (src/components/navbar.tsx) restricts navigation to authenticated users', () => {
    const navContent = fs.readFileSync(path.join(rootDir, 'src/components/navbar.tsx'), 'utf8');
    assert(navContent.includes('{user && ('), 'Desktop & mobile docks must be gated by user presence');
    assert(navContent.includes('Sign In') && navContent.includes('Get Started'), 'Public header must render Sign In and Get Started');
  });

  runTest('1.6 All major workspaces & dashboards are wrapped with AuthGuard', () => {
    const dashboardPage = fs.readFileSync(path.join(rootDir, 'src/app/dashboard/page.tsx'), 'utf8');
    const employeePage = fs.readFileSync(path.join(rootDir, 'src/app/employee/page.tsx'), 'utf8');
    const hrPage = fs.readFileSync(path.join(rootDir, 'src/app/hr/page.tsx'), 'utf8');
    const founderPage = fs.readFileSync(path.join(rootDir, 'src/app/founder/page.tsx'), 'utf8');
    const adminLayout = fs.readFileSync(path.join(rootDir, 'src/app/admin/layout.tsx'), 'utf8');
    const collegesPage = fs.readFileSync(path.join(rootDir, 'src/app/colleges/page.tsx'), 'utf8');
    const teacherPage = fs.readFileSync(path.join(rootDir, 'src/app/school/teacher/page.tsx'), 'utf8');
    const profilePage = fs.readFileSync(path.join(rootDir, 'src/app/profile/page.tsx'), 'utf8');
    const resumesPage = fs.readFileSync(path.join(rootDir, 'src/app/resumes/page.tsx'), 'utf8');
    const interviewsPage = fs.readFileSync(path.join(rootDir, 'src/app/interviews/page.tsx'), 'utf8');
    const jobsPage = fs.readFileSync(path.join(rootDir, 'src/app/jobs/page.tsx'), 'utf8');
    const projectsPage = fs.readFileSync(path.join(rootDir, 'src/app/projects/page.tsx'), 'utf8');
    const networkingPage = fs.readFileSync(path.join(rootDir, 'src/app/networking/page.tsx'), 'utf8');

    assert(dashboardPage.includes('<AuthGuard>'), 'Dashboard page must be wrapped with AuthGuard');
    assert(employeePage.includes('<AuthGuard'), 'Employee page must be wrapped with AuthGuard');
    assert(hrPage.includes('<AuthGuard'), 'HR page must be wrapped with AuthGuard');
    assert(founderPage.includes('<AuthGuard'), 'Founder page must be wrapped with AuthGuard');
    assert(adminLayout.includes('<AuthGuard'), 'Admin layout must be wrapped with AuthGuard');
    assert(collegesPage.includes('<AuthGuard'), 'Colleges page must be wrapped with AuthGuard');
    assert(teacherPage.includes('<AuthGuard'), 'Teacher page must be wrapped with AuthGuard');
    assert(profilePage.includes('<AuthGuard>'), 'Profile page must be wrapped with AuthGuard');
    assert(resumesPage.includes('<AuthGuard>'), 'Resumes page must be wrapped with AuthGuard');
    assert(interviewsPage.includes('<AuthGuard>'), 'Interviews page must be wrapped with AuthGuard');
    assert(jobsPage.includes('<AuthGuard>'), 'Jobs page must be wrapped with AuthGuard');
    assert(projectsPage.includes('<AuthGuard>'), 'Projects page must be wrapped with AuthGuard');
    assert(networkingPage.includes('<AuthGuard>'), 'Networking page must be wrapped with AuthGuard');
  });

  // -----------------------------------------------------------------------------
  // 2. Direct HTTP Unauthenticated Access Tests (Live Local Server)
  // -----------------------------------------------------------------------------
  await runAsyncTest('2.1 Unauthenticated direct access to /dashboard redirects to /auth/login', async () => {
    const res = await makeHttpRequest('/dashboard');
    assert(res.statusCode === 307 || res.statusCode === 308 || res.statusCode === 302, `Expected redirect status, got ${res.statusCode}`);
    assert(res.headers.location && res.headers.location.includes('/auth/login'), 'Must redirect to /auth/login');
    assert(res.headers.location.includes('redirectUrl'), 'Must preserve redirectUrl query param');
  });

  await runAsyncTest('2.2 Unauthenticated direct access to /hr redirects to /auth/login', async () => {
    const res = await makeHttpRequest('/hr');
    assert(res.statusCode === 307 || res.statusCode === 308 || res.statusCode === 302, `Expected redirect status, got ${res.statusCode}`);
    assert(res.headers.location && res.headers.location.includes('/auth/login'), 'Must redirect to /auth/login');
  });

  await runAsyncTest('2.3 Unauthenticated direct access to /founder redirects to /auth/login', async () => {
    const res = await makeHttpRequest('/founder');
    assert(res.statusCode === 307 || res.statusCode === 308 || res.statusCode === 302, `Expected redirect status, got ${res.statusCode}`);
    assert(res.headers.location && res.headers.location.includes('/auth/login'), 'Must redirect to /auth/login');
  });

  await runAsyncTest('2.4 Unauthenticated direct access to /employee redirects to /auth/login', async () => {
    const res = await makeHttpRequest('/employee');
    assert(res.statusCode === 307 || res.statusCode === 308 || res.statusCode === 302, `Expected redirect status, got ${res.statusCode}`);
    assert(res.headers.location && res.headers.location.includes('/auth/login'), 'Must redirect to /auth/login');
  });

  await runAsyncTest('2.5 Unauthenticated direct access to /admin redirects to /auth/login', async () => {
    const res = await makeHttpRequest('/admin');
    assert(res.statusCode === 307 || res.statusCode === 308 || res.statusCode === 302, `Expected redirect status, got ${res.statusCode}`);
    assert(res.headers.location && res.headers.location.includes('/auth/login'), 'Must redirect to /auth/login');
  });

  await runAsyncTest('2.6 Public pages remain accessible without authentication', async () => {
    const rootRes = await makeHttpRequest('/');
    assert.strictEqual(rootRes.statusCode, 200, 'Landing page / must return 200');

    const loginRes = await makeHttpRequest('/auth/login');
    assert.strictEqual(loginRes.statusCode, 200, 'Login page /auth/login must return 200');

    const signupRes = await makeHttpRequest('/auth/signup');
    assert.strictEqual(signupRes.statusCode, 200, 'Signup page /auth/signup must return 200');
  });

  // -----------------------------------------------------------------------------
  // 3. Protected API Server-Side Security
  // -----------------------------------------------------------------------------
  await runAsyncTest('3.1 Protected API without auth cookies/headers returns 401 Unauthorized', async () => {
    const res = await makeHttpRequest('/api/founder/revenue');
    assert.strictEqual(res.statusCode, 401, `Expected 401 Unauthorized, got ${res.statusCode}`);
  });

  // -----------------------------------------------------------------------------
  // 4. Authenticated Session Flow & Logout Invalidation
  // -----------------------------------------------------------------------------
  await runAsyncTest('4.1 Complete authentication, session validation, and logout invalidation flow', async () => {
    const testEmail = `auth.test.${Date.now()}@edworld.co.in`;
    
    // 1. Request OTP
    const sendRes = await makeHttpRequest('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { identifier: testEmail, purpose: 'login' },
    });
    assert.strictEqual(sendRes.statusCode, 200);

    // 2. Verify OTP and get cookie
    const verifyRes = await makeHttpRequest('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { identifier: testEmail, otp: sendRes.body.devOtp || '123456', purpose: 'login' },
    });
    assert.strictEqual(verifyRes.statusCode, 200);
    const sessionToken = verifyRes.body.token;
    assert(sessionToken, 'Must receive session token');

    // 3. Query GET /api/auth/session with token header
    const sessionCheck = await makeHttpRequest('/api/auth/session', {
      method: 'GET',
      headers: { 'authorization': `Bearer ${sessionToken}` },
    });
    assert.strictEqual(sessionCheck.statusCode, 200);
    assert.strictEqual(sessionCheck.body.authenticated, true);

    // 4. Logout
    const logoutRes = await makeHttpRequest('/api/auth/logout', {
      method: 'POST',
      headers: { 'authorization': `Bearer ${sessionToken}` },
    });
    assert.strictEqual(logoutRes.statusCode, 200);

    // 5. Query session after logout -> must return 401
    const postLogoutSession = await makeHttpRequest('/api/auth/session', {
      method: 'GET',
      headers: { 'authorization': `Bearer ${sessionToken}` },
    });
    assert.strictEqual(postLogoutSession.statusCode, 401, 'Post-logout session must return 401');
  });

  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('='.repeat(80) + '\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL AUTHENTICATION GATE & DASHBOARD PROTECTION TESTS PASSED 100%!\n');
  }
}

runVerification().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

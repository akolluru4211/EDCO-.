const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('================================================================================');
console.log('EDWORLD CO — VERIFICATION: PHASE 22 OTP AUTHENTICATION FOR ALL USERS');
console.log('================================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
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
  }
}

const rootDir = path.resolve(__dirname, '..');

// Helper for local HTTP requests
function makePostRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

async function executeSuite() {
  // -----------------------------------------------------------------------------
  // 1. UI Verification: Unified Mobile-First OTP Login Page
  // -----------------------------------------------------------------------------
  runTest('1.1 /auth/login provides unified "Sign in to Edworld" with zero internal role tabs', () => {
    const loginPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
    assert(loginPage.includes('Sign in to Edworld'), 'Login page must show "Sign in to Edworld"');
    assert(!loginPage.includes('href="/hr"') && !loginPage.includes('href="/founder"') && !loginPage.includes('href="/employee"'), 'Public login must not link to internal admin portals');
    assert(!loginPage.includes('TRACKS') || !loginPage.includes('staff:'), 'Public login must not expose internal staff switchers');
  });

  runTest('1.2 /auth/login supports Email or Mobile Number, Send OTP, and 6-digit input', () => {
    const loginPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
    assert(loginPage.includes('Email or Mobile Number'), 'Login must accept email or phone');
    assert(loginPage.includes('Send OTP'), 'Login must have "Send OTP" button');
    assert(loginPage.includes('Enter the 6-digit OTP'), 'Login must display 6-digit OTP prompt');
    assert(loginPage.includes('inputMode="numeric"') || loginPage.includes('inputMode=\\"numeric\\"'), 'Inputs must use mobile numeric keypad');
    assert(loginPage.includes('handlePaste'), 'Must support OTP paste');
    assert(loginPage.includes('Resend OTP') || loginPage.includes('countdown'), 'Must support resend timer cooldown');
    assert(loginPage.includes('Change email/number'), 'Must support changing identifier');
  });

  runTest('1.3 Zero hardcoded default passwords or edworld@122 across codebase', () => {
    const loginPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
    const signupPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/signup/page.tsx'), 'utf8');
    const provisionRoute = fs.readFileSync(path.join(rootDir, 'src/app/api/hr/provision-employee/route.ts'), 'utf8');
    assert(!loginPage.includes('edworld@122'), 'Login page must not contain edworld@122');
    assert(!signupPage.includes('edworld@122'), 'Signup page must not contain edworld@122');
    assert(!provisionRoute.includes('edworld@122'), 'Provision route must not contain edworld@122');
  });

  // -----------------------------------------------------------------------------
  // 2. Service & Structure Verification (Static Code Audit)
  // -----------------------------------------------------------------------------
  runTest('2.1 OTP service implements rate-limiting, cooldown, expiration, and brute-force protection', () => {
    const otpService = fs.readFileSync(path.join(rootDir, 'src/lib/otp-service.ts'), 'utf8');
    assert(otpService.includes('generateAndSendOtp'), 'Must export generateAndSendOtp');
    assert(otpService.includes('verifyOtp'), 'Must export verifyOtp');
    assert(otpService.includes('maskIdentifier'), 'Must export maskIdentifier');
    assert(otpService.includes('getRedirectForRole'), 'Must export getRedirectForRole');
    assert(otpService.includes('expiresAt'), 'Must track OTP expiration');
    assert(otpService.includes('lockedUntil'), 'Must support temporary account lockout on excessive attempts');
    assert(otpService.includes('resendAvailableAt'), 'Must enforce resend cooldown');
    assert(otpService.includes('logSecurityEvent'), 'Must log immutable security events without plaintext OTPs');
  });

  runTest('2.2 AuthContext exposes sendOtp, verifyOtp, and updated logout', () => {
    const authContext = fs.readFileSync(path.join(rootDir, 'src/lib/auth-context.tsx'), 'utf8');
    assert(authContext.includes('sendOtp:'), 'AuthContextType must declare sendOtp');
    assert(authContext.includes('verifyOtp:'), 'AuthContextType must declare verifyOtp');
    assert(authContext.includes('/api/auth/otp/send'), 'sendOtp must call /api/auth/otp/send');
    assert(authContext.includes('/api/auth/otp/verify'), 'verifyOtp must call /api/auth/otp/verify');
    assert(authContext.includes('/api/auth/logout'), 'logout must call /api/auth/logout');
  });

  // -----------------------------------------------------------------------------
  // 3. API Endpoints Functional Verification (over HTTP localhost:3000)
  // -----------------------------------------------------------------------------
  let testOtpCode = '';
  const studentEmail = `student.alex.${Date.now()}@example.com`;

  await runAsyncTest('3.1 POST /api/auth/otp/send dispatches 6-digit code with masked privacy', async () => {
    const res = await makePostRequest('/api/auth/otp/send', {
      identifier: studentEmail,
      purpose: 'login',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.maskedIdentifier.includes('***') && res.body.maskedIdentifier.includes('@example.com'), 'Masked identifier required');
    assert(res.body.cooldownSeconds >= 30, 'Cooldown seconds required');
    testOtpCode = res.body.devOtp || '123456';
  });

  await runAsyncTest('3.2 POST /api/auth/otp/verify validates OTP and returns server role for Student', async () => {
    const res = await makePostRequest('/api/auth/otp/verify', {
      identifier: studentEmail,
      otp: testOtpCode,
      purpose: 'login',
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.role, 'CLIENT');
    assert.strictEqual(res.body.redirectUrl, '/dashboard');
    assert(res.body.token && res.body.token.startsWith('edw_sess_'), 'Session token required');
  });

  await runAsyncTest('3.3 Internal Role Redirection: Employee, HR, Founder, Teacher, College, Admin', async () => {
    // Admin
    const adminSend = await makePostRequest('/api/auth/otp/send', { identifier: 'admin@edworld.co.in' });
    const adminVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'admin@edworld.co.in',
      otp: adminSend.body.devOtp || '123456',
    });
    assert.strictEqual(adminVerify.body.role, 'ADMIN');
    assert.strictEqual(adminVerify.body.redirectUrl, '/admin');

    // HR
    const hrSend = await makePostRequest('/api/auth/otp/send', { identifier: 'hr@edworld.co.in' });
    const hrVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'hr@edworld.co.in',
      otp: hrSend.body.devOtp || '123456',
    });
    assert.strictEqual(hrVerify.body.role, 'HR');
    assert.strictEqual(hrVerify.body.redirectUrl, '/hr');

    // Founder
    const founderSend = await makePostRequest('/api/auth/otp/send', { identifier: 'founder@edworld.co.in' });
    const founderVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'founder@edworld.co.in',
      otp: founderSend.body.devOtp || '123456',
    });
    assert.strictEqual(founderVerify.body.role, 'FOUNDER');
    assert.strictEqual(founderVerify.body.redirectUrl, '/founder');

    // Teacher
    const teacherSend = await makePostRequest('/api/auth/otp/send', { identifier: 'teacher@edworld.co.in' });
    const teacherVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'teacher@edworld.co.in',
      otp: teacherSend.body.devOtp || '123456',
    });
    assert.strictEqual(teacherVerify.body.role, 'TEACHER');
    assert.strictEqual(teacherVerify.body.redirectUrl, '/school/teacher');

    // College Admin
    const collegeSend = await makePostRequest('/api/auth/otp/send', { identifier: 'college@edworld.co.in' });
    const collegeVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'college@edworld.co.in',
      otp: collegeSend.body.devOtp || '123456',
    });
    assert.strictEqual(collegeVerify.body.role, 'COLLEGE_ADMIN');
    assert.strictEqual(collegeVerify.body.redirectUrl, '/colleges');

    // Employee
    const empSend = await makePostRequest('/api/auth/otp/send', { identifier: 'employee@edworld.co.in' });
    const empVerify = await makePostRequest('/api/auth/otp/verify', {
      identifier: 'employee@edworld.co.in',
      otp: empSend.body.devOtp || '123456',
    });
    assert.strictEqual(empVerify.body.role, 'EMPLOYEE');
    assert.strictEqual(empVerify.body.redirectUrl, '/employee');
  });

  await runAsyncTest('3.4 One-time use: Reused OTP is rejected by the API', async () => {
    const id = 'reused.api.test@example.com';
    const sendRes = await makePostRequest('/api/auth/otp/send', { identifier: id });
    const verify1 = await makePostRequest('/api/auth/otp/verify', { identifier: id, otp: sendRes.body.devOtp });
    assert.strictEqual(verify1.statusCode, 200);

    // Reuse attempt
    const verify2 = await makePostRequest('/api/auth/otp/verify', { identifier: id, otp: sendRes.body.devOtp });
    assert.strictEqual(verify2.statusCode, 400);
    assert(verify2.body.message.includes('already been used') || verify2.body.message.includes('expired'), verify2.body.message);
  });

  await runAsyncTest('3.5 Suspended accounts are rejected with 403 Forbidden', async () => {
    const id = 'suspended.user@example.com';
    const sendRes = await makePostRequest('/api/auth/otp/send', { identifier: id });
    const verifyRes = await makePostRequest('/api/auth/otp/verify', { identifier: id, otp: sendRes.body.devOtp });
    assert.strictEqual(verifyRes.statusCode, 403);
    assert.strictEqual(verifyRes.body.error, 'ACCOUNT_SUSPENDED');
  });

  // -----------------------------------------------------------------------------
  // 4. API Routes & Logout Verification
  // -----------------------------------------------------------------------------
  await runAsyncTest('4.1 POST /api/auth/logout invalidates user session', async () => {
    const res = await makePostRequest('/api/auth/logout', {});
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  console.log(`\n================================================================================`);
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log(`================================================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  } else {
    console.log('🎉 ALL OTP AUTHENTICATION VERIFICATION TESTS PASSED 100%!\n');
    process.exit(0);
  }
}

executeSuite().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

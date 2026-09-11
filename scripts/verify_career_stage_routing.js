const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Verification: Strict Career Stage Sign-Up & Login Isolation ---');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`? [PASS] ${total}. ${name}`);
    passed++;
  } catch (err) {
    console.error(`? [FAIL] ${total}. ${name}`);
    console.error(err);
  }
}

const rootDir = path.resolve(__dirname, '..');

// Test 1: Verify signup page stage redirection
test('Sign up page routes strictly based on selectedStage (Junior -> /onboarding/junior, Pro -> /onboarding/professional, Student -> /onboarding/student)', () => {
  const signupContent = fs.readFileSync(path.join(rootDir, 'src/app/auth/signup/page.tsx'), 'utf8');
  assert(signupContent.includes('router.push("/onboarding/junior")'), 'Missing junior redirect');
  assert(signupContent.includes('router.push("/onboarding/professional")'), 'Missing pro redirect');
  assert(signupContent.includes('router.push("/onboarding/student")'), 'Missing student redirect');
});

// Test 2: Verify login page stage-aware redirection
test('Login page routes strictly based on user registered careerStage', () => {
  const loginContent = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
  assert(loginContent.includes('careerStage === "JUNIOR"'), 'Missing careerStage JUNIOR check');
  assert(loginContent.includes('careerStage === "STUDENT"'), 'Missing careerStage STUDENT check');
  assert(loginContent.includes('careerStage === "PROFESSIONAL"'), 'Missing careerStage PROFESSIONAL check');
  assert(loginContent.includes('router.push("/student/junior/dashboard")'), 'Missing junior push');
  assert(loginContent.includes('router.push("/dashboard")'), 'Missing student dashboard push');
  assert(loginContent.includes('router.push("/career/dashboard")'), 'Missing pro dashboard push');
});

// Test 3: Verify auth-context loginWithEmail returns careerStage and stage-aware redirectUrl
test('AuthContext getRedirectForRole and loginWithEmail compute stage-aware redirects', () => {
  const authContextContent = fs.readFileSync(path.join(rootDir, 'src/lib/auth-context.tsx'), 'utf8');
  assert(authContextContent.includes('getRedirectForRole = (userRole: UserRole, stage?: CareerStage)'), 'getRedirectForRole missing stage argument');
  assert(authContextContent.includes('if (stage === "JUNIOR") return "/student/junior/dashboard"'), 'Missing junior redirect in role routing');
  assert(authContextContent.includes('if (stage === "STUDENT") return "/dashboard"'), 'Missing student redirect in role routing');
  assert(authContextContent.includes('return "/career/dashboard"'), 'Missing career dashboard fallback in role routing');
});

// Test 4: Verify Junior Dashboard guards against Student and Professional users
test('Junior dashboard guards against Student and Professional accounts', () => {
  const juniorDashContent = fs.readFileSync(path.join(rootDir, 'src/app/student/junior/dashboard/page.tsx'), 'utf8');
  assert(juniorDashContent.includes('user.careerStage === "PROFESSIONAL"'), 'Missing pro redirect in junior dash');
  assert(juniorDashContent.includes('user.careerStage === "STUDENT"'), 'Missing student redirect in junior dash');
  assert(juniorDashContent.includes('router.replace("/career/dashboard")'), 'Missing replace /career/dashboard in junior dash');
  assert(juniorDashContent.includes('router.replace("/dashboard")'), 'Missing replace /dashboard in junior dash');
});

// Test 5: Verify Junior Onboarding guards against Student and Professional users
test('Junior onboarding guards against Student and Professional accounts', () => {
  const juniorOnboardingContent = fs.readFileSync(path.join(rootDir, 'src/app/onboarding/junior/page.tsx'), 'utf8');
  assert(juniorOnboardingContent.includes('user.careerStage === "PROFESSIONAL"'), 'Missing pro redirect in junior onboarding');
  assert(juniorOnboardingContent.includes('user.careerStage === "STUDENT"'), 'Missing student redirect in junior onboarding');
  assert(juniorOnboardingContent.includes('router.replace("/onboarding/professional")'), 'Missing replace /onboarding/professional in junior onboarding');
  assert(juniorOnboardingContent.includes('router.replace("/onboarding/student")'), 'Missing replace /onboarding/student in junior onboarding');
});

// Test 6: Verify API auth session returns careerStage
test('API /api/auth/session selects and returns user careerStage and gradeLevel', () => {
  const sessionApiContent = fs.readFileSync(path.join(rootDir, 'src/app/api/auth/session/route.ts'), 'utf8');
  assert(sessionApiContent.includes('career_stage'), 'Missing career_stage in session select');
  assert(sessionApiContent.includes('careerStage: profile?.career_stage'), 'Missing careerStage in returned user object');
});

// Test 7: Verify OTP service getRedirectForRole supports careerStage
test('OTP service getRedirectForRole handles careerStage accurately', () => {
  const otpServiceContent = fs.readFileSync(path.join(rootDir, 'src/lib/otp-service.ts'), 'utf8');
  assert(otpServiceContent.includes('careerStage === "JUNIOR"'), 'Missing junior check in otp redirect');
  assert(otpServiceContent.includes('careerStage === "STUDENT"'), 'Missing student check in otp redirect');
});

// Test 8: Verify Main Dashboard distinguishes College vs Professional tabs based on careerStage
test('Main dashboard initializes and switches tab based on user careerStage', () => {
  const dashContent = fs.readFileSync(path.join(rootDir, 'src/app/dashboard/page.tsx'), 'utf8');
  assert(dashContent.includes('profile?.careerStage === "STUDENT" || user?.careerStage === "STUDENT"'), 'Missing student stage initial state');
  assert(dashContent.includes('setCareerStage("college")'), 'Missing setCareerStage college');
  assert(dashContent.includes('setCareerStage("working_professional")'), 'Missing setCareerStage working_professional');
});

console.log(`\n========================================\nTotal: ${total} | Passed: ${passed} | Failed: ${total - passed}\n========================================`);

if (passed === total) {
  console.log('?? ALL CAREER STAGE SIGN-UP & LOGIN ISOLATION TESTS PASSED 100%!');
  process.exit(0);
} else {
  process.exit(1);
}

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Verification: Phase 22 Mobile Career-Stage Experience ---\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`âœ… [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`âŒ [FAIL] ${name}: ${err.message}`);
  }
}

const rootDir = path.resolve(__dirname, '..');

// Test 1: Types definition for CareerStage
runTest('1. Types definition includes CareerStage enum', () => {
  const typesContent = fs.readFileSync(path.join(rootDir, 'src/lib/types.ts'), 'utf8');
  assert(typesContent.includes('export type CareerStage = "JUNIOR" | "STUDENT" | "PROFESSIONAL"'), 'CareerStage type must be exported with JUNIOR, STUDENT, PROFESSIONAL');
  assert(typesContent.includes('careerStage?: CareerStage'), 'UserProfile and AppUser must have careerStage');
});

// Test 2: Auth Context supports careerStage
runTest('2. AuthContext signupWithEmail accepts and persists careerStage', () => {
  const authContent = fs.readFileSync(path.join(rootDir, 'src/lib/auth-context.tsx'), 'utf8');
  assert(authContent.includes('careerStage?: CareerStage'), 'signupWithEmail must accept careerStage argument');
  assert(authContent.includes('careerStage: computedCareerStage'), 'syncUserData must persist careerStage');
});

// Test 3: Landing page contains mobile career-stage section and confirmation modal
runTest('3. Landing page contains career-stage switcher, cards, and modal', () => {
  const landingPage = fs.readFileSync(path.join(rootDir, 'src/app/page.tsx'), 'utf8');
  const stageComponent = fs.readFileSync(path.join(rootDir, 'src/components/landing/CareerStageSection.tsx'), 'utf8');
  
  assert(landingPage.includes('Real adaptability') || stageComponent.includes('Real adaptability'), 'Hero copy missing');
  assert(landingPage.includes('for every career stage') || stageComponent.includes('for every career stage'), 'Hero subtitle copy missing');
  assert(stageComponent.includes('Junior School Lab'), 'Junior School Lab card missing');
  assert(stageComponent.includes('Student & Campus'), 'Student & Campus card missing');
  assert(stageComponent.includes('Working Professional'), 'Working Professional card missing');
  assert(stageComponent.includes('You selected'), 'Stage confirmation modal missing');
  assert(stageComponent.includes('Continue with'), 'Stage confirmation continue button missing');
  assert(stageComponent.includes('Change Stage'), 'Stage confirmation change button missing');
});

// Test 4: Sign In page has unified flow and zero role leakage
runTest('4. Login page provides unified authentication and zero role leakage', () => {
  const loginPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
  assert(loginPage.includes('Sign In') || loginPage.includes('Sign in'), 'Login page must have Sign in header');
  assert(loginPage.includes('signInWithEmail') || loginPage.includes('password'), 'Login page must support authentication');
  assert(!loginPage.includes('Founder') && !loginPage.includes('Super Admin'), 'Login page must not leak internal roles');
});

// Test 5: Sign Up page has segmented switcher, common fields, and stage-specific fields
runTest('5. Adaptive Sign Up page supports Junior, Student, and Professional fields', () => {
  const signupPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/signup/page.tsx'), 'utf8');
  assert(signupPage.includes('selectedStage'), 'Signup page must track selectedStage');
  assert(signupPage.includes('schoolName'), 'Junior school name field missing');
  assert(signupPage.includes('guardianName') && signupPage.includes('guardianEmail'), 'Junior guardian consent fields missing');
  assert(signupPage.includes('DPDP Act'), 'DPDP Act compliance reference missing');
  assert(signupPage.includes('collegeName') && signupPage.includes('degree'), 'Student college and degree fields missing');
  assert(signupPage.includes('currentRole') && signupPage.includes('experienceYears'), 'Professional role and experience fields missing');
  assert(signupPage.includes('No OTP'), 'Phone number No OTP badge missing');
  assert(signupPage.includes('showPassword'), 'Password eye toggle missing');
  assert(signupPage.includes('/onboarding/junior'), 'Junior onboarding route missing');
  assert(signupPage.includes('/onboarding/student'), 'Student onboarding route missing');
  assert(signupPage.includes('/onboarding/professional'), 'Professional onboarding route missing');
});

// Test 6: Junior flow protects minors and never asks adult career fields in junior section
runTest('6. Junior flow enforces minor safety and DPDP compliance', () => {
  const signupPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/signup/page.tsx'), 'utf8');
  assert(signupPage.includes('isUnder13'), 'Under 13 block check missing');
  assert(signupPage.includes('guardianConsentAgreed'), 'Guardian consent agreement missing');
  assert(signupPage.includes('Start Junior Learning Track'), 'Junior button text missing');
});

// Test 7: Stage-specific onboarding pages exist
runTest('7. Stage-specific onboarding pages exist and are properly structured', () => {
  assert(fs.existsSync(path.join(rootDir, 'src/app/onboarding/junior/page.tsx')), 'junior onboarding page exists');
  assert(fs.existsSync(path.join(rootDir, 'src/app/onboarding/student/page.tsx')), 'student onboarding page exists');
  assert(fs.existsSync(path.join(rootDir, 'src/app/onboarding/professional/page.tsx')), 'professional onboarding page exists');

  const juniorOnb = fs.readFileSync(path.join(rootDir, 'src/app/onboarding/junior/page.tsx'), 'utf8');
  assert(juniorOnb.includes('Junior School Lab') || juniorOnb.includes('Junior'), 'Junior page content verified');
  assert(juniorOnb.includes('Curiosity') || juniorOnb.includes('Quests'), 'Junior quests verified');

  const studentOnb = fs.readFileSync(path.join(rootDir, 'src/app/onboarding/student/page.tsx'), 'utf8');
  assert(studentOnb.includes('Student & Campus') || studentOnb.includes('Student'), 'Student page content verified');

  const proOnb = fs.readFileSync(path.join(rootDir, 'src/app/onboarding/professional/page.tsx'), 'utf8');
  assert(proOnb.includes('Working Professional') || proOnb.includes('Career OS'), 'Pro page content verified');
});

// Test 8: Central onboarding router auto-routes by careerStage
runTest('8. Central onboarding page routes by careerStage', () => {
  const centralOnb = fs.readFileSync(path.join(rootDir, 'src/app/onboarding/page.tsx'), 'utf8');
  assert(centralOnb.includes('/onboarding/junior'), 'Routes to junior');
  assert(centralOnb.includes('/onboarding/student'), 'Routes to student');
  assert(centralOnb.includes('/onboarding/professional'), 'Routes to professional');
});

// Test 9: No Google auth buttons in login or signup pages (email-only policy requirement)
runTest('9. Email-only auth policy maintained (no Google buttons in login/signup)', () => {
  const loginPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/login/page.tsx'), 'utf8');
  const signupPage = fs.readFileSync(path.join(rootDir, 'src/app/auth/signup/page.tsx'), 'utf8');
  assert(!loginPage.includes('Continue with Google'), 'Login page must not have Google button');
  assert(!signupPage.includes('Sign up with Google'), 'Signup page must not have Google button');
});

// Test 10: Strict RBAC role isolation maintained
runTest('10. Strict Role Isolation maintained', () => {
  const landingPage = fs.readFileSync(path.join(rootDir, 'src/app/page.tsx'), 'utf8');
  assert(!landingPage.includes('href="/hr"') && !landingPage.includes('href="/founder"') && !landingPage.includes('href="/employee"'), 'Internal admin routes must not be in public landing nav');
});

console.log(`\n========================================`);
console.log(`Total: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}


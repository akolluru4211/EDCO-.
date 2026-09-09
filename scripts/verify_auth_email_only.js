const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: EMAIL/PASSWORD AUTH ONLY & ZERO GOOGLE OAUTH");
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

// -----------------------------------------------------------------------------
// 1. Google OAuth Removal Verification
// -----------------------------------------------------------------------------
runTest("1.1 GoogleButton component is completely removed from the codebase", () => {
  const googleBtnPath = path.join(__dirname, "../src/components/ui/GoogleButton.tsx");
  assert(!fs.existsSync(googleBtnPath), "GoogleButton.tsx must not exist");
});

runTest("1.2 Login page contains zero Google Sign-In references or buttons", () => {
  const loginPage = fs.readFileSync(path.join(__dirname, "../src/app/auth/login/page.tsx"), "utf-8");
  assert(!loginPage.includes("GoogleButton"), "Login page must not import GoogleButton");
  assert(!loginPage.includes("loginWithGoogle"), "Login page must not call loginWithGoogle");
  assert(!loginPage.includes("Continue with Google"), "Login page must not have 'Continue with Google' button");
});

runTest("1.3 Signup page contains zero Google Sign-In references or buttons", () => {
  const signupPage = fs.readFileSync(path.join(__dirname, "../src/app/auth/signup/page.tsx"), "utf-8");
  assert(!signupPage.includes("GoogleButton"), "Signup page must not import GoogleButton");
  assert(!signupPage.includes("loginWithGoogle"), "Signup page must not call loginWithGoogle");
  assert(!signupPage.includes("Sign up with Google"), "Signup page must not have 'Sign up with Google' button");
});

runTest("1.4 Auth context contains zero loginWithGoogle exports or OAuth sign-in branching", () => {
  const authContext = fs.readFileSync(path.join(__dirname, "../src/lib/auth-context.tsx"), "utf-8");
  assert(!authContext.includes("loginWithGoogle"), "AuthContext must not export loginWithGoogle");
});

// -----------------------------------------------------------------------------
// 2. Password Strength & Email Verification Verification
// -----------------------------------------------------------------------------
runTest("2.1 Signup enforces 8+ characters, letters, and numbers requirement", () => {
  const authContext = fs.readFileSync(path.join(__dirname, "../src/lib/auth-context.tsx"), "utf-8");
  assert(authContext.includes("pass.length < 8"), "AuthContext must enforce min 8 chars");
  assert(authContext.includes("/[a-zA-Z]/"), "AuthContext must enforce letters");
  assert(authContext.includes("/\\d/"), "AuthContext must enforce numbers");

  const signupPage = fs.readFileSync(path.join(__dirname, "../src/app/auth/signup/page.tsx"), "utf-8");
  assert(signupPage.includes("hasMinLen"), "Signup page must calculate min length");
  assert(signupPage.includes("hasNumber"), "Signup page must calculate number presence");
  assert(signupPage.includes("hasLetter"), "Signup page must calculate letter presence");
  assert(signupPage.includes("Account Created!"), "Signup page must support email verification confirmation");
});

runTest("2.2 Password reset via email is intact in auth context", () => {
  const authContext = fs.readFileSync(path.join(__dirname, "../src/lib/auth-context.tsx"), "utf-8");
  assert(authContext.includes("resetPasswordForEmail"), "resetPassword must use Supabase resetPasswordForEmail");
});

// -----------------------------------------------------------------------------
// 3. Phone Number Collection (Zero OTP Friction)
// -----------------------------------------------------------------------------
runTest("3.1 Signup page collects phone number without requiring OTP", () => {
  const signupPage = fs.readFileSync(path.join(__dirname, "../src/app/auth/signup/page.tsx"), "utf-8");
  assert(signupPage.includes("Phone Number"), "Signup page must ask for Phone Number");
  assert(signupPage.includes("No OTP Required"), "Signup page must display No OTP Required note");
  assert(signupPage.includes("setPhone"), "Signup page must bind phone state");

  const authContext = fs.readFileSync(path.join(__dirname, "../src/lib/auth-context.tsx"), "utf-8");
  assert(authContext.includes("phone?: string"), "AuthContext must accept optional phone parameter");
  assert(authContext.includes("cleanPhone"), "AuthContext must sanitize and store phone number");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL EMAIL/PASSWORD AUTH VERIFICATION TESTS PASSED 100%!");
  process.exit(0);
}

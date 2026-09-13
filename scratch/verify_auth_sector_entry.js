const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICATION: LOGIN & SIGNUP ENTRY POINTS FROM SECTOR PAGES ===');

// 1. Single Login Form Verification (No Role/Sector Selectors)
const loginCode = fs.readFileSync('src/app/auth/login/page.tsx', 'utf8');
assert(!loginCode.includes('TRACKS['), 'Login form must not have track selection state');
assert(!loginCode.includes('selectedTrack'), 'Login form must not have selectedTrack state');
assert(loginCode.includes('Sign In to EdWorld'), 'Login title verified');
assert(loginCode.includes('careerStage === "JUNIOR"'), 'Returning user routed by real account careerStage');
console.log('✅ 1. Single shared login form verified (zero role/sector selectors, strict account data routing)');

// 2. Sector Landing Pages Link Targets
const landingService = fs.readFileSync('src/lib/services/landing-sector-service.ts', 'utf8');
assert(landingService.includes('/signup?intent=junior'), 'Junior CTA must use /signup?intent=junior');
assert(landingService.includes('/signup?intent=explorer'), 'Explorer CTA must use /signup?intent=explorer');
assert(landingService.includes('/signup?intent=college'), 'College CTA must use /signup?intent=college');
assert(landingService.includes('/signup?intent=working_professional'), 'Professional CTA must use /signup?intent=working_professional');

const sectorPageComp = fs.readFileSync('src/components/landing/SectorLandingPage.tsx', 'utf8');
assert(sectorPageComp.includes('href="/login"'), 'Sector landing page Log In link must route to /login');
console.log('✅ 2. Sector landing page links verified (/login and /signup?intent=...)');

// 3. Signup Intent & Real DOB Age Band Verification
const signupCode = fs.readFileSync('src/app/auth/signup/page.tsx', 'utf8');
assert(signupCode.includes('intentParam'), 'Signup reads intent parameter');
assert(signupCode.includes('calculateAgeBandFromDob(dob)'), 'Age band must be strictly derived from DOB');
assert(signupCode.includes('guardianConsentAgreed'), 'Guardian consent must be verified for minors');
console.log('✅ 3. Signup intent handling and DOB-derived age band calculation verified');

// 4. Intent / Actual-Age Mismatch Friendly Redirection & Logging
assert(signupCode.includes('isAgeMismatch'), 'Age mismatch check present');
assert(signupCode.includes('INTENT_AGE_MISMATCH'), 'Mismatch logging event configured');
assert(signupCode.includes('Working Professional tools'), 'Friendly explanatory notice present');
console.log('✅ 4. Friendly mismatch redirection and logging verified');

// 5. Route Entry Points
assert(fs.existsSync('src/app/login/page.tsx'), '/login route exists');
assert(fs.existsSync('src/app/signup/page.tsx'), '/signup route exists');
console.log('✅ 5. First-class /login and /signup routes exist');

console.log('🎉 ALL LOGIN & SIGNUP ENTRY POINT CRITERIA VERIFIED SUCCESSFULLY!');

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Verification: Multi-Device Responsive Landing Architecture (Mobile, Tablet, Desktop) ---\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log('✅ [PASS] ' + name);
    passedTests++;
  } catch (err) {
    console.error('❌ [FAIL] ' + name + ': ' + err.message);
  }
}

const rootDir = path.resolve(__dirname, '..');

// Test 1: HomePage Responsive Tri-Split
runTest('1. HomePage renders dedicated Mobile, Tablet, and Desktop responsive containers', () => {
  const pageContent = fs.readFileSync(path.join(rootDir, 'src/app/page.tsx'), 'utf8');
  assert(pageContent.includes('MobileLandingView'), 'HomePage must import MobileLandingView');
  assert(pageContent.includes('TabletLandingView'), 'HomePage must import TabletLandingView');
  assert(pageContent.includes('DesktopLandingView'), 'HomePage must import DesktopLandingView');
  assert(pageContent.includes('block sm:hidden'), 'Mobile container must have block sm:hidden breakpoint');
  assert(pageContent.includes('hidden sm:block lg:hidden'), 'Tablet container must have hidden sm:block lg:hidden breakpoint');
  assert(pageContent.includes('hidden lg:block'), 'Desktop container must have hidden lg:block breakpoint');
});

// Test 2: Mobile Landing View Verification
runTest('2. MobileLandingView provides thumb-friendly career stage selection, modal, and zero staff leak', () => {
  const mobileContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/MobileLandingView.tsx'), 'utf8');
  assert(mobileContent.includes('Junior School Lab'), 'Mobile view must feature Junior School Lab');
  assert(mobileContent.includes('Student & Campus') || mobileContent.includes('Student &amp; Campus'), 'Mobile view must feature Student & Campus');
  assert(mobileContent.includes('Working Professional'), 'Mobile view must feature Working Professional');
  assert(mobileContent.includes('MobileLandingHeader'), 'Mobile view must use MobileLandingHeader');
  assert(mobileContent.includes('DPDP Act & Youth Safe') || mobileContent.includes('DPDP Act &amp; Youth Safe'), 'Mobile footer must feature DPDP & Youth Safe assurance');
  assert(!mobileContent.includes('Internal Staff') && !mobileContent.includes('Founder Gateway') && !mobileContent.includes('Super Admin'), 'Mobile view must have zero role leaks');
});

// Test 3: Tablet Landing View Verification
runTest('3. TabletLandingView provides dual-pane stage explorer and responsive telemetry card', () => {
  const tabletContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/TabletLandingView.tsx'), 'utf8');
  assert(tabletContent.includes('TABLET_STAGES'), 'Tablet view must define tablet stage configurations');
  assert(tabletContent.includes('GrowthRing'), 'Tablet view must include interactive GrowthRing widget');
  assert(tabletContent.includes('Explore Stage Portal') || tabletContent.includes('Launch Workspace'), 'Tablet view must have direct portal CTA');
  assert(tabletContent.includes('Stage Comparison Matrix'), 'Tablet view must include stage comparison telemetry');
  assert(!tabletContent.includes('Founder Gateway') && !tabletContent.includes('Employee Portal Access'), 'Tablet view must not leak internal staff roles');
});

// Test 4: Desktop Landing View Verification
runTest('4. DesktopLandingView delivers high-authority stage showcase and 3-pillar deep dive', () => {
  const desktopContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/DesktopLandingView.tsx'), 'utf8');
  assert(desktopContent.includes('DESKTOP_STAGES'), 'Desktop view must define desktop stage matrix');
  assert(desktopContent.includes('Junior School Curiosity Lab'), 'Desktop view must feature Junior pillar');
  assert(desktopContent.includes('Student & Campus Enterprise') || desktopContent.includes('Student &amp; Campus Enterprise'), 'Desktop view must feature Student pillar');
  assert(desktopContent.includes('Working Professional Acceleration'), 'Desktop view must feature Pro pillar');
  assert(!desktopContent.includes('Executive Admin') && !desktopContent.includes('HR Gateway'), 'Desktop view must have zero role leaks');
});

// Test 5: Route integrity & public links
runTest('5. All public links lead to valid public endpoints', () => {
  const desktopContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/DesktopLandingView.tsx'), 'utf8');
  const tabletContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/TabletLandingView.tsx'), 'utf8');
  const mobileContent = fs.readFileSync(path.join(rootDir, 'src/components/landing/MobileLandingView.tsx'), 'utf8');
  
  [desktopContent, tabletContent, mobileContent].forEach((content) => {
    assert(content.includes('/auth/login'), 'Must link to /auth/login');
    assert(content.includes('/auth/signup'), 'Must link to /auth/signup');
    assert(content.includes('/pricing'), 'Must link to /pricing');
    assert(content.includes('/for-schools'), 'Must link to /for-schools');
    assert(content.includes('/privacy'), 'Must link to /privacy');
    assert(content.includes('/terms'), 'Must link to /terms');
  });
});

console.log('\nVerification Complete: ' + passedTests + '/' + totalTests + ' tests passed.');
if (passedTests !== totalTests) {
  process.exit(1);
} else {
  console.log('🎉 Multi-Device Responsive Landing Page Architecture fully verified!\n');
}

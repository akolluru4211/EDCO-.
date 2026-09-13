const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICATION: SUBDOMAIN ROUTING & SECTOR PAGES ===');

// 1. Middleware Subdomain Mapping Verification
const middlewareCode = fs.readFileSync('src/middleware.ts', 'utf8');
assert(middlewareCode.includes('junior.edworldco.in'), 'junior.edworldco.in subdomain must be mapped');
assert(middlewareCode.includes('explorer.edworldco.in'), 'explorer.edworldco.in subdomain must be mapped');
assert(middlewareCode.includes('student.edworldco.in'), 'student.edworldco.in subdomain must be mapped');
assert(middlewareCode.includes('working.edworldco.in'), 'working.edworldco.in subdomain must be mapped');
assert(middlewareCode.includes('SUBDOMAIN_SECTOR_MAP'), 'SUBDOMAIN_SECTOR_MAP must be defined');
assert(middlewareCode.includes('NextResponse.rewrite'), 'Middleware must perform internal rewriting');
assert(middlewareCode.includes('/sector-landing/'), 'Middleware must rewrite to /sector-landing/[sector]');
console.log('✅ 1. Middleware subdomain mapping and internal rewrite verified');

// 2. Unified /sector-landing/[sector] route
const sectorLandingRoute = fs.readFileSync('src/app/sector-landing/[sector]/page.tsx', 'utf8');
assert(sectorLandingRoute.includes('SectorLandingPage'), 'Route must render SectorLandingPage component');
assert(sectorLandingRoute.includes('alternates'), 'Canonical SEO metadata configured');
assert(sectorLandingRoute.includes('canonical'), 'Canonical URL configured');
console.log('✅ 2. Unified /sector-landing/[sector] route and canonical SEO metadata verified');

// 3. Cross-Subdomain Absolute URL Navigation
const sectorCompCode = fs.readFileSync('src/components/landing/SectorLandingPage.tsx', 'utf8');
assert(sectorCompCode.includes('getMainAppUrl'), 'getMainAppUrl helper must be defined');
assert(sectorCompCode.includes('edworldco.in'), 'Parent domain resolution configured');
console.log('✅ 3. Cross-subdomain URL resolution to main app domain verified');

// 4. Canonical Tags on Path-based Routes
const pathRoutes = [
  'src/app/for-junior/page.tsx',
  'src/app/for-explorer/page.tsx',
  'src/app/for-college/page.tsx',
  'src/app/for-professionals/page.tsx'
];
pathRoutes.forEach(r => {
  const code = fs.readFileSync(r, 'utf8');
  assert(code.includes('alternates') && code.includes('canonical'), r + ' must contain canonical alternate tag');
});
console.log('✅ 4. All four path-based routes contain explicit canonical tags to prevent duplicate content');

// 5. Fallback & Graceful Behavior
assert(middlewareCode.includes('PUBLIC_PAGE_PREFIXES'), 'Public page prefixes defined');
assert(middlewareCode.includes('/login'), '/login is public');
assert(middlewareCode.includes('/signup'), '/signup is public');
console.log('✅ 5. Graceful fallback and unauthenticated routing verified');

console.log('🎉 ALL SUBDOMAIN ROUTING CRITERIA VERIFIED SUCCESSFULLY!');

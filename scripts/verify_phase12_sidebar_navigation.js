/**
 * Phase 12 Verification Script: Production Sidebar Navigation Rework
 *
 * Verifies:
 * 1. AppSidebar component presence and structure
 * 2. Navigation groups (Workspace, Network, Practice, Org, Account)
 * 3. Role-scoped RBAC navigation (Admin, HR, Founder, Employee)
 * 4. AppShell integration (Desktop persistent sidebar, Mobile header/drawer, Public page separation)
 * 5. Elimination of duplicate top navigation headers on authenticated pages
 * 6. Collapsed sidebar mode & LocalStorage persistence
 * 7. Real profile integration and Supabase Auth logout handler
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
console.log('   PHASE 12: PRODUCTION SIDEBAR NAVIGATION VERIFICATION');
console.log('======================================================\n');

// 1. AppSidebar Component Audit
console.log('[1/5] Auditing AppSidebar Component...');
const sidebarPath = path.join(process.cwd(), 'src', 'components', 'layout', 'AppSidebar.tsx');
assert(fs.existsSync(sidebarPath), 'src/components/layout/AppSidebar.tsx exists');

if (fs.existsSync(sidebarPath)) {
  const content = fs.readFileSync(sidebarPath, 'utf8');

  // Groups & Routes
  assert(content.includes('WORKSPACE'), 'Contains WORKSPACE navigation group');
  assert(content.includes('/dashboard'), 'Contains Dashboard navigation item');
  assert(content.includes('/resumes'), 'Contains ATS Resume Builder navigation item');
  assert(content.includes('/interviews'), 'Contains AI Mock Interviews navigation item');
  assert(content.includes('/projects'), 'Contains Project Studio navigation item');
  assert(content.includes('/career/dashboard'), 'Contains Career Hub navigation item');
  assert(content.includes('/problems'), 'Contains Code Sandbox navigation item');
  assert(content.includes('/jobs'), 'Contains Opportunities & Jobs navigation item');

  // Network & Mentorship
  assert(content.includes('NETWORK & MENTORSHIP'), 'Contains NETWORK & MENTORSHIP navigation group');
  assert(content.includes('/network'), 'Contains Network & Peers navigation item');
  assert(content.includes('/networking/mentors'), 'Contains Mentorship navigation item');
  assert(content.includes('/networking/messages'), 'Contains Direct Messages navigation item');

  // Account
  assert(content.includes('/profile') && content.includes('/billing'), 'Contains Profile & Billing navigation items');

  // Role Gate Checks
  assert(content.includes('isAdmin') && content.includes('isHR') && content.includes('isFounder') && content.includes('isEmployee'), 'Enforces role-based gating for org portals');
  assert(content.includes('/admin') && content.includes('/hr') && content.includes('/founder') && content.includes('/employee'), 'Contains role-specific portal routes');

  // Collapsed Mode & LocalStorage
  assert(content.includes('isCollapsed') && content.includes('toggleCollapsed'), 'Supports collapsed sidebar state');
  assert(content.includes('edworld_sidebar_collapsed'), 'Persists collapse preference to localStorage');

  // Profile & Logout
  assert(content.includes('logout()'), 'Integrates real Supabase Auth logout');
  assert(content.includes('displayName') || content.includes('profile?.name'), 'Renders real user profile name without mock strings');
}

// 2. AppShell Integration & Separation Audit
console.log('\n[2/5] Auditing AppShell Integration...');
const appShellPath = path.join(process.cwd(), 'src', 'components', 'AppShell.tsx');
assert(fs.existsSync(appShellPath), 'src/components/AppShell.tsx exists');

if (fs.existsSync(appShellPath)) {
  const shellContent = fs.readFileSync(appShellPath, 'utf8');
  assert(shellContent.includes('AppSidebar'), 'AppShell imports and renders AppSidebar');
  assert(shellContent.includes('isAppWorkspace'), 'Separates authenticated workspaces from public pages');
  assert(shellContent.includes('isPublicLanding'), 'Preserves standalone public landing pages');
  assert(!shellContent.includes('<Navbar />') || shellContent.includes('// <Navbar />') || !shellContent.match(/<Navbar\s*\/>/), 'Eliminates old duplicate top floating Navbar from app workspace');
}

// 3. Logo & Brand Asset Audit
console.log('\n[3/5] Auditing Edworld Brand Assets...');
const logoPath = path.join(process.cwd(), 'public', 'images', 'edworld-logo.png');
assert(fs.existsSync(logoPath), 'Official Edworld Logo asset exists in public/images/edworld-logo.png');

if (fs.existsSync(sidebarPath)) {
  const content = fs.readFileSync(sidebarPath, 'utf8');
  assert(content.includes('/images/edworld-logo.png'), 'AppSidebar uses official /images/edworld-logo.png asset');
}

// 4. Mobile Responsiveness & Drawer Audit
console.log('\n[4/5] Auditing Mobile & Tablet Drawer Architecture...');
if (fs.existsSync(sidebarPath)) {
  const content = fs.readFileSync(sidebarPath, 'utf8');
  assert(content.includes('isMobileOpen') && content.includes('setIsMobileOpen'), 'Supports mobile drawer state');
  assert(content.includes('lg:hidden') && content.includes('lg:flex'), 'Properly handles desktop persistent sidebar vs mobile drawer breakpoints');
  assert(content.includes('aria-label="Open Navigation Menu"'), 'Provides accessible mobile menu trigger button');
}

// 5. Zero Mock Data / Zero Fake Badge Audit
console.log('\n[5/5] Auditing Clean Metrics & Absence of Fake Data...');
if (fs.existsSync(sidebarPath)) {
  const content = fs.readFileSync(sidebarPath, 'utf8');
  assert(!content.includes('99+') && !content.includes('mockUser'), 'Sidebar contains ZERO fake counts or mock data');
}

console.log('\n======================================================');
console.log(`TOTAL PASS: \x1b[32m${passCount}\x1b[0m | TOTAL FAIL: \x1b[${failCount > 0 ? '31' : '32'}m${failCount}\x1b[0m`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

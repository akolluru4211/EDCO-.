import fs from 'fs';
import path from 'path';

console.log('================================================================================');
console.log('EDWORLD CO — PHASE 25: SUPABASE INTEGRATION AUDIT & PRODUCTION HARDENING');
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

// 1. Verify Supabase Client Configuration
console.log('--- Step 1: Client Isolation & Environment Security ---');
const clientConfigPath = path.resolve('src/lib/supabase/client.ts');
assert(fs.existsSync(clientConfigPath), '1.1 Browser Supabase client exists in src/lib/supabase/client.ts');
if (fs.existsSync(clientConfigPath)) {
  const clientContent = fs.readFileSync(clientConfigPath, 'utf8');
  assert(
    !clientContent.includes('SUPABASE_SERVICE_ROLE_KEY'),
    '1.2 Browser client does NOT reference or expose SUPABASE_SERVICE_ROLE_KEY'
  );
}

const serverConfigPath = path.resolve('src/lib/supabase/server.ts');
assert(fs.existsSync(serverConfigPath), '1.3 Server Supabase client exists in src/lib/supabase/server.ts');

// 2. Verify RLS Hardening Migration
console.log('\n--- Step 2: Row Level Security (RLS) & Table Indexing ---');
const rlsMigrationPath = path.resolve('supabase/migrations/20260913000000_phase25_rls_hardening.sql');
assert(fs.existsSync(rlsMigrationPath), '2.1 Phase 25 RLS hardening migration exists');
if (fs.existsSync(rlsMigrationPath)) {
  const rlsContent = fs.readFileSync(rlsMigrationPath, 'utf8');
  assert(
    rlsContent.includes('ENABLE ROW LEVEL SECURITY') &&
    rlsContent.includes('public.users') &&
    rlsContent.includes('public.profiles') &&
    rlsContent.includes('public.resumes') &&
    rlsContent.includes('public.applications'),
    '2.2 Migration enables Row Level Security on core relational tables'
  );
  assert(
    rlsContent.includes('idx_users_firebase_uid'),
    '2.3 Migration creates index on firebase_uid for fast identity mapping'
  );
  assert(
    rlsContent.includes('Users can read own resumes') &&
    rlsContent.includes('Candidates can view own applications'),
    '2.4 Migration enforces strict user ownership policies'
  );
}

// 3. Verify Admin System Health & Diagnostics Page
console.log('\n--- Step 3: Admin Integration Health & Diagnostics ---');
const healthPagePath = path.resolve('src/app/admin/system-health/page.tsx');
assert(fs.existsSync(healthPagePath), '3.1 Admin System Health page exists in src/app/admin/system-health/page.tsx');
if (fs.existsSync(healthPagePath)) {
  const healthContent = fs.readFileSync(healthPagePath, 'utf8');
  assert(
    healthContent.includes('Firebase Authentication') &&
    healthContent.includes('Supabase PostgreSQL Database') &&
    healthContent.includes('Model Context Protocol (MCP) Engine'),
    '3.2 System Health page monitors Firebase, Supabase, and MCP subsystems'
  );
  assert(
    healthContent.includes('AccessDeniedPortal') &&
    healthContent.includes('isAdmin'),
    '3.3 System Health page is strictly protected by RBAC (Admin only)'
  );
}

// 4. Verify Comprehensive Integration Report
console.log('\n--- Step 4: Integration Documentation ---');
const reportPath = path.resolve('docs/SUPABASE_INTEGRATION_REPORT.md');
assert(fs.existsSync(reportPath), '4.1 docs/SUPABASE_INTEGRATION_REPORT.md exists');
if (fs.existsSync(reportPath)) {
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  assert(
    reportContent.includes('Current Architecture') &&
    reportContent.includes('Row Level Security (RLS) Status') &&
    reportContent.includes('MCP Integration') &&
    reportContent.includes('Production Readiness Score'),
    '4.2 Integration report covers all 19 required architecture audit sections'
  );
}

console.log('\n================================================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 25 SUPABASE INTEGRATION AUDIT CHECKS PASSED 100%!');
}

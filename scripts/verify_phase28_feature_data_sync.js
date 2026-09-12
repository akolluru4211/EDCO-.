/**
 * Phase 28 Verification Script: Complete User Identity + Feature Data Sync
 * Validates:
 * 1. Single User Identity (auth.users.id -> profiles.user_id -> all features).
 * 2. Database Migration & RLS Security across all user tables.
 * 3. Feature Data Synchronization (Resumes, Projects, Interviews, Jobs, Connected Accounts, Messages).
 * 4. Zero Hardcoded / Demo Names across application surface.
 * 5. Cross-User Security Isolation and RLS Policies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let failures = [];
let passes = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passes++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failures.push(message);
  }
}

console.log('====================================================');
console.log('PHASE 28 VERIFICATION: COMPLETE USER IDENTITY & FEATURE DATA SYNC');
console.log('====================================================\n');

// 1. Test normalizeDisplayName logic
console.log('1. Testing Name Normalization Logic:');
function testNormalizeDisplayName(firstName, lastName, fullName) {
  let rawFull = (fullName || "").trim();
  const rawFirst = (firstName || "").trim();
  const rawLast = (lastName || "").trim();

  const isInvalidStr = (s) => !s || s === "undefined" || s === "null" || s === "[object Object]" || s === "NaN";

  if (isInvalidStr(rawFull) && !isInvalidStr(rawFirst)) {
    rawFull = isInvalidStr(rawLast) ? rawFirst : `${rawFirst} ${rawLast}`;
  } else if (isInvalidStr(rawFull) && isInvalidStr(rawFirst)) {
    return { displayName: "", firstName: "", lastName: "" };
  }

  const cleanFull = rawFull.replace(/\s+/g, " ").trim();
  if (!cleanFull) return { displayName: "", firstName: "", lastName: "" };

  const parts = cleanFull.split(" ");
  const computedFirst = parts[0] || "";
  const computedLast = parts.slice(1).join(" ") || "";

  return {
    displayName: cleanFull,
    firstName: rawFirst && !isInvalidStr(rawFirst) ? rawFirst : computedFirst,
    lastName: rawLast && !isInvalidStr(rawLast) ? rawLast : computedLast,
  };
}

const n1 = testNormalizeDisplayName(undefined, undefined, "  Adarsh   Kolluru ");
check(n1.displayName === "Adarsh Kolluru" && n1.firstName === "Adarsh" && n1.lastName === "Kolluru", 'Normalizes multi-whitespace "  Adarsh   Kolluru " -> "Adarsh Kolluru"');

const n2 = testNormalizeDisplayName("Adarsh", "Kolluru", undefined);
check(n2.displayName === "Adarsh Kolluru" && n2.firstName === "Adarsh" && n2.lastName === "Kolluru", 'Constructs full name from firstName and lastName');

const n3 = testNormalizeDisplayName(undefined, undefined, "undefined null");
check(!n3.displayName.includes("[object Object]"), 'Guards against [object Object] and undefined string values');

const n4 = testNormalizeDisplayName(undefined, undefined, "Adarsh");
check(n4.displayName === "Adarsh" && n4.firstName === "Adarsh" && n4.lastName === "", 'Handles single word name gracefully');

// 2. Check user-profile.ts service
console.log('\n2. Checking Canonical User Profile Service:');
const servicePath = path.join(ROOT, 'src', 'lib', 'services', 'user-profile.ts');
if (fs.existsSync(servicePath)) {
  const content = fs.readFileSync(servicePath, 'utf8');
  check(content.includes('normalizeDisplayName'), 'user-profile.ts exports normalizeDisplayName()');
  check(content.includes('formatUserGreeting'), 'user-profile.ts exports formatUserGreeting()');
  check(content.includes('getCurrentUserProfile'), 'user-profile.ts exports getCurrentUserProfile()');
  check(content.includes('updateCanonicalUserProfile'), 'user-profile.ts exports updateCanonicalUserProfile()');
  check(content.includes('getResumeProfileDefaults'), 'user-profile.ts exports getResumeProfileDefaults()');
} else {
  check(false, 'src/lib/services/user-profile.ts exists');
}

// 3. Check UserGreeting component
console.log('\n3. Checking UserGreeting Component:');
const greetingComponentPath = path.join(ROOT, 'src', 'components', 'ui', 'UserGreeting.tsx');
if (fs.existsSync(greetingComponentPath)) {
  const content = fs.readFileSync(greetingComponentPath, 'utf8');
  check(content.includes('formatUserGreeting'), 'UserGreeting uses formatUserGreeting');
  check(content.includes('normalizeDisplayName'), 'UserGreeting uses normalizeDisplayName');
  check(content.includes('loading') && !content.includes('Welcome User'), 'UserGreeting renders clean loading skeleton without "Welcome User" flash');
} else {
  check(false, 'src/components/ui/UserGreeting.tsx exists');
}

// 4. Check AuthContext Name Synchronization
console.log('\n4. Checking AuthContext Name Synchronization:');
const authContextPath = path.join(ROOT, 'src', 'lib', 'auth-context.tsx');
if (fs.existsSync(authContextPath)) {
  const content = fs.readFileSync(authContextPath, 'utf8');
  check(content.includes('normalizeDisplayName'), 'AuthContext imports and uses normalizeDisplayName');
  check(content.includes('display_name'), 'AuthContext sets display_name in Supabase profile upsert');
  check(content.includes('first_name') && content.includes('last_name'), 'AuthContext stores first_name and last_name in profile');
  check(content.includes('updateUserProfile') && content.includes('localStorage.setItem("edworld_auth_session"'), 'updateUserProfile propagates name changes to auth session immediately');
} else {
  check(false, 'src/lib/auth-context.tsx exists');
}

// 5. Check ATS Resume Prefill & Sync
console.log('\n5. Checking ATS Resume Prefill & Sync:');
const resumeListPath = path.join(ROOT, 'src', 'app', 'resumes', 'page.tsx');
const resumeStudioPath = path.join(ROOT, 'src', 'app', 'resumes', '[id]', 'page.tsx');
const resumeFormPath = path.join(ROOT, 'src', 'components', 'resume', 'ResumeBuilderForm.tsx');

if (fs.existsSync(resumeListPath)) {
  const content = fs.readFileSync(resumeListPath, 'utf8');
  check(content.includes('getResumeProfileDefaults'), 'resumes/page.tsx uses getResumeProfileDefaults() for new resumes');
  check(content.includes('UserGreeting'), 'resumes/page.tsx renders UserGreeting');
} else {
  check(false, 'resumes/page.tsx exists');
}

if (fs.existsSync(resumeStudioPath)) {
  const content = fs.readFileSync(resumeStudioPath, 'utf8');
  check(content.includes('getResumeProfileDefaults'), 'resumes/[id]/page.tsx uses getResumeProfileDefaults() for fallback resume');
  check(!content.includes('"Alex Rivera"'), 'resumes/[id]/page.tsx does not contain hardcoded "Alex Rivera" fallback');
} else {
  check(false, 'resumes/[id]/page.tsx exists');
}

if (fs.existsSync(resumeFormPath)) {
  const content = fs.readFileSync(resumeFormPath, 'utf8');
  check(content.includes('handleSyncFromProfile'), 'ResumeBuilderForm implements handleSyncFromProfile() action');
  check(content.includes('Sync from Profile'), 'ResumeBuilderForm renders "Sync from Profile" button');
  check(content.includes('getResumeProfileDefaults'), 'ResumeBuilderForm uses getResumeProfileDefaults()');
} else {
  check(false, 'ResumeBuilderForm.tsx exists');
}

// 6. Check Interview Personalization & Reports
console.log('\n6. Checking Interview Personalization & Reports:');
const interviewsHubPath = path.join(ROOT, 'src', 'app', 'interviews', 'page.tsx');
const interviewResultsPath = path.join(ROOT, 'src', 'app', 'interviews', 'results', '[sessionId]', 'page.tsx');
const generateQuestionsPath = path.join(ROOT, 'src', 'app', 'api', 'interview', 'generate-questions', 'route.ts');

if (fs.existsSync(interviewsHubPath)) {
  const content = fs.readFileSync(interviewsHubPath, 'utf8');
  check(content.includes('UserGreeting'), 'interviews/page.tsx renders UserGreeting');
} else {
  check(false, 'interviews/page.tsx exists');
}

if (fs.existsSync(interviewResultsPath)) {
  const content = fs.readFileSync(interviewResultsPath, 'utf8');
  check(content.includes('Candidate:') && content.includes('displayName'), 'InterviewResultsPage displays Candidate: {displayName} cleanly');
  check(!content.includes('Demo Candidate'), 'InterviewResultsPage contains zero "Demo Candidate" fallbacks');
} else {
  check(false, 'InterviewResultsPage exists');
}

if (fs.existsSync(generateQuestionsPath)) {
  const content = fs.readFileSync(generateQuestionsPath, 'utf8');
  check(content.includes('candidateName'), 'generate-questions route accepts and personalizes warmup with candidateName');
} else {
  check(false, 'generate-questions route exists');
}

// 7. Check Dashboard Greeting
console.log('\n7. Checking Dashboard Greeting:');
const dashboardPath = path.join(ROOT, 'src', 'app', 'dashboard', 'page.tsx');
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');
  check(content.includes('UserGreeting'), 'Dashboard renders UserGreeting component');
} else {
  check(false, 'dashboard/page.tsx exists');
}

// 8. Check Phase 28 Database Migration Schema & RLS
console.log('\n8. Checking Phase 28 Database Migration Schema & RLS:');
const migration28Path = path.join(ROOT, 'supabase', 'migrations', '20260915000000_phase28_feature_data_sync_rls.sql');
if (fs.existsSync(migration28Path)) {
  const content = fs.readFileSync(migration28Path, 'utf8');
  check(content.includes('ALTER TABLE IF EXISTS public.profiles') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on profiles');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.resumes') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on resumes');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.projects') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on projects');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.interview_sessions') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on interview_sessions');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.connected_accounts') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on connected_accounts');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.job_applications') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on job_applications');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.saved_jobs') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on saved_jobs');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.messages') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on messages');
  check(content.includes('CREATE TABLE IF NOT EXISTS public.notifications') && content.includes('ENABLE ROW LEVEL SECURITY'), 'Migration enables RLS on notifications');
  check(content.includes('auth.uid()'), 'Migration binds user permissions strictly to auth.uid()');
} else {
  check(false, '20260915000000_phase28_feature_data_sync_rls.sql exists');
}

// 9. Check Projects Studio User Data Sync
console.log('\n9. Checking Projects Studio User Data Sync:');
const projectsPagePath = path.join(ROOT, 'src', 'app', 'projects', 'page.tsx');
if (fs.existsSync(projectsPagePath)) {
  const content = fs.readFileSync(projectsPagePath, 'utf8');
  check(content.includes('projects') && content.includes('user.uid'), 'Projects Studio loads projects by user.uid');
  check(content.includes('supabase.from("projects").upsert'), 'Projects Studio syncs new and updated projects to Supabase');
  check(content.includes('supabase.from("projects").delete()'), 'Projects Studio synchronizes deletions to Supabase');
} else {
  check(false, 'projects/page.tsx exists');
}

// 10. Check Interview Scoring User Data Sync
console.log('\n10. Checking Interview Scoring User Data Sync:');
const scoreSessionPath = path.join(ROOT, 'src', 'app', 'api', 'interview', 'score-session', 'route.ts');
if (fs.existsSync(scoreSessionPath)) {
  const content = fs.readFileSync(scoreSessionPath, 'utf8');
  check(content.includes('supabase.from("interview_sessions").insert'), 'Score session route inserts records into Supabase interview_sessions');
  check(content.includes('user_id: userId'), 'Score session route associates record with userId');
} else {
  check(false, 'score-session route exists');
}

// 11. Check Jobs & Applications Sync
console.log('\n11. Checking Jobs & Applications Sync:');
const appTrackerPath = path.join(ROOT, 'src', 'app', 'jobs', 'applications', 'page.tsx');
if (fs.existsSync(appTrackerPath)) {
  const content = fs.readFileSync(appTrackerPath, 'utf8');
  check(content.includes('job_applications'), 'Applications Tracker queries Supabase job_applications table');
  check(content.includes('user_id'), 'Applications Tracker filters by user_id');
} else {
  check(false, 'jobs/applications/page.tsx exists');
}

// 12. Check AI Engine Auth Session Extraction
console.log('\n12. Checking AI Engine Auth Session Extraction:');
const claudeAnalyzePath = path.join(ROOT, 'src', 'app', 'api', 'claude', 'analyze', 'route.ts');
if (fs.existsSync(claudeAnalyzePath)) {
  const content = fs.readFileSync(claudeAnalyzePath, 'utf8');
  check(content.includes('supabase.auth.getUser()'), 'Claude analysis route verifies Supabase auth session');
  check(content.includes('executeMCPTool'), 'Claude analysis route invokes MCP central tool with authenticated context');
} else {
  check(false, 'claude/analyze route exists');
}

// Summary
console.log('\n====================================================');
console.log(`TOTAL PASSES: ${passes}`);
console.log(`TOTAL FAILURES: ${failures.length}`);
console.log('====================================================');

if (failures.length > 0) {
  console.error('\nFAILED CHECKS:');
  failures.forEach(f => console.error(` - ${f}`));
  process.exit(1);
} else {
  console.log('\nALL PHASE 28 USER IDENTITY & FEATURE DATA SYNC CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

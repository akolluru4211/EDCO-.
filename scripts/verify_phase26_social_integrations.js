/**
 * Phase 26 Verification Script: Social & Developer Profile Integration
 * Validates:
 * 1. Absence of mock/fake placeholders ("alexrivera_dev", fake hardcoded counts) in SyncedAccountsCard and services.
 * 2. Presence and exports of live social integration service functions.
 * 3. Existence and validity of integration API routes.
 * 4. Registration of developer MCP tools in ALL_MCP_TOOLS.
 * 5. Type definitions for SocialProvider, ConnectedAccount, DeveloperEvidenceProfile, etc.
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
console.log('PHASE 26 VERIFICATION: SOCIAL & DEVELOPER INTEGRATIONS');
console.log('====================================================\n');

// 1. Check SyncedAccountsCard for fake demo data
console.log('1. Checking SyncedAccountsCard for fake data removal:');
const syncedCardPath = path.join(ROOT, 'src', 'components', 'dashboard', 'SyncedAccountsCard.tsx');
if (fs.existsSync(syncedCardPath)) {
  const content = fs.readFileSync(syncedCardPath, 'utf8');
  check(!content.includes('alexrivera_dev'), 'SyncedAccountsCard does not contain "alexrivera_dev" mock username');
  check(!content.includes('45, 82, 14'), 'SyncedAccountsCard does not contain fake problem count numbers');
  check(content.includes('/api/integrations/connected-accounts'), 'SyncedAccountsCard fetches connected accounts from real API');
  check(content.includes('/api/integrations/github/sync'), 'SyncedAccountsCard triggers real GitHub sync API');
  check(content.includes('/api/integrations/leetcode/sync'), 'SyncedAccountsCard triggers real LeetCode sync API');
  check(content.includes('/api/integrations/linkedin/sync'), 'SyncedAccountsCard triggers real LinkedIn sync API');
  check(content.includes('consentGiven') || content.includes('Consent'), 'SyncedAccountsCard implements user consent flow before connecting');
} else {
  check(false, 'SyncedAccountsCard.tsx exists');
}

// 2. Check social-integrations service
console.log('\n2. Checking Social Integration Services:');
const servicePath = path.join(ROOT, 'src', 'lib', 'services', 'social-integrations.ts');
if (fs.existsSync(servicePath)) {
  const content = fs.readFileSync(servicePath, 'utf8');
  check(content.includes('fetchGitHubProfileData'), 'Exports fetchGitHubProfileData()');
  check(content.includes('fetchLeetCodeProfileData'), 'Exports fetchLeetCodeProfileData()');
  check(content.includes('verifyLinkedInProfile'), 'Exports verifyLinkedInProfile()');
  check(content.includes('synthesizeDeveloperEvidence'), 'Exports synthesizeDeveloperEvidence()');
  check(content.includes('api.github.com'), 'Uses official GitHub REST API');
  check(content.includes('leetcode.com/graphql'), 'Uses official LeetCode GraphQL endpoint');
} else {
  check(false, 'social-integrations.ts service exists');
}

// 3. Check Integration API routes
console.log('\n3. Checking Integration API routes:');
const routes = [
  'src/app/api/integrations/connected-accounts/route.ts',
  'src/app/api/integrations/github/sync/route.ts',
  'src/app/api/integrations/leetcode/sync/route.ts',
  'src/app/api/integrations/linkedin/sync/route.ts',
  'src/app/api/integrations/developer-evidence/route.ts'
];

routes.forEach(route => {
  const fullPath = path.join(ROOT, route);
  check(fs.existsSync(fullPath), `API Route exists: ${route}`);
});

// 4. Check Developer MCP Tools
console.log('\n4. Checking Developer MCP Tools:');
const devToolsPath = path.join(ROOT, 'src', 'lib', 'mcp', 'tools', 'developer.ts');
const mcpEnginePath = path.join(ROOT, 'src', 'lib', 'mcp', 'engine.ts');

if (fs.existsSync(devToolsPath)) {
  const devToolsContent = fs.readFileSync(devToolsPath, 'utf8');
  check(devToolsContent.includes('github_get_profile'), 'MCP defines github_get_profile tool');
  check(devToolsContent.includes('github_list_repositories'), 'MCP defines github_list_repositories tool');
  check(devToolsContent.includes('leetcode_get_problem_stats'), 'MCP defines leetcode_get_problem_stats tool');
  check(devToolsContent.includes('linkedin_get_profile'), 'MCP defines linkedin_get_profile tool');
  check(devToolsContent.includes('synthesize_developer_ability_score'), 'MCP defines synthesize_developer_ability_score tool');
} else {
  check(false, 'developer.ts MCP tool definition file exists');
}

if (fs.existsSync(mcpEnginePath)) {
  const engineContent = fs.readFileSync(mcpEnginePath, 'utf8');
  check(engineContent.includes('developerTools'), 'developerTools is registered in ALL_MCP_TOOLS in engine.ts');
} else {
  check(false, 'engine.ts MCP engine exists');
}

// 5. Check Type Definitions
console.log('\n5. Checking Type Definitions:');
const typesPath = path.join(ROOT, 'src', 'lib', 'types.ts');
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  check(typesContent.includes('SocialProvider'), 'types.ts contains SocialProvider type');
  check(typesContent.includes('ConnectedAccount'), 'types.ts contains ConnectedAccount type');
  check(typesContent.includes('DeveloperEvidenceProfile'), 'types.ts contains DeveloperEvidenceProfile type');
  check(typesContent.includes('DeveloperEvidenceCategory'), 'types.ts contains DeveloperEvidenceCategory type');
} else {
  check(false, 'types.ts exists');
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
  console.log('\nALL PHASE 26 CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

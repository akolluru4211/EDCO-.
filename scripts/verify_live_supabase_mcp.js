import fs from 'fs';
import path from 'path';

console.log('--- Verifying Live Supabase Data & MCP Tool Integration ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Check mock-data.ts does not contain fake seed questions array
const mockDataPath = path.resolve('src/lib/mock-data.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
assert(
  !mockDataContent.includes('export const SEED_INTERVIEW_QUESTIONS = [') &&
  !mockDataContent.includes('"What are the main principles of Object-Oriented Programming?"'),
  'src/lib/mock-data.ts does not contain static SEED_INTERVIEW_QUESTIONS array'
);

// 2. Check generate-questions route uses MCP student tools and Supabase
const generateQuestionsPath = path.resolve('src/app/api/interview/generate-questions/route.ts');
const generateQuestionsContent = fs.readFileSync(generateQuestionsPath, 'utf8');
assert(
  generateQuestionsContent.includes('executeMCPTool(') &&
  generateQuestionsContent.includes('generate_interview_questions'),
  'src/app/api/interview/generate-questions/route.ts executes via MCP tool generate_interview_questions'
);
assert(
  !generateQuestionsContent.includes('SEED_INTERVIEW_QUESTIONS'),
  'src/app/api/interview/generate-questions/route.ts does not import or use SEED_INTERVIEW_QUESTIONS'
);

// 3. Check claude/analyze route uses MCP
const claudeAnalyzePath = path.resolve('src/app/api/claude/analyze/route.ts');
const claudeAnalyzeContent = fs.readFileSync(claudeAnalyzePath, 'utf8');
assert(
  claudeAnalyzeContent.includes('executeMCPTool(') &&
  claudeAnalyzeContent.includes('analyze_claude_review'),
  'src/app/api/claude/analyze/route.ts dispatches to MCP analyze_claude_review tool'
);

// 4. Check student MCP tools expose necessary live tools
const studentToolsPath = path.resolve('src/lib/mcp/tools/student.ts');
const studentToolsContent = fs.readFileSync(studentToolsPath, 'utf8');
assert(
  studentToolsContent.includes('name: "generate_interview_questions"'),
  'src/lib/mcp/tools/student.ts defines generate_interview_questions tool'
);
assert(
  studentToolsContent.includes('name: "evaluate_interview_session"'),
  'src/lib/mcp/tools/student.ts defines evaluate_interview_session tool'
);
assert(
  studentToolsContent.includes('name: "analyze_claude_review"'),
  'src/lib/mcp/tools/student.ts defines analyze_claude_review tool'
);
assert(
  studentToolsContent.includes('name: "grade_essay"'),
  'src/lib/mcp/tools/student.ts defines grade_essay tool'
);
assert(
  studentToolsContent.includes('name: "coach_speech"'),
  'src/lib/mcp/tools/student.ts defines coach_speech tool'
);

// 5. Check Supabase migration exists with live schemas
const migrationPath = path.resolve('supabase/migrations/20260912000000_live_data_and_mcp_schema.sql');
assert(fs.existsSync(migrationPath), 'supabase/migrations/20260912000000_live_data_and_mcp_schema.sql exists');
if (fs.existsSync(migrationPath)) {
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  assert(
    migrationContent.includes('CREATE TABLE IF NOT EXISTS public.interview_questions'),
    'Migration defines live interview_questions table'
  );
  assert(
    migrationContent.includes('INSERT INTO public.interview_questions'),
    'Migration seeds live baseline interview questions'
  );
  assert(
    migrationContent.includes('INSERT INTO public.problems'),
    'Migration seeds live baseline problem records'
  );
  assert(
    migrationContent.includes('INSERT INTO public.jobs'),
    'Migration seeds live verified jobs records'
  );
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Live Supabase & MCP checks passed successfully!');
}

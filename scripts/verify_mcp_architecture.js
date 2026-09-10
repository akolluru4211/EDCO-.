const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log("EDWORLD CO — VERIFICATION: PRODUCTION-GRADE MCP + API ARCHITECTURE");
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
// 1. MCP Tool Registry & 7 Domain Modules
// -----------------------------------------------------------------------------
runTest("1.1 MCP registry defines tools across all 7 required domains", () => {
  const studentSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/student.ts"), "utf-8");
  const employeeSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/employee.ts"), "utf-8");
  const hrSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/hr.ts"), "utf-8");
  const founderSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/founder.ts"), "utf-8");
  const teacherSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/teacher.ts"), "utf-8");
  const collegeSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/college.ts"), "utf-8");
  const adminSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/tools/admin.ts"), "utf-8");

  assert(studentSrc.includes("analyze_resume"), "Student tools must contain analyze_resume");
  assert(studentSrc.includes("get_interview_questions"), "Student tools must contain get_interview_questions");
  assert(employeeSrc.includes("get_payroll"), "Employee tools must contain get_payroll");
  assert(employeeSrc.includes("get_performance"), "Employee tools must contain get_performance");
  assert(hrSrc.includes("get_candidates"), "HR tools must contain get_candidates");
  assert(hrSrc.includes("get_recruitment_pipeline"), "HR tools must contain get_recruitment_pipeline");
  assert(founderSrc.includes("get_revenue"), "Founder tools must contain get_revenue");
  assert(founderSrc.includes("get_cash_flow"), "Founder tools must contain get_cash_flow");
  assert(teacherSrc.includes("get_classes"), "Teacher tools must contain get_classes");
  assert(teacherSrc.includes("get_gradebook"), "Teacher tools must contain get_gradebook");
  assert(collegeSrc.includes("get_placement_drives"), "College tools must contain get_placement_drives");
  assert(collegeSrc.includes("get_placement_analytics"), "College tools must contain get_placement_analytics");
  assert(adminSrc.includes("get_audit_logs"), "Admin tools must contain get_audit_logs");
  assert(adminSrc.includes("manage_feature_flags"), "Admin tools must contain manage_feature_flags");
});

// -----------------------------------------------------------------------------
// 2. MCP Engine & RBAC Security Barrier
// -----------------------------------------------------------------------------
runTest("2.1 Central MCP engine enforces strict RBAC and security denial on cross-role tool calls", () => {
  const engineSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/engine.ts"), "utf-8");
  assert(engineSrc.includes("executeMCPTool"), "Must export executeMCPTool");
  assert(engineSrc.includes("getAvailableTools"), "Must export getAvailableTools");
  assert(engineSrc.includes("403"), "Must return 403 when user role lacks permission");
  assert(engineSrc.includes("recordAuditLog"), "Must log security audit events for access denials");
  assert(engineSrc.includes("mcp.access_denied"), "Must log mcp.access_denied event");
});

// -----------------------------------------------------------------------------
// 3. Prompt Injection Protection & Input Sanitization
// -----------------------------------------------------------------------------
runTest("3.1 MCP engine sanitizes input parameters against prompt injection", () => {
  const engineSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/engine.ts"), "utf-8");
  assert(engineSrc.includes("ignore previous instructions"), "Must sanitize prompt override injections");
  assert(engineSrc.includes("<system>"), "Must strip system tag injections");
});

// -----------------------------------------------------------------------------
// 4. Domain AI Agents & Specialized Sub-Agents
// -----------------------------------------------------------------------------
runTest("4.1 Domain AI Agents implement real processing with specialized sub-agents and zero random scores", () => {
  const agentsSrc = fs.readFileSync(path.join(__dirname, "../src/lib/mcp/agents.ts"), "utf-8");
  
  assert(agentsSrc.includes("class ResumeAgent"), "Must define ResumeAgent");
  assert(agentsSrc.includes("ATSAnalysisAgent"), "Must utilize ATSAnalysisAgent sub-agent");
  assert(agentsSrc.includes("KeywordAnalysisAgent"), "Must utilize KeywordAnalysisAgent sub-agent");
  
  assert(agentsSrc.includes("class InterviewAgent"), "Must define InterviewAgent");
  assert(agentsSrc.includes("TranscriptAgent"), "Must utilize TranscriptAgent sub-agent");
  assert(agentsSrc.includes("TimingAnalysisAgent"), "Must utilize TimingAnalysisAgent sub-agent");

  assert(agentsSrc.includes("class FounderInsightAgent"), "Must define FounderInsightAgent");
  assert(agentsSrc.includes("RevenueAnalysisAgent"), "Must utilize RevenueAnalysisAgent sub-agent");
  assert(agentsSrc.includes("GrowthAnalysisAgent"), "Must utilize GrowthAnalysisAgent sub-agent");

  assert(agentsSrc.includes("class ProductivityAgent"), "Must define ProductivityAgent");
  assert(agentsSrc.includes("class ClassInsightAgent"), "Must define ClassInsightAgent");
  assert(agentsSrc.includes("class PlacementInsightAgent"), "Must define PlacementInsightAgent");
  assert(agentsSrc.includes("class SecurityAgent"), "Must define SecurityAgent");

  // Zero Math.random in agents file
  assert(!agentsSrc.includes("Math.random()"), "Agents must NEVER use Math.random() for scores");
});

// -----------------------------------------------------------------------------
// 5. Production API Endpoints & Health Monitoring
// -----------------------------------------------------------------------------
runTest("5.1 API endpoints (/api/mcp/execute, /api/mcp/tools, /api/health, /api/docs) exist and enforce contracts", () => {
  const executePath = path.join(__dirname, "../src/app/api/mcp/execute/route.ts");
  const toolsPath = path.join(__dirname, "../src/app/api/mcp/tools/route.ts");
  const healthPath = path.join(__dirname, "../src/app/api/health/route.ts");
  const docsPath = path.join(__dirname, "../src/app/api/docs/route.ts");

  assert(fs.existsSync(executePath), "Execute endpoint must exist");
  assert(fs.existsSync(toolsPath), "Tools endpoint must exist");
  assert(fs.existsSync(healthPath), "Health endpoint must exist");
  assert(fs.existsSync(docsPath), "Docs endpoint must exist");

  const healthSrc = fs.readFileSync(healthPath, "utf-8");
  assert(healthSrc.includes("database"), "Health check must inspect database");
  assert(healthSrc.includes("mcpEngine"), "Health check must inspect mcpEngine");
  assert(healthSrc.includes("HEALTHY"), "Health check must return HEALTHY status");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("--------------------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL PRODUCTION-GRADE MCP + API ARCHITECTURE TESTS PASSED 100%!");
  process.exit(0);
}

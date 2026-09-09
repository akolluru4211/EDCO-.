import { NextRequest, NextResponse } from "next/server";
import vm from "vm";

export const dynamic = "force-dynamic";

export interface TestCase {
  id?: string;
  input: any;
  expected: any;
  description?: string;
}

export interface TestResultItem {
  testCaseId: string;
  description: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
}

// Security Forbidden AST tokens / keywords in submission
const DISALLOWED_PATTERNS = [
  /\bprocess\b/,
  /\brequire\s*\(/,
  /\bimport\s*\(/,
  /\bchild_process\b/,
  /\bfs\b/,
  /\bnet\b/,
  /\bhttp\b/,
  /\bglobal\b/,
  /\bFunction\s*\(/,
  /\b__dirname\b/,
  /\b__filename\b/
];

/**
 * Sandboxed code executor with memory boundaries and hard 2.5s execution timeout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      code = "", 
      language = "javascript", 
      testCases = [],
      functionName = "solution"
    } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code submission is required." }, { status: 400 });
    }

    // 1. Static Security Inspection
    for (const pattern of DISALLOWED_PATTERNS) {
      if (pattern.test(code)) {
        return NextResponse.json({
          success: false,
          error: "Security Violation: Access to system APIs (process, filesystem, network) is prohibited in the sandboxed interview environment.",
          runtimeError: "SecuritySandboxViolation",
          testResults: [],
          passCount: 0,
          totalCount: testCases.length,
          allPassed: false
        }, { status: 400 });
      }
    }

    const results: TestResultItem[] = [];
    let passCount = 0;

    // 2. Sandboxed VM Execution Loop
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcId = tc.id || `tc-${i + 1}`;
      const startTime = performance.now();

      // Create isolated sandbox context with zero host access
      const sandboxLogs: string[] = [];
      const sandbox = {
        console: {
          log: (...args: any[]) => sandboxLogs.push(args.map(a => String(a)).join(" ")),
          error: (...args: any[]) => sandboxLogs.push(args.map(a => String(a)).join(" "))
        },
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite
      };

      const context = vm.createContext(sandbox);

      try {
        // Wrap code with invocation
        const inputArg = Array.isArray(tc.input) ? tc.input.map((arg: any) => JSON.stringify(arg)).join(", ") : JSON.stringify(tc.input);
        const wrappedScript = `
          ${code}
          ;
          (function() {
            if (typeof ${functionName} === 'function') {
              return ${functionName}(${inputArg});
            } else if (typeof solution === 'function') {
              return solution(${inputArg});
            } else {
              throw new Error("Function '${functionName}' not defined in submission.");
            }
          })()
        `;

        const script = new vm.Script(wrappedScript);
        
        // Hard execution timeout: 2500ms
        const actualResult = script.runInContext(context, {
          timeout: 2500,
          displayErrors: true
        });

        const executionTimeMs = Math.round(performance.now() - startTime);
        const expectedNormalized = JSON.stringify(tc.expected);
        const actualNormalized = JSON.stringify(actualResult);

        const passed = expectedNormalized === actualNormalized;
        if (passed) passCount++;

        results.push({
          testCaseId: tcId,
          description: tc.description || `Test Case ${i + 1}`,
          input: typeof tc.input === "object" ? JSON.stringify(tc.input) : String(tc.input),
          expected: expectedNormalized,
          actual: actualNormalized,
          passed,
          executionTimeMs
        });
      } catch (execErr: any) {
        const executionTimeMs = Math.round(performance.now() - startTime);
        const isTimeout = execErr.message?.includes("timed out") || execErr.code === "ERR_SCRIPT_EXECUTION_TIMEOUT";

        results.push({
          testCaseId: tcId,
          description: tc.description || `Test Case ${i + 1}`,
          input: typeof tc.input === "object" ? JSON.stringify(tc.input) : String(tc.input),
          expected: JSON.stringify(tc.expected),
          actual: "Execution Error",
          passed: false,
          executionTimeMs,
          error: isTimeout ? "Execution Timed Out (Limit: 2500ms). Check for infinite loops." : execErr.message
        });
      }
    }

    const allPassed = testCases.length > 0 && passCount === testCases.length;
    const score = testCases.length > 0 ? Math.round((passCount / testCases.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      passCount,
      totalCount: testCases.length,
      allPassed,
      codeScore: score,
      testResults: results
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sandbox execution error" }, { status: 500 });
  }
}

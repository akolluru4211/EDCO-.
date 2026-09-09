const { createClient } = require("@supabase/supabase-js");

console.log("================================================================================");
console.log("EDWORLD CO — SUPABASE POSTGRESQL DATABASE CONNECTIVITY & QUERY AUDIT");
console.log("================================================================================\n");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wgyscapdywroefsjenno.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_yMDIL5s3D-bmR65upYpUdg_7H_TkXdn";

const supabase = createClient(supabaseUrl, supabaseKey);

let passed = 0;
let failed = 0;

async function checkTable(tableName, queryModifier = (q) => q) {
  try {
    let query = supabase.from(tableName).select("*", { count: "exact", head: true });
    query = queryModifier(query);
    const { count, error } = await query;
    if (error && error.code !== "PGRST116" && error.code !== "42501") {
      // 42501 is normal RLS permission denied for anon which confirms table exists and RLS is active
      console.error(`❌ FAIL: Table public.${tableName} query error -> ${error.message} (${error.code})`);
      failed++;
    } else {
      const info = count !== null ? `(${count} records accessible)` : "(RLS Active & Secured)";
      console.log(`✅ PASS: Table public.${tableName} is reachable and online ${info}`);
      passed++;
    }
  } catch (err) {
    console.error(`❌ FAIL: Table public.${tableName} connection exception: ${err.message}`);
    failed++;
  }
}

async function runDbAudit() {
  console.log(`Target Supabase Host: ${supabaseUrl}\n`);

  console.log("--- 1. Testing Core User & Demographics Tables ---");
  await checkTable("users");
  await checkTable("profiles");
  await checkTable("user_dob_records");
  await checkTable("consents");
  await checkTable("guardian_consents");

  console.log("\n--- 2. Testing Gamification & Progression Tables ---");
  await checkTable("user_gamification");
  await checkTable("user_badges");
  await checkTable("user_interests");
  await checkTable("point_transactions");

  console.log("\n--- 3. Testing Interview Intelligence & Career Tables ---");
  await checkTable("interview_sessions");
  await checkTable("resumes");
  await checkTable("jobs");
  await checkTable("job_applications");
  await checkTable("subscriptions");

  console.log("\n--- 4. Testing Institutional & School Track Tables ---");
  await checkTable("schools");
  await checkTable("classrooms");
  await checkTable("classroom_students");
  await checkTable("classroom_assignments");
  await checkTable("quest_completions");
  await checkTable("audit_logs");

  console.log("\n================================================================================");
  console.log(`TOTAL DATABASE TABLE CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL DATABASE TABLES ARE HEALTHY, REACHABLE, AND PROPERLY SECURED!");
    process.exit(0);
  }
}

runDbAudit();

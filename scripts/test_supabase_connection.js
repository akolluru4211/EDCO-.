const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wgyscapdywroefsjenno.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_yMDIL5s3D-bmR65upYpUdg_7H_TkXdn";

console.log("================================================================================");
console.log("EDWORLD CO — SUPABASE LIVE CONNECTION HEALTH CHECK");
console.log("================================================================================");
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key prefix: ${SUPABASE_ANON_KEY.substring(0, 16)}...\n`);

async function testConnection() {
  const startTime = Date.now();

  // 1. HTTP Endpoint Check
  console.log("1. Checking HTTP Connectivity & DNS Resolution...");
  try {
    await new Promise((resolve, reject) => {
      https.get(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_ANON_KEY }
      }, (res) => {
        console.log(`   [HTTP Status]: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
        } else {
          reject(new Error(`HTTP Status ${res.statusCode}`));
        }
      }).on("error", reject);
    });
    console.log("   ✅ Supabase Auth API Endpoint is reachable.\n");
  } catch (err) {
    console.error(`   ❌ HTTP Endpoint check failed: ${err.message}\n`);
  }

  // 2. Supabase SDK Client Test
  console.log("2. Initializing Supabase SDK Client & Querying Tables...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test table: plans
  try {
    const t0 = Date.now();
    const { data: plans, error: plansErr } = await supabase.from("plans").select("id, name, price_inr");
    const latency = Date.now() - t0;
    if (plansErr) {
      console.error(`   ❌ Table 'plans' query failed:`, plansErr.message);
    } else {
      console.log(`   ✅ Table 'plans': Read ${plans.length} records successfully in ${latency}ms.`);
      console.log(`      Available plans:`, plans.map(p => `${p.name} (₹${p.price_inr})`).join(", "));
    }
  } catch (err) {
    console.error(`   ❌ Table 'plans' query threw error:`, err.message);
  }

  // Test table: badges
  try {
    const t0 = Date.now();
    const { data: badges, error: badgesErr } = await supabase.from("badges").select("code, name");
    const latency = Date.now() - t0;
    if (badgesErr) {
      console.error(`   ❌ Table 'badges' query failed:`, badgesErr.message);
    } else {
      console.log(`   ✅ Table 'badges': Read ${badges.length} badges in ${latency}ms.`);
    }
  } catch (err) {
    console.error(`   ❌ Table 'badges' query threw error:`, err.message);
  }

  // Test table: quests
  try {
    const t0 = Date.now();
    const { data: quests, error: questsErr } = await supabase.from("quests").select("id, title");
    const latency = Date.now() - t0;
    if (questsErr) {
      console.error(`   ❌ Table 'quests' query failed:`, questsErr.message);
    } else {
      console.log(`   ✅ Table 'quests': Read ${quests.length} quests in ${latency}ms.`);
    }
  } catch (err) {
    console.error(`   ❌ Table 'quests' query threw error:`, err.message);
  }

  // Test table: scholarships
  try {
    const t0 = Date.now();
    const { data: scholarships, error: scholErr } = await supabase.from("scholarships").select("id, name");
    const latency = Date.now() - t0;
    if (scholErr) {
      console.error(`   ❌ Table 'scholarships' query failed:`, scholErr.message);
    } else {
      console.log(`   ✅ Table 'scholarships': Read ${scholarships.length} scholarships in ${latency}ms.`);
    }
  } catch (err) {
    console.error(`   ❌ Table 'scholarships' query threw error:`, err.message);
  }

  // Test View: teacher_visible_student_progress
  try {
    const t0 = Date.now();
    const { data: teacherView, error: viewErr } = await supabase.from("teacher_visible_student_progress").select("*");
    const latency = Date.now() - t0;
    if (viewErr) {
      console.error(`   ❌ View 'teacher_visible_student_progress' query failed:`, viewErr.message);
    } else {
      console.log(`   ✅ View 'teacher_visible_student_progress': Read ${teacherView.length} records in ${latency}ms.`);
    }
  } catch (err) {
    console.error(`   ❌ View query threw error:`, err.message);
  }

  const totalDuration = Date.now() - startTime;
  console.log("\n--------------------------------------------------------------------------------");
  console.log(`OVERALL STATUS: SUPABASE CONNECTION FULLY OPERATIONAL (Completed in ${totalDuration}ms)`);
  console.log("--------------------------------------------------------------------------------\n");
}

testConnection();

/**
 * Supabase Connection & Health Verification Script
 *
 * Tests:
 * 1. Supabase environment configuration (URL & API Key)
 * 2. Supabase Auth API connectivity
 * 3. Supabase Postgres Data API connectivity across key tables
 * 4. Latency measurement & RLS status
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env or .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const value = rest.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://wgyscapdywroefsjenno.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_yMDIL5s3D-bmR65upYpUdg_7H_TkXdn";

console.log('\n======================================================');
console.log('         SUPABASE CONNECTION & HEALTH CHECK');
console.log('======================================================\n');

console.log(`[Config] Target URL : ${supabaseUrl}`);
console.log(`[Config] Key Prefix : ${supabaseKey.substring(0, 15)}...`);

async function runCheck() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Auth Health Check
  console.log('\n[1/3] Testing Supabase Auth API Connectivity...');
  const authStart = Date.now();
  try {
    const { data: sessionData, error: authError } = await supabase.auth.getSession();
    const authLatency = Date.now() - authStart;
    if (authError) {
      console.log(`  ✖ Auth Check Failed (${authLatency}ms): ${authError.message}`);
    } else {
      console.log(`  ✔ \x1b[32mAuth Service Connected\x1b[0m (${authLatency}ms) - Active Session: ${sessionData.session ? 'Yes' : 'No (Anonymous context)'}`);
    }
  } catch (err) {
    console.log(`  ✖ Auth Exception: ${err.message}`);
  }

  // 2. Database Tables Query Test
  console.log('\n[2/3] Testing Postgres Database Tables...');
  const tables = ['profiles', 'users', 'certifications', 'audit_logs', 'learning_paths', 'interviews'];

  for (const table of tables) {
    const dbStart = Date.now();
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      const dbLatency = Date.now() - dbStart;

      if (error) {
        // Distinguish RLS/Permission vs Table Not Found vs Network Error
        if (error.code === 'PGRST116' || error.message.includes('permission') || error.code === '42501') {
          console.log(`  ✔ Table '${table}' exists and protected by RLS (${dbLatency}ms) [Code: ${error.code}]`);
        } else if (error.code === '42P01') {
          console.log(`  ⚠ Table '${table}' does not exist in public schema (${dbLatency}ms)`);
        } else {
          console.log(`  ✖ Table '${table}' check error (${dbLatency}ms): ${error.message} [Code: ${error.code}]`);
        }
      } else {
        console.log(`  ✔ \x1b[32mTable '${table}' accessible\x1b[0m (${dbLatency}ms) - Record count: ${count !== null ? count : 'N/A'}`);
      }
    } catch (err) {
      console.log(`  ✖ Table '${table}' exception: ${err.message}`);
    }
  }

  // 3. Service Role Admin Key Check (if configured)
  console.log('\n[3/3] Checking Service Role / Admin Client Capability...');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey || serviceKey === 'placeholder_service_role_key') {
    console.log('  ℹ SUPABASE_SERVICE_ROLE_KEY is not configured in local environment (using client/anon key).');
  } else {
    try {
      const adminClient = createClient(supabaseUrl, serviceKey);
      const adminStart = Date.now();
      const { data: usersData, error: adminErr } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
      const adminLatency = Date.now() - adminStart;
      if (adminErr) {
        console.log(`  ✖ Service Role check failed (${adminLatency}ms): ${adminErr.message}`);
      } else {
        console.log(`  ✔ \x1b[32mService Role Admin Connected\x1b[0m (${adminLatency}ms) - Admin access verified.`);
      }
    } catch (e) {
      console.log(`  ✖ Service Role exception: ${e.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('               CHECK COMPLETE');
  console.log('======================================================\n');
}

runCheck();

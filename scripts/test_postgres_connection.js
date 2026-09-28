/**
 * Direct PostgreSQL Connection Diagnostic Script
 */

const { Client } = require('pg');

const connectionString = "postgresql://postgres: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@db.wgyscapdywroefsjenno.supabase.co:5432/postgres";

console.log('\n======================================================');
console.log('       DIRECT SUPABASE POSTGRESQL CONNECTION TEST');
console.log('======================================================\n');

console.log(`[Target Host]     : db.wgyscapdywroefsjenno.supabase.co`);
console.log(`[Target Port]     : 5432`);
console.log(`[Database]        : postgres`);
console.log(`[User]            : postgres`);

async function testConnection() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase cloud connections
    connectionTimeoutMillis: 10000,
  });

  const start = Date.now();

  try {
    console.log('\n[1/4] Establishing SSL/TLS Connection to Postgres...');
    await client.connect();
    const latency = Date.now() - start;
    console.log(`  ✔ \x1b[32mSuccessfully Connected to Database\x1b[0m in ${latency}ms.`);

    // 1. Version Check
    console.log('\n[2/4] Querying PostgreSQL Server Version...');
    const verRes = await client.query('SELECT version();');
    console.log(`  ✔ Engine: ${verRes.rows[0].version}`);

    // 2. Query Public Tables
    console.log('\n[3/4] Inspecting Public Schema Tables & Row Counts...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (tablesRes.rows.length === 0) {
      console.log('  ℹ No tables found in public schema.');
    } else {
      console.log(`  Found ${tablesRes.rows.length} public tables:`);
      for (const row of tablesRes.rows) {
        try {
          const countRes = await client.query(`SELECT count(*) FROM public."${row.table_name}";`);
          console.log(`    - \x1b[36m${row.table_name.padEnd(25)}\x1b[0m : ${countRes.rows[0].count} rows`);
        } catch (cntErr) {
          console.log(`    - \x1b[36m${row.table_name.padEnd(25)}\x1b[0m : (access error: ${cntErr.message})`);
        }
      }
    }

    // 3. Auth Schema Check
    console.log('\n[4/4] Inspecting Auth Schema...');
    try {
      const authUsersRes = await client.query('SELECT count(*) FROM auth.users;');
      console.log(`  ✔ Registered Auth Users : \x1b[32m${authUsersRes.rows[0].count}\x1b[0m`);
    } catch (authErr) {
      console.log(`  ⚠ Auth schema access note: ${authErr.message}`);
    }

    console.log('\n======================================================');
    console.log('     \x1b[32m✔ SUPABASE POSTGRES CONNECTION IS 100% OPERATIONAL\x1b[0m');
    console.log('======================================================\n');
  } catch (err) {
    console.error(`\n  ✖ \x1b[31mConnection Failed:\x1b[0m ${err.message}`);
    console.log('\n======================================================');
    console.log('     \x1b[31m✖ DATABASE CONNECTION TEST FAILED\x1b[0m');
    console.log('======================================================\n');
  } finally {
    await client.end().catch(() => {});
  }
}

testConnection();

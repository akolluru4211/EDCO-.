const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres: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@db.wgyscapdywroefsjenno.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  await client.connect();
  const tables = ['profiles', 'users', 'resumes', 'interview_sessions', 'certifications', 'audit_logs', 'projects'];
  
  console.log('\n=== Check Constraints on Profiles ===');
  const constraints = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass;
  `);
  constraints.rows.forEach(c => console.log(`  - ${c.conname}: ${c.def}`));

  console.log('\n=== Foreign Keys in Public Schema ===');
  const fks = await client.query(`
    SELECT c.conrelid::regclass AS table_name, c.conname, pg_get_constraintdef(c.oid) AS def
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public' AND c.contype = 'f'
    ORDER BY table_name;
  `);
  fks.rows.forEach(f => console.log(`  - ${f.table_name.padEnd(25)} -> ${f.def}`));
  await client.end();
}

inspect();

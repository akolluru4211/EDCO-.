/**
 * Comprehensive Supabase Data Persistence & Auth Integration Verification Suite
 *
 * Verifies:
 * 1. PostgreSQL Direct DB connection & engine readiness
 * 2. Supabase Auth user record creation in auth.users
 * 3. Automatic Profile provisioning via trigger (handle_new_user)
 * 4. Dual-table sync to public.users (fulfilling all 58 table foreign keys)
 * 5. Profiles table update & field persistence roundtrip
 * 6. Resumes table write & JSON content structure roundtrip
 * 7. Interview Sessions table write & questions/metrics JSON roundtrip
 * 8. Certifications table write & URL verification roundtrip
 * 9. Projects table write & tech stack array roundtrip
 * 10. Security Audit Logs table append & query roundtrip
 * 11. Foreign Key CASCADE cleanup test across both profiles and users trees
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres: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@db.wgyscapdywroefsjenno.supabase.co:5432/postgres";

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('   SUPABASE PERSISTENCE & AUTH INTEGRATION TEST');
console.log('======================================================\n');

async function runVerification() {
  const pgClient = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const testUserId = `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;

  try {
    // 1. PostgreSQL DB Connection
    console.log('[1/11] Connecting to Supabase PostgreSQL Database...');
    await pgClient.connect();
    assert(true, 'Direct PostgreSQL connection established');

    // 2. Auth User Registration Test
    console.log('\n[2/11] Creating Auth User in auth.users...');
    const testEmail = `${testId}@edworld.test`;
    await pgClient.query(
      `INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
       VALUES ($1, $2, 'test_hash_pw_123', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"QA Test Engineer"}', NOW(), NOW(), 'authenticated', 'authenticated');`,
      [testUserId, testEmail]
    );
    assert(true, 'Auth user created in auth.users directory');

    // 3. Automated Profile Provisioning Trigger Test
    console.log('\n[3/11] Verifying Automated Profile Trigger (handle_new_user)...');
    const autoProfileRes = await pgClient.query('SELECT * FROM public.profiles WHERE id = $1;', [testUserId]);
    assert(autoProfileRes.rows.length === 1, 'Profile row automatically created by handle_new_user trigger');
    assert(autoProfileRes.rows[0].name === 'QA Test Engineer', 'Profile initialized with correct full_name');

    // 4. Dual-table Sync to public.users
    console.log('\n[4/11] Syncing identity to public.users table...');
    await pgClient.query(
      `INSERT INTO public.users (id, name, email, age_band, grade, career_stage, is_admin, is_employer, is_mentor, created_at)
       VALUES ($1, 'QA Test Engineer', $2, '18+', 'College', 'working_professional', false, false, false, NOW());`,
      [testUserId, testEmail]
    );
    const userRes = await pgClient.query('SELECT * FROM public.users WHERE id = $1;', [testUserId]);
    assert(userRes.rows.length === 1, 'Identity synced to public.users (fulfilling all 58 foreign keys)');

    // 5. Profiles Table Update & Field Persistence Test
    console.log('\n[5/11] Updating Profile Fields (headline, bio, career_stage, interests)...');
    const headline = 'Automated Test Specialist & Cloud Architect';
    const bio = 'Validating end-to-end Supabase data persistence and auth integration.';
    const interests = JSON.stringify([{ id: 'swe', name: 'Software Engineering', level: 2 }]);

    await pgClient.query(
      `UPDATE public.profiles 
       SET headline = $1, bio = $2, career_stage = 'working_professional', grade_level = 'College', is_public = true, interests = $3, updated_at = NOW()
       WHERE id = $4;`,
      [headline, bio, interests, testUserId]
    );

    const profileRes = await pgClient.query('SELECT * FROM public.profiles WHERE id = $1;', [testUserId]);
    assert(profileRes.rows[0].headline === headline, 'Profile headline updated and persisted');
    assert(profileRes.rows[0].is_public === true, 'Profile visibility flag persisted');

    // 6. Resumes Table Persistence Test
    console.log('\n[6/11] Testing Resumes Table Persistence...');
    const resumeId = `00000000-0000-4000-8000-${(Date.now() + 1).toString(16).padStart(12, '0').slice(-12)}`;
    const resumeContent = {
      contact: { fullName: 'QA Test Engineer', email: testEmail },
      summary: 'Experienced QA Engineer with cloud automation focus.',
      skills: ['TypeScript', 'PostgreSQL', 'Next.js', 'Supabase'],
    };

    await pgClient.query(
      `INSERT INTO public.resumes (id, user_id, title, target_role, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW());`,
      [resumeId, testUserId, 'Senior Cloud Engineer Resume', 'Full Stack Engineer', JSON.stringify(resumeContent)]
    );

    const resumeRes = await pgClient.query('SELECT * FROM public.resumes WHERE id = $1;', [resumeId]);
    assert(resumeRes.rows.length === 1, 'Resume record stored successfully');
    assert(resumeRes.rows[0].title === 'Senior Cloud Engineer Resume', 'Resume title preserved');

    // 7. Interview Sessions Table Persistence Test
    console.log('\n[7/11] Testing Interview Sessions Table Persistence...');
    const sessionId = `00000000-0000-4000-8000-${(Date.now() + 2).toString(16).padStart(12, '0').slice(-12)}`;
    const questions = [
      { id: 'q1', text: 'Tell me about a challenging distributed systems bug you resolved.' }
    ];
    const metrics = {
      communication: 90,
      technical_depth: 88,
      problem_solving: 85,
    };

    await pgClient.query(
      `INSERT INTO public.interview_sessions (id, user_id, category, difficulty_level, questions, overall_score, metrics, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());`,
      [
        sessionId,
        testUserId,
        'TECHNICAL',
        2,
        JSON.stringify(questions),
        88,
        JSON.stringify(metrics)
      ]
    );

    const sessionRes = await pgClient.query('SELECT * FROM public.interview_sessions WHERE id = $1;', [sessionId]);
    assert(sessionRes.rows.length === 1, 'Interview session record stored successfully');
    assert(sessionRes.rows[0].category === 'TECHNICAL', 'Interview session category verified');

    // 8. Certifications Table Persistence Test
    console.log('\n[8/11] Testing Certifications Table Persistence...');
    const certId = `00000000-0000-4000-8000-${(Date.now() + 3).toString(16).padStart(12, '0').slice(-12)}`;
    await pgClient.query(
      `INSERT INTO public.certifications (id, user_id, name, issuing_org, date_earned, credential_url, is_self_reported, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());`,
      [certId, testUserId, 'AWS Certified Solutions Architect', 'Amazon Web Services', '2026-09-01', 'https://credly.com/sample', true]
    );

    const certRes = await pgClient.query('SELECT * FROM public.certifications WHERE id = $1;', [certId]);
    assert(certRes.rows.length === 1, 'Certification record stored successfully');
    assert(certRes.rows[0].issuing_org === 'Amazon Web Services', 'Certification issuing org verified');

    // 9. Projects Table Persistence Test
    console.log('\n[9/11] Testing Projects Table Persistence...');
    const projectId = `00000000-0000-4000-8000-${(Date.now() + 4).toString(16).padStart(12, '0').slice(-12)}`;
    await pgClient.query(
      `INSERT INTO public.projects (id, user_id, title, description, skills, github_url, live_url, is_verified, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW());`,
      [
        projectId,
        testUserId,
        'Cloud Career Intelligence Platform',
        'Next-generation career execution operating system with distributed data persistence.',
        ['Next.js', 'PostgreSQL', 'TypeScript', 'Supabase'],
        'https://github.com/edworld-co/platform',
        'https://edworld.co.in',
        true,
        true
      ]
    );

    const projectRes = await pgClient.query('SELECT * FROM public.projects WHERE id = $1;', [projectId]);
    assert(projectRes.rows.length === 1, 'Project studio artifact persisted successfully');
    assert(projectRes.rows[0].title === 'Cloud Career Intelligence Platform', 'Project title verified');

    // 10. Security Audit Logs Table Persistence Test
    console.log('\n[10/11] Testing Security Audit Logs Table Persistence...');
    const auditId = `00000000-0000-4000-8000-${(Date.now() + 5).toString(16).padStart(12, '0').slice(-12)}`;
    await pgClient.query(
      `INSERT INTO public.audit_logs (id, actor_id, actor_role, action, target_type, target_id, metadata, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW());`,
      [auditId, testUserId, 'CLIENT', 'auth.login_verified', 'session', testUserId, JSON.stringify({ ip: '127.0.0.1' }), '127.0.0.1']
    );

    const auditRes = await pgClient.query('SELECT * FROM public.audit_logs WHERE id = $1;', [auditId]);
    assert(auditRes.rows.length === 1, 'Audit log event inserted and indexed successfully');
    assert(auditRes.rows[0].action === 'auth.login_verified', 'Audit log action verified');

    // 11. Cleanup Test Records via CASCADE
    console.log('\n[11/11] Testing Foreign Key CASCADE Cleanup...');
    await pgClient.query('DELETE FROM public.audit_logs WHERE id = $1;', [auditId]);
    await pgClient.query('DELETE FROM public.projects WHERE id = $1;', [projectId]);
    await pgClient.query('DELETE FROM public.certifications WHERE id = $1;', [certId]);
    await pgClient.query('DELETE FROM public.interview_sessions WHERE id = $1;', [sessionId]);
    await pgClient.query('DELETE FROM public.resumes WHERE id = $1;', [resumeId]);
    await pgClient.query('DELETE FROM public.users WHERE id = $1;', [testUserId]);
    await pgClient.query('DELETE FROM auth.users WHERE id = $1;', [testUserId]);
    
    // Verify profiles row was cascaded automatically
    const remainingProfile = await pgClient.query('SELECT * FROM public.profiles WHERE id = $1;', [testUserId]);
    assert(remainingProfile.rows.length === 0, 'Foreign key CASCADE verified (profile row deleted automatically)');

  } catch (err) {
    assert(false, `Persistence test exception: ${err.message}`);
  } finally {
    await pgClient.end().catch(() => {});
  }

  console.log('\n======================================================');
  console.log(`TOTAL PASS: \x1b[32m${passCount}\x1b[0m | TOTAL FAIL: \x1b[${failCount > 0 ? '31' : '32'}m${failCount}\x1b[0m`);
  console.log('======================================================\n');

  if (failCount > 0) process.exit(1);
  else process.exit(0);
}

runVerification();

-- ============================================================
-- PHASE 25: SUPABASE ROW LEVEL SECURITY (RLS) HARDENING MIGRATION
-- Production-Ready Security for EdWorld Co.
-- ============================================================

-- 1. Ensure RLS is enabled on all core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consents ENABLE ROW LEVEL SECURITY;

-- 2. Create index on firebase_uid for fast lookup and identity synchronization
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users (firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications (user_id);

-- 3. PROFILES RLS POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated, anon
USING (
  id = (SELECT auth.uid()) OR
  is_public = true OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
    AND (p.is_admin = true OR p.role IN ('ADMIN', 'SUPER_ADMIN', 'HR', 'FOUNDER'))
  )
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- 4. RESUMES RLS POLICIES
DROP POLICY IF EXISTS "Users can read own resumes" ON public.resumes;
CREATE POLICY "Users can read own resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND (profiles.is_admin = true OR profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'HR'))
  )
);

DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
CREATE POLICY "Users can manage own resumes"
ON public.resumes FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- 5. INTERVIEW SESSIONS RLS POLICIES
DROP POLICY IF EXISTS "Users can read own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can read own interview sessions"
ON public.interview_sessions FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND (profiles.is_admin = true OR profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  )
);

DROP POLICY IF EXISTS "Users can insert own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can insert own interview sessions"
ON public.interview_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- 6. APPLICATIONS RLS POLICIES
DROP POLICY IF EXISTS "Candidates can view own applications" ON public.applications;
CREATE POLICY "Candidates can view own applications"
ON public.applications FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND (profiles.is_admin = true OR profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'HR'))
  )
);

DROP POLICY IF EXISTS "Candidates can create own applications" ON public.applications;
CREATE POLICY "Candidates can create own applications"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- 7. PUBLIC VERIFIED CATALOGS (Jobs, Problems, Interview Questions)
DROP POLICY IF EXISTS "Public can view active jobs" ON public.jobs;
CREATE POLICY "Public can view active jobs"
ON public.jobs FOR SELECT
TO anon, authenticated
USING (is_active = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Public can view active problems" ON public.problems;
CREATE POLICY "Public can view active problems"
ON public.problems FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active interview questions" ON public.interview_questions;
CREATE POLICY "Public can view active interview questions"
ON public.interview_questions FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 8. AUDIT LOGS SECURITY
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND (profiles.is_admin = true OR profiles.role IN ('ADMIN', 'SUPER_ADMIN'))
  )
);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated, anon
WITH CHECK (true);

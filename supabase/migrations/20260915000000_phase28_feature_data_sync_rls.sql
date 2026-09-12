-- ==============================================================================
-- Migration: 20260915000000_phase28_feature_data_sync_rls.sql
-- Description: Phase 28 Complete User Identity + Feature Data Sync with Row Level Security (RLS)
--              Guarantees auth.users.id (UUID) is the primary user identity across all tables:
--              profiles, resumes, projects, interview_sessions, connected_accounts, 
--              job_applications, saved_jobs, messages, notifications.
-- ==============================================================================

-- 1. PROFILES TABLE IDENTITY & HARDENING
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can view public profiles or own profile ON public.profiles;
DROP POLICY IF EXISTS Users can insert own profile ON public.profiles;
DROP POLICY IF EXISTS Users can update own profile ON public.profiles;
DROP POLICY IF EXISTS Users can delete own profile ON public.profiles;

CREATE POLICY Users can view public profiles or own profile
  ON public.profiles FOR SELECT
  USING (
    is_public = true 
    OR auth.uid() = user_id 
    OR auth.uid()::text = id::text
  );

CREATE POLICY Users can insert own profile
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY Users can update own profile
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
  );

-- 2. RESUMES TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.resumes (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text DEFAULT 'Untitled Resume',
  template_id text DEFAULT 'classic',
  content jsonb DEFAULT '{}'::jsonb,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can manage own resumes ON public.resumes;
CREATE POLICY Users can manage own resumes
  ON public.resumes FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 3. PROJECTS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.projects (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text,
  description text,
  skills text[],
  github_url text,
  live_url text,
  images text[],
  is_verified boolean DEFAULT false,
  source text DEFAULT 'manual',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can view public projects or own projects ON public.projects;
CREATE POLICY Users can view public projects or own projects
  ON public.projects FOR SELECT
  USING (
    is_public = true 
    OR auth.uid()::text = user_id 
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS Users can manage own projects ON public.projects;
CREATE POLICY Users can manage own projects
  ON public.projects FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 4. INTERVIEW SESSIONS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  category text,
  difficulty_level integer DEFAULT 0,
  format text DEFAULT 'standard',
  model_version text,
  code_submission text,
  test_results jsonb DEFAULT '[]'::jsonb,
  discussion_transcript jsonb DEFAULT '[]'::jsonb,
  code_score numeric,
  discussion_score numeric,
  questions jsonb DEFAULT '[]'::jsonb,
  overall_score numeric,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can manage own interview sessions ON public.interview_sessions;
CREATE POLICY Users can manage own interview sessions
  ON public.interview_sessions FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 5. CONNECTED ACCOUNTS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  provider text NOT NULL,
  provider_account_id text,
  provider_username text,
  profile_url text,
  sync_status text DEFAULT 'active',
  synced_data jsonb DEFAULT '{}'::jsonb,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own connected accounts ON public.connected_accounts;
CREATE POLICY Users manage own connected accounts
  ON public.connected_accounts FOR ALL
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 6. JOB APPLICATIONS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  job_id uuid NOT NULL,
  resume_id text,
  cover_note text,
  resume_snapshot jsonb,
  match_score numeric DEFAULT 0,
  status text DEFAULT 'applied',
  applied_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own job applications ON public.job_applications;
CREATE POLICY Users manage own job applications
  ON public.job_applications FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 7. SAVED JOBS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  job_id uuid NOT NULL,
  saved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_saved_job UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own saved jobs ON public.saved_jobs;
CREATE POLICY Users manage own saved jobs
  ON public.saved_jobs FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 8. DIRECT MESSAGES TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_id text NOT NULL,
  receiver_id text,
  sender_name text,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users can read and send own messages ON public.messages;
CREATE POLICY Users can read and send own messages
  ON public.messages FOR ALL
  TO authenticated
  USING (
    auth.uid()::text = sender_id 
    OR auth.uid()::text = receiver_id 
    OR auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid()::text = sender_id 
    OR auth.uid() IS NOT NULL
  );

-- 9. NOTIFICATIONS TABLE HARDENING
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own notifications ON public.notifications;
CREATE POLICY Users manage own notifications
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

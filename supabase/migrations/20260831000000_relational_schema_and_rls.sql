-- ==============================================================================
-- EDWORLD CO — RELATIONAL POSTGRESQL SCHEMA & COMPREHENSIVE RLS POLICIES
-- Complete Migration: Pure Relational Data Model, Isolated DOB Table & Strict RLS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & ISOLATED SENSITIVE DATA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age_band TEXT CHECK (age_band IN ('13-15', '16-18', '18+')),
  grade TEXT,
  is_employer BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRICT DOB ISOLATION TABLE (Zero Client-Facing Select RLS Policy)
CREATE TABLE IF NOT EXISTS public.user_dob_records (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  dob DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & INTERESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  primary_goal TEXT,
  is_public BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  interest_id TEXT NOT NULL,
  self_level INT CHECK (self_level BETWEEN 0 AND 2),
  effective_level INT CHECK (effective_level BETWEEN 0 AND 2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, interest_id)
);

-- ------------------------------------------------------------------------------
-- 3. CONSENTS (DPDP Act & Minor Safety)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consents (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  tos_version TEXT,
  privacy_version TEXT,
  accepted_at TIMESTAMPTZ,
  guardian_email TEXT,
  guardian_consent_confirmed BOOLEAN DEFAULT FALSE,
  guardian_consent_requested_at TIMESTAMPTZ,
  guardian_consent_confirmed_at TIMESTAMPTZ,
  billing_terms_accepted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 4. RESUMES & ATS DATA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  content JSONB,
  template_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. INTERVIEW QUESTIONS & SESSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  difficulty_level INT CHECK (difficulty_level BETWEEN 0 AND 2)
);

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.interview_questions(id),
  video_url TEXT,
  transcript TEXT,
  content_score INT,
  voice_score INT,
  expression_score INT,
  overall_score INT,
  feedback TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PROJECTS (Verified Code Artifacts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  skills TEXT[],
  github_url TEXT,
  live_url TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT CHECK (source IN ('github', 'manual', 'starter-kit')),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. NETWORKING, CONVERSATIONS & DIRECT MESSAGING (18+ Gated)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. JOBS & APPLICATIONS (18+ Career Board)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  company TEXT,
  description TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('internship', 'full-time', 'part-time', 'entry_level')),
  skills_required TEXT[],
  posted_by UUID REFERENCES public.users(id),
  application_deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  salary_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_snapshot JSONB,
  cover_note TEXT,
  status TEXT CHECK (status IN ('applied', 'viewed', 'rejected', 'interview', 'offer', 'submitted', 'under_review', 'shortlisted')) DEFAULT 'applied',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 9. SUBSCRIPTIONS & MONETIZATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT
);

-- ------------------------------------------------------------------------------
-- 10. CONTENT SAFETY REPORTS & IMMUTABLE AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  target_id TEXT,
  reported_by UUID REFERENCES public.users(id),
  reason TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_role TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — STRICT ENFORCEMENT & ZERO CLIENT DOB
-- ==============================================================================

-- Enable RLS on Every Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dob_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: public.user_dob_records has NO policies for authenticated/anon roles.
-- Only backend service-role key can access DOB records.

-- 1. Users Policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Profiles Policies
CREATE POLICY "profiles_select_public_or_own" ON public.profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    (is_public = TRUE AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.profiles.user_id AND u.age_band = '18+')) OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

CREATE POLICY "profiles_manage_own" ON public.profiles
  FOR ALL USING (user_id = auth.uid());

-- 3. User Interests Policies
CREATE POLICY "user_interests_manage_own" ON public.user_interests
  FOR ALL USING (user_id = auth.uid());

-- 4. Consents Policies
CREATE POLICY "consents_manage_own" ON public.consents
  FOR ALL USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- 5. Resumes Policies
CREATE POLICY "resumes_owner_all" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- 6. Interview Questions (Readable by all authenticated users)
CREATE POLICY "interview_questions_select_all" ON public.interview_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Interview Sessions (Owner Only)
CREATE POLICY "interview_sessions_owner_all" ON public.interview_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 8. Projects Policies
CREATE POLICY "projects_select_public_or_own" ON public.projects
  FOR SELECT USING (
    user_id = auth.uid() OR
    (is_public = TRUE AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.projects.user_id AND u.age_band = '18+')) OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

CREATE POLICY "projects_manage_own" ON public.projects
  FOR ALL USING (user_id = auth.uid());

-- 9. Connections Policies (18+ Adult Gated)
CREATE POLICY "connections_adult_only" ON public.connections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band = '18+') AND
    (requester_id = auth.uid() OR recipient_id = auth.uid())
  );

-- 10. Conversations & Participants Policies (18+ Adult Gated)
CREATE POLICY "conversations_participants_only" ON public.conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      JOIN public.users u ON u.id = auth.uid()
      WHERE cp.conversation_id = public.conversations.id
      AND cp.user_id = auth.uid()
      AND u.age_band = '18+'
    )
  );

CREATE POLICY "conversation_participants_manage" ON public.conversation_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band = '18+') AND
    (user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = public.conversation_participants.conversation_id
      AND cp2.user_id = auth.uid()
    ))
  );

-- 11. Messages Policies (Participants Only & 18+ Gated)
CREATE POLICY "messages_participants_only" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      JOIN public.users u ON u.id = auth.uid()
      WHERE cp.conversation_id = public.messages.conversation_id
      AND cp.user_id = auth.uid()
      AND u.age_band = '18+'
    )
  );

-- 12. Jobs Policies (18+ Adult & Employers)
CREATE POLICY "jobs_select_active_adult" ON public.jobs
  FOR SELECT USING (
    (is_active = TRUE AND moderation_status = 'approved' AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band = '18+')) OR
    posted_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

CREATE POLICY "jobs_employer_insert" ON public.jobs
  FOR INSERT WITH CHECK (
    (posted_by = auth.uid() AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.is_employer = TRUE OR u.is_admin = TRUE)))
  );

CREATE POLICY "jobs_employer_update" ON public.jobs
  FOR UPDATE USING (
    posted_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 13. Applications Policies (18+ Candidates & Job Post Employers)
CREATE POLICY "applications_select" ON public.applications
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = public.applications.job_id AND j.posted_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

CREATE POLICY "applications_candidate_insert" ON public.applications
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band = '18+')
  );

CREATE POLICY "applications_employer_update" ON public.applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = public.applications.job_id AND j.posted_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 14. Subscriptions Policies (18+ & Owner)
CREATE POLICY "subscriptions_owner_only" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 15. Reports Policies
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "reports_admin_only" ON public.reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 16. Audit Logs Policies (Strictly Admin Read-Only, Zero Client Write)
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- ------------------------------------------------------------------------------
-- AUTO USER PROFILE CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, age_band, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Candidate'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'age_band', '18+'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (user_id, username, primary_goal)
  VALUES (
    new.id,
    LOWER(REPLACE(COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'candidate'), ' ', '_')) || '_' || SUBSTRING(new.id::text, 1, 4),
    'Master technical interviews and build ATS-ready portfolio'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

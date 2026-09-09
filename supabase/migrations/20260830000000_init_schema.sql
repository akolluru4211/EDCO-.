-- ==============================================================================
-- EDWORLD CO — POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Production migration for Supabase (Auth + Storage + PostgreSQL)
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (User identity, age-banding, and role clearances)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  dob DATE,
  age_band TEXT CHECK (age_band IN ('13-15', '16-18', '18+')),
  grade_level TEXT,
  username TEXT UNIQUE,
  headline TEXT,
  bio TEXT,
  primary_goal TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  mentor_tags JSONB DEFAULT '[]'::jsonb,
  is_employer BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  visual_mode TEXT DEFAULT 'career' CHECK (visual_mode IN ('career', 'maximalist')),
  tos_version TEXT DEFAULT '2026.1',
  privacy_version TEXT DEFAULT '2026.1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. GUARDIAN CONSENTS (DPDP Act Minor Protection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guardian_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  guardian_email TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'legal_guardian')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('not_required', 'pending', 'verified', 'revoked')),
  token TEXT UNIQUE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. RESUMES & ANALYSES (ATS Resume Maker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_role TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  match_score INT NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. INTERVIEW SESSIONS (AI Mock Studio)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  difficulty_level INT NOT NULL CHECK (difficulty_level IN (0, 1, 2)),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score NUMERIC(5, 2) NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. JOBS & APPLICATIONS (18+ Job Board)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internship', 'entry_level', 'full_time', 'contract')),
  experience_level TEXT,
  salary_range TEXT,
  skills_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  application_deadline TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  resume_snapshot JSONB NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'rejected')),
  cover_note TEXT,
  match_score INT DEFAULT 0,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 6. NETWORKING & MESSAGING (18+ Gated)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  type TEXT DEFAULT 'peer' CHECK (type IN ('peer', 'mentorship')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'message', 'job', 'project')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. SUBSCRIPTIONS & MONETIZATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOGS (Immutable Security Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is adult (18+)
CREATE OR REPLACE FUNCTION public.is_adult()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND age_band = '18+'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles visible if 18+ and public" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    (is_public = TRUE AND age_band = '18+') OR
    public.is_admin()
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Guardian Consents Policies
CREATE POLICY "Users can manage own guardian consents" ON public.guardian_consents
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- Resumes Policies
CREATE POLICY "Users can manage own resumes" ON public.resumes
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own resume analyses" ON public.resume_analyses
  FOR ALL USING (user_id = auth.uid());

-- Interview Sessions Policies
CREATE POLICY "Users can manage own interview sessions" ON public.interview_sessions
  FOR ALL USING (user_id = auth.uid());

-- Jobs Policies (18+ only)
CREATE POLICY "Approved active jobs visible to 18+" ON public.jobs
  FOR SELECT USING (
    (is_active = TRUE AND moderation_status = 'approved' AND public.is_adult()) OR
    posted_by = auth.uid() OR
    public.is_admin()
  );

CREATE POLICY "Employers and Admins can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    (posted_by = auth.uid() AND public.is_adult()) OR public.is_admin()
  );

CREATE POLICY "Employers can update own jobs" ON public.jobs
  FOR UPDATE USING (posted_by = auth.uid() OR public.is_admin());

-- Job Applications Policies (Applicant & Employer Isolation)
CREATE POLICY "Applications readable by applicant and employer" ON public.job_applications
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()) OR
    public.is_admin()
  );

CREATE POLICY "18+ Candidates can apply to jobs" ON public.job_applications
  FOR INSERT WITH CHECK (user_id = auth.uid() AND public.is_adult());

CREATE POLICY "Employers can update application status" ON public.job_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND posted_by = auth.uid()) OR
    public.is_admin()
  );

-- Connections Policies (18+ only)
CREATE POLICY "Connections accessible by participants" ON public.connections
  FOR ALL USING (
    public.is_adult() AND (requester_id = auth.uid() OR recipient_id = auth.uid())
  );

-- Direct Messages Policies (18+ only)
CREATE POLICY "Messages accessible by sender and recipient" ON public.direct_messages
  FOR ALL USING (
    public.is_adult() AND (sender_id = auth.uid() OR receiver_id = auth.uid())
  );

-- Audit Logs Policies (Admin Read-Only, Zero Client Write)
CREATE POLICY "Audit logs readable only by admins" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Subscriptions readable by owner and admin" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- AUTO USER CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Candidate'),
    new.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- Migration: 20260925000000_phase9_career_intelligence_execution_platform.sql
-- Description: Phase 9 Career Intelligence & Execution Platform schema.
--              Includes skill_evidence, target_roles, job_applications_pipeline,
--              career_milestones, career_copilot_conversations, and document_vault.
-- ==============================================================================

-- 1. SKILL EVIDENCE (Multi-source verifiable evidence records)
CREATE TABLE IF NOT EXISTS public.skill_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('github', 'leetcode', 'linkedin', 'resume', 'project', 'interview', 'certification', 'user')),
  source_id TEXT,
  evidence_title TEXT NOT NULL,
  evidence_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1.0),
  strength TEXT NOT NULL CHECK (strength IN ('strong', 'moderate', 'supporting')),
  user_visibility BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_evidence_user_skill ON public.skill_evidence(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_evidence_source ON public.skill_evidence(source);

-- 2. TARGET ROLES (Customizable target roles, skills, and industry requirements)
CREATE TABLE IF NOT EXISTS public.target_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  industry TEXT,
  target_companies TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'entry_to_mid',
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_target_roles_user ON public.target_roles(user_id);

-- 3. APPLICATION COMMAND CENTER PIPELINE
CREATE TABLE IF NOT EXISTS public.job_applications_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_location TEXT,
  salary_range TEXT,
  job_url TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'viewed', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_at TIMESTAMPTZ,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  notes TEXT,
  interview_prep_notes TEXT,
  next_action_date TIMESTAMPTZ,
  next_action_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_app_pipeline_user ON public.job_applications_pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_job_app_pipeline_status ON public.job_applications_pipeline(status);

-- 4. CAREER MILESTONES (Real event milestones)
CREATE TABLE IF NOT EXISTS public.career_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('resume', 'project', 'interview', 'github', 'application', 'milestone', 'branding')),
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  evidence_ref JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT uq_user_milestone UNIQUE (user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_career_milestones_user ON public.career_milestones(user_id);

-- 5. CAREER COPILOT CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.career_copilot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  evidence_citations JSONB DEFAULT '[]'::jsonb,
  action_shortcuts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user_session ON public.career_copilot_conversations(user_id, session_id);

-- 6. DOCUMENT VAULT (Secure personal document tracking)
CREATE TABLE IF NOT EXISTS public.document_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('resume_pdf', 'certificate', 'offer_letter', 'portfolio_asset', 'other')),
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_vault_user ON public.document_vault(user_id);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES (Enforce strict owner isolation)
DROP POLICY IF EXISTS "Users can manage own skill evidence" ON public.skill_evidence;
CREATE POLICY "Users can manage own skill evidence"
  ON public.skill_evidence FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own target roles" ON public.target_roles;
CREATE POLICY "Users can manage own target roles"
  ON public.target_roles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own applications" ON public.job_applications_pipeline;
CREATE POLICY "Users can manage own applications"
  ON public.job_applications_pipeline FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own milestones" ON public.career_milestones;
CREATE POLICY "Users can manage own milestones"
  ON public.career_milestones FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own copilot conversations" ON public.career_copilot_conversations;
CREATE POLICY "Users can manage own copilot conversations"
  ON public.career_copilot_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own document vault" ON public.document_vault;
CREATE POLICY "Users can manage own document vault"
  ON public.document_vault FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

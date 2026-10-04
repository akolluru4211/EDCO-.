-- Migration: 20261004100000_myra_copilot_tables.sql
-- Description: Creates myra_interactions and myra_proactive_suggestions tables for unified AI orchestration

-- 1. Myra Interactions Table (Centralized AI Audit & Quality Logging)
CREATE TABLE IF NOT EXISTS public.myra_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_context TEXT NOT NULL, -- 'ask_myra' | 'resume_tailor' | 'interview_generate' | 'interview_score' | 'birthday_wish' | 'proactive_suggestion'
  input_summary TEXT,
  output_summary TEXT,
  model_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success', -- 'success' | 'rate_limited' | 'error' | 'fallback'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_myra_interactions_user_id ON public.myra_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_myra_interactions_feature_context ON public.myra_interactions(feature_context);
CREATE INDEX IF NOT EXISTS idx_myra_interactions_created_at ON public.myra_interactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.myra_interactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'myra_interactions' AND policyname = 'Users can view own myra interactions'
  ) THEN
    CREATE POLICY "Users can view own myra interactions"
      ON public.myra_interactions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'myra_interactions' AND policyname = 'Allow insert for authenticated and service role'
  ) THEN
    CREATE POLICY "Allow insert for authenticated and service role"
      ON public.myra_interactions FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;


-- 2. Myra Proactive Suggestions Table (Exactly 1 daily contextual suggestion per user)
CREATE TABLE IF NOT EXISTS public.myra_proactive_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  action_label TEXT NOT NULL,
  action_url TEXT NOT NULL,
  context_reason TEXT NOT NULL,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  acted_on BOOLEAN NOT NULL DEFAULT false,
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_date_bucket UNIQUE (user_id, date_bucket)
);

CREATE INDEX IF NOT EXISTS idx_myra_proactive_user_date ON public.myra_proactive_suggestions(user_id, date_bucket);

-- Enable RLS
ALTER TABLE public.myra_proactive_suggestions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'myra_proactive_suggestions' AND policyname = 'Users can view own proactive suggestions'
  ) THEN
    CREATE POLICY "Users can view own proactive suggestions"
      ON public.myra_proactive_suggestions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'myra_proactive_suggestions' AND policyname = 'Users can update own proactive suggestions'
  ) THEN
    CREATE POLICY "Users can update own proactive suggestions"
      ON public.myra_proactive_suggestions FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'myra_proactive_suggestions' AND policyname = 'Allow insert for service and authenticated'
  ) THEN
    CREATE POLICY "Allow insert for service and authenticated"
      ON public.myra_proactive_suggestions FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.myra_interactions TO authenticated, anon, service_role;
GRANT SELECT, INSERT, UPDATE ON public.myra_proactive_suggestions TO authenticated, anon, service_role;

-- ==============================================================================
-- EDWORLD CO — FEATURE 3 UPGRADE: INTERVIEW FORMATS & MODEL CONFIGURABILITY
-- Schema migrations for Coding Rounds, AI Group Discussions, and Model Versioning
-- ==============================================================================

-- 1. EXTEND interview_questions TABLE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_questions' AND column_name = 'question_type'
  ) THEN
    ALTER TABLE public.interview_questions 
    ADD COLUMN question_type TEXT DEFAULT 'behavioral' 
    CHECK (question_type IN ('behavioral', 'technical_verbal', 'coding', 'group_discussion'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_questions' AND column_name = 'starter_code'
  ) THEN
    ALTER TABLE public.interview_questions ADD COLUMN starter_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_questions' AND column_name = 'language'
  ) THEN
    ALTER TABLE public.interview_questions ADD COLUMN language TEXT DEFAULT 'javascript';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_questions' AND column_name = 'test_cases'
  ) THEN
    ALTER TABLE public.interview_questions ADD COLUMN test_cases JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_questions' AND column_name = 'persona_configs'
  ) THEN
    ALTER TABLE public.interview_questions ADD COLUMN persona_configs JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. EXTEND interview_sessions TABLE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'format'
  ) THEN
    ALTER TABLE public.interview_sessions 
    ADD COLUMN format TEXT DEFAULT 'standard' 
    CHECK (format IN ('standard', 'coding', 'group_discussion'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'model_version'
  ) THEN
    ALTER TABLE public.interview_sessions 
    ADD COLUMN model_version TEXT DEFAULT 'edworld-scorer-v2.1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'code_submission'
  ) THEN
    ALTER TABLE public.interview_sessions ADD COLUMN code_submission TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'test_results'
  ) THEN
    ALTER TABLE public.interview_sessions ADD COLUMN test_results JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'discussion_transcript'
  ) THEN
    ALTER TABLE public.interview_sessions ADD COLUMN discussion_transcript JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'code_score'
  ) THEN
    ALTER TABLE public.interview_sessions ADD COLUMN code_score INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'interview_sessions' AND column_name = 'discussion_score'
  ) THEN
    ALTER TABLE public.interview_sessions ADD COLUMN discussion_score INTEGER;
  END IF;
END $$;

-- 3. MODEL CONFIGURATION TABLE (Dynamic Config without Code Redeploys)
CREATE TABLE IF NOT EXISTS public.model_configs (
  id TEXT PRIMARY KEY,
  purpose TEXT NOT NULL,
  model_identifier TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  temperature NUMERIC DEFAULT 0.2,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default model configs
INSERT INTO public.model_configs (id, purpose, model_identifier, provider, temperature)
VALUES 
  ('content_scoring', 'Detailed interview response scoring & rubric evaluation', 'gpt-4o-2026-08', 'openai', 0.2),
  ('fast_classification', 'Filler words, pacing, and basic extraction', 'gpt-4o-mini-2026', 'openai', 0.0),
  ('group_discussion_persona', 'Multi-persona debate agent reasoning', 'gpt-4o-2026-08', 'openai', 0.7)
ON CONFLICT (id) DO UPDATE SET 
  model_identifier = EXCLUDED.model_identifier,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE public.model_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_model_configs" ON public.model_configs FOR SELECT USING (true);

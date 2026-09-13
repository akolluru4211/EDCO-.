-- ==============================================================================
-- Migration: 20260916000000_phase31_language_and_communication_trainer.sql
-- Description: Phase 31 Communication & Language Trainer Schema with Row Level Security (RLS)
--              Tables: communication_profiles, language_patterns, 
--                      interview_language_metrics, language_practice_sessions
-- ==============================================================================

-- 1. COMMUNICATION PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.communication_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  language_score numeric DEFAULT 75,
  grammar_score numeric DEFAULT 75,
  clarity_score numeric DEFAULT 75,
  fluency_score numeric DEFAULT 75,
  vocabulary_score numeric DEFAULT 75,
  professional_score numeric DEFAULT 75,
  total_interviews integer DEFAULT 0,
  average_wpm numeric DEFAULT 125,
  primary_weakness text DEFAULT 'filler_words',
  top_recurring_fillers text[] DEFAULT ARRAY['um', 'basically']::text[],
  strengths text[] DEFAULT ARRAY['Clear subject knowledge', 'Structured technical explanation']::text[],
  recommended_focus text[] DEFAULT ARRAY['Reduce filler words', 'Use STAR structure']::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_profiles_user_id ON public.communication_profiles(user_id);
ALTER TABLE public.communication_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own communication profile ON public.communication_profiles;
CREATE POLICY Users manage own communication profile
  ON public.communication_profiles FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 2. LANGUAGE PATTERNS TABLE (Cross-Interview Learning)
CREATE TABLE IF NOT EXISTS public.language_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  pattern_type text NOT NULL, -- 'filler_word', 'grammar_tendency', 'sentence_structure', 'pacing'
  pattern text NOT NULL, -- e.g. 'actually', 'tense_inconsistency', 'run_on_sentence'
  frequency integer DEFAULT 1,
  severity text DEFAULT 'moderate', -- 'low', 'moderate', 'high'
  examples text[] DEFAULT ARRAY[]::text[],
  first_detected_at timestamptz DEFAULT now(),
  last_detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lang_patterns_user_id ON public.language_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_lang_patterns_type ON public.language_patterns(pattern_type);
ALTER TABLE public.language_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own language patterns ON public.language_patterns;
CREATE POLICY Users manage own language patterns
  ON public.language_patterns FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 3. INTERVIEW LANGUAGE METRICS TABLE (Per-Interview Telemetry)
CREATE TABLE IF NOT EXISTS public.interview_language_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id text NOT NULL,
  user_id text NOT NULL,
  language_score numeric NOT NULL,
  grammar_score numeric NOT NULL,
  clarity_score numeric NOT NULL,
  fluency_score numeric NOT NULL,
  vocabulary_score numeric NOT NULL,
  professional_score numeric NOT NULL,
  filler_word_count integer DEFAULT 0,
  speaking_rate_wpm numeric DEFAULT 120,
  pause_count integer DEFAULT 0,
  answer_structure_score numeric DEFAULT 80,
  what_you_said text,
  improved_version text,
  improvement_rationale text[] DEFAULT ARRAY[]::text[],
  coach_suggestions text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lang_metrics_user_id ON public.interview_language_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_lang_metrics_interview_id ON public.interview_language_metrics(interview_id);
ALTER TABLE public.interview_language_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own interview language metrics ON public.interview_language_metrics;
CREATE POLICY Users manage own interview language metrics
  ON public.interview_language_metrics FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

-- 4. LANGUAGE PRACTICE SESSIONS TABLE (Rapid Drills & Try-Again Comparisons)
CREATE TABLE IF NOT EXISTS public.language_practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  role_category text DEFAULT 'General',
  attempt_number integer DEFAULT 1,
  transcript text NOT NULL,
  language_score numeric NOT NULL,
  grammar_score numeric NOT NULL,
  clarity_score numeric NOT NULL,
  filler_count integer DEFAULT 0,
  wpm numeric DEFAULT 120,
  what_you_said text,
  improved_version text,
  delta_comparison jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.language_practice_sessions(user_id);
ALTER TABLE public.language_practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS Users manage own practice sessions ON public.language_practice_sessions;
CREATE POLICY Users manage own practice sessions
  ON public.language_practice_sessions FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

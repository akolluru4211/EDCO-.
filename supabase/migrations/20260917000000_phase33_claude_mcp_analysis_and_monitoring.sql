-- ============================================================================
-- Phase 33: Claude MCP Analysis & Quality Monitoring System Schema
-- ============================================================================

-- 1. AI Analysis Logs & Telemetry Table
CREATE TABLE IF NOT EXISTS public.ai_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  input_reference JSONB DEFAULT '{}'::jsonb,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  latency_ms INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'INSUFFICIENT_DATA', 'UNAVAILABLE')),
  error_message TEXT,
  user_feedback JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Communication Profiles Table (for longitudinal language tracking)
CREATE TABLE IF NOT EXISTS public.user_communication_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  language_score INTEGER DEFAULT 0,
  grammar_score INTEGER DEFAULT 0,
  clarity_score INTEGER DEFAULT 0,
  fluency_score INTEGER DEFAULT 0,
  vocabulary_score INTEGER DEFAULT 0,
  professional_score INTEGER DEFAULT 0,
  total_interviews INTEGER DEFAULT 0,
  average_wpm NUMERIC DEFAULT 0,
  top_fillers TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  recommended_focus TEXT[] DEFAULT '{}',
  recent_deltas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast monitoring queries and user lookups
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_user_id ON public.ai_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_created_at ON public.ai_analysis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_feature ON public.ai_analysis_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_status ON public.ai_analysis_logs(status);

-- 4. Enable RLS
ALTER TABLE public.ai_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_communication_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for ai_analysis_logs
DROP POLICY IF EXISTS "Users can view own AI analysis logs" ON public.ai_analysis_logs;
CREATE POLICY "Users can view own AI analysis logs"
  ON public.ai_analysis_logs
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own AI analysis logs" ON public.ai_analysis_logs;
CREATE POLICY "Users can insert own AI analysis logs"
  ON public.ai_analysis_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all AI analysis logs" ON public.ai_analysis_logs;
CREATE POLICY "Admins can view all AI analysis logs"
  ON public.ai_analysis_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'SUPER_ADMIN', 'FOUNDER')
    )
  );

-- 6. RLS Policies for user_communication_profiles
DROP POLICY IF EXISTS "Users can view own communication profile" ON public.user_communication_profiles;
CREATE POLICY "Users can view own communication profile"
  ON public.user_communication_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own communication profile" ON public.user_communication_profiles;
CREATE POLICY "Users can update own communication profile"
  ON public.user_communication_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


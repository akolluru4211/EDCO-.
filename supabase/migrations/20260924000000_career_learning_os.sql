-- ==============================================================================
-- Migration: 20260924000000_career_learning_os.sql
-- Description: Career Learning OS relational tables, multi-domain mapping,
--              unified roadmaps, daily timetable plans, learning resources,
--              and adaptive curriculum history with strict RLS policies.
-- ==============================================================================

-- 1. USER DOMAINS (Multi-domain selection with priority tiers)
CREATE TABLE IF NOT EXISTS public.user_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  domain_id TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('primary', 'secondary', 'supporting')),
  self_level INT NOT NULL DEFAULT 1 CHECK (self_level IN (0, 1, 2)),
  effective_level INT NOT NULL DEFAULT 1 CHECK (effective_level IN (0, 1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_domain UNIQUE (user_id, domain_id)
);

CREATE INDEX IF NOT EXISTS idx_user_domains_user_id ON public.user_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_user_domains_priority ON public.user_domains(priority);

-- 2. USER CAREER GOALS
CREATE TABLE IF NOT EXISTS public.user_career_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  target_role TEXT NOT NULL,
  target_industry TEXT,
  target_timeframe_months INT NOT NULL DEFAULT 6,
  available_hours_per_day NUMERIC NOT NULL DEFAULT 2,
  weekly_target_hours NUMERIC NOT NULL DEFAULT 14,
  preferred_schedule_blocks JSONB NOT NULL DEFAULT '["morning", "evening"]'::jsonb,
  current_experience_level TEXT DEFAULT 'early_career',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_career_goals_user ON public.user_career_goals(user_id);

-- 3. LEARNING ROADMAPS (Unified multi-domain roadmap)
CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_role TEXT NOT NULL,
  total_phases INT NOT NULL DEFAULT 4,
  current_phase_index INT NOT NULL DEFAULT 0,
  progress_percent INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'adapting')),
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  last_adapted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user ON public.learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_status ON public.learning_roadmaps(status);

-- 4. DAILY PLANS (Dynamic Daily Timetable)
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  time_block TEXT NOT NULL CHECK (time_block IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
  estimated_minutes INT NOT NULL DEFAULT 45,
  task_type TEXT NOT NULL CHECK (task_type IN ('concept', 'practice', 'project', 'interview_drill', 'aptitude', 'resume_tuning', 'review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  domain_id TEXT,
  skill_id TEXT,
  resource_url TEXT,
  practice_url TEXT,
  project_id TEXT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON public.daily_plans(user_id, plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_status ON public.daily_plans(status);

-- 5. LEARNING RESOURCES (Curated, verified educational materials)
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  provider TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'interactive_tutorial', 'documentation', 'repo', 'drill', 'course', 'challenge')),
  domain_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INT NOT NULL DEFAULT 30,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_domain ON public.learning_resources(domain_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill ON public.learning_resources(skill_id);

-- 6. ROADMAP CHANGE HISTORY (AI Adaptation audit trail)
CREATE TABLE IF NOT EXISTS public.roadmap_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  previous_phase_index INT,
  new_phase_index INT,
  change_reason TEXT NOT NULL,
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('user', 'ai_evaluator', 'interview_feedback', 'code_assessment', 'progress_acceleration')),
  proposed_changes JSONB,
  accepted_by_user BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_history_user ON public.roadmap_change_history(user_id);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_change_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES
DROP POLICY IF EXISTS "Users can manage their own domains" ON public.user_domains;
CREATE POLICY "Users can manage their own domains"
  ON public.user_domains FOR ALL
  USING (auth.uid()::text = user_id OR user_id = auth.uid()::text)
  WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage their career goals" ON public.user_career_goals;
CREATE POLICY "Users can manage their career goals"
  ON public.user_career_goals FOR ALL
  USING (auth.uid()::text = user_id OR user_id = auth.uid()::text)
  WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage their roadmaps" ON public.learning_roadmaps;
CREATE POLICY "Users can manage their roadmaps"
  ON public.learning_roadmaps FOR ALL
  USING (auth.uid()::text = user_id OR user_id = auth.uid()::text)
  WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can manage their daily plans" ON public.daily_plans;
CREATE POLICY "Users can manage their daily plans"
  ON public.daily_plans FOR ALL
  USING (auth.uid()::text = user_id OR user_id = auth.uid()::text)
  WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

DROP POLICY IF EXISTS "All users can view active resources" ON public.learning_resources;
CREATE POLICY "All users can view active resources"
  ON public.learning_resources FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can view and manage their roadmap history" ON public.roadmap_change_history;
CREATE POLICY "Users can view and manage their roadmap history"
  ON public.roadmap_change_history FOR ALL
  USING (auth.uid()::text = user_id OR user_id = auth.uid()::text)
  WITH CHECK (auth.uid()::text = user_id OR user_id = auth.uid()::text);

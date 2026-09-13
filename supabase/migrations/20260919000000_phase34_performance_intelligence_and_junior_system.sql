-- ==============================================================================
-- Migration: 20260919000000_phase34_performance_intelligence_and_junior_system.sql
-- Description: Phase 34 - Central Performance Intelligence, Junior AI Daily System,
--              Real Evidence Tracking, and Adaptive Learning Engine
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.performance_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_status TEXT DEFAULT 'NOT_ENOUGH_DATA' CHECK (overall_status IN ('STRONG', 'DEVELOPING', 'NEEDS_PRACTICE', 'NOT_ENOUGH_DATA')),
  total_events_analyzed INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  insights_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.performance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  metrics_payload JSONB DEFAULT '{}'::jsonb,
  evidence_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_events_user_created ON public.performance_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_events_type ON public.performance_events(event_type);

CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN ('COMMUNICATION', 'TECHNICAL', 'CODING', 'RESUME', 'PROJECTS', 'INTERVIEW', 'PROBLEM_SOLVING', 'PROFESSIONAL_PROFILE')),
  score NUMERIC(5, 2),
  confidence NUMERIC(3, 2) DEFAULT 0.00,
  status_label TEXT NOT NULL DEFAULT 'NOT_ENOUGH_DATA' CHECK (status_label IN ('STRONG', 'DEVELOPING', 'NEEDS_PRACTICE', 'NOT_ENOUGH_DATA')),
  improvement_trend TEXT NOT NULL DEFAULT 'INSUFFICIENT_DATA' CHECK (improvement_trend IN ('IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA')),
  evidence_points JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  source_summary TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_user ON public.performance_metrics(user_id);

CREATE TABLE IF NOT EXISTS public.daily_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recommendation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  focus_title TEXT NOT NULL,
  focus_area TEXT NOT NULL,
  reason TEXT NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT NOT NULL,
  task_action_url TEXT NOT NULL,
  evidence_summary TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recommendation_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_rec_user_date ON public.daily_ai_recommendations(user_id, recommendation_date);

CREATE TABLE IF NOT EXISTS public.daily_ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_items JSONB DEFAULT '[]'::jsonb,
  improved_items JSONB DEFAULT '[]'::jsonb,
  needs_attention_items JSONB DEFAULT '[]'::jsonb,
  recommended_next TEXT,
  has_activity BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_sum_user_date ON public.daily_ai_summaries(user_id, summary_date);

CREATE TABLE IF NOT EXISTS public.junior_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_milestone_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_junior_goals_user ON public.junior_goals(user_id);

CREATE TABLE IF NOT EXISTS public.junior_daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  concept TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  solution_explanation TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'BEGINNER' CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  consecutive_successes INTEGER DEFAULT 0,
  consecutive_struggles INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'SKIPPED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_date)
);

CREATE INDEX IF NOT EXISTS idx_junior_tasks_user_date ON public.junior_daily_tasks(user_id, task_date);

CREATE TABLE IF NOT EXISTS public.junior_task_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.junior_daily_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_code TEXT NOT NULL,
  is_successful BOOLEAN DEFAULT FALSE,
  feedback TEXT,
  hints_revealed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_junior_attempts_task ON public.junior_task_attempts(task_id);

CREATE TABLE IF NOT EXISTS public.junior_skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL CHECK (skill_name IN ('Python', 'JavaScript', 'HTML/CSS', 'Algorithms', 'Problem Solving', 'Debugging', 'Logic', 'AI Concepts', 'Project Building')),
  mastery_level TEXT NOT NULL DEFAULT 'NOT_ENOUGH_DATA' CHECK (mastery_level IN ('NOT_ENOUGH_DATA', 'BEGINNER', 'DEVELOPING', 'PROFICIENT', 'ADVANCED')),
  attempts_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_junior_skills_user ON public.junior_skill_mastery(user_id);

CREATE TABLE IF NOT EXISTS public.junior_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'BEGINNER' CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  repo_url TEXT,
  live_url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_junior_projects_user ON public.junior_projects(user_id);

-- Enable RLS
ALTER TABLE public.performance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junior_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junior_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junior_task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junior_skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.junior_projects ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own performance profile') THEN
    CREATE POLICY "Users can view own performance profile" ON public.performance_profiles FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own performance profile" ON public.performance_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own performance events" ON public.performance_events FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own performance events" ON public.performance_events FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own performance metrics" ON public.performance_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own daily recommendations" ON public.daily_ai_recommendations FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own daily recommendations" ON public.daily_ai_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own daily summaries" ON public.daily_ai_summaries FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own daily summaries" ON public.daily_ai_summaries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own junior goals" ON public.junior_goals FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own junior goals" ON public.junior_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own junior daily tasks" ON public.junior_daily_tasks FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own junior daily tasks" ON public.junior_daily_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own junior task attempts" ON public.junior_task_attempts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own junior task attempts" ON public.junior_task_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own junior skill mastery" ON public.junior_skill_mastery FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own junior skill mastery" ON public.junior_skill_mastery FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can view own junior projects" ON public.junior_projects FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own junior projects" ON public.junior_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

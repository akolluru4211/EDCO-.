-- ==============================================================================
-- EDWORLD CO — FEATURE 9: GAMIFICATION SYSTEM (POINTS, BADGES, STREAKS, LEADERBOARD)
-- Normalized Schema, Atomic Point Event Ledger & RLS Security
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USER STATS (Points, Streaks, and Timezone Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  timezone TEXT DEFAULT 'UTC',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. BADGES CATALOG & USER BADGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Award'
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ------------------------------------------------------------------------------
-- 3. POINT EVENTS AUDIT LEDGER (Idempotency & Source Traceability)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_feature TEXT NOT NULL,
  source_id TEXT,
  points INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_events_dedup ON public.point_events (user_id, source_feature, source_id);
CREATE INDEX IF NOT EXISTS idx_point_events_weekly ON public.point_events (user_id, created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — ZERO CLIENT WRITES
-- ==============================================================================

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 1. user_stats policies (Select only for owner & admin, zero client write)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_stats' AND policyname = 'user_stats_select_own') THEN
    CREATE POLICY "user_stats_select_own" ON public.user_stats
      FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));
  END IF;

  -- 2. badges catalog (Readable by all authenticated users)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'badges_select_all') THEN
    CREATE POLICY "badges_select_all" ON public.badges
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- 3. user_badges (Readable by owner, 18+ peers on profile, and admin)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'user_badges_select') THEN
    CREATE POLICY "user_badges_select" ON public.user_badges
      FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
      );
  END IF;

  -- 4. point_events (Strictly owner & admin read-only)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'point_events' AND policyname = 'point_events_select_own') THEN
    CREATE POLICY "point_events_select_own" ON public.point_events
      FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- SEED STANDARD BADGES CATALOG
-- ------------------------------------------------------------------------------
INSERT INTO public.badges (code, name, description, icon)
VALUES 
  ('first_interview', 'First Interview Practiced', 'Completed your first AI mock interview session.', 'Video'),
  ('first_quest', 'Curiosity Pioneer', 'Successfully finished your first interactive curiosity quest.', 'Compass'),
  ('streak_3', '3-Day Consistency', 'Maintained a 3-day active learning streak.', 'Flame'),
  ('streak_7', 'Weekly Mastery Streak', 'Logged active skill progress 7 days in a row.', 'Zap'),
  ('projects_3', 'Builder Apprentice', 'Built and published 3 verified portfolio projects.', 'FolderGit2'),
  ('points_500', '500 XP Milestone', 'Accumulated 500 points across practice drills and tasks.', 'Sparkles')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

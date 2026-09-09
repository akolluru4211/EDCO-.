-- ==============================================================================
-- EDWORLD CO — FEATURE 8: SCHOOL TRACK (JUNIOR 13-15 & EXPLORER 16-18)
-- PostgreSQL Tables, RLS Policies, and Seed Data for Minor Safety
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. AI & FUTURE SKILLS LITERACY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_literacy_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  depth_level TEXT CHECK (depth_level IN ('intro', 'deeper')) DEFAULT 'intro',
  related_interests TEXT[] DEFAULT '{}',
  is_ethics BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CURIOSITY QUESTS & PROGRESS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  interest_tags TEXT[] DEFAULT '{}',
  target_band TEXT CHECK (target_band IN ('13-15', '16-18', 'both')) DEFAULT 'both',
  points INT DEFAULT 50,
  badge_icon TEXT DEFAULT 'Sparkles',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quest_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_type TEXT CHECK (step_type IN ('read', 'quiz', 'creative')) DEFAULT 'read',
  prompt TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.quest_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  points_earned INT DEFAULT 50,
  UNIQUE (user_id, quest_id, step_id)
);

-- ------------------------------------------------------------------------------
-- 3. TALENT SHOWCASE (Strict Pre-Moderation & Zero Public Exposure)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.showcase_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  visibility TEXT CHECK (visibility IN ('classroom', 'private')) DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. GROWTH JOURNAL (Private Reflective Journal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT DEFAULT 'neutral',
  guardian_access_requested BOOLEAN DEFAULT FALSE,
  guardian_access_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. SCHOLARSHIPS & EXAM FINDER (Freshness Gated)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline DATE NOT NULL,
  link TEXT NOT NULL,
  related_streams TEXT[] DEFAULT '{}',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. MICRO-PROJECT CERTIFICATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.micro_project_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_title TEXT NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SCHOOL TRACK
-- ==============================================================================

ALTER TABLE public.ai_literacy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_project_certificates ENABLE ROW LEVEL SECURITY;

-- 1. AI Literacy Content (Readable by School Track users: 13-15 and 16-18, and Admins)
CREATE POLICY "ai_literacy_select" ON public.ai_literacy_content
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.age_band IN ('13-15', '16-18') OR u.is_admin = TRUE))
  );

-- 2. Quests & Steps (Readable by School Track users: 13-15 and 16-18, and Admins)
CREATE POLICY "quests_select" ON public.quests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.age_band IN ('13-15', '16-18') OR u.is_admin = TRUE))
  );

CREATE POLICY "quest_steps_select" ON public.quest_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.age_band IN ('13-15', '16-18') OR u.is_admin = TRUE))
  );

-- 3. User Quest Progress (Owner only)
CREATE POLICY "user_quest_progress_manage" ON public.user_quest_progress
  FOR ALL USING (user_id = auth.uid());

-- 4. Showcase Submissions (Owner & Admins see all; Classmates see APPROVED classroom only; NEVER PUBLIC)
CREATE POLICY "showcase_select" ON public.showcase_submissions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE) OR
    (moderation_status = 'approved' AND visibility = 'classroom' AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band IN ('13-15', '16-18')))
  );

CREATE POLICY "showcase_insert" ON public.showcase_submissions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.age_band IN ('13-15', '16-18'))
  );

CREATE POLICY "showcase_admin_update" ON public.showcase_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 5. Journal Entries (Strictly Owner; Guardian viewable ONLY after explicit approval)
CREATE POLICY "journal_entries_owner_all" ON public.journal_entries
  FOR ALL USING (user_id = auth.uid());

-- 6. Scholarships (Readable by Explorer 16-18 & School Track, and Admins)
CREATE POLICY "scholarships_select" ON public.scholarships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.age_band IN ('16-18', '13-15') OR u.is_admin = TRUE))
  );

CREATE POLICY "scholarships_admin_manage" ON public.scholarships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
  );

-- 7. Micro-Project Certificates (Owner only)
CREATE POLICY "certificates_owner_select" ON public.micro_project_certificates
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

CREATE POLICY "certificates_insert" ON public.micro_project_certificates
  FOR INSERT WITH CHECK (user_id = auth.uid());

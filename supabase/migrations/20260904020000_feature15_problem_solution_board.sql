-- ==============================================================================
-- EDWORLD CO — FEATURE 15: PROBLEM → SOLUTION BOARD & STRUCTURED FEEDBACK
-- ==============================================================================

-- 1. PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('community', 'environment', 'business', 'technical', 'education', 'general')),
  interest_tags TEXT[] DEFAULT '{}'::text[],
  difficulty_level INT CHECK (difficulty_level BETWEEN 0 AND 2) DEFAULT 0,
  min_age_band TEXT CHECK (min_age_band IN ('13-15', '16-18', '18+')) DEFAULT '13-15',
  source TEXT CHECK (source IN ('admin', 'partner', 'community')) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROBLEM SOLUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.problem_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  linked_project_id UUID REFERENCES public.projects(id),
  status TEXT CHECK (status IN ('in_progress', 'submitted')) DEFAULT 'in_progress',
  moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  visibility TEXT CHECK (visibility IN ('private', 'classroom', 'public')) DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOLUTION FEEDBACK TABLE (Structured, Never Public/Social)
CREATE TABLE IF NOT EXISTS public.solution_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES public.problem_solutions(id) ON DELETE CASCADE,
  given_by UUID REFERENCES public.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_feedback ENABLE ROW LEVEL SECURITY;

-- Problems: Active problems readable by authenticated users
CREATE POLICY "problems_read_active" ON public.problems
  FOR SELECT USING (is_active = TRUE OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "problems_admin_all" ON public.problems
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

-- Problem Solutions: Owner can read/write own solutions
CREATE POLICY "solutions_owner_all" ON public.problem_solutions
  FOR ALL USING (user_id = auth.uid());

-- Problem Solutions: Peers can read ONLY approved classroom/public solutions (Pending is NEVER leaked)
CREATE POLICY "solutions_peer_approved_read" ON public.problem_solutions
  FOR SELECT USING (
    (visibility IN ('classroom', 'public') AND moderation_status = 'approved') OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Solution Feedback: Only owner of solution, author of feedback, or admin can read
CREATE POLICY "feedback_authorized_read" ON public.solution_feedback
  FOR SELECT USING (
    given_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.problem_solutions ps WHERE ps.id = solution_id AND ps.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "feedback_authorized_insert" ON public.solution_feedback
  FOR INSERT WITH CHECK (
    given_by = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (is_admin = TRUE OR is_teacher = TRUE)) OR
      EXISTS (
        SELECT 1 FROM public.mentor_connections mc
        JOIN public.problem_solutions ps ON ps.user_id = mc.mentee_id
        WHERE ps.id = solution_id AND mc.mentor_id = auth.uid() AND mc.status = 'accepted'
      )
    )
  );

-- 5. SEED CURATED REAL-WORLD PROBLEMS
INSERT INTO public.problems (id, title, description, category, interest_tags, difficulty_level, min_age_band, source, last_reviewed_at)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'Community Food Waste & Pantry Distribution Network',
    'Design a lightweight neighborhood routing system to match excess produce from local markets with regional distribution pantries before spoilage occurs.',
    'community',
    ARRAY['community', 'sustainability', 'logistics', 'social-impact'],
    0,
    '13-15',
    'admin',
    NOW()
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'Solar Microgrid Energy Usage Dashboard for Schools',
    'Build an interactive visualization that tracks rooftop solar generation versus classroom HVAC load to gamify student energy conservation.',
    'environment',
    ARRAY['environment', 'iot', 'clean-energy', 'analytics'],
    1,
    '16-18',
    'partner',
    NOW()
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'Decentralized Offline-First Medical Supply Inventory',
    'Architect an offline-first sync engine using CRDTs or SQLite to maintain verifiable medical inventory records during rural power outages.',
    'technical',
    ARRAY['technical', 'architecture', 'databases', 'healthtech'],
    2,
    '18+',
    'admin',
    NOW()
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-444444444444',
    'Stale Legacy Community Recycling Hub Tracker',
    'A legacy problem record seeded specifically to test freshness verification and review flagging.',
    'community',
    ARRAY['community', 'waste-management'],
    0,
    '13-15',
    'community',
    NOW() - INTERVAL '120 days'
  )
ON CONFLICT (id) DO NOTHING;

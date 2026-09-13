-- ==============================================================================
-- Migration: 20260920000000_landing_sector_pages_and_features.sql
-- Description: Four Sector Landing Pages Content Schema, Features & Seed Data
-- ==============================================================================

-- 1. Create Landing Sector Pages Table
CREATE TABLE IF NOT EXISTS public.landing_sector_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT UNIQUE NOT NULL CHECK (sector IN ('junior', 'explorer', 'college', 'working_professional')),
  slug TEXT UNIQUE NOT NULL,
  hero_headline TEXT NOT NULL,
  hero_subtext TEXT NOT NULL,
  cta_label TEXT NOT NULL,
  cta_href TEXT NOT NULL,
  visual_mode TEXT NOT NULL CHECK (visual_mode IN ('maximalist', 'career')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 2. Create Landing Feature Highlights Table
CREATE TABLE IF NOT EXISTS public.landing_feature_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL REFERENCES public.landing_sector_pages(sector) ON DELETE CASCADE,
  display_order INT NOT NULL,
  icon_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_landing_features_sector_order ON public.landing_feature_highlights(sector, display_order ASC);

-- 3. Row-Level Security (RLS)
ALTER TABLE public.landing_sector_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_feature_highlights ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_read_landing_pages" ON public.landing_sector_pages;
DROP POLICY IF EXISTS "admin_write_landing_pages" ON public.landing_sector_pages;
DROP POLICY IF EXISTS "public_read_landing_features" ON public.landing_feature_highlights;
DROP POLICY IF EXISTS "admin_write_landing_features" ON public.landing_feature_highlights;

-- Public read for all visitors
CREATE POLICY "public_read_landing_pages" ON public.landing_sector_pages
  FOR SELECT USING (true);

CREATE POLICY "public_read_landing_features" ON public.landing_feature_highlights
  FOR SELECT USING (true);

-- Admin write only
CREATE POLICY "admin_write_landing_pages" ON public.landing_sector_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_admin = true OR p.role IN ('admin', 'super_admin'))
    )
  );

CREATE POLICY "admin_write_landing_features" ON public.landing_feature_highlights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.is_admin = true OR p.role IN ('admin', 'super_admin'))
    )
  );

-- 4. Seed Content for the Four Sector Pages

-- Junior (for-junior, Maximalist)
INSERT INTO public.landing_sector_pages (sector, slug, hero_headline, hero_subtext, cta_label, cta_href, visual_mode)
VALUES (
  'junior',
  'for-junior',
  'Explore, build, and discover your potential before high school.',
  'A 100% private, kid-safe creative sandbox for Ages 13–15. Master real programming logic, test AI tools responsibly, and discover what you love.',
  'Start Exploring Free',
  '/auth/signup?track=junior&stage=junior',
  'maximalist'
)
ON CONFLICT (sector) DO UPDATE SET
  slug = EXCLUDED.slug,
  hero_headline = EXCLUDED.hero_headline,
  hero_subtext = EXCLUDED.hero_subtext,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  visual_mode = EXCLUDED.visual_mode,
  updated_at = NOW();

-- Explorer (for-explorer, Maximalist)
INSERT INTO public.landing_sector_pages (sector, slug, hero_headline, hero_subtext, cta_label, cta_href, visual_mode)
VALUES (
  'explorer',
  'for-explorer',
  'Bridge high school and your future career with real projects.',
  'Built for Ages 16–18. Practice low-pressure communication drills, track real scholarship deadlines, compare colleges honestly, and build verifiable micro-projects.',
  'Create Student Account',
  '/auth/signup?track=student&stage=student',
  'maximalist'
)
ON CONFLICT (sector) DO UPDATE SET
  slug = EXCLUDED.slug,
  hero_headline = EXCLUDED.hero_headline,
  hero_subtext = EXCLUDED.hero_subtext,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  visual_mode = EXCLUDED.visual_mode,
  updated_at = NOW();

-- College (for-college, Career)
INSERT INTO public.landing_sector_pages (sector, slug, hero_headline, hero_subtext, cta_label, cta_href, visual_mode)
VALUES (
  'college',
  'for-college',
  'From campus coursework to top-tier technical placement.',
  'The comprehensive career acceleration OS for college students. ATS resume optimizer, full-stack STAR mock drills with live code execution, and verified GitHub portfolios.',
  'Launch College Profile',
  '/auth/signup?track=student&stage=student',
  'career'
)
ON CONFLICT (sector) DO UPDATE SET
  slug = EXCLUDED.slug,
  hero_headline = EXCLUDED.hero_headline,
  hero_subtext = EXCLUDED.hero_subtext,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  visual_mode = EXCLUDED.visual_mode,
  updated_at = NOW();

-- Working Professional (for-professionals, Career)
INSERT INTO public.landing_sector_pages (sector, slug, hero_headline, hero_subtext, cta_label, cta_href, visual_mode)
VALUES (
  'working_professional',
  'for-professionals',
  'Level up your seniority or execute a high-impact career switch.',
  'Designed for engineers, product leads, and ambitious professionals. Pinpoint exact skill gaps, run STAR interview drills with language cadence scoring, and manage applications with zero noise.',
  'Build Career OS',
  '/auth/signup?track=pro&stage=professional',
  'career'
)
ON CONFLICT (sector) DO UPDATE SET
  slug = EXCLUDED.slug,
  hero_headline = EXCLUDED.hero_headline,
  hero_subtext = EXCLUDED.hero_subtext,
  cta_label = EXCLUDED.cta_label,
  cta_href = EXCLUDED.cta_href,
  visual_mode = EXCLUDED.visual_mode,
  updated_at = NOW();

-- 5. Seed Feature Highlights for All Four Sectors

DELETE FROM public.landing_feature_highlights WHERE sector IN ('junior', 'explorer', 'college', 'working_professional');

-- Junior Highlights
INSERT INTO public.landing_feature_highlights (sector, display_order, icon_key, title, description) VALUES
  ('junior', 1, 'brain', 'AI & Future Skills Literacy', 'Learn what AI actually is, and how to use it well'),
  ('junior', 2, 'compass', 'Stream & Subject Guidance', 'Explore Science, Commerce, and Arts before you have to choose'),
  ('junior', 3, 'sparkles', 'Curiosity Quests', 'Short, game-like challenges matched to what you''re into'),
  ('junior', 4, 'trophy', 'Talent Showcase', 'Share what you''ve made, safely, with your classmates'),
  ('junior', 5, 'rocket', 'Career Simulator', 'See what different careers actually look like day to day'),
  ('junior', 6, 'book-open', 'Growth Journal', 'A private space to track what you''re learning');

-- Explorer Highlights
INSERT INTO public.landing_feature_highlights (sector, display_order, icon_key, title, description) VALUES
  ('explorer', 1, 'message-square', 'Communication Trainer', 'Light interview practice, zero pressure, real feedback'),
  ('explorer', 2, 'award', 'Scholarship & Exam Finder', 'Real deadlines, always dated so you know they''re current'),
  ('explorer', 3, 'target', 'Entrance Exam Tracker', 'Keep your prep on track for the exams that matter'),
  ('explorer', 4, 'layers', 'College Comparison Tool', 'Honest, factual comparisons — never a ranked list'),
  ('explorer', 5, 'code-2', 'Guided Micro-Projects', 'Build your first real project with a certificate to show for it'),
  ('explorer', 6, 'file-text', 'SOP Assistant', 'Help structuring your essay — you still write it');

-- College Highlights
INSERT INTO public.landing_feature_highlights (sector, display_order, icon_key, title, description) VALUES
  ('college', 1, 'file-text', 'Resume Maker', 'Built to actually pass ATS filters, not just look nice'),
  ('college', 2, 'video', 'Mock Interview', 'Practice with real scoring, including coding rounds'),
  ('college', 3, 'folder-git-2', 'Project Studio', 'A verifiable portfolio, pulled straight from your GitHub'),
  ('college', 4, 'building-2', 'Campus Placement Tracker', 'Know which companies are visiting and when'),
  ('college', 5, 'users', 'Peer Resume Review', 'Get feedback from people who''ve been through it'),
  ('college', 6, 'briefcase', 'Job & Internship Board', 'Filtered for what actually fits a student''s timeline');

-- Working Professional Highlights
INSERT INTO public.landing_feature_highlights (sector, display_order, icon_key, title, description) VALUES
  ('working_professional', 1, 'trending-up', 'Career-Switch Path Recommendations', 'See the real gap between where you are and where you want to be'),
  ('working_professional', 2, 'target', 'Job Search Pipeline', 'Track every application in one place, not five tabs'),
  ('working_professional', 3, 'users', 'Referral Request Tool', 'Ask your network the easy way'),
  ('working_professional', 4, 'dollar-sign', 'Salary-Range Reference', 'Sourced, factual ranges — never invented numbers'),
  ('working_professional', 5, 'file-text', 'Performance-Review Assistant', 'Structure your self-appraisal without starting from a blank page'),
  ('working_professional', 6, 'award', 'Certification Tracker', 'Keep a running record of what you''ve earned');

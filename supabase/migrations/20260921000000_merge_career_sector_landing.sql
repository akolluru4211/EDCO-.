-- ==============================================================================
-- Migration: 20260921000000_merge_career_sector_landing.sql
-- Description: Merge College and Working Professional into unified Career Sector
--              while keeping Junior and Explorer rows for the standalone site.
-- ==============================================================================

-- 1. Update Check Constraint on landing_sector_pages to allow 'career'
ALTER TABLE public.landing_sector_pages 
  DROP CONSTRAINT IF EXISTS landing_sector_pages_sector_check;

ALTER TABLE public.landing_sector_pages 
  ADD CONSTRAINT landing_sector_pages_sector_check 
  CHECK (sector IN ('junior', 'explorer', 'college', 'working_professional', 'career'));

-- 2. Insert or Update Unified Career Sector Page
INSERT INTO public.landing_sector_pages (sector, slug, hero_headline, hero_subtext, cta_label, cta_href, visual_mode)
VALUES (
  'career',
  'for-career',
  'From college coursework to high-impact career seniority.',
  'The unified career acceleration OS for students and working professionals. ATS resume builder, full-stack STAR mock drills with live code execution, salary benchmarks, and verified GitHub portfolios.',
  'Build Career OS Free',
  '/signup?intent=college',
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

-- 3. Insert Combined Feature Highlights for Career
DELETE FROM public.landing_feature_highlights WHERE sector = 'career';

INSERT INTO public.landing_feature_highlights (sector, display_order, icon_key, title, description) VALUES
  ('career', 1, 'file-text', 'ATS Resume Maker', 'Built to pass single-column ATS parsers with quantifiable impact metrics'),
  ('career', 2, 'video', 'STAR Mock Interviews', 'Practice with real speech cadence analysis and coding execution'),
  ('career', 3, 'folder-git-2', 'GitHub Project Studio', 'Verifiable engineering portfolio extracted directly from your repos'),
  ('career', 4, 'trending-up', 'Career Switch & Placement Roadmap', 'Pinpoint real skill gaps for campus drives or senior transitions'),
  ('career', 5, 'target', 'Job Application Pipeline', 'Track every application and interview stage in one structured workspace'),
  ('career', 6, 'dollar-sign', 'Salary & Peer Benchmarks', 'Sourced, factual compensation ranges and peer resume feedback');

-- Feature 17: College & Working Professional Expansion Schema

CREATE TABLE IF NOT EXISTS public.interview_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  rounds JSONB DEFAULT '[]',
  overall_notes TEXT,
  difficulty_rating INT DEFAULT 3,
  is_anonymous BOOLEAN DEFAULT true,
  moderation_status TEXT CHECK (moderation_status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT UNIQUE NOT NULL,
  culture_notes TEXT,
  interview_process_notes TEXT,
  common_question_themes TEXT[] DEFAULT '{}',
  compensation_insights TEXT,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offer_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  offers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leadership_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  reflection_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='jobs' AND column_name='listing_type') THEN
    ALTER TABLE public.jobs ADD COLUMN listing_type TEXT DEFAULT 'full_time';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certifications' AND column_name='target_exam_date') THEN
    ALTER TABLE public.certifications ADD COLUMN target_exam_date DATE;
    ALTER TABLE public.certifications ADD COLUMN prep_progress_notes TEXT;
  END IF;
END $$;

ALTER TABLE public.interview_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved interview experiences"
  ON public.interview_experiences FOR SELECT
  USING (moderation_status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own interview experiences"
  ON public.interview_experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interview experiences"
  ON public.interview_experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view company research"
  ON public.company_research FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their private offer comparisons"
  ON public.offer_comparisons FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their private leadership assessments"
  ON public.leadership_assessments FOR ALL
  USING (auth.uid() = user_id);

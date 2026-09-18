-- Aptitude Questions & Attempts Tables
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty_level INT DEFAULT 1,
  active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aptitude_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_ids UUID[] DEFAULT '{}',
  answers JSONB NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL DEFAULT 10,
  time_spent_seconds INT DEFAULT 0,
  attempted_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aptitude_questions_date ON public.aptitude_questions(active_date);
CREATE INDEX IF NOT EXISTS idx_aptitude_attempts_user ON public.aptitude_attempts(user_id, attempted_date);

ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active aptitude questions"
  ON public.aptitude_questions FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own aptitude attempts"
  ON public.aptitude_attempts FOR ALL
  USING (auth.uid() = user_id);

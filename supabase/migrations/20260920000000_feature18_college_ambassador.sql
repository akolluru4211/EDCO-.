-- Feature 18: College Ambassador Program Schema

CREATE TABLE IF NOT EXISTS public.ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  college_name TEXT NOT NULL,
  why_ambassador TEXT NOT NULL,
  social_links JSONB DEFAULT '{}',
  relevant_experience TEXT,
  status TEXT CHECK (status IN ('pending','approved','rejected','withdrawn')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ambassadors (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  college_name TEXT NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id UUID REFERENCES public.ambassadors(user_id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id),
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Ambassador Badge if not existing
INSERT INTO public.badges (name, code, description, icon_name, xp_value)
VALUES ('Edworld Campus Ambassador', 'campus_ambassador', 'Official Edworld Co Campus Representative & Community Leader', 'Award', 250)
ON CONFLICT (code) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ambassador_apps_user ON public.ambassador_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_code ON public.ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_amb ON public.ambassador_referrals(ambassador_user_id);

-- Row Level Security
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own ambassador application"
  ON public.ambassador_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ambassador application"
  ON public.ambassador_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can withdraw their own ambassador application"
  ON public.ambassador_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Ambassadors can view own ambassador profile"
  ON public.ambassadors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Ambassadors can view own referrals"
  ON public.ambassador_referrals FOR SELECT
  USING (auth.uid() = ambassador_user_id);

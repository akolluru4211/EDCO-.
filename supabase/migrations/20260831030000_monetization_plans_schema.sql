-- ==============================================================================
-- EDWORLD CO — FEATURE 10: MONETIZATION & RAZORPAY SUBSCRIPTIONS
-- Plans Catalog, Subscriptions Lifecycle, Payment History & Audit RLS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PLANS CATALOG TABLE (Central Config)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_inr INT NOT NULL,
  resume_limit INT NOT NULL,
  interview_limit_per_month INT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. EXTEND SUBSCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grace_period_until TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 3. PAYMENT HISTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount_inr INT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 1. plans catalog (Readable by authenticated users)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'plans_select_all') THEN
    CREATE POLICY "plans_select_all" ON public.plans
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- 2. payment_history (Owner & Admin read-only, Zero client write)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_history' AND policyname = 'payment_history_select_own') THEN
    CREATE POLICY "payment_history_select_own" ON public.payment_history
      FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- SEED STANDARD PLANS
-- ------------------------------------------------------------------------------
INSERT INTO public.plans (id, name, price_inr, resume_limit, interview_limit_per_month, features)
VALUES 
  (
    'free',
    'Free Starter',
    0,
    1,
    2,
    '["1 ATS Resume Draft", "2 AI Mock Interviews / month", "Basic Community Networking", "View-Only Job Board", "Curiosity Quests & Growth Journal"]'::jsonb
  ),
  (
    'pro',
    'Career Pro',
    499,
    9999,
    9999,
    '["Unlimited ATS Resumes & PDF Exports", "Unlimited AI Mock Interviews with Deep STAR Diagnostics", "Apply to Verified Industry Jobs", "Direct 1:1 Mentor Messaging", "Priority Interview Scoring Pipeline"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price_inr = EXCLUDED.price_inr,
  resume_limit = EXCLUDED.resume_limit,
  interview_limit_per_month = EXCLUDED.interview_limit_per_month,
  features = EXCLUDED.features;

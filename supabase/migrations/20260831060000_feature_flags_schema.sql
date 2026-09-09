-- ==============================================================================
-- EDWORLD CO — FEATURE 13 MIGRATION: FEATURE FLAGS & MONITORING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags_select_all" ON public.feature_flags;
CREATE POLICY "feature_flags_select_all" ON public.feature_flags
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "feature_flags_admin_manage" ON public.feature_flags;
CREATE POLICY "feature_flags_admin_manage" ON public.feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Seed Initial Feature Flags
INSERT INTO public.feature_flags (key, description, enabled, rollout_percentage)
VALUES
  ('career_pro_monetization', 'Razorpay checkout and billing subscriptions for 18+ track', true, 100),
  ('voice_tts_interviews', 'Voice delivered text-to-speech mock interview questions', true, 100),
  ('fullscreen_integrity_mode', 'Auto-pause and neutral logging on interview fullscreen exit', true, 100),
  ('junior_study_groups', 'Moderated peer study groups for classroom students', true, 100),
  ('working_prof_appraisal_aid', 'Self-appraisal writing assistant for working professionals', true, 100)
ON CONFLICT (key) DO UPDATE SET enabled = EXCLUDED.enabled;

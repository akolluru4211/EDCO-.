-- ==============================================================================
-- Migration: 20260923000000_phase37_auth_onboarding_hardening.sql
-- Description: Hardening profiles for onboarding completion, canonical identity,
--              education & career fields, and strict RLS policies
-- ==============================================================================

-- 1. Ensure onboarding and profile fields exist on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS institution text,
  ADD COLUMN IF NOT EXISTS degree text,
  ADD COLUMN IF NOT EXISTS field_of_study text,
  ADD COLUMN IF NOT EXISTS graduation_year text,
  ADD COLUMN IF NOT EXISTS target_role text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS current_company text;

-- 2. Create indexes for quick session and profile lookup
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_target_role ON public.profiles(target_role);

-- 3. Ensure RLS is active on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Update / ensure user RLS policies for profiles
DROP POLICY IF EXISTS "Users can view public profiles or own profile" ON public.profiles;
CREATE POLICY "Users can view public profiles or own profile"
  ON public.profiles FOR SELECT
  USING (
    is_public = true 
    OR auth.uid() = user_id 
    OR auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
    OR auth.uid() IS NOT NULL
  );

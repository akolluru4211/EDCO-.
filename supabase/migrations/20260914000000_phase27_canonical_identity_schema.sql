-- ==============================================================================
-- Migration: 20260914000000_phase27_canonical_identity_schema.sql
-- Description: Enforce Canonical User Identity (profiles.display_name, first_name, last_name, user_id)
--              and strictly wire Row Level Security (RLS) policies to auth.uid()
-- ==============================================================================

-- 1. Ensure columns exist on profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS leetcode_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

-- 2. Populate display_name from existing name column if null
UPDATE public.profiles
SET display_name = name
WHERE display_name IS NULL AND name IS NOT NULL;

-- 3. Create index for fast user_id and username resolution
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- 4. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing overlapping policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view public profiles or own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 6. Recreate robust RLS policies for profiles
CREATE POLICY "Users can view public profiles or own profile"
  ON public.profiles FOR SELECT
  USING (
    is_public = true 
    OR auth.uid() = user_id 
    OR auth.uid()::text = id::text
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR auth.uid()::text = id::text
    OR auth.uid() IS NOT NULL
  );

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

-- 7. Ensure connected_accounts table references user_id with strict RLS
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  provider text NOT NULL,
  provider_account_id text,
  provider_username text,
  profile_url text,
  sync_status text DEFAULT 'active',
  synced_data jsonb DEFAULT '{}'::jsonb,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON public.connected_accounts(user_id);
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own connected accounts" ON public.connected_accounts;
CREATE POLICY "Users manage own connected accounts"
  ON public.connected_accounts FOR ALL
  USING (auth.uid()::text = user_id OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NOT NULL);

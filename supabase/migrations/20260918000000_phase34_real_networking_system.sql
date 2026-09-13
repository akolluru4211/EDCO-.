-- ==============================================================================
-- Migration: 20260918000000_phase34_real_networking_system.sql
-- Description: Phase 34 - Real EdWorld Networking for Students & Working Professionals
-- Tables: connections, user_blocks, user_reports, profiles enhancements + RLS
-- ==============================================================================

-- 1. Ensure Profile Networking & Visibility Columns Exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'EDWORLD_USERS_ONLY', 'PRIVATE', 'public', 'edworld_users_only', 'private')),
  ADD COLUMN IF NOT EXISTS college TEXT,
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS experience_years NUMERIC,
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS show_college BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_experience BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_skills BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_projects BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_github BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_linkedin BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_leetcode BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_in_network BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_location_visible BOOLEAN DEFAULT TRUE;

-- Indexes on profiles for fast networking search and filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_career_stage ON public.profiles(career_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_profiles_show_in_network ON public.profiles(show_in_network);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company);

-- 2. Real Connections Table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED', 'pending', 'accepted', 'declined', 'blocked')),
  request_type TEXT DEFAULT 'connection' CHECK (request_type IN ('connection', 'mentorship', 'study_group')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT connections_no_self_connect CHECK (requester_id <> receiver_id),
  CONSTRAINT connections_unique_pair UNIQUE (requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- 3. User Blocks Table
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_blocks_no_self_block CHECK (blocker_id <> blocked_id),
  CONSTRAINT user_blocks_unique_pair UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- 4. User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_reports_no_self_report CHECK (reporter_id <> reported_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- 6. Connections RLS Policies
DROP POLICY IF EXISTS "connections_view_participants" ON public.connections;
DROP POLICY IF EXISTS "connections_insert_requester" ON public.connections;
DROP POLICY IF EXISTS "connections_update_participants" ON public.connections;
DROP POLICY IF EXISTS "connections_delete_participants" ON public.connections;

CREATE POLICY "connections_view_participants" ON public.connections
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

CREATE POLICY "connections_insert_requester" ON public.connections
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND requester_id <> receiver_id
  );

CREATE POLICY "connections_update_participants" ON public.connections
  FOR UPDATE USING (
    auth.uid() = receiver_id OR auth.uid() = requester_id
  );

CREATE POLICY "connections_delete_participants" ON public.connections
  FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = receiver_id
  );

-- 7. User Blocks RLS Policies
DROP POLICY IF EXISTS "user_blocks_view_owner" ON public.user_blocks;
DROP POLICY IF EXISTS "user_blocks_insert_owner" ON public.user_blocks;
DROP POLICY IF EXISTS "user_blocks_delete_owner" ON public.user_blocks;

CREATE POLICY "user_blocks_view_owner" ON public.user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "user_blocks_insert_owner" ON public.user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id AND blocker_id <> blocked_id);

CREATE POLICY "user_blocks_delete_owner" ON public.user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- 8. User Reports RLS Policies
DROP POLICY IF EXISTS "user_reports_view_reporter" ON public.user_reports;
DROP POLICY IF EXISTS "user_reports_insert_reporter" ON public.user_reports;

CREATE POLICY "user_reports_view_reporter" ON public.user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "user_reports_insert_reporter" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND reporter_id <> reported_id);

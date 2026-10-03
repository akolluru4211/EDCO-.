-- ==============================================================================
-- Migration: 20261003000000_feature22_dashboard_and_birthdays.sql
-- Description: Feature 22 - Personalized Dashboard Layout, Connection Birthdays & Myra's Automated Wishes
-- Tables: birthday_wishes, birthday_system_wishes, profiles enhancements + RLS & Functions
-- ==============================================================================

-- 1. Add privacy toggle and dashboard layout preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_birthday_to_connections BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dashboard_layout_preference JSONB DEFAULT NULL;

-- 2. One-Way Birthday Wishes Table
CREATE TABLE IF NOT EXISTS public.birthday_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT birthday_wishes_unique_per_year UNIQUE (sender_id, recipient_id, year),
  CONSTRAINT birthday_wishes_no_self_wish CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_birthday_wishes_recipient ON public.birthday_wishes(recipient_id);
CREATE INDEX IF NOT EXISTS idx_birthday_wishes_sender ON public.birthday_wishes(sender_id);
CREATE INDEX IF NOT EXISTS idx_birthday_wishes_year ON public.birthday_wishes(year);

-- 3. System Automated Wishes Log (Myra AI)
CREATE TABLE IF NOT EXISTS public.birthday_system_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT birthday_system_wishes_unique UNIQUE (user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_birthday_system_wishes_user_year ON public.birthday_system_wishes(user_id, year);

-- 4. Enable RLS on birthday_wishes
ALTER TABLE public.birthday_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_system_wishes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Birthday Wishes (One-Way privacy: recipient reads theirs, sender reads theirs)
DROP POLICY IF EXISTS "birthday_wishes_read_participants" ON public.birthday_wishes;
DROP POLICY IF EXISTS "birthday_wishes_insert_sender" ON public.birthday_wishes;

CREATE POLICY "birthday_wishes_read_participants" ON public.birthday_wishes
  FOR SELECT USING (
    auth.uid() = recipient_id OR auth.uid() = sender_id
  );

CREATE POLICY "birthday_wishes_insert_sender" ON public.birthday_wishes
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

-- 6. Privacy-Safe Security Definer Function: Get Upcoming Connection Birthdays
-- Extracts ONLY month and day for opted-in accepted connections. Never exposes year or age!
CREATE OR REPLACE FUNCTION public.get_upcoming_connection_birthdays(requesting_user_id UUID)
RETURNS TABLE (
  connection_user_id UUID,
  name TEXT,
  month INT,
  day INT,
  is_today BOOLEAN,
  has_wished BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_m INT := EXTRACT(MONTH FROM NOW())::INT;
  current_d INT := EXTRACT(DAY FROM NOW())::INT;
  current_y INT := EXTRACT(YEAR FROM NOW())::INT;
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS connection_user_id,
    p.name,
    EXTRACT(MONTH FROM p.dob)::INT AS month,
    EXTRACT(DAY FROM p.dob)::INT AS day,
    (EXTRACT(MONTH FROM p.dob)::INT = current_m AND EXTRACT(DAY FROM p.dob)::INT = current_d) AS is_today,
    EXISTS (
      SELECT 1 FROM public.birthday_wishes bw 
      WHERE bw.sender_id = requesting_user_id 
        AND bw.recipient_id = p.id 
        AND bw.year = current_y
    ) AS has_wished
  FROM public.profiles p
  JOIN public.connections c ON (
    (c.requester_id = requesting_user_id AND (c.receiver_id = p.id OR c.recipient_id = p.id)) OR
    ((c.receiver_id = requesting_user_id OR c.recipient_id = requesting_user_id) AND c.requester_id = p.id)
  )
  WHERE LOWER(c.status) = 'accepted'
    AND p.show_birthday_to_connections = TRUE
    AND p.dob IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.user_blocks b
      WHERE (b.blocker_id = requesting_user_id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = requesting_user_id)
    );
END;
$$;

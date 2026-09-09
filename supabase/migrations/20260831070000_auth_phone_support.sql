-- ==============================================================================
-- EDWORLD CO — AUTH PHONE SUPPORT MIGRATION (NO OTP REQUIREMENT)
-- ==============================================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- ==============================================================================
-- EDWORLD CO — PHASE 36: INTERNAL WORKSPACES (FOUNDER, HR, EMPLOYEE)
-- Granular RBAC, Audit Trail, Strategic Goals, Roadmap, Recruitment & Performance
-- ==============================================================================

-- 1. INTERNAL AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.internal_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_audit_logs_actor ON public.internal_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_internal_audit_logs_action ON public.internal_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_internal_audit_logs_created ON public.internal_audit_logs(created_at DESC);

-- 2. COMPANY STRATEGIC GOALS & OKRS (FOUNDER / EXECUTIVE)
CREATE TABLE IF NOT EXISTS public.company_strategic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'AT_RISK', 'COMPLETED', 'CANCELLED')),
  budget NUMERIC DEFAULT 0,
  expected_outcome TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT ROADMAP ITEMS (FOUNDER / PRODUCT)
CREATE TABLE IF NOT EXISTS public.product_roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Core Platform',
  status TEXT NOT NULL DEFAULT 'In Development' CHECK (status IN ('Planning', 'In Development', 'Testing', 'Released', 'Blocked')),
  priority TEXT NOT NULL DEFAULT 'High' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  description TEXT,
  release_version TEXT,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HR JOB OPENINGS & REQUISITIONS (HR / RECRUITMENT)
CREATE TABLE IF NOT EXISTS public.hr_job_openings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote / Hybrid',
  employment_type TEXT NOT NULL DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
  experience_level TEXT NOT NULL DEFAULT 'Mid-Level',
  description TEXT,
  requirements TEXT[],
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'DRAFT', 'ON_HOLD', 'FILLED', 'CLOSED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPLOYEE ATTENDANCE RECORDS (EMPLOYEE / HR)
CREATE TABLE IF NOT EXISTS public.employee_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  work_mode TEXT NOT NULL DEFAULT 'REMOTE' CHECK (work_mode IN ('REMOTE', 'OFFICE', 'HYBRID')),
  hours_worked NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, work_date)
);

-- 6. EMPLOYEE PERFORMANCE REVIEWS (HR / MANAGER / EMPLOYEE)
CREATE TABLE IF NOT EXISTS public.employee_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_period TEXT NOT NULL,
  overall_rating NUMERIC CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  strengths TEXT,
  improvements TEXT,
  goals_summary TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'FINALIZED')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HR DOCUMENTS (HR / EMPLOYEE)
CREATE TABLE IF NOT EXISTS public.hr_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Policy' CHECK (category IN ('Offer Letter', 'Policy', 'Handbook', 'Contract', 'Tax', 'Performance', 'Other')),
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT 'application/pdf',
  uploaded_by UUID REFERENCES auth.users(id),
  access_role TEXT NOT NULL DEFAULT 'EMPLOYEE' CHECK (access_role IN ('ALL', 'EMPLOYEE', 'HR', 'FOUNDER')),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMPANY ANNOUNCEMENTS (INTERNAL)
CREATE TABLE IF NOT EXISTS public.company_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('URGENT', 'HIGH', 'NORMAL', 'LOW')),
  target_audience TEXT NOT NULL DEFAULT 'ALL' CHECK (target_audience IN ('ALL', 'ENGINEERING', 'PRODUCT', 'HR', 'LEADERSHIP')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.internal_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_announcements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internal_audit_logs' AND policyname = 'audit_read_founder_admin') THEN
    CREATE POLICY "audit_read_founder_admin" ON public.internal_audit_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND (u.is_admin = TRUE OR u.is_founder = TRUE OR u.is_hr = TRUE)
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internal_audit_logs' AND policyname = 'audit_insert_authenticated') THEN
    CREATE POLICY "audit_insert_authenticated" ON public.internal_audit_logs
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

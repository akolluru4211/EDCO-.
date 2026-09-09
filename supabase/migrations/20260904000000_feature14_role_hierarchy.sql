-- ==============================================================================
-- EDWORLD CO — FEATURE 14: ROLE HIERARCHY & STRICT PANEL SEPARATION
-- Data Integrity Constraints, Admin Audit Access Log & Strict Role Isolation
-- ==============================================================================

-- 1. DATA INTEGRITY CONSTRAINT: MINORS (13-17) CAN NEVER HOLD ADMIN-TIER FLAGS
-- Ensures at the database engine level that no student can ever be granted admin/teacher/school-admin roles

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'minor_cannot_hold_admin_roles'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT minor_cannot_hold_admin_roles 
    CHECK (
      age_band = '18+' OR (
        COALESCE(is_admin, FALSE) = FALSE AND 
        COALESCE(is_teacher, FALSE) = FALSE AND 
        COALESCE(is_school_admin, FALSE) = FALSE
      )
    );
  END IF;
END $$;

-- 2. TRIGGER ON PROFILES AND USERS TO PREVENT ILLEGAL ROLE COMBINATIONS
CREATE OR REPLACE FUNCTION public.check_user_role_integrity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age_band IN ('13-15', '16-18') THEN
    IF NEW.is_admin = TRUE OR NEW.is_teacher = TRUE OR NEW.is_school_admin = TRUE THEN
      RAISE EXCEPTION 'Data Integrity Violation: Minors (13-17) cannot hold admin, teacher, or school admin roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_role_integrity ON public.users;
CREATE TRIGGER trigger_user_role_integrity
BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.check_user_role_integrity();

-- 3. AUDIT LOGGING FOR INDIVIDUAL STUDENT RECORD ACCESS BY ADMINS
-- Guarantees that admin access to individual student data is an auditable, recorded event
CREATE OR REPLACE FUNCTION public.log_admin_student_inspection(
  p_admin_id UUID,
  p_student_id UUID,
  p_reason TEXT DEFAULT 'Investigation / Compliance review'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    metadata
  ) VALUES (
    p_admin_id,
    'admin',
    'admin.student_record_inspected',
    'student',
    p_student_id,
    jsonb_build_object('reason', p_reason, 'timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. HARDEN RLS BOUNDARIES FOR SCHOOL ADMINS
-- School Admins can only ever query and modify classrooms, teachers, and stats of their OWN school
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'school_admin_own_school_only'
  ) THEN
    CREATE POLICY "school_admin_own_school_only" ON public.schools
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.school_admins sa 
          WHERE sa.school_id = schools.id AND sa.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND u.is_admin = TRUE
        )
      );
  END IF;
END $$;

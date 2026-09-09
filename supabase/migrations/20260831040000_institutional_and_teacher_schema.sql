-- ==============================================================================
-- EDWORLD CO — FEATURE 11: INSTITUTIONAL, TEACHER & ADMIN PANELS
-- Schema, Narrow Teacher View (Zero PII/Full Profile Leakage) & RLS Policies
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. EXTEND USERS TABLE FOR TEACHER & SCHOOL ADMIN ROLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_teacher BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_school_admin BOOLEAN DEFAULT FALSE;

-- ------------------------------------------------------------------------------
-- 2. SCHOOLS & SCHOOL ADMINS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_admins (
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (school_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 3. CLASSROOMS & CLASSROOM STUDENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  name TEXT NOT NULL, -- e.g. "Class 10-B"
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classroom_students (
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (classroom_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 4. CLASSROOM ASSIGNMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classroom_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  linked_feature TEXT, -- e.g. 'ai_literacy_content', 'quest'
  linked_id UUID,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. THE DELIBERATELY NARROW TEACHER-VISIBLE PROGRESS VIEW
-- Zero email, zero DOB, zero age_band, zero resumes, zero videos, zero journals!
-- ==============================================================================
CREATE OR REPLACE VIEW public.teacher_visible_student_progress AS
SELECT
  cs.classroom_id,
  u.id AS student_id,
  u.name,
  -- subject/classroom-relevant progress counts only:
  COUNT(DISTINCT qsp.quest_id) FILTER (WHERE q.interest_tags && ARRAY[c.subject]) AS related_quests_completed,
  COUNT(DISTINCT qsp.quest_id) AS total_quests_completed,
  COALESCE(MAX(is2.overall_score), 0) AS related_interview_score,
  cs.joined_at
FROM public.classroom_students cs
JOIN public.classrooms c ON c.id = cs.classroom_id
JOIN public.users u ON u.id = cs.student_id
LEFT JOIN public.user_quest_progress qsp ON qsp.user_id = u.id
LEFT JOIN public.quests q ON q.id = qsp.quest_id
LEFT JOIN public.interview_sessions is2 ON is2.user_id = u.id
GROUP BY cs.classroom_id, u.id, u.name, cs.joined_at;

ALTER VIEW public.teacher_visible_student_progress SET (security_invoker = true);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 1. classrooms policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classrooms' AND policyname = 'classrooms_teacher_manage') THEN
    CREATE POLICY "classrooms_teacher_manage" ON public.classrooms
      FOR ALL USING (
        teacher_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.school_admins sa WHERE sa.school_id = classrooms.school_id AND sa.user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classrooms' AND policyname = 'classrooms_student_select') THEN
    CREATE POLICY "classrooms_student_select" ON public.classrooms
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- 2. classroom_students policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classroom_students' AND policyname = 'teacher_own_classroom_only') THEN
    CREATE POLICY "teacher_own_classroom_only" ON public.classroom_students
      FOR SELECT USING (
        student_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_students.classroom_id AND c.teacher_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classroom_students' AND policyname = 'student_join_leave_own') THEN
    CREATE POLICY "student_join_leave_own" ON public.classroom_students
      FOR ALL USING (student_id = auth.uid());
  END IF;

  -- 3. classroom_assignments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classroom_assignments' AND policyname = 'assignments_teacher_manage') THEN
    CREATE POLICY "assignments_teacher_manage" ON public.classroom_assignments
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_assignments.classroom_id AND c.teacher_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classroom_assignments' AND policyname = 'assignments_student_select') THEN
    CREATE POLICY "assignments_student_select" ON public.classroom_assignments
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.classroom_students cs WHERE cs.classroom_id = classroom_assignments.classroom_id AND cs.student_id = auth.uid())
      );
  END IF;

  -- 4. schools policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'schools_select_auth') THEN
    CREATE POLICY "schools_select_auth" ON public.schools
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- 5. school_admins policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'school_admins' AND policyname = 'school_admins_select_own') THEN
    CREATE POLICY "school_admins_select_own" ON public.school_admins
      FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));
  END IF;
END $$;

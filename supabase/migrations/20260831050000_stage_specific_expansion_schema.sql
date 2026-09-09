-- ==============================================================================
-- EDWORLD CO — FEATURE 12 MIGRATION: STAGE-SPECIFIC FEATURE EXPANSION
-- (Junior 13-15 -> Explorer 16-18 -> College 18+ -> Working Professional 18+)
-- ==============================================================================

-- 0. Split Career Track into College / Working Professional
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS career_stage text CHECK (career_stage IN ('college', 'working_professional'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career_stage text CHECK (career_stage IN ('college', 'working_professional'));

-- Add is_explorer_appropriate to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_explorer_appropriate boolean DEFAULT false;

-- Add quest_type to quests table
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS quest_type text DEFAULT 'general' CHECK (quest_type IN ('general', 'coding_literacy'));

-- -----------------------------------------------------------------------------
-- 1. JUNIOR TRACK (13-15) ADDITIONS
-- -----------------------------------------------------------------------------

-- 1.2 Moderated Peer Study Groups (scoped strictly to classroom_students of same classroom)
CREATE TABLE IF NOT EXISTS public.study_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_group_messages_classroom_members" ON public.study_group_messages;
CREATE POLICY "study_group_messages_classroom_members" ON public.study_group_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_students
      WHERE classroom_students.classroom_id = study_group_messages.classroom_id
        AND classroom_students.student_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE classrooms.id = study_group_messages.classroom_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- 1.3 Guardian Progress Digest Subscriptions
CREATE TABLE IF NOT EXISTS public.guardian_digest_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guardian_email text NOT NULL,
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'monthly')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guardian_digest_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guardian_digest_student_manage" ON public.guardian_digest_subscriptions;
CREATE POLICY "guardian_digest_student_manage" ON public.guardian_digest_subscriptions
  FOR ALL
  USING (student_id = auth.uid());

-- 1.4 Hobby / Extracurricular Tracker (Low-pressure personal record)
CREATE TABLE IF NOT EXISTS public.extracurricular_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.extracurricular_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "extracurricular_student_manage" ON public.extracurricular_entries;
CREATE POLICY "extracurricular_student_manage" ON public.extracurricular_entries
  FOR ALL
  USING (student_id = auth.uid());

-- 1.5 Financial Literacy Content (Conceptual, educational only, no product/financial advice)
CREATE TABLE IF NOT EXISTS public.financial_literacy_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  concept_category text NOT NULL,
  body text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_literacy_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_literacy_select_all" ON public.financial_literacy_content;
CREATE POLICY "financial_literacy_select_all" ON public.financial_literacy_content
  FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 2. EXPLORER TRACK (16-18) ADDITIONS
-- -----------------------------------------------------------------------------

-- 2.1 Entrance Exam Tracker
CREATE TABLE IF NOT EXISTS public.exam_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  target_date date,
  syllabus_progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_tracking_student_manage" ON public.exam_tracking;
CREATE POLICY "exam_tracking_student_manage" ON public.exam_tracking
  FOR ALL
  USING (student_id = auth.uid());

-- 2.2 College Comparison Reference Data
CREATE TABLE IF NOT EXISTS public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  courses text[] NOT NULL DEFAULT '{}',
  fee_range text NOT NULL,
  typical_cutoff_range text NOT NULL,
  source_url text NOT NULL,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  needs_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "colleges_select_all" ON public.colleges;
CREATE POLICY "colleges_select_all" ON public.colleges
  FOR SELECT
  USING (true);

-- 2.4 Moderated Senior / Alumni Connection
CREATE TABLE IF NOT EXISTS public.alumni_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alumni_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'rejected')),
  inquiry_topic text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alumni_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alumni_connections_parties" ON public.alumni_connections;
CREATE POLICY "alumni_connections_parties" ON public.alumni_connections
  FOR ALL
  USING (student_id = auth.uid() OR alumni_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. COLLEGE SUB-STAGE (18+ & career_stage = 'college') ADDITIONS
-- -----------------------------------------------------------------------------

-- 3.1 Campus Placement Tracker
CREATE TABLE IF NOT EXISTS public.placement_drives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name text NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  drive_date date NOT NULL,
  rounds jsonb NOT NULL DEFAULT '[]'::jsonb,
  eligibility_criteria text,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "placement_drives_select_all" ON public.placement_drives;
CREATE POLICY "placement_drives_select_all" ON public.placement_drives
  FOR SELECT
  USING (true);

-- 3.3 Group Project / Hackathon Finder
CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  registration_url text NOT NULL,
  team_size_range text NOT NULL,
  skills_focus text[] NOT NULL DEFAULT '{}',
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  needs_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hackathons_select_all" ON public.hackathons;
CREATE POLICY "hackathons_select_all" ON public.hackathons
  FOR SELECT
  USING (true);

-- 3.4 Peer Resume Review
CREATE TABLE IF NOT EXISTS public.resume_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_review', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_reviews_scoped_parties" ON public.resume_reviews;
CREATE POLICY "resume_reviews_scoped_parties" ON public.resume_reviews
  FOR ALL
  USING (requester_id = auth.uid() OR reviewer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. WORKING PROFESSIONAL SUB-STAGE (18+ & career_stage = 'working_professional') ADDITIONS
-- -----------------------------------------------------------------------------

-- 4.3 Referral Request Tool
CREATE TABLE IF NOT EXISTS public.referral_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company text NOT NULL,
  job_link text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_requests_parties" ON public.referral_requests;
CREATE POLICY "referral_requests_parties" ON public.referral_requests
  FOR ALL
  USING (requester_id = auth.uid() OR connection_id = auth.uid());

-- 4.4 Reference Salary Data (Clearly aggregated, factual reference, not financial advice)
CREATE TABLE IF NOT EXISTS public.salary_reference_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  city text NOT NULL,
  experience_bracket text NOT NULL,
  p25_inr integer NOT NULL,
  p50_median_inr integer NOT NULL,
  p75_inr integer NOT NULL,
  data_source text NOT NULL,
  disclaimer text NOT NULL DEFAULT 'Aggregated reference data only. Not compensation or negotiation advice.',
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.salary_reference_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salary_reference_select_all" ON public.salary_reference_data;
CREATE POLICY "salary_reference_select_all" ON public.salary_reference_data
  FOR SELECT
  USING (true);

-- 4.6 Ongoing Certification / Learning Tracker (Self-reported)
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuing_org text NOT NULL,
  date_earned date NOT NULL,
  credential_url text,
  is_self_reported boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certifications_user_manage" ON public.certifications;
CREATE POLICY "certifications_user_manage" ON public.certifications
  FOR ALL
  USING (user_id = auth.uid());

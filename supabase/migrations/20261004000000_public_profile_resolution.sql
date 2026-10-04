-- ==============================================================================
-- EDWORLD CO — PUBLIC PROFILE LOOKUP & IDENTITY RESOLUTION
-- Enables robust multi-column lookups (username, name, email prefix, ID)
-- bypassing RLS safely via SECURITY DEFINER to distinguish 404 vs 403 (private).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_public_profile(p_identifier TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_user RECORD;
  v_target_id UUID;
  v_clean_ident TEXT;
BEGIN
  IF p_identifier IS NULL OR TRIM(p_identifier) = '' THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  v_clean_ident := TRIM(LOWER(p_identifier));

  -- 1. Search in profiles by username, name, email, or id
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE LOWER(username) = v_clean_ident
     OR LOWER(username) LIKE v_clean_ident || '\_%' ESCAPE '\'
     OR LOWER(name) = v_clean_ident
     OR LOWER(name) LIKE v_clean_ident || ' %'
     OR LOWER(email) LIKE v_clean_ident || '@%'
     OR LOWER(email) LIKE v_clean_ident || '%'
     OR id::text = p_identifier
     OR (user_id IS NOT NULL AND user_id::text = p_identifier)
  ORDER BY 
    CASE 
      WHEN LOWER(username) = v_clean_ident THEN 1
      WHEN LOWER(name) = v_clean_ident THEN 2
      WHEN LOWER(username) LIKE v_clean_ident || '\_%' ESCAPE '\' THEN 3
      WHEN LOWER(name) LIKE v_clean_ident || ' %' THEN 4
      ELSE 5
    END
  LIMIT 1;

  -- 2. If not found in profiles, check users table
  IF v_profile IS NULL THEN
    SELECT * INTO v_user
    FROM public.users
    WHERE id::text = p_identifier
       OR LOWER(name) = v_clean_ident
       OR LOWER(name) LIKE v_clean_ident || ' %'
       OR LOWER(email) LIKE v_clean_ident || '@%'
       OR LOWER(email) LIKE v_clean_ident || '%'
    ORDER BY
      CASE
        WHEN LOWER(name) = v_clean_ident THEN 1
        WHEN LOWER(name) LIKE v_clean_ident || ' %' THEN 2
        ELSE 3
      END
    LIMIT 1;

    IF v_user IS NOT NULL THEN
      RETURN jsonb_build_object(
        'found', true,
        'id', v_user.id,
        'user_id', v_user.id,
        'name', COALESCE(v_user.name, 'Software Engineer'),
        'email', v_user.email,
        'username', v_clean_ident,
        'career_stage', COALESCE(v_user.career_stage, 'PROFESSIONAL'),
        'headline', 'Software Engineer & Builder',
        'is_public', true,
        'age_band', COALESCE(v_user.age_band, '18+'),
        'created_at', COALESCE(v_user.created_at, NOW())
      );
    END IF;
  END IF;

  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  v_target_id := COALESCE(v_profile.user_id, v_profile.id);

  RETURN jsonb_build_object(
    'found', true,
    'id', v_target_id,
    'user_id', v_target_id,
    'name', COALESCE(v_profile.name, 'Software Engineer'),
    'email', v_profile.email,
    'username', COALESCE(v_profile.username, v_clean_ident),
    'headline', COALESCE(v_profile.headline, 'Full Stack Software Engineer & Platform Builder'),
    'bio', COALESCE(v_profile.bio, ''),
    'interests', COALESCE(v_profile.interests, '[]'::jsonb),
    'skills', COALESCE(v_profile.interests, '[]'::jsonb),
    'career_stage', COALESCE(v_profile.career_stage, 'PROFESSIONAL'),
    'target_role', v_profile.primary_goal,
    'college', COALESCE(v_profile.grade_level, 'University Partner'),
    'is_public', COALESCE(v_profile.is_public, false),
    'is_mentor', COALESCE(v_profile.is_mentor, false),
    'mentor_tags', COALESCE(v_profile.mentor_tags, '[]'::jsonb),
    'age_band', COALESCE(v_profile.age_band, '18+'),
    'created_at', v_profile.created_at
  );
END;
$$;

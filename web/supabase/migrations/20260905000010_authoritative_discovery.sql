-- Drop conflicting overloaded versions
DROP FUNCTION IF EXISTS public.get_discovery_candidates(integer, integer);
DROP FUNCTION IF EXISTS public.get_discovery_candidates(integer, integer, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_discovery_candidates(integer, integer, jsonb);

-- Authoritative, Secure Matrimonial Discovery RPC
CREATE OR REPLACE FUNCTION public.get_discovery_candidates(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_filters jsonb DEFAULT '{}'::jsonb
) RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_my_uid uuid;
    v_my_gender text;
    v_my_intent text;
    v_my_readiness boolean;
    v_must_have jsonb;
    v_deal_breaker jsonb;
    v_preferred jsonb;
    v_gender_filter text;
    v_min_age integer;
    v_max_age integer;
BEGIN
  v_my_uid := auth.uid();
  IF v_my_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- Verify user readiness
  SELECT gender, intent, onboarding_completed 
  INTO v_my_gender, v_my_intent, v_my_readiness 
  FROM public.profiles 
  WHERE id = v_my_uid;

  -- Strict Marriage Mode Rule: User must have 100% completed profile
  IF v_my_intent = 'Marriage' AND (v_my_readiness IS NOT TRUE) THEN
    RAISE EXCEPTION 'Discovery in Marriage mode requires 100%% profile completion.';
  END IF;

  -- Enforce Safe Limits
  IF p_limit > 50 THEN
    p_limit := 50;
  END IF;
  IF p_offset > 500 THEN
    RAISE EXCEPTION 'Pagination limit reached.';
  END IF;

  v_must_have := COALESCE(p_filters->'must_have', '{}'::jsonb);
  v_deal_breaker := COALESCE(p_filters->'deal_breaker', '{}'::jsonb);
  v_preferred := COALESCE(p_filters->'preferred', '{}'::jsonb);

  -- Target gender: default to opposite gender
  v_gender_filter := p_filters->>'gender';
  IF v_gender_filter IS NULL THEN
    IF v_my_gender = 'Male' THEN
      v_gender_filter := 'Female';
    ELSIF v_my_gender = 'Female' THEN
      v_gender_filter := 'Male';
    END IF;
  END IF;

  v_min_age := COALESCE((v_must_have->>'min_age')::integer, (p_filters->>'min_age')::integer, 18);
  v_max_age := COALESCE((v_must_have->>'max_age')::integer, (p_filters->>'max_age')::integer, 100);

  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.date_of_birth,
    p.gender,
    p.location,
    p.bio,
    p.education,
    p.profession,
    p.birth_location,
    p.onboarding_completed,
    p.regional_preference,
    p.created_at,
    p.updated_at,
    p.intent,
    p.height,
    p.blood_group,
    p.mother_tongue,
    p.religion,
    p.caste,
    p.sub_caste,
    p.gotra,
    p.education_10th,
    p.education_12th,
    p.higher_education,
    p.employer,
    -- Highly Sensitive Fields Sanitized for Unmatched Discovery
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.annual_income 
      ELSE NULL::text 
    END as annual_income,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.health_info 
      ELSE NULL::text 
    END as health_info,
    p.health_privacy,
    p.diet,
    p.alcohol,
    p.smoking,
    p.marital_status,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.previous_marriage 
      ELSE NULL::text 
    END as previous_marriage,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.children_status 
      ELSE NULL::text 
    END as children_status,
    p.photo_privacy,
    p.voice_note_url,
    p.voice_note_prompt,
    p.marriage_questionnaire,
    p.looking_for,
    p.nakshatra,
    p.rashi,
    p.nadi,
    p.manglik,
    p.family_background,
    p.never_married,
    p.lifestyle_info,
    p.nakshatra_pada,
    p.chemistry_answers,
    p.region,
    p.state,
    p.city_district,
    p.spiritual_practices,
    p.degree_course,
    p.institution,
    p.work_location,
    -- Sanitized health status
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.health_status 
      ELSE 'Disclosed after match'::text 
    END as health_status,
    NULL::text as pre_existing_conditions,
    NULL::text as health_disclosures,
    p.food_preferences,
    p.alcohol_frequency,
    p.smoking_frequency,
    p.other_habits,
    p.divorced,
    p.widowed,
    p.separated,
    p.annulled,
    NULL::text as previous_marriage_details,
    p.children,
    NULL::text as parenting_details,
    p.numerology_inputs,
    p.nadi_inputs,
    p.partner_preferences_tiers
  FROM public.profiles p
  WHERE p.id != v_my_uid
    AND p.onboarding_completed = true
    AND (v_my_intent IS NULL OR p.intent = v_my_intent)
    -- Exclude candidates user already liked/passed
    AND NOT EXISTS (
      SELECT 1 FROM public.interactions i 
      WHERE i.actor_id = v_my_uid AND i.target_id = p.id
    )
    -- Gender filter
    AND (v_gender_filter IS NULL OR p.gender = v_gender_filter)
    -- Age Range
    AND (
      p.date_of_birth IS NULL OR (
        EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) >= v_min_age
        AND EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) <= v_max_age
      )
    )
    -- MUST HAVE filters (Strict Inclusion)
    AND (v_must_have->>'religion' IS NULL OR p.religion ILIKE '%' || (v_must_have->>'religion') || '%')
    AND (v_must_have->>'caste' IS NULL OR p.caste ILIKE '%' || (v_must_have->>'caste') || '%')
    AND (v_must_have->>'sub_caste' IS NULL OR p.sub_caste ILIKE '%' || (v_must_have->>'sub_caste') || '%')
    AND (v_must_have->>'region' IS NULL OR p.region ILIKE '%' || (v_must_have->>'region') || '%')
    AND (v_must_have->>'diet' IS NULL OR p.diet ILIKE '%' || (v_must_have->>'diet') || '%')
    AND (v_must_have->>'marital_status' IS NULL OR p.marital_status ILIKE '%' || (v_must_have->>'marital_status') || '%')
    AND (v_must_have->>'higher_education' IS NULL OR p.higher_education ILIKE '%' || (v_must_have->>'higher_education') || '%')
    -- DEAL BREAKER filters (Strict Exclusion)
    AND (v_deal_breaker->>'religion' IS NULL OR p.religion NOT ILIKE '%' || (v_deal_breaker->>'religion') || '%')
    AND (v_deal_breaker->>'caste' IS NULL OR p.caste NOT ILIKE '%' || (v_deal_breaker->>'caste') || '%')
    AND (v_deal_breaker->>'diet' IS NULL OR p.diet NOT ILIKE '%' || (v_deal_breaker->>'diet') || '%')
    AND (v_deal_breaker->>'marital_status' IS NULL OR p.marital_status NOT ILIKE '%' || (v_deal_breaker->>'marital_status') || '%')
  ORDER BY 
    -- PREFERRED rank boost
    (
      CASE WHEN v_preferred->>'religion' IS NOT NULL AND p.religion ILIKE '%' || (v_preferred->>'religion') || '%' THEN 3 ELSE 0 END +
      CASE WHEN v_preferred->>'caste' IS NOT NULL AND p.caste ILIKE '%' || (v_preferred->>'caste') || '%' THEN 2 ELSE 0 END +
      CASE WHEN v_preferred->>'diet' IS NOT NULL AND p.diet ILIKE '%' || (v_preferred->>'diet') || '%' THEN 2 ELSE 0 END +
      CASE WHEN v_preferred->>'region' IS NOT NULL AND p.region ILIKE '%' || (v_preferred->>'region') || '%' THEN 1 ELSE 0 END
    ) DESC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

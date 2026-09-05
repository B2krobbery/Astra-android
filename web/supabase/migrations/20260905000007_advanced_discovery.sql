-- 1. UPDATE DISCOVERY RPC
CREATE OR REPLACE FUNCTION public.get_discovery_candidates(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_filters jsonb DEFAULT '{}'::jsonb
) RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_gender text;
    v_min_age integer;
    v_max_age integer;
    v_religion text;
    v_caste text;
    v_sub_caste text;
    v_region text;
    v_state text;
    v_education text;
    v_profession text;
    v_marital_status text;
    v_diet text;
BEGIN
  -- 1. HARD SECURITY LIMITS
  IF p_limit > 50 THEN
    p_limit := 50;
  END IF;

  IF p_offset > 500 THEN
    RAISE EXCEPTION 'Pagination limit exceeded. Refine your search criteria.';
  END IF;

  -- 2. EXTRACT FILTERS
  v_gender := p_filters->>'gender';
  v_min_age := COALESCE((p_filters->>'min_age')::integer, 18);
  v_max_age := COALESCE((p_filters->>'max_age')::integer, 100);
  v_religion := p_filters->>'religion';
  v_caste := p_filters->>'caste';
  v_sub_caste := p_filters->>'sub_caste';
  v_region := p_filters->>'region';
  v_state := p_filters->>'state';
  v_education := p_filters->>'education';
  v_profession := p_filters->>'profession';
  v_marital_status := p_filters->>'marital_status';
  v_diet := p_filters->>'diet';

  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  LEFT JOIN public.interactions i 
    ON p.id = i.target_id 
    AND i.actor_id = auth.uid()
  WHERE p.id != auth.uid()
    AND p.onboarding_completed = true
    AND i.id IS NULL -- Exclude profiles the user has already interacted with
    AND (v_gender IS NULL OR p.gender = v_gender)
    AND (
      EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) >= v_min_age
      AND EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) <= v_max_age
    )
    AND (v_religion IS NULL OR p.religion ILIKE '%' || v_religion || '%')
    AND (v_caste IS NULL OR p.caste ILIKE '%' || v_caste || '%')
    AND (v_sub_caste IS NULL OR p.sub_caste ILIKE '%' || v_sub_caste || '%')
    AND (v_region IS NULL OR p.region ILIKE '%' || v_region || '%')
    AND (v_state IS NULL OR p.state ILIKE '%' || v_state || '%')
    AND (v_education IS NULL OR p.higher_education ILIKE '%' || v_education || '%')
    AND (v_profession IS NULL OR p.profession ILIKE '%' || v_profession || '%')
    AND (v_marital_status IS NULL OR p.marital_status ILIKE '%' || v_marital_status || '%')
    AND (v_diet IS NULL OR p.diet ILIKE '%' || v_diet || '%')
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

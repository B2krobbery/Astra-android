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
    v_must_have jsonb;
    v_deal_breaker jsonb;
    v_min_age integer;
    v_max_age integer;
    v_gender text;
BEGIN
  -- 1. HARD SECURITY LIMITS
  IF p_limit > 50 THEN
    p_limit := 50;
  END IF;
  IF p_offset > 500 THEN
    RAISE EXCEPTION 'Pagination limit exceeded.';
  END IF;

  v_must_have := COALESCE(p_filters->'must_have', '{}'::jsonb);
  v_deal_breaker := COALESCE(p_filters->'deal_breaker', '{}'::jsonb);
  
  v_gender := p_filters->>'gender';
  v_min_age := COALESCE((p_filters->>'min_age')::integer, 18);
  v_max_age := COALESCE((p_filters->>'max_age')::integer, 100);

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
    -- MUST HAVES (Inclusive)
    AND (v_must_have->>'religion' IS NULL OR p.religion ILIKE '%' || (v_must_have->>'religion') || '%')
    AND (v_must_have->>'caste' IS NULL OR p.caste ILIKE '%' || (v_must_have->>'caste') || '%')
    AND (v_must_have->>'education' IS NULL OR p.higher_education ILIKE '%' || (v_must_have->>'education') || '%')
    AND (v_must_have->>'diet' IS NULL OR p.diet ILIKE '%' || (v_must_have->>'diet') || '%')
    AND (v_must_have->>'marital_status' IS NULL OR p.marital_status ILIKE '%' || (v_must_have->>'marital_status') || '%')
    
    -- DEAL BREAKERS (Exclusive)
    AND (v_deal_breaker->>'religion' IS NULL OR p.religion NOT ILIKE '%' || (v_deal_breaker->>'religion') || '%')
    AND (v_deal_breaker->>'caste' IS NULL OR p.caste NOT ILIKE '%' || (v_deal_breaker->>'caste') || '%')
    AND (v_deal_breaker->>'education' IS NULL OR p.higher_education NOT ILIKE '%' || (v_deal_breaker->>'education') || '%')
    AND (v_deal_breaker->>'diet' IS NULL OR p.diet NOT ILIKE '%' || (v_deal_breaker->>'diet') || '%')
    AND (v_deal_breaker->>'marital_status' IS NULL OR p.marital_status NOT ILIKE '%' || (v_deal_breaker->>'marital_status') || '%')
    
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

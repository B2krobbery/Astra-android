CREATE OR REPLACE FUNCTION public.get_discovery_candidates(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_gender text DEFAULT NULL,
  p_min_age integer DEFAULT 18,
  p_max_age integer DEFAULT 100
) RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. HARD SECURITY LIMITS
  IF p_limit > 50 THEN
    p_limit := 50;
  END IF;

  IF p_offset > 500 THEN
    RAISE EXCEPTION 'Pagination limit exceeded. Refine your search criteria.';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  LEFT JOIN public.interactions i 
    ON p.id = i.target_id 
    AND i.actor_id = auth.uid()
  WHERE p.id != auth.uid()
    AND p.onboarding_completed = true
    AND i.id IS NULL -- Exclude profiles the user has already interacted with
    AND (p_gender IS NULL OR p.gender = p_gender)
    -- Calculate age dynamically for filtering
    AND (
      EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) >= p_min_age
      AND EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) <= p_max_age
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

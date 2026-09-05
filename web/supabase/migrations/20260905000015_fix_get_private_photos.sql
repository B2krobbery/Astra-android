-- 20260905000015_fix_get_private_photos.sql
-- Fix get_private_photos to query real columns of public.profile_photos (no is_public column)
CREATE OR REPLACE FUNCTION public.get_private_photos(p_target_id uuid)
RETURNS SETOF public.profile_photos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_my_uid uuid := auth.uid();
  v_privacy text;
  v_is_matched boolean;
  v_has_access boolean;
BEGIN
  IF v_my_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  -- 1. If viewing own photos, return all
  IF v_my_uid = p_target_id THEN
    RETURN QUERY SELECT * FROM public.profile_photos WHERE user_id = p_target_id;
    RETURN;
  END IF;

  -- 2. Fetch target user's photo privacy setting
  SELECT photo_privacy INTO v_privacy FROM public.profiles WHERE id = p_target_id;

  -- 3. If public (or null), return all photos
  IF v_privacy IS NULL OR v_privacy = 'public' THEN
    RETURN QUERY SELECT * FROM public.profile_photos WHERE user_id = p_target_id;
    RETURN;
  END IF;

  -- 4. If private, check if matched
  SELECT EXISTS (
    SELECT 1 FROM public.matches 
    WHERE (user1_id = v_my_uid AND user2_id = p_target_id)
       OR (user2_id = v_my_uid AND user1_id = p_target_id)
  ) INTO v_is_matched;

  IF v_is_matched THEN
    RETURN QUERY SELECT * FROM public.profile_photos WHERE user_id = p_target_id;
    RETURN;
  END IF;

  -- 5. Check if photo request was accepted
  SELECT EXISTS (
    SELECT 1 FROM public.photo_requests 
    WHERE requester_id = v_my_uid AND target_id = p_target_id AND status = 'ACCEPTED'
  ) INTO v_has_access;

  IF v_has_access THEN
    RETURN QUERY SELECT * FROM public.profile_photos WHERE user_id = p_target_id;
    RETURN;
  END IF;

  -- If private and no access, return empty set
  RETURN;
END;
$$;

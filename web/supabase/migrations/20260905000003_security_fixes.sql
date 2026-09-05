-- FIX 1: PROFILE_PHOTOS RLS
DROP POLICY IF EXISTS "Photos are viewable by everyone" ON public.profile_photos;

CREATE POLICY "Photos are viewable based on privacy and matches"
ON public.profile_photos
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = profile_photos.user_id AND (photo_privacy = 'public' OR photo_privacy IS NULL)
  )
  OR EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = auth.uid() AND user2_id = profile_photos.user_id)
       OR (user2_id = auth.uid() AND user1_id = profile_photos.user_id)
  )
);

-- FIX 2: DISCOVERY ENUMERATION (Add pagination limits)
DROP FUNCTION IF EXISTS public.get_discovery_candidates();
CREATE OR REPLACE FUNCTION public.get_discovery_candidates(p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid;
  my_intent text;
  my_gender text;
  my_prefs record;
BEGIN
  my_uid := auth.uid();
  
  SELECT intent, gender INTO my_intent, my_gender FROM public.profiles WHERE id = my_uid;
  SELECT * INTO my_prefs FROM public.preferences WHERE user_id = my_uid;
  
  RETURN QUERY
  SELECT 
    p.id, p.display_name, p.date_of_birth, p.gender, p.location, p.bio, p.education, p.profession, 
    p.birth_location, p.onboarding_completed, p.regional_preference, p.created_at, p.updated_at, 
    p.intent, p.height, p.blood_group, p.mother_tongue, p.religion, p.caste, p.sub_caste, p.gotra, 
    p.education_10th, p.education_12th, p.higher_education, p.employer, 
    NULL::text as annual_income, 
    NULL::text as health_info, 
    NULL::text as health_privacy, 
    p.diet, p.alcohol, p.smoking, p.marital_status, p.previous_marriage, p.children_status, 
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for,
    p.nakshatra, p.rashi, p.nadi, p.manglik
  FROM public.profiles p
  WHERE p.onboarding_completed = true
  AND p.id != my_uid
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i WHERE i.actor_id = my_uid AND i.target_id = p.id
  )
  AND (my_intent IS NULL OR p.intent = my_intent)
  AND (
    my_prefs IS NULL 
    OR my_prefs.gender_preference IS NULL 
    OR my_prefs.gender_preference = 'Everyone' 
    OR p.gender = my_prefs.gender_preference
  )
  AND (
    my_prefs IS NULL 
    OR my_prefs.preferred_religion IS NULL 
    OR my_prefs.preferred_religion = '' 
    OR p.religion = my_prefs.preferred_religion
  )
  AND (
    my_prefs IS NULL 
    OR my_prefs.preferred_caste IS NULL 
    OR my_prefs.preferred_caste = '' 
    OR p.caste = my_prefs.preferred_caste
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS public.get_pending_requests();
CREATE OR REPLACE FUNCTION public.get_pending_requests(p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid;
BEGIN
  my_uid := auth.uid();
  
  RETURN QUERY
  SELECT 
    p.id, p.display_name, p.date_of_birth, p.gender, p.location, p.bio, p.education, p.profession, 
    p.birth_location, p.onboarding_completed, p.regional_preference, p.created_at, p.updated_at, 
    p.intent, p.height, p.blood_group, p.mother_tongue, p.religion, p.caste, p.sub_caste, p.gotra, 
    p.education_10th, p.education_12th, p.higher_education, p.employer, 
    NULL::text as annual_income, 
    NULL::text as health_info, 
    NULL::text as health_privacy, 
    p.diet, p.alcohol, p.smoking, p.marital_status, p.previous_marriage, p.children_status, 
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for,
    p.nakshatra, p.rashi, p.nadi, p.manglik
  FROM public.profiles p
  JOIN public.interactions i ON i.actor_id = p.id
  WHERE i.target_id = my_uid
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = my_uid AND i2.target_id = p.id
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS public.get_sent_requests();
CREATE OR REPLACE FUNCTION public.get_sent_requests(p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid;
BEGIN
  my_uid := auth.uid();
  
  RETURN QUERY
  SELECT 
    p.id, p.display_name, p.date_of_birth, p.gender, p.location, p.bio, p.education, p.profession, 
    p.birth_location, p.onboarding_completed, p.regional_preference, p.created_at, p.updated_at, 
    p.intent, p.height, p.blood_group, p.mother_tongue, p.religion, p.caste, p.sub_caste, p.gotra, 
    p.education_10th, p.education_12th, p.higher_education, p.employer, 
    NULL::text as annual_income, 
    NULL::text as health_info, 
    NULL::text as health_privacy, 
    p.diet, p.alcohol, p.smoking, p.marital_status, p.previous_marriage, p.children_status, 
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for,
    p.nakshatra, p.rashi, p.nadi, p.manglik
  FROM public.profiles p
  JOIN public.interactions i ON i.target_id = p.id
  WHERE i.actor_id = my_uid
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = p.id AND i2.target_id = my_uid AND i2.action_type = 'LIKE'
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;


-- FIX 3: INTERACTION RATE LIMIT
CREATE OR REPLACE FUNCTION public.check_interaction_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  interaction_count int;
BEGIN
  SELECT count(*) INTO interaction_count 
  FROM public.interactions 
  WHERE actor_id = NEW.actor_id 
  AND created_at >= NOW() - INTERVAL '24 hours';
  
  -- Soft limit of 100 interactions per day
  IF interaction_count >= 100 THEN
    RAISE EXCEPTION 'Daily interaction limit reached. Please try again tomorrow.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_interaction_limit ON public.interactions;
CREATE TRIGGER enforce_interaction_limit
BEFORE INSERT ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION public.check_interaction_rate_limit();


CREATE OR REPLACE FUNCTION public.get_discovery_candidates()
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
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for
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
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pending_requests()
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
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for
  FROM public.profiles p
  JOIN public.interactions i ON i.actor_id = p.id
  WHERE i.target_id = my_uid
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = my_uid AND i2.target_id = p.id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sent_requests()
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
    p.photo_privacy, p.voice_note_url, p.voice_note_prompt, p.marriage_questionnaire, p.looking_for
  FROM public.profiles p
  JOIN public.interactions i ON i.target_id = p.id
  WHERE i.actor_id = my_uid
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = p.id AND i2.target_id = my_uid AND i2.action_type = 'LIKE'
  );
END;
$$;

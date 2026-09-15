-- 20260915000000_nearby_and_activity_rooms.sql
-- 1. Add location columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_latitude numeric,
  ADD COLUMN IF NOT EXISTS current_longitude numeric,
  ADD COLUMN IF NOT EXISTS last_location_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS distance_km numeric;

-- 2. Create update_user_location RPC
CREATE OR REPLACE FUNCTION public.update_user_location(
  p_latitude numeric,
  p_longitude numeric,
  p_city text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  UPDATE public.profiles
  SET 
    current_latitude = p_latitude,
    current_longitude = p_longitude,
    location_city = COALESCE(p_city, location_city),
    last_location_at = now()
  WHERE id = auth.uid();

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_user_location(numeric, numeric, text) TO authenticated;

-- 3. Update get_discovery_candidates to support radius_km and distance calculation
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
    v_my_lat numeric;
    v_my_lng numeric;
    v_radius_km numeric;
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

  SELECT gender, intent, onboarding_completed, current_latitude, current_longitude
  INTO v_my_gender, v_my_intent, v_my_readiness, v_my_lat, v_my_lng
  FROM public.profiles 
  WHERE id = v_my_uid;

  IF v_my_intent = 'Marriage' AND (v_my_readiness IS NOT TRUE) THEN
    RAISE EXCEPTION 'Discovery in Marriage mode requires 100%% profile completion.';
  END IF;

  IF p_limit > 50 THEN
    p_limit := 50;
  END IF;
  IF p_offset > 500 THEN
    RAISE EXCEPTION 'Pagination limit reached.';
  END IF;

  -- Optional override from client filters
  IF p_filters->>'latitude' IS NOT NULL AND p_filters->>'longitude' IS NOT NULL THEN
    v_my_lat := (p_filters->>'latitude')::numeric;
    v_my_lng := (p_filters->>'longitude')::numeric;
  END IF;

  IF p_filters->>'radius_km' IS NOT NULL THEN
    v_radius_km := (p_filters->>'radius_km')::numeric;
  ELSIF (p_filters->>'nearby')::boolean IS TRUE THEN
    v_radius_km := 25;
  END IF;

  v_must_have := COALESCE(p_filters->'must_have', '{}'::jsonb);
  v_deal_breaker := COALESCE(p_filters->'deal_breaker', '{}'::jsonb);
  v_preferred := COALESCE(p_filters->'preferred', '{}'::jsonb);

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
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.health_status 
      ELSE 'Disclosed after match'::text 
    END as health_status,
    p.pre_existing_conditions,
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
    p.partner_preferences_tiers,
    p.native_location,
    p.avatar_storage_path,
    p.mother_father_gotra,
    p.father_mother_gotra,
    p.mother_mother_gotra,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.matches m 
        WHERE (m.user1_id = v_my_uid AND m.user2_id = p.id) 
           OR (m.user2_id = v_my_uid AND m.user1_id = p.id)
      ) THEN p.family_income 
      ELSE NULL::text 
    END as family_income,
    p.current_latitude,
    p.current_longitude,
    p.last_location_at,
    p.location_city,
    CASE 
      WHEN v_my_lat IS NOT NULL AND v_my_lng IS NOT NULL AND p.current_latitude IS NOT NULL AND p.current_longitude IS NOT NULL THEN
        ROUND((
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(v_my_lat)) * cos(radians(p.current_latitude)) *
              cos(radians(p.current_longitude) - radians(v_my_lng)) +
              sin(radians(v_my_lat)) * sin(radians(p.current_latitude))
            ))
          )
        )::numeric, 1)
      ELSE NULL::numeric
    END as distance_km
  FROM public.profiles p
  WHERE p.id != v_my_uid
    AND p.onboarding_completed = true
    AND (v_my_intent IS NULL OR p.intent = v_my_intent)
    AND NOT EXISTS (
      SELECT 1 FROM public.interactions i 
      WHERE i.actor_id = v_my_uid AND i.target_id = p.id
    )
    AND (v_gender_filter IS NULL OR p.gender = v_gender_filter)
    AND (
      p.date_of_birth IS NULL OR (
        EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) >= v_min_age
        AND EXTRACT(YEAR FROM age(current_date, p.date_of_birth)) <= v_max_age
      )
    )
    AND (
      v_radius_km IS NULL OR (
        v_my_lat IS NOT NULL AND v_my_lng IS NOT NULL AND
        p.current_latitude IS NOT NULL AND p.current_longitude IS NOT NULL AND
        (
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(v_my_lat)) * cos(radians(p.current_latitude)) *
              cos(radians(p.current_longitude) - radians(v_my_lng)) +
              sin(radians(v_my_lat)) * sin(radians(p.current_latitude))
            ))
          ) <= v_radius_km
        )
      )
    )
    AND (v_must_have->>'religion' IS NULL OR p.religion ILIKE '%' || (v_must_have->>'religion') || '%')
    AND (v_must_have->>'caste' IS NULL OR p.caste ILIKE '%' || (v_must_have->>'caste') || '%')
    AND (v_must_have->>'sub_caste' IS NULL OR p.sub_caste ILIKE '%' || (v_must_have->>'sub_caste') || '%')
    AND (v_must_have->>'region' IS NULL OR p.region ILIKE '%' || (v_must_have->>'region') || '%')
    AND (v_must_have->>'diet' IS NULL OR p.diet ILIKE '%' || (v_must_have->>'diet') || '%')
    AND (v_must_have->>'marital_status' IS NULL OR p.marital_status ILIKE '%' || (v_must_have->>'marital_status') || '%')
    AND (v_must_have->>'higher_education' IS NULL OR p.higher_education ILIKE '%' || (v_must_have->>'higher_education') || '%')
    AND (v_deal_breaker->>'religion' IS NULL OR p.religion NOT ILIKE '%' || (v_deal_breaker->>'religion') || '%')
    AND (v_deal_breaker->>'caste' IS NULL OR p.caste NOT ILIKE '%' || (v_deal_breaker->>'caste') || '%')
    AND (v_deal_breaker->>'diet' IS NULL OR p.diet NOT ILIKE '%' || (v_deal_breaker->>'diet') || '%')
    AND (v_deal_breaker->>'marital_status' IS NULL OR p.marital_status NOT ILIKE '%' || (v_deal_breaker->>'marital_status') || '%')
  ORDER BY 
    (
      CASE WHEN v_radius_km IS NOT NULL AND v_my_lat IS NOT NULL AND p.current_latitude IS NOT NULL THEN
        -(6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(v_my_lat)) * cos(radians(p.current_latitude)) *
            cos(radians(p.current_longitude) - radians(v_my_lng)) +
            sin(radians(v_my_lat)) * sin(radians(p.current_latitude))
          ))
        ))
      ELSE 0 END
    ) DESC,
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
GRANT EXECUTE ON FUNCTION public.get_discovery_candidates(integer, integer, jsonb) TO authenticated;

-- ============================================================================
-- 4. COMMUNITY ACTIVITY ROOMS & REALTIME GROUP CHAT
-- ============================================================================

-- Table: public.community_rooms
CREATE TABLE IF NOT EXISTS public.community_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Sports',
  description text,
  location_name text DEFAULT 'Nearby',
  latitude numeric,
  longitude numeric,
  radius_km integer DEFAULT 25,
  max_participants integer DEFAULT 15,
  is_active boolean DEFAULT true,
  expires_at timestamptz DEFAULT (now() + interval '48 hours'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: public.room_participants
CREATE TABLE IF NOT EXISTS public.room_participants (
  room_id uuid REFERENCES public.community_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- Table: public.room_messages
CREATE TABLE IF NOT EXISTS public.room_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES public.community_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_community_rooms_active ON public.community_rooms (is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_community_rooms_creator ON public.community_rooms (creator_id);
CREATE INDEX IF NOT EXISTS idx_community_rooms_category ON public.community_rooms (category);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_room_messages_room ON public.room_messages (room_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.community_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- RLS: community_rooms
DROP POLICY IF EXISTS "Public can view active community rooms" ON public.community_rooms;
CREATE POLICY "Public can view active community rooms"
  ON public.community_rooms FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create community rooms" ON public.community_rooms;
CREATE POLICY "Authenticated users can create community rooms"
  ON public.community_rooms FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creator can update own community room" ON public.community_rooms;
CREATE POLICY "Creator can update own community room"
  ON public.community_rooms FOR UPDATE
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creator can delete own community room" ON public.community_rooms;
CREATE POLICY "Creator can delete own community room"
  ON public.community_rooms FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS: room_participants
DROP POLICY IF EXISTS "Anyone can view room participants" ON public.room_participants;
CREATE POLICY "Anyone can view room participants"
  ON public.room_participants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;
CREATE POLICY "Users can join rooms"
  ON public.room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_participants;
CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS: room_messages
DROP POLICY IF EXISTS "Room participants can view messages" ON public.room_messages;
CREATE POLICY "Room participants can view messages"
  ON public.room_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_rooms cr
    WHERE cr.id = room_id AND cr.is_active = true
  ));

DROP POLICY IF EXISTS "Joined members can post messages" ON public.room_messages;
CREATE POLICY "Joined members can post messages"
  ON public.room_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.room_participants rp
      WHERE rp.room_id = room_id AND rp.user_id = auth.uid()
    )
  );

-- Enable Supabase Realtime for room messages
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- ============================================================================
-- 5. ROOM STORE & QUERY RPCS
-- ============================================================================

-- RPC: create_community_room
CREATE OR REPLACE FUNCTION public.create_community_room(
  p_name text,
  p_category text,
  p_description text DEFAULT NULL,
  p_location_name text DEFAULT 'Nearby',
  p_latitude numeric DEFAULT NULL,
  p_longitude numeric DEFAULT NULL,
  p_max_participants integer DEFAULT 15
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_room_id uuid;
  v_result jsonb;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  INSERT INTO public.community_rooms (
    creator_id, name, category, description, location_name,
    latitude, longitude, max_participants
  ) VALUES (
    v_uid, p_name, p_category, p_description, p_location_name,
    p_latitude, p_longitude, COALESCE(p_max_participants, 15)
  ) RETURNING id INTO v_room_id;

  -- Add creator as room participant with role 'creator'
  INSERT INTO public.room_participants (room_id, user_id, role)
  VALUES (v_room_id, v_uid, 'creator')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  SELECT json_build_object(
    'id', cr.id,
    'name', cr.name,
    'category', cr.category,
    'description', cr.description,
    'location_name', cr.location_name,
    'max_participants', cr.max_participants,
    'created_at', cr.created_at
  ) INTO v_result
  FROM public.community_rooms cr
  WHERE cr.id = v_room_id;

  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_community_room(text, text, text, text, numeric, numeric, integer) TO authenticated;

-- RPC: join_community_room
CREATE OR REPLACE FUNCTION public.join_community_room(p_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_uid uuid;
  v_count integer;
  v_max integer;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT max_participants INTO v_max
  FROM public.community_rooms
  WHERE id = p_room_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room does not exist or has expired.';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.room_participants
  WHERE room_id = p_room_id;

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Room is full.';
  END IF;

  INSERT INTO public.room_participants (room_id, user_id, role)
  VALUES (p_room_id, v_uid, 'member')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.join_community_room(uuid) TO authenticated;

-- RPC: leave_community_room
CREATE OR REPLACE FUNCTION public.leave_community_room(p_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  DELETE FROM public.room_participants
  WHERE room_id = p_room_id AND user_id = v_uid;

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.leave_community_room(uuid) TO authenticated;

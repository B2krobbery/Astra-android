-- 1. ADD MISSING PROFILE FIELDS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sub_caste text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS city_district text,
ADD COLUMN IF NOT EXISTS gotra text,
ADD COLUMN IF NOT EXISTS spiritual_practices text,
ADD COLUMN IF NOT EXISTS education_10th text,
ADD COLUMN IF NOT EXISTS education_12th text,
ADD COLUMN IF NOT EXISTS degree_course text,
ADD COLUMN IF NOT EXISTS institution text,
ADD COLUMN IF NOT EXISTS employer text,
ADD COLUMN IF NOT EXISTS work_location text,
ADD COLUMN IF NOT EXISTS annual_income text,
ADD COLUMN IF NOT EXISTS health_status text,
ADD COLUMN IF NOT EXISTS pre_existing_conditions text,
ADD COLUMN IF NOT EXISTS health_disclosures text,
ADD COLUMN IF NOT EXISTS food_preferences text,
ADD COLUMN IF NOT EXISTS alcohol_frequency text,
ADD COLUMN IF NOT EXISTS smoking_frequency text,
ADD COLUMN IF NOT EXISTS other_habits text,
ADD COLUMN IF NOT EXISTS divorced boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS widowed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS separated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS annulled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_marriage_details text,
ADD COLUMN IF NOT EXISTS children text,
ADD COLUMN IF NOT EXISTS parenting_details text,
ADD COLUMN IF NOT EXISTS numerology_inputs jsonb,
ADD COLUMN IF NOT EXISTS nadi_inputs jsonb,
ADD COLUMN IF NOT EXISTS partner_preferences_tiers jsonb; -- Structured JSONB for Must Have, Preferred, Flexible, Deal Breaker

-- 2. CREATE PREFERENCE TIERS TABLE (Alternative to JSONB, but JSONB is fine for sparse nested data if queried properly, let's use JSONB to match prompt's caution: "Do not overuse JSONB where structured querying is required". Actually, since we need to filter by MUST HAVE and DEAL BREAKER in Discovery, a structured table is better.)

CREATE TABLE IF NOT EXISTS public.preference_tiers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    attribute_name text NOT NULL, -- e.g., 'religion', 'age_min', 'smoking'
    attribute_value text NOT NULL,
    tier text NOT NULL CHECK (tier IN ('MUST_HAVE', 'PREFERRED', 'FLEXIBLE', 'DEAL_BREAKER')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, attribute_name, tier)
);

ALTER TABLE public.preference_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their preference tiers" ON public.preference_tiers 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. CREATE CHEMISTRY TABLE
CREATE TABLE IF NOT EXISTS public.chemistry (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    sports text[],
    movies text[],
    shows text[],
    favorite_characters text[],
    music text[],
    hobbies text[],
    travel text[],
    weekend_habits text,
    personality text,
    things_they_love text[],
    partner_expectations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chemistry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their chemistry" ON public.chemistry 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view chemistry of active profiles" ON public.chemistry 
    FOR SELECT USING (true); -- Governed by Discovery filtering at the edge

-- 1. SECURE BUCKETS
UPDATE storage.buckets SET public = false WHERE name IN ('avatars', 'voice_notes');

-- Add Storage RLS for avatars
DROP POLICY IF EXISTS "Avatars viewable by owner or match" ON storage.objects;
CREATE POLICY "Avatars viewable by owner or match"
ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars' AND (
    auth.uid() = owner
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = (string_to_array(name, '/'))[1]::uuid AND p.photo_privacy = 'public'
    )
    OR EXISTS (
      SELECT 1 FROM public.matches m WHERE (m.user1_id = auth.uid() AND m.user2_id = (string_to_array(name, '/'))[1]::uuid) OR (m.user2_id = auth.uid() AND m.user1_id = (string_to_array(name, '/'))[1]::uuid)
    )
  )
);

-- 2. SCHEMA ADDITIONS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS family_background text,
ADD COLUMN IF NOT EXISTS never_married boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS lifestyle_info jsonb,
ADD COLUMN IF NOT EXISTS nakshatra_pada integer,
ADD COLUMN IF NOT EXISTS chemistry_answers jsonb;

-- Create Chaanbean requests
CREATE TABLE IF NOT EXISTS public.chaanbean_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'PENDING_PAYMENT',
    consent_granted boolean DEFAULT false,
    checks_requested jsonb,
    report_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.chaanbean_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chaanbean requests" ON public.chaanbean_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);
CREATE POLICY "Users can insert chaanbean requests" ON public.chaanbean_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Create Photo Requests
CREATE TABLE IF NOT EXISTS public.photo_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(requester_id, target_id)
);
ALTER TABLE public.photo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own photo requests" ON public.photo_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);
CREATE POLICY "Users can insert photo requests" ON public.photo_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update photo requests they received" ON public.photo_requests FOR UPDATE USING (auth.uid() = target_id);


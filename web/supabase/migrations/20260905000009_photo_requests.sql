CREATE TABLE IF NOT EXISTS public.photo_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid REFERENCES public.profiles(id) NOT NULL,
    target_id uuid REFERENCES public.profiles(id) NOT NULL,
    status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(requester_id, target_id)
);

ALTER TABLE public.photo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view requests they sent or received"
ON public.photo_requests FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR target_id = auth.uid());

CREATE POLICY "Users can create requests"
ON public.photo_requests FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can accept/decline requests they received"
ON public.photo_requests FOR UPDATE
TO authenticated
USING (target_id = auth.uid())
WITH CHECK (target_id = auth.uid());

-- Function to safely fetch private photos ONLY if request is accepted
CREATE OR REPLACE FUNCTION public.get_private_photos(p_target_id uuid)
RETURNS SETOF public.profile_photos
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Allowed if it's their own profile
  IF auth.uid() = p_target_id THEN
    RETURN QUERY SELECT * FROM public.profile_photos WHERE user_id = p_target_id;
    RETURN;
  END IF;

  -- 2. Allowed if the photo is public
  RETURN QUERY SELECT * FROM public.profile_photos 
  WHERE user_id = p_target_id AND is_public = true;

  -- 3. Allowed if there is an ACCEPTED request
  IF EXISTS (
    SELECT 1 FROM public.photo_requests 
    WHERE requester_id = auth.uid() AND target_id = p_target_id AND status = 'ACCEPTED'
  ) THEN
    RETURN QUERY SELECT * FROM public.profile_photos 
    WHERE user_id = p_target_id AND is_public = false;
  END IF;
END;
$$;

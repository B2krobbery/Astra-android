-- Remove legacy overly-permissive storage policies
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Voice" ON storage.objects;
DROP POLICY IF EXISTS "Avatars viewable by owner or match" ON storage.objects;

-- Secure Avatars Access Policy
CREATE POLICY "Avatars viewable by owner, approved request, or match"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND (
    -- 1. Owner
    (auth.uid())::text = (storage.foldername(name))[1]
    OR
    -- 2. Public photo privacy
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1]
        AND (p.photo_privacy = 'public' OR p.photo_privacy IS NULL)
    )
    -- 3. Mutual Match
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (m.user1_id = auth.uid() AND m.user2_id::text = (storage.foldername(name))[1])
         OR (m.user2_id = auth.uid() AND m.user1_id::text = (storage.foldername(name))[1])
    )
    -- 4. Accepted Photo Request
    OR EXISTS (
      SELECT 1 FROM public.photo_requests pr
      WHERE pr.requester_id = auth.uid()
        AND pr.target_id::text = (storage.foldername(name))[1]
        AND pr.status = 'ACCEPTED'
    )
  )
);

-- Secure Voice Notes Policy (Owner or Match only)
CREATE POLICY "Voice notes viewable by owner or match"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice_notes' AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (m.user1_id = auth.uid() AND m.user2_id::text = (storage.foldername(name))[1])
         OR (m.user2_id = auth.uid() AND m.user1_id::text = (storage.foldername(name))[1])
    )
  )
);

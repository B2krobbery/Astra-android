-- 20260905000014_profile_photos_request_policy.sql
-- Update profile_photos SELECT policy to allow viewing photos when photo_request is ACCEPTED
DROP POLICY IF EXISTS "Photos are viewable based on privacy and matches" ON public.profile_photos;
DROP POLICY IF EXISTS "Photos are viewable based on privacy, matches, and requests" ON public.profile_photos;

CREATE POLICY "Photos are viewable based on privacy, matches, and requests"
ON public.profile_photos
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id)
  OR (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = profile_photos.user_id 
    AND (profiles.photo_privacy = 'public' OR profiles.photo_privacy IS NULL)
  ))
  OR (EXISTS (
    SELECT 1 FROM matches 
    WHERE (matches.user1_id = auth.uid() AND matches.user2_id = profile_photos.user_id) 
       OR (matches.user2_id = auth.uid() AND matches.user1_id = profile_photos.user_id)
  ))
  OR (EXISTS (
    SELECT 1 FROM photo_requests
    WHERE photo_requests.requester_id = auth.uid()
      AND photo_requests.target_id = profile_photos.user_id
      AND photo_requests.status = 'ACCEPTED'
  ))
);

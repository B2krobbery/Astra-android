SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('profiles', 'private_profiles', 'profile_photos', 'matches', 'interactions', 'chaanbean_requests');

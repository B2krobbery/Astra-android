-- Seed Realistic Mock Profiles into Supabase

-- This script uses DO block to insert mock data securely without needing an external script.
DO $$
DECLARE
  kavya_id uuid := '11111111-1111-4111-1111-111111111111';
  vikram_id uuid := '22222222-2222-4222-2222-222222222222';
  sneha_id uuid := '33333333-3333-4333-3333-333333333333';
  rahul_id uuid := '44444444-4444-4444-4444-444444444444';
  priya_id uuid := '55555555-5555-4555-5555-555555555555';
  aditi_id uuid := '66666666-6666-4666-6666-666666666666';
BEGIN

  -- 1. Create mock users in auth.users
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
  (kavya_id, 'authenticated', 'authenticated', 'kavya.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Kavya"}', now(), now()),
  (vikram_id, 'authenticated', 'authenticated', 'vikram.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Vikram"}', now(), now()),
  (sneha_id, 'authenticated', 'authenticated', 'sneha.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Sneha"}', now(), now()),
  (rahul_id, 'authenticated', 'authenticated', 'rahul.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Rahul"}', now(), now()),
  (priya_id, 'authenticated', 'authenticated', 'priya.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Priya"}', now(), now()),
  (aditi_id, 'authenticated', 'authenticated', 'aditi.mock@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Aditi"}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create public profiles
  INSERT INTO public.profiles (id, intent, display_name, date_of_birth, gender, location, bio, education_10th, profession, onboarding_completed, religion, caste)
  VALUES
  (kavya_id, 'Marriage', 'Kavya', '1999-05-15', 'Female', 'Delhi NCR', 'Designer of spaces by day, collector of stories by night. Usually found in a quiet corner of a cafe in Indiranagar or exploring the ruins of Hampi. Believer in warm filter coffee, slow mornings, and deep alignment of stars.', 'IIT Roorkee', 'Brand Strategist', true, 'Hindu', 'Brahmin'),
  (vikram_id, 'Marriage', 'Vikram', '1995-11-20', 'Male', 'Bengaluru', 'Building tech startups and chasing sunsets. Looking for an equal partner to build a life with.', 'BITS Pilani', 'Software Engineer', true, 'Hindu', 'Rajput'),
  (sneha_id, 'Marriage', 'Sneha', '1998-03-10', 'Female', 'Mumbai', 'Crafting digital experiences with empathy. Avid vinyl collector and weekend cyclist along Marine Drive.', 'NID Ahmedabad', 'UI/UX Lead', true, 'Hindu', 'Brahmin'),
  (rahul_id, 'Dating', 'Rahul', '1997-08-25', 'Male', 'Pune', 'Fitness enthusiast and dog dad. Always up for a spontaneous weekend trek.', 'Pune University', 'Marketing Manager', true, 'Hindu', 'Maratha'),
  (priya_id, 'Marriage', 'Priya', '1999-01-05', 'Female', 'Chennai', 'Classical dancer and data scientist. Finding patterns in code and rhythm in life.', 'Anna University', 'Data Scientist', true, 'Hindu', 'Iyer'),
  (aditi_id, 'Dating', 'Aditi', '1998-07-22', 'Female', 'Bengaluru', 'Product designer who loves matcha lattes, exploring hidden art galleries, and debating the best sci-fi movies.', 'NIFT', 'Product Designer', true, 'Hindu', 'Brahmin')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Insert Photos using realistic Unsplash URLs
  INSERT INTO public.profile_photos (user_id, storage_path, is_primary)
  VALUES
  (kavya_id, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', true),
  (kavya_id, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', false),
  
  (vikram_id, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop', true),
  
  (sneha_id, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', true),
  (sneha_id, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', false),
  
  (rahul_id, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop', true),
  
  (priya_id, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop', true),
  
  (aditi_id, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop', true),
  (aditi_id, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', false)
  ON CONFLICT DO NOTHING;

END $$;

-- Add family_income to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_income text;

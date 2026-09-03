-- Migration to add comprehensive Matrimonial Profile fields to public.profiles

alter table public.profiles
  add column intent text default 'Marriage', -- 'Dating' or 'Marriage'
  add column height text,
  add column blood_group text,
  add column mother_tongue text,
  
  -- Religion & Community
  add column religion text,
  add column caste text,
  add column sub_caste text,
  add column gotra text,
  
  -- Education & Work
  add column education_10th text,
  add column education_12th text,
  add column higher_education text,
  add column employer text,
  add column annual_income text,
  
  -- Health
  add column health_info text,
  add column health_privacy text default 'private', -- 'public' or 'private'
  
  -- Lifestyle
  add column diet text,
  add column alcohol text,
  add column smoking text,
  
  -- Family & Marriage History
  add column marital_status text default 'Never Married',
  add column previous_marriage text,
  add column children_status text,
  
  -- Settings
  add column photo_privacy text default 'public'; -- 'public' or 'private'

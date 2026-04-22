
-- Add reading_goal column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reading_goal INTEGER DEFAULT 0;

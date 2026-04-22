
-- Migration 008: Add updated_at to reading_progress
ALTER TABLE public.reading_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migration 010: Add duration field to reading progress
ALTER TABLE public.reading_progress 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

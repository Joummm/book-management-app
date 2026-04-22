-- Migration 006: Add favorites flag to books and track daily reading progress

-- 1. Add is_favorite boolean to books
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. Create reading_progress table to track daily read pages
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  pages_read INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique entry per user, per book, per day
  UNIQUE (user_id, book_id, date)
);

-- 3. Indexes for faster filtering and aggregations
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON public.reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_date ON public.reading_progress(date);

-- Note: RLS policies are omitted as authentication is handled at the application level.

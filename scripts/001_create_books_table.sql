-- Create books table with all required fields
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_image TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  release_date DATE,
  start_reading_date DATE,
  finish_reading_date DATE,
  pages INTEGER,
  genres TEXT[], -- Array of genres
  publisher TEXT,
  format TEXT NOT NULL CHECK (format IN ('physical', 'digital')),
  characters TEXT[], -- Array of characters
  quotes TEXT[], -- Array of memorable quotes
  would_read_again TEXT CHECK (would_read_again IN ('yes', 'no', 'maybe')),
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own books
CREATE POLICY "users_select_own_books"
  ON public.books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_books"
  ON public.books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_books"
  ON public.books FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_books_user_id ON public.books(user_id);
CREATE INDEX idx_books_created_at ON public.books(created_at DESC);

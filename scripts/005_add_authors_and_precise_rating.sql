-- Alter rating column to NUMERIC(3,1) and remove old integer check
ALTER TABLE public.books 
  ALTER COLUMN rating TYPE NUMERIC(3,1),
  DROP CONSTRAINT IF EXISTS books_rating_check;

ALTER TABLE public.books
  ADD CONSTRAINT books_rating_check CHECK (rating >= 0 AND rating <= 10); -- Increased range for flexibility

-- Create authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  born_date DATE,
  died_date DATE,
  nationality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many junction table for books and authors
CREATE TABLE IF NOT EXISTS public.book_authors (
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_user_id ON public.authors(user_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_book_id ON public.book_authors(book_id);
CREATE INDEX IF NOT EXISTS idx_book_authors_author_id ON public.book_authors(author_id);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Register update_at trigger if doesn't exist (assuming the project might have it)
-- For now, we'll just skip the trigger or implement a simple one if needed.

-- Create many-to-many junction table for books and collections
CREATE TABLE IF NOT EXISTS public.book_collections (
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, collection_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_book_collections_book_id ON public.book_collections(book_id);
CREATE INDEX IF NOT EXISTS idx_book_collections_collection_id ON public.book_collections(collection_id);

-- Note: RLS policies are omitted because the base project doesn't seem to use 
-- DB-level RLS policies on the books table in this environment.
-- Authentication is handled at the application level.

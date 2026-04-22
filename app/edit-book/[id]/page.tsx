import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { BookForm } from "@/components/BookFormat";
import type { Book } from "@/lib/types";
import { Footer } from "@/components/Footer";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  
  // Verificar autenticação
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Buscar o livro
  const booksRaw = await sql`
    SELECT b.*,
      COALESCE(
        (SELECT json_agg(a.*)
         FROM authors a
         JOIN book_authors ba ON a.id = ba.author_id
         WHERE ba.book_id = b.id),
        '[]'::json
      ) as authors
    FROM books b
    WHERE b.id = ${id} AND b.user_id = ${user.id}
  `;

  if (booksRaw.length === 0) {
    redirect("/books");
  }

  const bookRaw = booksRaw[0];
  
  // Converter para o tipo Book
  const book: Book = {
    id: bookRaw.id,
    user_id: bookRaw.user_id,
    title: bookRaw.title,
    author: bookRaw.author,
    cover_image: bookRaw.cover_image,
    rating: bookRaw.rating,
    review: bookRaw.review,
    release_date: bookRaw.release_date,
    start_reading_date: bookRaw.start_reading_date,
    finish_reading_date: bookRaw.finish_reading_date,
    pages: bookRaw.pages,
    genres: bookRaw.genres,
    publisher: bookRaw.publisher,
    format: bookRaw.format,
    characters: bookRaw.characters,
    quotes: bookRaw.quotes,
    would_read_again: bookRaw.would_read_again,
    would_recommend: bookRaw.would_recommend,
    authors: bookRaw.authors,
    created_at: bookRaw.created_at,
    updated_at: bookRaw.updated_at,
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <BookForm book={book} />
      </main>
      <Footer />
    </div>
  );
}
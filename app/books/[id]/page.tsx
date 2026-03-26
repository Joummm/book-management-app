import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { BookDetails } from "@/components/BookDetails";
import type { Book } from "@/lib/types";

interface BookDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const { id } = await params;
  
  // Verificar autenticação
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Buscar o livro
  const booksRaw = await sql`
    SELECT * FROM books 
    WHERE id = ${id} AND user_id = ${user.id}
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
    created_at: bookRaw.created_at,
    updated_at: bookRaw.updated_at,
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <BookDetails book={book} />
      </main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 João Nunes | All rights reserved
        </div>
      </footer>
    </div>
  );
}
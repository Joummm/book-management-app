// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { DashboardContent } from "@/components/DashboardContent";
import type { Book } from "@/lib/types";

export default async function DashboardPage() {
  // Verificar autenticação no servidor
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Buscar livros do usuário com tipagem explícita
  const booksRaw = await sql`
    SELECT * FROM books 
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;

  // Converter para o tipo Book
  const books: Book[] = booksRaw.map((book: any) => ({
    id: book.id,
    user_id: book.user_id,
    title: book.title,
    author: book.author,
    cover_image: book.cover_image,
    rating: book.rating,
    review: book.review,
    release_date: book.release_date,
    start_reading_date: book.start_reading_date,
    finish_reading_date: book.finish_reading_date,
    pages: book.pages,
    genres: book.genres,
    publisher: book.publisher,
    format: book.format,
    characters: book.characters,
    quotes: book.quotes,
    would_read_again: book.would_read_again,
    would_recommend: book.would_recommend,
    created_at: book.created_at,
    updated_at: book.updated_at,
  }));

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <DashboardContent books={books} />
      </main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 João Nunes | All rights reserved
        </div>
      </footer>
    </div>
  );
}
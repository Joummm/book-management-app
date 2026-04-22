// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { DashboardContent } from "@/components/DashboardContent";
import type { Book } from "@/lib/types";
import { Footer } from "@/components/Footer";

export default async function DashboardPage() {
  // Verificar autenticação no servidor
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Buscar livros do usuário com tipagem explícita
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
    WHERE b.user_id = ${user.id}
    ORDER BY b.created_at DESC
  `;

  // Buscar perfil do utilizador para a meta de leitura
  const profileRaw = await sql`
    SELECT reading_goal FROM profiles WHERE id = ${user.id}
  `;
  const readingGoal = profileRaw[0]?.reading_goal || 0;

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
    authors: book.authors,
    created_at: book.created_at,
    updated_at: book.updated_at,
  }));

  const communityBooksRaw = await sql`
    SELECT b.*,
      p.name as owner_name
    FROM books b
    LEFT JOIN profiles p ON b.user_id = p.id
    WHERE b.user_id != ${user.id}
    ORDER BY b.created_at DESC
    LIMIT 20
  `;

  // Converter para o tipo Book
  const communityBooks = communityBooksRaw as any[];

  // Buscar progresso de leitura
  const progressRaw = await sql`
    SELECT * FROM reading_progress 
    WHERE user_id = ${user.id}
    ORDER BY date ASC
  `;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <DashboardContent 
          books={books} 
          communityBooks={communityBooks} 
          readingGoal={readingGoal}
          progress={progressRaw as any[]}
        />
      </main>
      <Footer />
    </div>
  );
}
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { AuthorsListContent } from "@/components/AuthorsListContent";

export default async function AuthorsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const authors = await sql`
    SELECT a.*, COUNT(ba.book_id) as books_count
    FROM authors a
    LEFT JOIN book_authors ba ON a.id = ba.author_id
    WHERE a.user_id = ${user.id}
    GROUP BY a.id
    ORDER BY a.name ASC
  `;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Autores</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie os autores e associe-os aos seus livros.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {authors.length > 0 && (
              <div className="px-4 py-2 rounded-xl bg-muted/60 text-center mr-1">
                <p className="text-2xl font-bold text-primary">{authors.length}</p>
                <p className="text-xs text-muted-foreground">Autores</p>
              </div>
            )}
            <Link href="/authors/new">
              <Button className="gap-2 shadow-lg shadow-primary/20 cursor-pointer">
                <UserPlus className="h-4 w-4" />
                Novo Autor
              </Button>
            </Link>
          </div>
        </div>

        <AuthorsListContent authors={authors as any[]} />
      </main>

      <Footer />
    </div>
  );
}

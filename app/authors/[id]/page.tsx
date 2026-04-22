import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { BookCard } from "@/components/BookCard";
import { Users, Calendar, Globe, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteAuthorButton } from "@/components/DeleteAuthorButton";


export default async function AuthorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch author details
  const authorResult = await sql`
    SELECT * FROM authors 
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  if (authorResult.length === 0) {
    redirect("/authors");
  }

  const author = authorResult[0];

  // Fetch books by this author
  const booksRaw = await sql`
    SELECT b.*, 
      COALESCE(
        (SELECT json_agg(c.*) 
         FROM collections c 
         JOIN book_collections bc ON c.id = bc.collection_id 
         WHERE bc.book_id = b.id), 
        '[]'::json
      ) as collections,
      COALESCE(
        (SELECT json_agg(a.*)
         FROM authors a
         JOIN book_authors ba ON a.id = ba.author_id
         WHERE ba.book_id = b.id),
        '[]'::json
      ) as authors
    FROM books b
    JOIN book_authors ba ON b.id = ba.book_id
    WHERE ba.author_id = ${id}
    ORDER BY b.created_at DESC
  `;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="mb-8">
          <Link href="/authors">
            <Button variant="ghost" className="gap-2 -ml-4 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Autores
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="h-40 w-40 rounded-2xl bg-muted overflow-hidden border-4 border-background shadow-xl shrink-0">
              {author.image_url ? (
                <img src={author.image_url} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <Users className="h-16 w-16" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{author.name}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground text-sm font-medium">
                    {author.nationality && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-primary/60" />
                        {author.nationality}
                      </div>
                    )}
                    {author.born_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary/60" />
                        {new Date(author.born_date).toLocaleDateString()}
                        {author.died_date && ` — ${new Date(author.died_date).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>
                
                 <div className="flex gap-2">
                   <Link href={`/authors/${id}/edit`}>
                     <Button variant="outline" size="sm" className="gap-2">
                       <Edit className="h-4 w-4" />
                       Editar
                     </Button>
                   </Link>
                   <DeleteAuthorButton authorId={id} authorName={author.name} />
                 </div>

              </div>
              
              {author.bio && (
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="pt-6">
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {author.bio}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Livros deste Autor
              <Badge variant="outline" className="text-sm font-normal">
                {booksRaw.length}
              </Badge>
            </h2>
          </div>

          {booksRaw.length === 0 ? (
            <Card className="border-dashed py-20 text-center">
              <CardContent>
                <p className="text-muted-foreground">Nenhum livro associado a este autor ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {booksRaw.map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

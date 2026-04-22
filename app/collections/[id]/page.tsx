import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { ArrowLeft, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookCard } from "@/components/BookCard";
import type { Book } from "@/lib/types";
import { EditCollectionDialog } from "@/components/EditCollectionDialog";
import { DeleteCollectionButton } from "@/components/DeleteCollectionButton";
import { Footer } from "@/components/Footer";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ── Virtual "Favoritos" collection ──
  if (id === "favorites") {
    const booksRaw = await sql`
      SELECT b.*,
        COALESCE(
          (SELECT json_agg(c.*)
           FROM collections c
           JOIN book_collections bc ON c.id = bc.collection_id
           WHERE bc.book_id = b.id),
          '[]'::json
        ) as collections
      FROM books b
      WHERE b.user_id = ${user.id} AND b.is_favorite = true
      ORDER BY b.created_at DESC
    `;

    const books: Book[] = booksRaw.map((b: any) => ({ ...b, collections: b.collections }));

    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
          <div className="mb-8">
            <Link href="/collections">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Coleções
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                  <Heart className="h-8 w-8 fill-rose-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Favoritos</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">Os seus livros favoritos</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  {books.length} {books.length === 1 ? "livro" : "livros"}
                </span>
                <span>•</span>
                <span className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">Coleção de Sistema</span>
              </div>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="py-20 text-center bg-rose-500/5 rounded-3xl border-2 border-dashed border-rose-500/20">
              <Heart className="h-12 w-12 text-rose-500/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum livro favorito ainda</h2>
              <p className="text-muted-foreground mb-8">
                Marca livros como favoritos clicando no coração ❤️ nos seus cartões.
              </p>
              <Link href="/books">
                <Button className="cursor-pointer">Explorar meus livros</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // ── Regular collection ──
  const collections = await sql`
    SELECT * FROM collections WHERE id = ${id} AND user_id = ${user.id}
  `;

  if (collections.length === 0) {
    redirect("/collections");
  }

  const collection = collections[0];

  const booksRaw = await sql`
    SELECT b.*, 
      COALESCE(
        (SELECT json_agg(c.*) 
         FROM collections c 
         JOIN book_collections bc ON c.id = bc.collection_id 
         WHERE bc.book_id = b.id), 
        '[]'::json
      ) as collections
    FROM books b
    JOIN book_collections bc ON b.id = bc.book_id
    WHERE bc.collection_id = ${id} AND b.user_id = ${user.id}
    ORDER BY b.created_at DESC
  `;

  const books: Book[] = booksRaw.map((b: any) => ({
    ...b,
    collections: b.collections
  }));

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Breadcrumbs / Back */}
        <div className="mb-8">
          <Link href="/collections">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Coleções
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Bookmark className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{collection.name}</h1>
            </div>
            {collection.description && (
              <p className="text-xl text-muted-foreground max-w-2xl">
                {collection.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                {books.length} {books.length === 1 ? 'livro' : 'livros'}
              </span>
              <span>•</span>
              <span>Criada em {new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <EditCollectionDialog 
              collection={{
                id: collection.id,
                name: collection.name,
                description: collection.description,
                image_url: collection.image_url,
                color: collection.color,
                emoji: collection.emoji
              }} 
              trigger={
                <Button variant="outline" className="flex-1 md:flex-none gap-2 cursor-pointer">
                  <Bookmark className="h-4 w-4" />
                  Editar Coleção
                </Button>
              }
            />
            <DeleteCollectionButton collectionId={collection.id} />
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
            <h2 className="text-xl font-semibold mb-2">Nenhum livro nesta coleção</h2>
            <p className="text-muted-foreground mb-8">
              Adicione livros a esta coleção a partir da sua lista principal.
            </p>
            <Link href="/books">
              <Button className="cursor-pointer">Explorar meus livros</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

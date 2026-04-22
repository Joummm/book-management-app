import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { Bookmark, Plus, BookOpen, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCollectionDialog } from "@/components/CreateCollectionDialog";
import { EditCollectionDialog } from "@/components/EditCollectionDialog";
import { Footer } from "@/components/Footer";

export default async function CollectionsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const collections = await sql`
    SELECT c.*, COUNT(bc.book_id) as books_count
    FROM collections c
    LEFT JOIN book_collections bc ON c.id = bc.collection_id
    WHERE c.user_id = ${user.id}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  // Virtual "Favoritos" collection
  const favoritesCount = await sql`
    SELECT COUNT(*) as count FROM books
    WHERE user_id = ${user.id} AND is_favorite = true
  `;

  const favoritesCollection = {
    id: "favorites",
    name: "Favoritos",
    description: "Os seus livros favoritos",
    image_url: null,
    books_count: Number(favoritesCount[0].count),
    is_system: true,
    updated_at: new Date().toISOString(),
  };

  const allCollections = [favoritesCollection, ...collections];

  const totalBooks = collections.reduce(
    (sum: number, c: any) => sum + Number(c.books_count),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Coleções</h1>
            </div>
            <p className="text-muted-foreground">
              Organize os seus livros em grupos personalizados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {collections.length > 0 && (
              <div className="flex items-center gap-4 pr-4 border-r border-border/60 mr-1">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{collections.length}</p>
                  <p className="text-xs text-muted-foreground">Coleções</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalBooks}</p>
                  <p className="text-xs text-muted-foreground">Livros</p>
                </div>
              </div>
            )}
            <CreateCollectionDialog />
          </div>
        </div>

        {/* Collections Grid — always shows because Favoritos is always present */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allCollections.map((collection: any) => {
            const isFavorites = collection.id === "favorites";
            return (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <div className={`group h-full rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                  isFavorites
                    ? "border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-card hover:border-rose-500/50 hover:shadow-rose-500/10"
                    : "border-border/50 bg-card hover:border-primary/30 hover:shadow-primary/8"
                }`}>
                  {/* Top bar */}
                  {collection.image_url ? (
                    <div className="h-32 w-full overflow-hidden relative">
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
                    </div>
                  ) : (
                    <div className={`h-1.5 bg-gradient-to-r transition-all duration-300 ${
                      isFavorites
                        ? "from-rose-400/60 via-rose-500 to-rose-400/40 group-hover:from-rose-500 group-hover:to-rose-400/70"
                        : "from-primary/60 via-primary to-primary/40 group-hover:from-primary group-hover:to-primary/70"
                    }`} />
                  )}

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div 
                          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                            isFavorites
                              ? "bg-rose-500/10 group-hover:bg-rose-500/20"
                              : "group-hover:opacity-80"
                          }`}
                          style={!isFavorites ? { backgroundColor: `${collection.color || '#6366f1'}20` } : {}}
                        >
                          {isFavorites ? (
                            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                          ) : (
                            <span className="text-xl">{collection.emoji || "📚"}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isFavorites && <EditCollectionDialog collection={collection} />}
                          <Badge
                            variant="secondary"
                            className={`font-semibold text-xs ${isFavorites ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-0" : ""}`}
                            style={!isFavorites ? { color: collection.color || 'inherit', backgroundColor: `${collection.color || ''}10` } : {}}
                          >
                            {collection.books_count}{" "}
                            {Number(collection.books_count) === 1 ? "livro" : "livros"}
                          </Badge>
                        </div>
                      </div>

                      <h3 
                        className={`font-semibold text-base leading-snug transition-colors mb-1 ${
                          isFavorites ? "group-hover:text-rose-500" : ""
                        }`}
                        style={!isFavorites ? { color: collection.color || 'inherit' } : {}}
                      >
                        {collection.name}
                        {isFavorites && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">• Sistema</span>
                        )}
                      </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/40">
                      <span className="text-xs text-muted-foreground">
                        {isFavorites
                          ? `${collection.books_count} favorito${collection.books_count !== 1 ? "s" : ""}`
                          : new Date(collection.updated_at).toLocaleDateString("pt-PT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                        }
                      </span>
                      {isFavorites
                        ? <Heart className="h-3.5 w-3.5 text-rose-500/50 fill-rose-500/50 group-hover:text-rose-500 group-hover:fill-rose-500 transition-colors" />
                        : <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                      }
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Show empty state only when there are no user collections AND no favorites */}
        {allCollections.length === 1 && favoritesCollection.books_count === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-24 w-24 rounded-3xl bg-primary/8 flex items-center justify-center mb-6 ring-1 ring-primary/15">
              <Bookmark className="h-12 w-12 text-primary/50" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma coleção ainda</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Crie coleções para organizar os seus livros por tema, série ou lista de leitura.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <CreateCollectionDialog />
              <Link href="/books">
                <Button variant="outline" className="cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver Livros
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


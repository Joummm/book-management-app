"use client";

import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, FileText, Star, Users } from "lucide-react";
import Link from "next/link";

interface BookDetailsProps {
  book: Book;
}

export function BookDetails({ book }: BookDetailsProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
          <p className="text-xl text-muted-foreground mt-1">{book.author}</p>
        </div>
        <Link href={`/edit-book/${book.id}`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            {t.edit}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cover Image */}
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              {book.cover_image ? (
                <img
                  src={book.cover_image || "/placeholder.svg"}
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {book.rating && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="text-2xl font-bold">{book.rating}</span>
                <span className="text-muted-foreground">/5</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes do Livro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {book.publisher && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Editora
                  </p>
                  <p>{book.publisher}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Formato
                </p>
                <p>{book.format === "physical" ? t.physical : t.digital}</p>
              </div>
              {book.pages && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Páginas
                  </p>
                  <p>{book.pages}</p>
                </div>
              )}
              {book.release_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Data de Lançamento
                  </p>
                  <p>
                    {new Date(book.release_date).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
              {book.start_reading_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Início da Leitura
                  </p>
                  <p>
                    {new Date(book.start_reading_date).toLocaleDateString(
                      locale,
                    )}
                  </p>
                </div>
              )}
              {book.finish_reading_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fim da Leitura
                  </p>
                  <p>
                    {new Date(book.finish_reading_date).toLocaleDateString(
                      locale,
                    )}
                  </p>
                </div>
              )}
              {book.would_read_again && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Voltaria a Ler?
                  </p>
                  <p>{t[book.would_read_again as keyof typeof t]}</p>
                </div>
              )}
              {book.would_recommend !== null &&
                book.would_recommend !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Recomendaria?
                    </p>
                    <p>{book.would_recommend ? t.yes : t.no}</p>
                  </div>
                )}
            </div>

            {book.genres && book.genres.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Géneros
                </p>
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {t[genre as keyof typeof t] || genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review */}
      {book.review && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Crítica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {book.review}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Characters */}
      {book.characters && book.characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {book.characters.map((character) => (
                <Badge key={character} variant="outline">
                  {character}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quotes */}
      {book.quotes && book.quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frases Marcantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {book.quotes.map((quote, index) => (
              <blockquote
                key={index}
                className="border-l-4 border-primary pl-4 italic text-muted-foreground"
              >
                "{quote}"
              </blockquote>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

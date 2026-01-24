"use client";

import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Edit,
  FileText,
  Star,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  BarChart3,
  Heart,
  ThumbsUp,
  Award,
  BookMarked,
  Sparkles,
  Quote,
  User,
  Building,
  Hash,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface BookDetailsProps {
  book: Book;
}

export function BookDetails({ book }: BookDetailsProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);

  // Calcular dias de leitura
  const calculateReadingDays = () => {
    if (book.start_reading_date && book.finish_reading_date) {
      const start = new Date(book.start_reading_date);
      const finish = new Date(book.finish_reading_date);
      const diffTime = Math.abs(finish.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const readingDays = calculateReadingDays();

  // Status de leitura
  const getReadingStatus = () => {
    if (book.finish_reading_date)
      return { text: t.ended, color: "bg-success", icon: CheckCircle };
    if (book.start_reading_date)
      return { text: t.reading, color: "bg-warning", icon: Clock };
    return { text: t.notStarted, color: "bg-muted", icon: BookOpen };
  };

  const readingStatus = getReadingStatus();

  // Calcular progresso (se estiver a ler)
  const calculateProgress = () => {
    if (!book.start_reading_date || book.finish_reading_date) return 100;
    // Simulação - pode ser substituído por lógica real
    return Math.floor(Math.random() * 30) + 20;
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho com navegação */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/books">
          <Button variant="ghost" className="gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            {t.backToBooks}
          </Button>
        </Link>
        <Link href={`/edit-book/${book.id}`}>
          <Button className="gap-2 cursor-pointer">
            <Edit className="h-4 w-4" />
            {t.edit}
          </Button>
        </Link>
      </div>

      {/* Cabeçalho principal */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex flex-col md:flex-row gap-8">
          {/* Capa do livro */}
          <div className="shrink-0">
            <div className="relative aspect-3/4 w-64 rounded-xl overflow-hidden shadow-2xl border-4 border-background">
              {book.cover_image ? (
                <img
                  src={book.cover_image || "/placeholder.svg"}
                  alt={book.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-linear-to-br from-muted to-muted/50">
                  <BookOpen className="h-20 w-20 text-muted-foreground/50" />
                </div>
              )}
              {/* Badge de status */}
              <div className="absolute top-4 right-4">
                <Badge
                  className={`${readingStatus.color} text-white gap-1 px-3 py-1`}
                >
                  <readingStatus.icon className="h-3 w-3" />
                  {readingStatus.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações principais */}
          <div className="flex-1 space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">
                {book.format === "physical" ? t.physical : t.digital}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {book.title}
              </h1>
              <p className="text-2xl text-muted-foreground">{book.author}</p>
            </div>

            {/* Rating */}
            {book.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(book.rating!)
                          ? "fill-primary text-primary"
                          : i < book.rating!
                            ? "fill-primary/50 text-primary/50"
                            : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{book.rating}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </div>
            )}

            {/* Progresso de leitura */}
            {(book.start_reading_date || progress < 100) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{t.readingProgress}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Ações rápidas */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="outline" className="gap-2">
                <Heart className="h-4 w-4" />
                {t.addToFavorites}
              </Button>
              <Button variant="outline" className="gap-2">
                <BookMarked className="h-4 w-4" />
                {t.markAsRead}
              </Button>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t.share}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para organização */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="details" className="gap-2 cursor-pointer">
            <BookOpen className="h-4 w-4" />
            {t.details}
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            {t.review}
          </TabsTrigger>
          <TabsTrigger value="characters" className="gap-2 cursor-pointer">
            <Users className="h-4 w-4" />
            {t.characters}
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2 cursor-pointer">
            <Quote className="h-4 w-4" />
            {t.quotes}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Detalhes */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Informações do livro */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" />
                  {t.bookInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {book.publisher && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {t.publisher}
                      </div>
                      <span className="font-medium">{book.publisher}</span>
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        {t.pages}
                      </div>
                      <span className="font-medium">{book.pages}</span>
                    </div>
                  )}
                  {book.release_date && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {t.releaseDate}
                      </div>
                      <span className="font-medium">
                        {new Date(book.release_date).toLocaleDateString(
                          locale,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t.genres}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {book.genres?.map((genre) => (
                      <Badge key={genre} variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {t[genre as keyof typeof t] || genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datas de leitura */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  {t.readingDates}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {book.start_reading_date && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t.startDate}
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-success" />
                      <span className="font-medium">
                        {new Date(book.start_reading_date).toLocaleDateString(
                          locale,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {book.finish_reading_date && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t.finishDate}
                    </p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="font-medium">
                        {new Date(book.finish_reading_date).toLocaleDateString(
                          locale,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Avaliação pessoal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  {t.personalEvaluation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {book.would_read_again && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t.wouldReadAgain}
                    </p>
                    <div className="flex items-center gap-2">
                      <Heart
                        className={`h-4 w-4 ${
                          book.would_read_again === "yes"
                            ? "text-success"
                            : book.would_read_again === "no"
                              ? "text-destructive"
                              : "text-warning"
                        }`}
                      />
                      <span className="font-medium capitalize">
                        {t[book.would_read_again as keyof typeof t]}
                      </span>
                    </div>
                  </div>
                )}
                {book.would_recommend !== null &&
                  book.would_recommend !== undefined && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t.wouldRecommend}
                      </p>
                      <div className="flex items-center gap-2">
                        <ThumbsUp
                          className={`h-4 w-4 ${book.would_recommend ? "text-success" : "text-destructive"}`}
                        />
                        <span className="font-medium">
                          {book.would_recommend ? t.yes : t.no}
                        </span>
                      </div>
                    </div>
                  )}
                {book.rating && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4" />
                        {t.yourRating}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold">
                          {book.rating}
                        </span>
                        <span className="text-muted-foreground">/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Review */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.review}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {book.review ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="bg-muted/30 rounded-lg p-6 border">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {book.review}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noReview}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t.addReviewPrompt}
                  </p>
                  <Link href={`/edit-book/${book.id}`}>
                    <Button className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      {t.addReview}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Characters */}
        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t.characters}{" "}
                {book.characters && `(${book.characters.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {book.characters && book.characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {book.characters.map((character, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{character}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t.character} #{index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noCharacters}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t.addCharactersPrompt}
                  </p>
                  <Link href={`/edit-book/${book.id}`}>
                    <Button className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      {t.addCharacters}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Quotes */}
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                {t.memorableQuotes} {book.quotes && `(${book.quotes.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {book.quotes && book.quotes.length > 0 ? (
                <div className="space-y-6">
                  {book.quotes.map((quote, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute -left-4 top-0 h-full w-1 bg-primary/20 rounded-full group-hover:bg-primary/40 transition-colors"></div>
                      <blockquote className="border-l-4 border-primary pl-6 py-4 bg-linear-to-r from-primary/5 to-transparent rounded-r-lg">
                        <p className="text-lg italic text-foreground leading-relaxed">
                          "{quote}"
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-muted-foreground">
                            {t.quote} #{index + 1}
                          </span>
                          {/*Implementar no Futuro o sistema de partilhar uma frase marcante*/}
                          {/* <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="h-3 w-3" />
                            {t.shareQuote}
                          </Button> */}
                        </div>
                      </blockquote>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Quote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t.noQuotes}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t.addQuotesPrompt}
                  </p>
                  <Link href={`/edit-book/${book.id}`}>
                    <Button className="gap-2 cursor-pointer">
                      <Edit className="h-4 w-4" />
                      {t.addQuotes}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t.status}
                </p>
                <p className="text-xl font-bold mt-1">{readingStatus.text}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <readingStatus.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {book.rating && (
          <Card className="bg-success/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.rating}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold">{book.rating}</span>
                    <span className="text-muted-foreground">/5</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-success fill-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {book.pages && (
          <Card className="bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t.pages}
                  </p>
                  <p className="text-xl font-bold mt-1">{book.pages}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Futuro */}
        {/* {readingDays && (
          <Card className="bg-info/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.readingTime}</p>
                  <p className="text-xl font-bold mt-1">{readingDays} {t.days}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}

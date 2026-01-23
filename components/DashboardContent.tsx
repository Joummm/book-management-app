"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  books: Book[];
}

export function DashboardContent({ books }: DashboardContentProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);

  // Calculate statistics
  const totalBooks = books.length;
  const ratedBooks = books.filter((b) => b.rating);
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) /
        ratedBooks.length
      : 0;

  // Books per year
  const booksByYear = books.reduce(
    (acc, book) => {
      const year = new Date(book.created_at).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const currentYear = new Date().getFullYear();
  const booksThisYear = booksByYear[currentYear] || 0;

  // Reading progress - CORRIGIDO: usando os nomes corretos das propriedades
  const readingBooks = books.filter(
    (b) => b.start_reading_date && !b.finish_reading_date,
  ).length;
  const completedBooks = books.filter((b) => b.finish_reading_date).length;
  const completionRate =
    totalBooks > 0 ? ((completedBooks / totalBooks) * 100).toFixed(0) : 0;

  // Top genres
  const genreCount = books.reduce(
    (acc, book) => {
      book.genres?.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const chartData = Object.entries(booksByYear)
    .map(([year, count]) => ({
      year,
      count,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  // Last 5 added books
  const lastBooks = books.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.dashboard}</h1>
          <p className="text-muted-foreground">{t.overview}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/add-book">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              {t.addBook}
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t.totalBooks}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              {t.booksInCollection}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t.averageRating}
              </CardTitle>
              <Star className="h-4 w-4 text-secondary fill-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {ratedBooks.length > 0
                ? t.fromRated.replace("{count}", ratedBooks.length.toString())
                : t.noRatings}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t.reading}</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingBooks}</div>
            <p className="text-xs text-muted-foreground">{t.activeBooks}</p>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t.completion}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedBooks + " "}
              {t.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Insights Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Yearly Overview Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.booksPerYear}</CardTitle>
                <CardDescription>{t.yearlyOverview}</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="year"
                    className="text-xs"
                    label={{
                      value: t.year,
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    className="text-xs"
                    label={{
                      value: t.books,
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} ${t.books}`, t.quantity]}
                    labelFormatter={(label) => `${t.year}: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "calc(var(--radius) - 2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    name={t.books}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-75 flex-col items-center justify-center text-muted-foreground gap-3">
                <Calendar className="h-12 w-12 opacity-50" />
                <div className="text-center">
                  <p className="font-medium">{t.noHistoricalData}</p>
                  <p className="text-sm">{t.addBooksForStats}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card>
          <CardHeader>
            <CardTitle>{t.insights}</CardTitle>
            <CardDescription>{t.collectionStatistics}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Year Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{currentYear}</span>
                <span className="text-sm font-medium">
                  {booksThisYear} {t.books}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(booksThisYear * 10, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {booksThisYear > 0
                  ? t.booksAddedThisYear.replace(
                      "{count}",
                      booksThisYear.toString(),
                    )
                  : t.noBooksThisYear}
              </p>
            </div>

            {/* Top Genres */}
            {topGenres.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t.topGenres}</h4>
                <div className="space-y-2">
                  {topGenres.map(([genre, count]) => (
                    <div
                      key={genre}
                      className="flex items-center justify-between"
                    >
                      <Badge variant="secondary" className="font-normal">
                        {t[genre as keyof typeof t] || genre}
                      </Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-medium">{t.quickActions}</h4>
              <div className="flex flex-col gap-2">
                <Link href="/books">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t.viewAllBooks}
                  </Button>
                </Link>
                <Link href="/add-book">
                  <Button
                    variant="default"
                    className="w-full justify-start gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {t.addNewBook}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added Books */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.lastAddedBooks}</CardTitle>
              <CardDescription>{t.recentlyAdded}</CardDescription>
            </div>
            <Link href="/books">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 cursor-pointer"
              >
                {t.viewAll}
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {totalBooks}
                </span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {lastBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {lastBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="group relative flex flex-col rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md h-full">
                    <div className="aspect-3/4 w-full overflow-hidden rounded-lg bg-muted mb-4">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image || "/placeholder.svg"}
                          alt={book.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium leading-tight line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {book.author}
                      </p>
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-sm font-medium">
                            {book.rating}
                          </span>
                        </div>
                      )}
                      {book.genres && book.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 relative group">
                          {book.genres.slice(0, 2).map((genre) => (
                            <Badge
                              key={genre}
                              variant="outline"
                              className="text-xs"
                            >
                              {genre.charAt(0).toUpperCase() +
                                genre.slice(1).toLowerCase()}
                            </Badge>
                          ))}
                          {book.genres.length > 2 && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                +{book.genres.length - 2}
                              </Badge>
                              <div className="direction-alternate bottom-full left-0 mb-2 hidden group-hover:block z-50">
                                <div className="bg-popover text-popover-foreground rounded-md border shadow-md p-2 text-xs max-w-xs">
                                  <div className="font-medium mb-1">
                                    Outros gêneros:
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {book.genres.slice(2).map((genre) => (
                                      <span
                                        key={genre}
                                        className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                                      >
                                        {genre.charAt(0).toUpperCase() +
                                          genre.slice(1).toLowerCase()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t.emptyCollection}</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t.startBuilding}
              </p>
              <Link href="/add-book">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t.addFirstBook}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

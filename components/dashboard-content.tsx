"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/contexts/app-context"
import { getTranslations } from "@/lib/i18n"
import type { Book } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BookOpen, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

interface DashboardContentProps {
  books: Book[]
}

export function DashboardContent({ books }: DashboardContentProps) {
  const { locale } = useApp()
  const t = getTranslations(locale)

  // Calculate statistics
  const totalBooks = books.length
  const averageRating =
    books.filter((b) => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / books.filter((b) => b.rating).length ||
    0

  // Books per year
  const booksByYear = books.reduce(
    (acc, book) => {
      const year = new Date(book.created_at).getFullYear()
      acc[year] = (acc[year] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const chartData = Object.entries(booksByYear)
    .map(([year, count]) => ({
      year,
      count,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year))

  // Last 5 added books
  const lastBooks = books.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard}</h1>
        <p className="text-muted-foreground">Visão geral da sua coleção de livros</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.totalBooks}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">livros na sua coleção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.averageRating}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">de 5 estrelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Este Ano</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booksByYear[new Date().getFullYear()] || 0}</div>
            <p className="text-xs text-muted-foreground">livros adicionados</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.booksPerYear}</CardTitle>
          <CardDescription>Histórico de livros adicionados por ano</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Added Books */}
      <Card>
        <CardHeader>
          <CardTitle>{t.lastAddedBooks}</CardTitle>
          <CardDescription>Os 5 livros mais recentes da sua coleção</CardDescription>
        </CardHeader>
        <CardContent>
          {lastBooks.length > 0 ? (
            <div className="space-y-4">
              {lastBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex h-16 w-12 items-center justify-center rounded bg-muted">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image || "/placeholder.svg"}
                          alt={book.title}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    {book.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">{book.rating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <p>Nenhum livro adicionado ainda</p>
                <Link href="/add-book" className="text-sm text-primary hover:underline">
                  Adicionar seu primeiro livro
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useApp } from "@/lib/contexts/app-context"
import { getTranslations } from "@/lib/i18n"
import type { Book } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookCard } from "@/components/book-card"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { GENRES } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"

interface BooksListContentProps {
  books: Book[]
}

export function BooksListContent({ books }: BooksListContentProps) {
  const { locale } = useApp()
  const t = getTranslations(locale)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("latest")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Filter and sort books
  let filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGenre = selectedGenres.length === 0 || selectedGenres.some((genre) => book.genres?.includes(genre))

    return matchesSearch && matchesGenre
  })

  // Sort books
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "aToZ":
        return a.title.localeCompare(b.title)
      case "zToA":
        return b.title.localeCompare(a.title)
      case "highestRated":
        return (b.rating || 0) - (a.rating || 0)
      case "lowestRated":
        return (a.rating || 0) - (b.rating || 0)
      default:
        return 0
    }
  })

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.books}</h1>
        <p className="text-muted-foreground">
          {filteredBooks.length} {filteredBooks.length === 1 ? "livro" : "livros"} encontrados
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{t.latest}</SelectItem>
            <SelectItem value="oldest">{t.oldest}</SelectItem>
            <SelectItem value="aToZ">{t.aToZ}</SelectItem>
            <SelectItem value="zToA">{t.zToA}</SelectItem>
            <SelectItem value="highestRated">{t.highestRated}</SelectItem>
            <SelectItem value="lowestRated">{t.lowestRated}</SelectItem>
          </SelectContent>
        </Select>

        {/* Genre Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {t.filter}
              {selectedGenres.length > 0 && ` (${selectedGenres.length})`}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtrar por Género</SheetTitle>
              <SheetDescription>Selecione os géneros que deseja ver</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                {GENRES.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${genre}`}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => handleGenreToggle(genre)}
                    />
                    <Label htmlFor={`filter-${genre}`} className="text-sm font-normal cursor-pointer">
                      {t[genre as keyof typeof t] || genre}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedGenres([])}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Nenhum livro encontrado</p>
          {searchQuery && <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros ou busca</p>}
        </div>
      )}
    </div>
  )
}

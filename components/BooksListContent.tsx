"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCard } from "@/components/BookCard";
import {
  Search,
  Grid2x2,
  List,
  X,
  Filter,
  Star,
  TrendingUp,
  Clock,
  BookOpen,
  Plus,
  Heart,
  ThumbsUp,
  LayoutGrid,
  LibraryBig,
  History,
  Maximize2,
  CalendarDays
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { GENRES } from "@/lib/types";

import { saveBooksToIndexedDB, getBooksFromIndexedDB } from "@/lib/db/idb";
import { WifiOff } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface BooksListContentProps {
  books: Book[];
}

// Interface local estendida para incluir propriedades faltantes
interface ExtendedBook extends Omit<Book, "description" | "read_count"> {
  description?: string;
  read_count?: number;
}

import { useBooks } from "@/hooks/use-books";

export function BooksListContent({ books: initialBooks }: BooksListContentProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  
  const { data: booksData } = useBooks();
  const [localBooks, setLocalBooks] = useState<Book[]>(booksData || initialBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  // Sync with hook data
  useEffect(() => {
    if (booksData) {
      setLocalBooks(booksData);
      saveBooksToIndexedDB(booksData);
    }
  }, [booksData]);

  // Sync local books when props change or load from IDB if offline
  useEffect(() => {
    const handleOnlineStatus = async () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      
      if (offline && (!booksData && (!initialBooks || initialBooks.length === 0))) {
        // Load from IndexedDB if offline and no books provided
        const cachedBooks = await getBooksFromIndexedDB();
        if (cachedBooks.length > 0) {
          setLocalBooks(cachedBooks);
        }
      }
    };

    handleOnlineStatus();
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [initialBooks, booksData]);

  const handleDeleteBook = (bookId: string) => {
    setLocalBooks((prev) => prev.filter((b) => b.id !== bookId));
  };
  const [sortBy, setSortBy] = useState<string>("latest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [wouldReadAgainFilter, setWouldReadAgainFilter] =
    useState<string>("all");
  const [wouldRecommendFilter, setWouldRecommendFilter] =
    useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "bookshelf" | "timeline" | "focus">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Cast books to ExtendedBook type for compatibility
  const extendedBooks = localBooks as ExtendedBook[];

  // Calculate statistics for quick stats
  const totalBooks = extendedBooks.length;
  const readingBooks = extendedBooks.filter(
    (b) => b.start_reading_date && !b.finish_reading_date,
  ).length;
  const completedBooks = extendedBooks.filter(
    (b) => b.finish_reading_date,
  ).length;
  const notStartedBooks = extendedBooks.filter(
    (b) => !b.start_reading_date && !b.finish_reading_date,
  ).length;
  const ratedBooksCount = extendedBooks.filter((b) => b.rating !== null && b.rating !== undefined).length;
  const averageRating =
    ratedBooksCount > 0
      ? extendedBooks.reduce((sum, b) => sum + Number(b.rating || 0), 0) / ratedBooksCount
      : 0;

  // Filter and sort books
  let filteredBooks = extendedBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description &&
        book.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenres.length === 0 ||
      selectedGenres.some((genre) => book.genres?.includes(genre));

    const matchesWouldReadAgain =
      wouldReadAgainFilter === "all" ||
      book.would_read_again === wouldReadAgainFilter;

    const matchesWouldRecommend =
      wouldRecommendFilter === "all" ||
      (wouldRecommendFilter === "recommended" &&
        book.would_recommend === "yes") ||
      (wouldRecommendFilter === "not_recommended" &&
        book.would_recommend === "no") ||
      (wouldRecommendFilter === "maybe" &&
        book.would_recommend === "maybe");

    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "reading" && book.start_reading_date && !book.finish_reading_date) ||
      (statusFilter === "completed" && book.finish_reading_date) ||
      (statusFilter === "not_started" && !book.start_reading_date);

    const matchesFormat =
      formatFilter === "all" || book.format === formatFilter;

    const matchesRating =
      ratingFilter === "all" || (book.rating !== null && book.rating !== undefined && book.rating >= parseInt(ratingFilter));

    return (
      matchesSearch &&
      matchesGenre &&
      matchesWouldReadAgain &&
      matchesWouldRecommend &&
      matchesStatus &&
      matchesFormat &&
      matchesRating
    );
  });

  // Sort books
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "aToZ":
        return a.title.localeCompare(b.title);
      case "zToA":
        return b.title.localeCompare(a.title);
      case "highestRated":
        return (b.rating || 0) - (a.rating || 0);
      case "lowestRated":
        return (a.rating || 0) - (b.rating || 0);
      case "mostRead":
        return (b.read_count || 0) - (a.read_count || 0);
      case "recentlyRead":
        const dateA = b.finish_reading_date
          ? new Date(b.finish_reading_date).getTime()
          : 0;
        const dateB = a.finish_reading_date
          ? new Date(a.finish_reading_date).getTime()
          : 0;
        return dateA - dateB;
      default:
        return 0;
    }
  });

  // Virtualization logic
  const [columns, setColumns] = useState(1);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (viewMode === "list" || viewMode === "timeline" || viewMode === "focus") {
        setColumns(1);
        return;
      }
      if (viewMode === "bookshelf") {
        setColumns(window.innerWidth >= 1024 ? 10 : 5);
        return;
      }
      if (window.innerWidth >= 1280) setColumns(4); // xl
      else if (window.innerWidth >= 1024) setColumns(3); // lg
      else if (window.innerWidth >= 640) setColumns(2); // sm
      else setColumns(1);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [viewMode]);

  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < filteredBooks.length; i += columns) {
      r.push(filteredBooks.slice(i, i + columns));
    }
    return r;
  }, [filteredBooks, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => {
      if (viewMode === "grid") return 480;
      if (viewMode === "bookshelf") return 220;
      if (viewMode === "list") return 180;
      if (viewMode === "timeline") return 250;
      if (viewMode === "focus") return 600;
      return 180;
    },
    overscan: 5,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setWouldReadAgainFilter("all");
    setWouldRecommendFilter("all");
    setStatusFilter("all");
    setFormatFilter("all");
    setRatingFilter("all");
    setSortBy("latest");
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  // Reset virtualizer when filters change
  useEffect(() => {
    virtualizer.scrollToIndex(0);
  }, [
    searchQuery,
    selectedGenres,
    sortBy,
    wouldReadAgainFilter,
    wouldRecommendFilter,
    statusFilter,
    formatFilter,
    ratingFilter,
  ]);

  // Completion percentage
  const completionPct = totalBooks > 0 ? Math.round((completedBooks / totalBooks) * 100) : 0;
  const favoritesCount = extendedBooks.filter((b) => b.is_favorite).length;

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Biblioteca</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t.books}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{t.manageCollection}</p>
          </div>
          <Link href="/add-book">
            <Button className="gap-2 cursor-pointer shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              {t.addBook}
            </Button>
          </Link>
        </div>

        {isOffline && (
          <div className="mt-4 flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-medium border border-destructive/20">
            <WifiOff className="h-4 w-4" />
            Modo Offline: A apresentar dados gravados localmente.
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-background/70 backdrop-blur-sm border border-primary/20 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.totalBooks}</span>
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold">{totalBooks}</div>
            <div className="text-[11px] text-muted-foreground">{favoritesCount} favorito{favoritesCount !== 1 ? 's' : ''}</div>
          </div>

          <div className="bg-background/70 backdrop-blur-sm border border-amber-500/25 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">A Ler</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-500">{readingBooks}</div>
            <div className="text-[11px] text-muted-foreground">em progresso</div>
          </div>

          <div className="bg-background/70 backdrop-blur-sm border border-emerald-500/25 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.completed}</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-500">{completedBooks}</div>
            <div className="text-[11px] text-muted-foreground">{completionPct}% da biblioteca</div>
          </div>

          <div className="bg-background/70 backdrop-blur-sm border border-amber-400/25 rounded-xl p-3.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.averageRating}</span>
              <div className="h-7 w-7 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-400">{averageRating.toFixed(1)}</div>
            <div className="text-[11px] text-muted-foreground">{ratedBooksCount} avaliado{ratedBooksCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        {totalBooks > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progresso de Leitura</span>
              <span className="font-semibold text-foreground">{completionPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 p-4 bg-background border border-border/40 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Buscar por título, autor ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background border-border/40 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 cursor-pointer" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40 mr-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`cursor-pointer h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"}`}
                title={t.gridView}
              >
                <Grid2x2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={`cursor-pointer h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"}`}
                title={t.listView}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "bookshelf" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("bookshelf")}
                className={`cursor-pointer h-8 w-8 rounded-lg ${viewMode === "bookshelf" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"}`}
                title="Vista Prateleira"
              >
                <LibraryBig className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("timeline")}
                className={`cursor-pointer h-8 w-8 rounded-lg ${viewMode === "timeline" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"}`}
                title="Vista Timeline"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "focus" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("focus")}
                className={`cursor-pointer h-8 w-8 rounded-lg ${viewMode === "focus" ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"}`}
                title="Modo Foco"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-10 bg-background border-border/40 rounded-xl cursor-pointer">
                <SelectValue placeholder="Estado de Leitura" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="cursor-pointer">
                  <span className="flex items-center justify-between gap-3 w-full">
                    Todos os Estados
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 min-w-5 font-semibold">{totalBooks}</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="reading" className="cursor-pointer">
                  <span className="flex items-center justify-between gap-3 w-full">
                    A Ler
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 min-w-5 font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">{readingBooks}</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="completed" className="cursor-pointer">
                  <span className="flex items-center justify-between gap-3 w-full">
                    Lidos
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 min-w-5 font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">{completedBooks}</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="not_started" className="cursor-pointer">
                  <span className="flex items-center justify-between gap-3 w-full">
                    Não Iniciados
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 min-w-5 font-semibold">{notStartedBooks}</Badge>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-10 bg-background border-border/40 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="latest" className="cursor-pointer">{t.latest}</SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">{t.oldest}</SelectItem>
                <SelectItem value="aToZ" className="cursor-pointer">{t.aToZ}</SelectItem>
                <SelectItem value="zToA" className="cursor-pointer">{t.zToA}</SelectItem>
                <SelectItem value="highestRated" className="cursor-pointer">{t.highestRated}</SelectItem>
                <SelectItem value="lowestRated" className="cursor-pointer">{t.lowestRated}</SelectItem>
                <SelectItem value="mostRead" className="cursor-pointer">{t.mostRead}</SelectItem>
                <SelectItem value="recentlyRead" className="cursor-pointer">{t.recentlyRead}</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button & Sheet Wrapper */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 bg-background border-border/40 rounded-xl cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Filtrar
                  {(selectedGenres.length > 0 ||
                    wouldReadAgainFilter !== "all" ||
                    wouldRecommendFilter !== "all" ||
                    statusFilter !== "all" ||
                    formatFilter !== "all" ||
                    ratingFilter !== "all") && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 bg-primary/10 text-primary">
                      {selectedGenres.length +
                        (wouldReadAgainFilter !== "all" ? 1 : 0) +
                        (wouldRecommendFilter !== "all" ? 1 : 0) +
                        (statusFilter !== "all" ? 1 : 0) +
                        (formatFilter !== "all" ? 1 : 0) +
                        (ratingFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[420px] overflow-y-auto p-6">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    {t.filters}
                  </SheetTitle>
                  <SheetDescription className="text-xs">{t.applyFilters}</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-5">
                  {/* Genres */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.genres}</h3>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleGenreToggle(genre)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                            selectedGenres.includes(genre)
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {t[genre as keyof typeof t] || genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Format */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Formato</h3>
                    <div className="flex gap-2">
                      {[{v:"all",l:"Todos"},{v:"physical",l:"Físico"},{v:"digital",l:"Digital"}].map(({v,l}) => (
                        <button key={v} onClick={() => setFormatFilter(v)}
                          className={`flex-1 text-xs py-2 rounded-xl border font-medium transition-all cursor-pointer ${
                            formatFilter === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/40"
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Would Read Again */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.wouldReadAgain}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {[{v:"all",l:t.all},{v:"yes",l:t.yes},{v:"no",l:t.no},{v:"maybe",l:t.maybe}].map(({v,l}) => (
                        <button key={v} onClick={() => setWouldReadAgainFilter(v)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                            wouldReadAgainFilter === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/40"
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Would Recommend */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.wouldRecommend}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {[{v:"all",l:t.all},{v:"recommended",l:t.yes},{v:"not_recommended",l:t.no},{v:"maybe",l:t.maybe}].map(({v,l}) => (
                        <button key={v} onClick={() => setWouldRecommendFilter(v)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer ${
                            wouldRecommendFilter === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/40"
                          }`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2 pt-1">
                    <Button variant="outline" className="w-full cursor-pointer" onClick={handleClearFilters}
                      disabled={selectedGenres.length === 0 && wouldReadAgainFilter === "all" && wouldRecommendFilter === "all" && formatFilter === "all" && ratingFilter === "all"}>
                      {t.clearAllFilters}
                    </Button>
                    <Button variant="default" className="w-full cursor-pointer" onClick={handleApplyFilters}>
                      {t.applyFiltersBtn}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters Summary underneath the main bar if any active */}
        {(selectedGenres.length > 0 || wouldReadAgainFilter !== "all" || wouldRecommendFilter !== "all" || statusFilter !== "all" || formatFilter !== "all" || ratingFilter !== "all") && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedGenres.map((genre) => (
              <Badge key={genre} variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80 bg-muted/60" onClick={() => handleGenreToggle(genre)}>
                {t[genre as keyof typeof t] || genre} <X className="h-3 w-3 " />
              </Badge>
            ))}
            {wouldReadAgainFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80 bg-muted/60" onClick={() => setWouldReadAgainFilter("all")}>
                {wouldReadAgainFilter === "yes" && t.yes}
                {wouldReadAgainFilter === "no" && t.no}
                {wouldReadAgainFilter === "maybe" && t.maybe}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {wouldRecommendFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80 bg-muted/60" onClick={() => setWouldRecommendFilter("all")}>
                {wouldRecommendFilter === "recommended" && t.recommended}
                {wouldRecommendFilter === "not_recommended" && t.notRecommended}
                {wouldRecommendFilter === "maybe" && t.maybe}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80 bg-muted/60" onClick={() => setStatusFilter("all")}>
                {statusFilter === "reading" && "A Ler"}
                {statusFilter === "completed" && "Lido"}
                {statusFilter === "not_started" && "Não Iniciado"}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {formatFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80 bg-muted/60" onClick={() => setFormatFilter("all")}>
                {formatFilter === "physical" && "Físico"}
                {formatFilter === "digital" && "Digital"}
                <X className="h-3 w-3" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-full ml-1">
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          A mostrar{" "}
          <span className="font-semibold text-foreground">{filteredBooks.length}</span>{" "}
          livro{filteredBooks.length !== 1 ? "s" : ""}
          {searchQuery && (
            <> para "<span className="font-semibold text-foreground">{searchQuery}</span>"</>
          )}
        </p>
        <span className="text-xs text-muted-foreground">{totalBooks} no total</span>
      </div>

      {/* Books Grid/List with Virtualization */}
      {filteredBooks.length > 0 ? (
        <div ref={parentRef} className="w-full">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                }}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-3"
                      : viewMode === "bookshelf"
                      ? "flex flex-wrap gap-1 items-end justify-center py-10 px-4 bg-muted/20 rounded-3xl border border-border/40"
                      : "space-y-4 py-2"
                  }
                >
                  {rows[virtualRow.index].map((book) => {
                    if (viewMode === "focus") {
                      return (
                        <div key={book.id} className="max-w-4xl mx-auto py-10 px-4">
                          <div className="grid md:grid-cols-2 gap-8 items-center bg-card p-8 rounded-3xl border border-primary/20 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5 -z-0">
                               <BookOpen className="h-64 w-64 rotate-12" />
                            </div>
                            <div className="relative z-10 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                               {book.cover_image ? (
                                 <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full bg-muted flex items-center justify-center">
                                   <BookOpen className="h-20 w-20 text-muted-foreground/30" />
                                 </div>
                               )}
                            </div>
                            <div className="relative z-10 space-y-6">
                               <div>
                                 <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-0 uppercase tracking-widest text-[10px]">A ler agora</Badge>
                                 <h2 className="text-4xl font-bold font-serif leading-tight">{book.title}</h2>
                                 <p className="text-xl text-muted-foreground font-medium mt-2">{book.author}</p>
                               </div>
                               
                               <div className="space-y-2">
                                  <div className="flex justify-between text-sm font-bold">
                                     <span className="text-muted-foreground uppercase tracking-tighter">Progresso</span>
                                     <span className="text-primary">{book.pages ? "Em curso" : "N/A"}</span>
                                  </div>
                                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                     <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "65%" }} />
                                  </div>
                               </div>

                               <div className="flex gap-4">
                                  <Link href={`/books/${book.id}`} className="flex-1">
                                    <Button className="w-full h-12 rounded-xl text-base font-bold shadow-xl shadow-primary/20">Continuar Leitura</Button>
                                  </Link>
                                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setViewMode("grid")}><X className="h-5 w-5" /></Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    if (viewMode === "timeline") {
                      return (
                        <div key={book.id} className="relative pl-12 pb-12 group">
                          {/* Timeline Line */}
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/60 group-last:bottom-full" />
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                             <CalendarDays className="h-4 w-4 text-primary" />
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-6 bg-card/40 hover:bg-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300">
                             <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-md">
                                {book.cover_image ? (
                                  <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                                  </div>
                                )}
                             </div>
                             <div className="space-y-2">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                  {book.finish_reading_date ? format(new Date(book.finish_reading_date), "dd 'de' MMMM, yyyy", { locale: pt }) : "Data desconhecida"}
                                </p>
                                <h3 className="text-xl font-bold">{book.title}</h3>
                                <p className="text-muted-foreground">{book.author}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                   <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                   <span className="font-bold text-amber-600">{book.rating ? Number(book.rating).toFixed(1) : "N/A"}</span>
                                </div>
                             </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <BookCard
                        key={book.id}
                        book={book}
                        layout={viewMode === "bookshelf" ? "bookshelf" : viewMode}
                        onDelete={() => handleDeleteBook(book.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10">
          <div className="h-20 w-20 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-5">
            <BookOpen className="h-9 w-9 text-primary/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || selectedGenres.length > 0 || statusFilter !== "all" || formatFilter !== "all" || ratingFilter !== "all"
              ? "Nenhum livro encontrado"
              : "A biblioteca está vazia"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">
            {searchQuery
              ? `Sem resultados para "${searchQuery}". Tenta outro termo.`
              : selectedGenres.length > 0 || statusFilter !== "all" || formatFilter !== "all" || ratingFilter !== "all"
              ? "Nenhum livro corresponde aos filtros selecionados."
              : "Ainda não adicionaste nenhum livro. Começa a construir a tua biblioteca!"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {(searchQuery || selectedGenres.length > 0 || wouldReadAgainFilter !== "all" || wouldRecommendFilter !== "all" || statusFilter !== "all" || formatFilter !== "all" || ratingFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters} className="gap-2 cursor-pointer">
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            )}
            <Link href="/add-book">
              <Button className="gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                Adicionar Livro
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

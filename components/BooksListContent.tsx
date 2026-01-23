"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
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
import { BookCard } from "@/components/book-card";
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
import { GENRES } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BooksListContentProps {
  books: Book[];
}

// Interface local estendida para incluir propriedades faltantes
interface ExtendedBook extends Omit<Book, "description" | "read_count"> {
  description?: string;
  read_count?: number;
}

export function BooksListContent({ books }: BooksListContentProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [wouldReadAgainFilter, setWouldReadAgainFilter] =
    useState<string>("all");
  const [wouldRecommendFilter, setWouldRecommendFilter] =
    useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 12;

  // Cast books to ExtendedBook type for compatibility
  const extendedBooks = books as ExtendedBook[];

  // Calculate statistics for quick stats
  const totalBooks = extendedBooks.length;
  const readingBooks = extendedBooks.filter(
    (b) => b.start_reading_date && !b.finish_reading_date,
  ).length;
  const completedBooks = extendedBooks.filter(
    (b) => b.finish_reading_date,
  ).length;
  const ratedBooks = extendedBooks.filter((b) => b.rating).length;
  const averageRating =
    ratedBooks > 0
      ? extendedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks
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
        book.would_recommend === true) ||
      (wouldRecommendFilter === "not_recommended" &&
        book.would_recommend === false);

    return (
      matchesSearch &&
      matchesGenre &&
      matchesWouldReadAgain &&
      matchesWouldRecommend
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

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setWouldReadAgainFilter("all");
    setWouldRecommendFilter("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedGenres,
    sortBy,
    wouldReadAgainFilter,
    wouldRecommendFilter,
  ]);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.books}</h1>
            <p className="text-muted-foreground">{t.manageCollection}</p>
          </div>
          <Link href="/add-book">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              {t.addBook}
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.totalBooks}</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold mt-1">{totalBooks}</div>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.reading}</span>
              <Clock className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold mt-1">{readingBooks}</div>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.completed}</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold mt-1">{completedBooks}</div>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.averageRating}</span>
              <Star className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold mt-1">
              {averageRating.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 p-4 bg-card border rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 cursor-pointer" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="cursor-pointer"
              title={t.gridView}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="cursor-pointer"
              title={t.listView}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Active Filters */}
          <div className="flex-1 flex flex-wrap gap-2 min-h-10">
            {selectedGenres.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handleGenreToggle(genre)}
              >
                {t[genre as keyof typeof t] || genre}
                <X className="h-3 w-3 " />
              </Badge>
            ))}
            {wouldReadAgainFilter !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => setWouldReadAgainFilter("all")}
              >
                {wouldReadAgainFilter === "yes" && t.yes}
                {wouldReadAgainFilter === "no" && t.no}
                {wouldReadAgainFilter === "maybe" && t.maybe}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {wouldRecommendFilter !== "all" && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => setWouldRecommendFilter("all")}
              >
                {wouldRecommendFilter === "recommended" && t.recommended}
                {wouldRecommendFilter === "not_recommended" && t.notRecommended}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {(searchQuery ||
              selectedGenres.length > 0 ||
              wouldReadAgainFilter !== "all" ||
              wouldRecommendFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-12 px-2 text-xs cursor-pointer"
              >
                {t.clearAll}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-45 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">{t.latest}</SelectItem>
                  <SelectItem value="oldest">{t.oldest}</SelectItem>
                  <SelectItem value="aToZ">{t.aToZ}</SelectItem>
                  <SelectItem value="zToA">{t.zToA}</SelectItem>
                  <SelectItem value="highestRated">{t.highestRated}</SelectItem>
                  <SelectItem value="lowestRated">{t.lowestRated}</SelectItem>
                  <SelectItem value="mostRead">{t.mostRead}</SelectItem>
                  <SelectItem value="recentlyRead">{t.recentlyRead}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  {t.filter}
                  {(selectedGenres.length > 0 ||
                    wouldReadAgainFilter !== "all" ||
                    wouldRecommendFilter !== "all") && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 ">
                      {selectedGenres.length +
                        (wouldReadAgainFilter !== "all" ? 1 : 0) +
                        (wouldRecommendFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{t.filters}</SheetTitle>
                  <SheetDescription>{t.applyFilters}</SheetDescription>
                </SheetHeader>

                <div className="mt-2 space-y-6 ">
                  {/* Genres Filter */}
                  <div className="space-y-4 ml-5">
                    <h3 className="text-sm font-medium">{t.genres}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {GENRES.map((genre) => (
                        <div
                          key={genre}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            className="cursor-pointer"
                            id={`filter-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={() => handleGenreToggle(genre)}
                          />
                          <Label
                            htmlFor={`filter-${genre}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {t[genre as keyof typeof t] || genre}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Would Read Again Filter */}
                  <div className="space-y-4 ml-5">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">
                        {t.wouldReadAgain}
                      </h3>
                    </div>
                    <RadioGroup
                      value={wouldReadAgainFilter}
                      onValueChange={setWouldReadAgainFilter}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="all"
                          id="read-again-all"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="read-again-all"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.all}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="yes"
                          id="read-again-yes"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="read-again-yes"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.yes}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="no"
                          id="read-again-no"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="read-again-no"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.no}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="maybe"
                          id="read-again-maybe"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="read-again-maybe"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.maybe}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Would Recommend Filter */}
                  <div className="space-y-4 ml-5">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">
                        {t.wouldRecommend}
                      </h3>
                    </div>
                    <RadioGroup
                      value={wouldRecommendFilter}
                      onValueChange={setWouldRecommendFilter}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="all"
                          id="recommend-all"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="recommend-all"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.all}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="recommended"
                          id="recommend-yes"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="recommend-yes"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.yes}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="not_recommended"
                          id="recommend-no"
                          className="cursor-pointer"
                        />
                        <Label
                          htmlFor="recommend-no"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t.no}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={handleClearFilters}
                      disabled={
                        selectedGenres.length === 0 &&
                        wouldReadAgainFilter === "all" &&
                        wouldRecommendFilter === "all"
                      }
                    >
                      {t.clearAllFilters}
                    </Button>
                    <Button
                      variant="default"
                      className="w-full cursor-pointer"
                      onClick={handleApplyFilters}
                    >
                      {t.applyFiltersBtn}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.showing}{" "}
          <span className="font-semibold text-foreground">
            {paginatedBooks.length}
          </span>{" "}
          {t.of}{" "}
          <span className="font-semibold text-foreground">
            {filteredBooks.length}
          </span>{" "}
          {t.books}
          {searchQuery && (
            <>
              {" "}
              {t.for} "
              <span className="font-semibold text-foreground">
                {searchQuery}
              </span>
              "
            </>
          )}
        </p>
        {filteredBooks.length > itemsPerPage && (
          <p className="text-sm text-muted-foreground">
            {t.page}{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            {t.of}{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        )}
      </div>

      {/* Books Grid/List */}
      {filteredBooks.length > 0 ? (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-4"
            }
          >
            {paginatedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={currentPage === pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t.noBooksFound}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? t.noBooksForQuery.replace("{query}", searchQuery)
              : t.noBooksMatchFilters}
          </p>
          {(searchQuery ||
            selectedGenres.length > 0 ||
            wouldReadAgainFilter !== "all" ||
            wouldRecommendFilter !== "all") && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="gap-2 cursor-pointer"
            >
              <X className="h-4 w-4" />
              {t.clearFiltersSearch}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

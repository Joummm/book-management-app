"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Pencil,
  Star,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  Bookmark,
  MoreHorizontal,
  Plus,
  Loader2,
  FileText,
  Heart,
} from "lucide-react";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
  onDelete?: () => void;
  layout?: "grid" | "list" | "bookshelf";
}

export function BookCard({ book, onDelete, layout = "grid" }: BookCardProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allCollections, setAllCollections] = useState<any[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isFavorite, setIsFavorite] = useState(book.is_favorite ?? false);

  const fetchAllCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setAllCollections(data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const handleToggleCollection = async (collectionId: string) => {
    const isSelected = book.collections?.some((c: any) => c.id === collectionId);
    const method = isSelected ? "DELETE" : "POST";
    const url = isSelected
      ? `/api/books/${book.id}/collections?collectionId=${collectionId}`
      : `/api/books/${book.id}/collections`;

    try {
      const response = await fetch(url, {
        method,
        headers: isSelected ? {} : { "Content-Type": "application/json" },
        body: isSelected ? null : JSON.stringify({ collectionId }),
      });

      if (response.ok) {
        toast({ title: isSelected ? t.removeFromCollection : t.addToCollection });
        router.refresh();
      }
    } catch {
      toast({ title: t.error, description: t.anErrorOccurred, variant: "destructive" });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !isFavorite;
    setIsFavorite(newValue); // optimistic update
    try {
      const response = await fetch(`/api/books/${book.id}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: newValue }),
      });

      if (response.ok) {
        const { triggerHaptic } = await import("@/lib/haptics");
        triggerHaptic("success");
        router.refresh();
        toast({
          title: newValue ? "Adicionado aos Favoritos" : "Removido dos Favoritos",
        });
      } else {
        setIsFavorite(!newValue); // revert on error
      }
    } catch {
      setIsFavorite(!newValue); // revert on error
      toast({ title: t.error, variant: "destructive" });
    }
  };

  const getReadingStatus = () => {
    if (book.finish_reading_date) {
      return {
        text: t.ended,
        className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        icon: CheckCircle,
      };
    }
    if (book.start_reading_date) {
      return {
        text: t.reading,
        className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25",
        icon: Clock,
      };
    }
    return {
      text: t.notStarted,
      className: "bg-muted/80 text-muted-foreground border-border/60",
      icon: BookOpen,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
      if (response.ok) {
        toast({
          title: t.bookDeleted,
          description: `"${book.title}" ${t.wasRemovedFromCollection}`,
        });
        if (onDelete) onDelete();
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.anErrorOccurred,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isActionButton =
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.tagName === "BUTTON" ||
      (target.tagName === "A" && target.getAttribute("href")?.includes("/edit-book/"));
    if (!isActionButton) {
      router.push(`/books/${book.id}`);
    }
  };

  const readingStatus = getReadingStatus();
  const StatusIcon = readingStatus.icon;

  return (
    <>
      {layout === "bookshelf" ? (
        <div
          className="group cursor-pointer flex flex-col items-center justify-end h-40 w-10 hover:-translate-y-2 transition-all duration-300 relative"
          onClick={handleCardClick}
          title={book.title}
        >
          {/* Book Spine */}
          <div 
            className="w-full h-full rounded-sm border-x border-t border-white/20 shadow-lg relative overflow-hidden flex items-center justify-center"
            style={{ 
              backgroundColor: book.genres && book.genres.length > 0 
                ? `oklch(from var(--primary) l c h / ${0.5 + (book.title.length % 5) * 0.1})` 
                : 'var(--muted)',
              borderBottom: '4px solid rgba(0,0,0,0.3)'
            }}
          >
            {/* Spine Title (Vertical) */}
            <div className="rotate-90 whitespace-nowrap text-[8px] font-bold uppercase tracking-tighter text-white/90 drop-shadow-sm select-none">
              {book.title.length > 20 ? book.title.substring(0, 18) + "..." : book.title}
            </div>
            
            {/* Top Shine */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>
          
          {/* Hover Info Tooltip (Simulated) */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] p-2 rounded-lg shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none w-32 text-center font-bold">
            {book.title}
            <div className="text-muted-foreground font-medium mt-1">{book.author}</div>
          </div>
        </div>
      ) : layout === "grid" ? (
        <div
          className="group cursor-pointer h-full"
          onClick={handleCardClick}
        >
          <div className={`relative h-full flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${
            isFavorite 
              ? "border-rose-500/40 bg-rose-500/[0.02] shadow-lg shadow-rose-500/10" 
              : "border-border/50 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8"
          } hover:-translate-y-1`}>

            {/* Cover Image */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/60 overflow-hidden shrink-0">
            {/* Status badge */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <Badge className={`${readingStatus.className} text-[11px] font-medium px-2 py-0.5 border backdrop-blur-sm flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {readingStatus.text}
              </Badge>
            </div>

            {/* Format badge & Favorite */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-2">
              {book.format && (
                <Badge variant="outline" className="text-[10px] bg-background/70 backdrop-blur-sm border-border/60 px-1.5 py-0.5 font-medium">
                  {book.format === "physical" ? t.physical : t.digital}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full bg-background/50 backdrop-blur-md border border-border/50 transition-colors ${
                  book.is_favorite ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
              </Button>
            </div>

            {/* Image */}
            {book.cover_image ? (
              <img
                src={book.cover_image}
                alt={book.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40">
                <BookOpen className="h-12 w-12" />
                <span className="text-xs font-medium">Sem capa</span>
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-3.5 gap-2">
            {/* Title + Author */}
            <div>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-1">
                {book.title}
              </h3>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {book.authors && (book.authors as any[]).length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {(book.authors as any[]).map((author, index) => (
                      <span key={author.id}>
                        <Link
                          href={`/authors/${author.id}`}
                          className="hover:text-primary hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {author.name}
                        </Link>
                        {index < (book.authors as any[]).length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{book.author}</span>
                )}
              </div>
            </div>

            {/* Rating */}
            {book.rating ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(Number(book.rating) / 2)
                          ? "fill-amber-400 text-amber-400"
                          : i < Number(book.rating) / 2
                          ? "fill-amber-400/50 text-amber-400/50"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {Number(book.rating).toFixed(1)}
                </span>
              </div>
            ) : book.pages ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>{book.pages} pág.</span>
              </div>
            ) : null}

            {/* Genres */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.genres.slice(0, 2).map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="text-[10px] font-medium px-1.5 py-0 h-4.5 rounded-md"
                  >
                    {t[genre as keyof typeof t] || genre}
                  </Badge>
                ))}
                {book.genres.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 rounded-md">
                    +{book.genres.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer: date + actions */}
            <div className="mt-auto pt-2.5 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(book.created_at)}</span>
              </div>

              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 cursor-pointer"
                  onClick={() => router.push(`/edit-book/${book.id}`)}
                  title={t.edit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>

                <DropdownMenu onOpenChange={(open) => open && fetchAllCollections()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 cursor-pointer"
                      title={t.addToCollection}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => router.push(`/collections`)} className="cursor-pointer gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      {t.manageCollections}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isLoadingCollections ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : allCollections.length === 0 ? (
                      <div className="text-xs text-center py-3 text-muted-foreground px-2">
                        {t.noCollections}
                      </div>
                    ) : (
                      allCollections.map((collection) => (
                        <DropdownMenuCheckboxItem
                          key={collection.id}
                          checked={book.collections?.some((c: any) => c.id === collection.id)}
                          onCheckedChange={() => handleToggleCollection(collection.id)}
                          className="cursor-pointer"
                        >
                          {collection.name}
                        </DropdownMenuCheckboxItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                  title={t.delete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div
          className="group cursor-pointer w-full"
          onClick={handleCardClick}
        >
          <div className="flex flex-row items-center gap-4 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
            {/* Cover thumbnail */}
            <div className="relative shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/60 border border-border/40">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30"><BookOpen className="h-6 w-6" /></div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors truncate">{book.title}</h3>
                <Badge className={`${readingStatus.className} shrink-0 text-[10px] font-medium px-2 py-0.5 border w-fit flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {readingStatus.text}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground truncate mb-2">
                {book.authors && (book.authors as any[]).length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {(book.authors as any[]).map((author, index) => (
                      <span key={author.id}>
                        <Link
                          href={`/authors/${author.id}`}
                          className="hover:text-primary hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {author.name}
                        </Link>
                        {index < (book.authors as any[]).length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span>{book.author}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {book.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(Number(book.rating) / 2) ? "fill-amber-400 text-amber-400" : i < Number(book.rating) / 2 ? "fill-amber-400/50 text-amber-400/50" : "fill-muted text-muted"}`} />
                    ))}
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{Number(book.rating).toFixed(1)}</span>
                  </div>
                )}
                {book.pages && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{book.pages} pág.</span>
                  </div>
                )}
                {book.format && <span className="text-[11px] text-muted-foreground capitalize">{book.format === "physical" ? t.physical : t.digital}</span>}
                {book.genres?.slice(0, 3).map(g => (
                  <Badge key={g} variant="secondary" className="text-[10px] h-5 px-2 rounded-md font-medium">{t[g as keyof typeof t] || g}</Badge>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pr-2" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-lg transition-colors ${isFavorite ? "text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"} cursor-pointer`} onClick={handleToggleFavorite} title="Favorito">
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 cursor-pointer" onClick={() => router.push(`/edit-book/${book.id}`)} title={t.edit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => setShowDeleteDialog(true)} title={t.delete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t.deleteBook}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteConfirm}{" "}
              <span className="font-semibold text-foreground">"{book.title}"</span>? {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer rounded-xl">
              {t.cancel}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="cursor-pointer rounded-xl px-4"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.deleting}</span>
                </div>
              ) : (
                t.delete
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
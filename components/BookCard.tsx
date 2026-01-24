"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
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
  BookOpen,
  Pencil,
  Star,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  Eye,
  Bookmark,
  Sparkles,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calcular status de leitura
  const getReadingStatus = () => {
    if (book.finish_reading_date) {
      return {
        text: t.ended,
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
        icon: CheckCircle,
        iconColor: "text-green-600 dark:text-green-400",
      };
    }
    if (book.start_reading_date) {
      return {
        text: t.reading,
        color:
          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        icon: Clock,
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    }
    return {
      text: t.notStarted,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
      icon: BookOpen,
      iconColor: "text-gray-600 dark:text-gray-400",
    };
  };

  const readingStatus = getReadingStatus();
  const StatusIcon = readingStatus.icon;

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  };

  // Função para lidar com exclusão
  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: t.error,
        description: t.needToBeLoggedIn,
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", book.id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t.bookDeleted,
        description: `"${book.title}" ${t.wasRemovedFromCollection}`,
      });
      router.refresh();
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  // Handler para abrir o livro
  const handleCardClick = (e: React.MouseEvent) => {
    // Verificar se o clique foi em um botão de ação
    const target = e.target as HTMLElement;
    const isActionButton =
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.tagName === "BUTTON" ||
      (target.tagName === "A" &&
        target.getAttribute("href")?.includes("/edit-book/"));

    if (!isActionButton) {
      router.push(`/books/${book.id}`);
    }
  };

  return (
    <>
      <Card
        className="overflow-hidden group hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/40 h-full cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Container principal */}
        <div className="relative h-full flex flex-col">
          {/* Imagem da capa - encostada ao topo */}
          <div className="relative aspect-3/4 bg-linear-to-br from-muted to-muted/50 overflow-hidden">
            {/* Status badge - canto superior direito */}
            <div className="absolute top-2 right-2 z-10">
              <Badge
                className={`${readingStatus.color} text-xs font-medium px-2 py-0.5`}
              >
                <StatusIcon
                  className={`h-3 w-3 mr-1 ${readingStatus.iconColor}`}
                />
                {readingStatus.text}
              </Badge>
            </div>

            {/* Badge de formato - canto superior esquerdo */}
            {book.format && (
              <div className="absolute top-2 left-2 z-10">
                <Badge
                  variant="outline"
                  className="text-xs bg-background/80 px-2 py-0.5"
                >
                  {book.format === "physical" ? t.physical : t.digital}
                </Badge>
              </div>
            )}

            {/* Imagem ou placeholder */}
            {book.cover_image ? (
              <img
                src={book.cover_image || "/placeholder.svg"}
                alt={book.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-linear-to-br from-muted to-muted/50">
                <BookOpen className="h-10 w-10 text-muted-foreground/60" />
              </div>
            )}
          </div>

          {/* Conteúdo abaixo da imagem */}
          <CardContent className="p-3 flex-1 flex flex-col">
            {/* Título e Autor */}
            <div className="mb-2">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author}
              </p>
            </div>

            {/* Rating e páginas */}
            <div className="flex items-center justify-between mb-2">
              {book.rating ? (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">
                    {book.rating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {t.noRating}
                </div>
              )}

              {book.pages && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>{book.pages}p</span>
                </div>
              )}
            </div>

            {/* Gêneros */}
            {book.genres && book.genres.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {book.genres.slice(0, 2).map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="text-xs font-normal px-1.5 py-0 h-5"
                    >
                      {t[genre as keyof typeof t] || genre}
                    </Badge>
                  ))}
                  {book.genres.length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      +{book.genres.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Data e ações */}
            <div className="mt-auto pt-2 border-t flex items-center justify-between">
              {/* Data */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(book.created_at)}</span>
              </div>

              {/* Botões de ação */}
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => router.push(`/edit-book/${book.id}`)}
                  title={t.edit}
                >
                  <Pencil className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                  title={t.delete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {t.deleteBook}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteConfirm}{" "}
              <span className="font-semibold text-foreground">
                "{book.title}"
              </span>
              ? {t.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <span className="animate-pulse">{t.deleting}</span>
                </>
              ) : (
                t.delete
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

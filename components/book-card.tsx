"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BookOpen, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
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

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado",
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
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t.bookDeleted,
        description: `"${book.title}" foi removido da sua coleção`,
      });
      router.refresh();
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        <Link href={`/books/${book.id}`}>
          <div className="aspect-[3/4] bg-muted relative overflow-hidden">
            {book.cover_image ? (
              <img
                src={book.cover_image || "/placeholder.svg"}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>
        <CardContent className="p-4">
          <Link href={`/books/${book.id}`}>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
          </Link>
          {book.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{book.rating}</span>
            </div>
          )}
          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs bg-muted px-2 py-1 rounded"
                >
                  {t[genre as keyof typeof t] || genre}
                </span>
              ))}
              {book.genres.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{book.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/edit-book/${book.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Livro</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteConfirm}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "..." : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

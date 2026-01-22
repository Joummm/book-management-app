"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import { GENRES, type Book } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
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
import { X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookFormProps {
  book?: Book;
}

export function BookForm({ book }: BookFormProps) {
  const { locale } = useApp();
  const t = getTranslations(locale);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Form state
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [coverImage, setCoverImage] = useState(book?.cover_image || "");
  const [rating, setRating] = useState<number | undefined>(
    book?.rating || undefined,
  );
  const [review, setReview] = useState(book?.review || "");
  const [releaseDate, setReleaseDate] = useState(book?.release_date || "");
  const [startReadingDate, setStartReadingDate] = useState(
    book?.start_reading_date || "",
  );
  const [finishReadingDate, setFinishReadingDate] = useState(
    book?.finish_reading_date || "",
  );
  const [pages, setPages] = useState<number | undefined>(
    book?.pages || undefined,
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    book?.genres || [],
  );
  const [customGenre, setCustomGenre] = useState("");
  const [publisher, setPublisher] = useState(book?.publisher || "");
  const [format, setFormat] = useState<"physical" | "digital">(
    book?.format || "physical",
  );
  const [characters, setCharacters] = useState<string[]>(
    book?.characters || [],
  );
  const [newCharacter, setNewCharacter] = useState("");
  const [quotes, setQuotes] = useState<string[]>(book?.quotes || []);
  const [newQuote, setNewQuote] = useState("");
  const [wouldReadAgain, setWouldReadAgain] = useState<
    "yes" | "no" | "maybe" | undefined
  >(book?.would_read_again || undefined);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | undefined>(
    book?.would_recommend || undefined,
  );

  // Track changes
  useEffect(() => {
    if (book) {
      setHasChanges(
        title !== book.title ||
          author !== book.author ||
          coverImage !== (book.cover_image || "") ||
          rating !== book.rating ||
          review !== (book.review || "") ||
          releaseDate !== (book.release_date || "") ||
          startReadingDate !== (book.start_reading_date || "") ||
          finishReadingDate !== (book.finish_reading_date || "") ||
          pages !== book.pages ||
          JSON.stringify(selectedGenres) !==
            JSON.stringify(book.genres || []) ||
          publisher !== (book.publisher || "") ||
          format !== book.format ||
          JSON.stringify(characters) !==
            JSON.stringify(book.characters || []) ||
          JSON.stringify(quotes) !== JSON.stringify(book.quotes || []) ||
          wouldReadAgain !== book.would_read_again ||
          wouldRecommend !== book.would_recommend,
      );
    } else {
      setHasChanges(title !== "" || author !== "");
    }
  }, [
    title,
    author,
    coverImage,
    rating,
    review,
    releaseDate,
    startReadingDate,
    finishReadingDate,
    pages,
    selectedGenres,
    publisher,
    format,
    characters,
    quotes,
    wouldReadAgain,
    wouldRecommend,
    book,
  ]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const addCustomGenre = () => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      setSelectedGenres([...selectedGenres, customGenre.trim()]);
      setCustomGenre("");
    }
  };

  const addCharacter = () => {
    if (newCharacter.trim() && !characters.includes(newCharacter.trim())) {
      setCharacters([...characters, newCharacter.trim()]);
      setNewCharacter("");
    }
  };

  const removeCharacter = (character: string) => {
    setCharacters(characters.filter((c) => c !== character));
  };

  const addQuote = () => {
    if (newQuote.trim() && !quotes.includes(newQuote.trim())) {
      setQuotes([...quotes, newQuote.trim()]);
      setNewQuote("");
    }
  };

  const removeQuote = (quote: string) => {
    setQuotes(quotes.filter((q) => q !== quote));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      setIsLoading(false);
      return;
    }

    const bookData = {
      user_id: user.id,
      title,
      author,
      cover_image: coverImage || null,
      rating: rating || null,
      review: review || null,
      release_date: releaseDate || null,
      start_reading_date: startReadingDate || null,
      finish_reading_date: finishReadingDate || null,
      pages: pages || null,
      genres: selectedGenres.length > 0 ? selectedGenres : null,
      publisher: publisher || null,
      format,
      characters: characters.length > 0 ? characters : null,
      quotes: quotes.length > 0 ? quotes : null,
      would_read_again: wouldReadAgain || null,
      would_recommend: wouldRecommend !== undefined ? wouldRecommend : null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (book) {
        // Update existing book
        const { error } = await supabase
          .from("books")
          .update(bookData)
          .eq("id", book.id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: t.bookUpdated,
          description: `"${title}" foi atualizado com sucesso`,
        });
      } else {
        // Create new book
        const { error } = await supabase.from("books").insert([bookData]);

        if (error) throw error;

        toast({
          title: t.bookCreated,
          description: `"${title}" foi adicionado à sua coleção`,
        });
      }

      setHasChanges(false);
      router.push("/books");
      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowExitDialog(true);
    } else {
      router.push("/books");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {book ? t.edit : t.addBook}
            </CardTitle>
            <CardDescription>
              {book
                ? "Edite as informações do livro"
                : "Adicione um novo livro à sua coleção"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title - Required */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t.title} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="O Senhor dos Anéis"
                  required
                />
              </div>

              {/* Author - Required */}
              <div className="space-y-2">
                <Label htmlFor="author">
                  {t.author} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="J.R.R. Tolkien"
                  required
                />
              </div>

              {/* Cover Image - Optional */}
              <div className="space-y-2">
                <Label htmlFor="cover">
                  {t.coverImage}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <Input
                  id="cover"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>

              {/* Format - Required */}
              <div className="space-y-2">
                <Label>
                  {t.format} <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={format}
                  onValueChange={(value) =>
                    setFormat(value as "physical" | "digital")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="physical" />
                    <Label htmlFor="physical">{t.physical}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital" id="digital" />
                    <Label htmlFor="digital">{t.digital}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rating - Optional */}
              <div className="space-y-2">
                <Label htmlFor="rating">
                  {t.rating}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <Select
                  value={rating?.toString()}
                  onValueChange={(value) => setRating(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma nota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ⭐</SelectItem>
                    <SelectItem value="2">2 ⭐⭐</SelectItem>
                    <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                    <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                    <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review - Optional */}
              <div className="space-y-2">
                <Label htmlFor="review">
                  {t.review}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Escreva sua crítica sobre o livro..."
                  rows={4}
                />
              </div>

              {/* Dates - Optional */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="release">
                    {t.releaseDate}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t.optional})
                    </span>
                  </Label>
                  <Input
                    id="release"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start">
                    {t.startReading}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t.optional})
                    </span>
                  </Label>
                  <Input
                    id="start"
                    type="date"
                    value={startReadingDate}
                    onChange={(e) => setStartReadingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finish">
                    {t.finishReading}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t.optional})
                    </span>
                  </Label>
                  <Input
                    id="finish"
                    type="date"
                    value={finishReadingDate}
                    onChange={(e) => setFinishReadingDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Pages and Publisher */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pages">
                    {t.pages}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t.optional})
                    </span>
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    value={pages || ""}
                    onChange={(e) =>
                      setPages(Number(e.target.value) || undefined)
                    }
                    placeholder="352"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">
                    {t.publisher}{" "}
                    <span className="text-muted-foreground text-sm">
                      ({t.optional})
                    </span>
                  </Label>
                  <Input
                    id="publisher"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Editora Rocco"
                  />
                </div>
              </div>

              {/* Genres - Optional */}
              <div className="space-y-2">
                <Label>
                  {t.genres}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                  {GENRES.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={genre}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => handleGenreToggle(genre)}
                      />
                      <Label
                        htmlFor={genre}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {t[genre as keyof typeof t] || genre}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Género personalizado"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addCustomGenre())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addCustomGenre}
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedGenres.filter((g) => !GENRES.includes(g as any))
                  .length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGenres
                      .filter((g) => !GENRES.includes(g as any))
                      .map((genre) => (
                        <div
                          key={genre}
                          className="flex items-center gap-1 bg-muted px-2 py-1 rounded"
                        >
                          <span className="text-sm">{genre}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedGenres(
                                selectedGenres.filter((g) => g !== genre),
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Characters - Optional */}
              <div className="space-y-2">
                <Label>
                  {t.characters}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do personagem"
                    value={newCharacter}
                    onChange={(e) => setNewCharacter(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCharacter())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addCharacter}
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {characters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {characters.map((character) => (
                      <div
                        key={character}
                        className="flex items-center gap-1 bg-muted px-3 py-1 rounded"
                      >
                        <span className="text-sm">{character}</span>
                        <button
                          type="button"
                          onClick={() => removeCharacter(character)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quotes - Optional */}
              <div className="space-y-2">
                <Label>
                  {t.quotes}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Frase marcante do livro"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    rows={2}
                  />
                  <Button
                    type="button"
                    onClick={addQuote}
                    variant="secondary"
                    className="self-end"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {quotes.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {quotes.map((quote, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 bg-muted p-3 rounded"
                      >
                        <p className="text-sm flex-1 italic">"{quote}"</p>
                        <button
                          type="button"
                          onClick={() => removeQuote(quote)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Would Read Again - Optional */}
              <div className="space-y-2">
                <Label>
                  {t.wouldReadAgain}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
                <RadioGroup
                  value={wouldReadAgain}
                  onValueChange={(value) => setWouldReadAgain(value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">{t.yes}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">{t.no}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id="maybe" />
                    <Label htmlFor="maybe">{t.maybe}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Would Recommend - Optional */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommend"
                  checked={wouldRecommend || false}
                  onCheckedChange={(checked) =>
                    setWouldRecommend(checked as boolean)
                  }
                />
                <Label htmlFor="recommend">
                  {t.wouldRecommend}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t.optional})
                  </span>
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !title || !author}
                  className="flex-1"
                >
                  {isLoading ? "..." : t.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 bg-transparent"
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>{t.unsavedChanges}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/books")}>
              Sair sem Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

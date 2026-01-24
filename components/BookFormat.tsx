"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  X,
  Plus,
  BookOpen,
  Calendar,
  Users,
  Quote,
  Award,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  AlertCircle,
  Bookmark,
  Star,
  ExternalLink,
  Building,
  File,
  Heart,
  ThumbsUp,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BooksPage from "@/app/books/page";

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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

  // Validate reading dates
  const validateDates = useCallback(() => {
    if (startReadingDate && finishReadingDate) {
      const start = new Date(startReadingDate);
      const finish = new Date(finishReadingDate);
      if (finish < start) {
        toast({
          title: t.dateError,
          description: t.finishDateBeforeStart,
          variant: "destructive",
        });
        setFinishReadingDate("");
      }
    }
  }, [startReadingDate, finishReadingDate, toast, t]);

  useEffect(() => {
    validateDates();
  }, [startReadingDate, finishReadingDate, validateDates]);

  // Calculate reading progress
  const calculateReadingProgress = () => {
    if (!startReadingDate) return 0;
    if (finishReadingDate) return 100;

    // If started but not finished, estimate 50%
    return 50;
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== "" && author.trim() !== "";
      case 2:
        return true; // Details step is always valid
      case 3:
        return true; // Personal step is always valid
      default:
        return false;
    }
  };

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

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim() || !author.trim()) {
      toast({
        title: t.requiredFields,
        description: t.titleAuthorRequiredShort,
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);

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
        title: t.error,
        description: error instanceof Error ? error.message : t.anErrorOccurred,
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

  // Test if image URL is valid
  const [isImageValid, setIsImageValid] = useState(true);
  const testImageUrl = (url: string) => {
    if (!url) return;

    const img = new Image();
    img.onload = () => setIsImageValid(true);
    img.onerror = () => setIsImageValid(false);
    img.src = url;
  };

  useEffect(() => {
    if (coverImage) {
      testImageUrl(coverImage);
    }
  }, [coverImage]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Cover Image */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {t.bookCover}
            <span className="text-muted-foreground text-xs">
              ({t.optional})
            </span>
          </Label>

          {/* Image Preview or Upload */}
          <div className="border rounded-lg p-4">
            <div className="space-y-4">
              {coverImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-3/4 max-w-xs mx-auto">
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Preview da capa"
                      className={`object-cover w-full h-full rounded-lg shadow-lg ${
                        !isImageValid ? "opacity-50" : ""
                      }`}
                    />
                    {!isImageValid && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                        <AlertCircle className="h-8 w-8 text-warning" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCoverImage("")}
                      className="gap-2 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      {t.removeImage}
                    </Button>
                    {!isImageValid && (
                      <p className="text-xs text-warning">
                        {t.imageUrlMayNotBeValid}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="cover-url" className="text-sm">
                        {t.coverImageUrl}
                      </Label>
                      <Input
                        id="cover-url"
                        placeholder="https://exemplo.com/capa.jpg"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{t.tipsForFindingImage}</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>{t.googleImages}</li>
                        <li>{t.amazonGoodreads}</li>
                        <li>{t.uploadServices}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading Progress */}
        {(startReadingDate || finishReadingDate) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.readingProgress}
                <span className="text-muted-foreground text-xs">
                  ({t.optional})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t.progress}</span>
                  <span className="font-medium">
                    {calculateReadingProgress()}%
                  </span>
                </div>
                <Progress value={calculateReadingProgress()} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs">{t.startDate}</Label>
                  <Input
                    type="date"
                    value={startReadingDate}
                    onChange={(e) => setStartReadingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t.finishDate}</Label>
                  <Input
                    type="date"
                    value={finishReadingDate}
                    onChange={(e) => setFinishReadingDate(e.target.value)}
                    disabled={!startReadingDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Basic Info */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            {t.bookTitle}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Harry Potter"
            required
            className="h-12 text-lg"
          />
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t.author}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="J. K. Rowling"
            required
            className="h-12"
          />
        </div>

        {/* Format */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.format}
            <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={format === "physical" ? "default" : "outline"}
              onClick={() => setFormat("physical")}
              className="h-auto py-4 flex flex-col gap-2 cursor-pointer"
            >
              <BookOpen className="h-6 w-6" />
              <span>{t.physical}</span>
            </Button>
            <Button
              type="button"
              variant={format === "digital" ? "default" : "outline"}
              onClick={() => setFormat("digital")}
              className="h-auto py-4 flex flex-col gap-2 cursor-pointer"
            >
              <FileText className="h-6 w-6" />
              <span>{t.digital}</span>
            </Button>
          </div>
        </div>

        {/* Rating Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {t.yourRating}
            <span className="text-muted-foreground text-xs">
              ({t.optional})
            </span>
          </Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="relative cursor-pointer"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (rating || 0)
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted-foreground hover:text-primary"
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {star}
                </span>
              </button>
            ))}
            <span className="ml-2 text-lg font-medium">
              {rating ? `${rating}/5` : t.noRating}
            </span>
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{t.fillRequiredFields}</p>
                <p className="text-xs text-muted-foreground">
                  {t.titleAuthorRequired}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Book Details */}
      <div className="space-y-6">
        {/* Dates */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="release">
                <Calendar className="h-4 w-4" />
                {t.publicationDate}
                <span className="text-muted-foreground text-xs">
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
          </div>
        </div>

        {/* Pages & Publisher */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="pages">
              <File className="h-4 w-4" />
              {t.numberOfPages}
              <span className="text-muted-foreground text-xs">
                ({t.optional})
              </span>
            </Label>
            <div className="relative">
              <Input
                id="pages"
                type="number"
                min="1"
                value={pages || ""}
                onChange={(e) => setPages(Number(e.target.value) || undefined)}
                placeholder="352"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {t.pagess}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publisher">
              <Building className="h-4 w-4" />
              {t.publisher}
              <span className="text-muted-foreground text-xs">
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

        {/* Review */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.yourReview}
            <span className="text-muted-foreground text-xs">
              ({t.optional})
            </span>
          </h3>
          <div className="space-y-2">
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Compartilhe seus pensamentos sobre o livro..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t.reviewIsPrivate}</span>
              <span>
                {review.length}/5000 {t.charactersCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Genres */}
      <div className="space-y-6">
        {/* Genres */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {t.genres}
              <span className="text-muted-foreground text-xs">
                {" "}
                ({t.optional})
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">
              {selectedGenres.length} {t.selected}
            </span>
          </div>

          {/* Popular Genres */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">{t.popular}</Label>
            <div className="flex flex-wrap gap-2 ">
              {GENRES.slice(0, 8).map((genre) => (
                <Badge
                  key={genre}
                  variant={
                    selectedGenres.includes(genre) ? "default" : "outline"
                  }
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleGenreToggle(genre)}
                >
                  {selectedGenres.includes(genre) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {t[genre as keyof typeof t] || genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* All Genres */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              {t.allGenres}
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 ">
              {GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2 ">
                  <Checkbox
                    id={genre}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                    className="cursor-pointer"
                  />
                  <Label
                    htmlFor={genre}
                    className="text-sm font-normal cursor-pointer flex-1 truncate"
                  >
                    {t[genre as keyof typeof t] || genre}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Genre */}
          <div className="space-y-2">
            <Label>{t.customGenre}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t.addCustomGenre}
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomGenre())
                }
              />
              <Button
                type="button"
                onClick={addCustomGenre}
                variant="secondary"
                size="icon"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Genres */}
          {selectedGenres.length > 0 && (
            <div className="pt-4 border-t">
              <Label className="text-sm">{t.selectedGenres}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="gap-1 group"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Characters & Quotes */}
      <div className="space-y-6">
        {/* Characters */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t.characters}
            <span className="text-muted-foreground text-xs">
              ({t.optional})
            </span>
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={t.characterName}
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
                size="icon"
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {characters.length > 0 && (
              <div className="space-y-2">
                {characters.map((character, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{character}</span>
                        <p className="text-xs text-muted-foreground">
                          {t.characterNumber.replace(
                            "{number}",
                            (index + 1).toString(),
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharacter(character)}
                      className="h-8 w-8 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quotes */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Quote className="h-4 w-4" />
            {t.memorableQuotes}
            <span className="text-muted-foreground text-xs">
              ({t.optional})
            </span>
          </h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder={t.writeMemorableQuote}
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                rows={3}
              />
              <Button
                type="button"
                onClick={addQuote}
                variant="secondary"
                className="self-start cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {quotes.length > 0 && (
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <div
                    key={index}
                    className="relative border-l-4 border-primary pl-4 pr-4 py-3 bg-primary/5 rounded-r-lg group"
                  >
                    <p className="italic text-foreground">"{quote}"</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuote(quote)}
                      className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {t.quoteNumber.replace(
                        "{number}",
                        (index + 1).toString(),
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Personal Evaluation */}
      <div className="space-y-6">
        {/* Personal Evaluation */}
        <div className="space-y-6">
          <h3 className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            {t.personalEvaluation}
          </h3>

          {/* Would Read Again */}
          <div className="space-y-3">
            <Label>
              <Heart className="h-4 w-4" />
              {t.wouldReadAgain}
              <span className="text-muted-foreground text-xs">
                ({t.optional})
              </span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={wouldReadAgain === "yes" ? "default" : "outline"}
                onClick={() => setWouldReadAgain("yes")}
                className="h-auto py-3 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <Check className="h-5 w-5" />
                  <span>{t.yes}</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={wouldReadAgain === "no" ? "default" : "outline"}
                onClick={() => setWouldReadAgain("no")}
                className="h-auto py-3 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <X className="h-5 w-5" />
                  <span>{t.no}</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={wouldReadAgain === "maybe" ? "default" : "outline"}
                onClick={() => setWouldReadAgain("maybe")}
                className="h-auto py-3 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <AlertCircle className="h-5 w-5" />
                  <span>{t.maybe}</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Would Recommend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                <ThumbsUp className="h-4 w-4" />
                {t.recommendThisBook}
                <span className="text-muted-foreground text-xs">
                  ({t.optional})
                </span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-muted-foreground " />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.considerRecommending}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className="h-auto py-3 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <Check className="h-5 w-5" />
                  <span>{t.yes}</span>
                </div>
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className="h-auto py-3 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <X className="h-5 w-5" />
                  <span>{t.no}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.title}:</span>
              <span className="font-medium truncate max-w-50">
                {title || t.notDefined}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.author}:</span>
              <span className="font-medium truncate max-w-50">
                {author || t.notDefined}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.format}:</span>
              <span className="font-medium">
                {format === "physical" ? t.physical : t.digital}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.rating}:</span>
              <span className="font-medium">
                {rating ? `${rating}/5` : t.notRated}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.genres}:</span>
              <span className="font-medium">{selectedGenres.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {book ? t.editBook : t.addBook}
              </h1>
              <p className="text-muted-foreground">
                {book ? t.editBook : t.addNewBookToCollection}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {t.step} {currentStep} {t.of} {totalSteps}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {[t.basicInformation, t.bookDetails, t.personalEvaluation].map(
                (step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        currentStep > index + 1
                          ? "bg-primary text-primary-foreground"
                          : currentStep === index + 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentStep > index + 1 ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 ${
                        currentStep >= index + 1
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ),
              )}
            </div>
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {currentStep === 1 && t.basicInformation}
                  {currentStep === 2 && t.bookDetails}
                  {currentStep === 3 && t.personalEvaluation}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && t.fillBasicInfo}
                  {currentStep === 2 && t.addDetails}
                  {currentStep === 3 && t.shareExperience}
                </CardDescription>
              </div>
              {!isStepValid() && currentStep === 1 && (
                <div className="flex items-center gap-2 text-warning text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t.titleAuthorRequiredShort}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id="book-form">
              {renderStepContent()}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {hasChanges && (
                <>
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span>{t.youHaveUnsavedChanges}</span>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* Step 1: Cancelar e Avançar */}
              {currentStep === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2 cursor-pointer"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="gap-2 flex-1 sm:flex-none cursor-pointer"
                  >
                    {t.continue}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              ) : null}

              {/* Step 2: Voltar, Cancelar e Avançar */}
              {currentStep === 2 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-2 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.back}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="cursor-pointer"
                  >
                    {t.cancel}
                  </Button>

                  <Button
                    type="button"
                    onClick={nextStep}
                    className="gap-2 flex-1 sm:flex-none cursor-pointer"
                  >
                    {t.continue}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              ) : null}

              {/* Step 3: Voltar, Cancelar e Enviar */}
              {currentStep === 3 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-2 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.back}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="cursor-pointer"
                  >
                    {t.cancel}
                  </Button>

                  <Button
                    type="submit"
                    form="book-form"
                    disabled={isLoading || !title || !author}
                    className="flex-1 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t.saving}
                      </>
                    ) : book ? (
                      t.updateBook
                    ) : (
                      t.addBookToCollection
                    )}
                  </Button>
                </>
              ) : null}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.youHaveUnsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>{t.unsavedChanges}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t.continueEditing}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/books")}
              className="cursor-pointer"
            >
              {t.leaveWithoutSaving}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

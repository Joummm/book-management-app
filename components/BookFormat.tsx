"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { getTranslations, type Locale } from "@/lib/i18n";
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
  Search,
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
  Building,
  File,
  Heart,
  ThumbsUp,
  PlayCircle,
  StopCircle,
  FileDown,
  Trash2,
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
import { AuthorSelector } from "./AuthorSelector";
import { CollectionSelector } from "./CollectionSelector";
import { BookSearchDialog } from "./BookSearchDialog";

interface BookFormProps {
  book?: Book;
}

export function BookForm({ book }: BookFormProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
  const [wouldRecommend, setWouldRecommend] = useState<
    "yes" | "no" | "maybe" | undefined
  >(book?.would_recommend || undefined);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    book?.collections?.map((c: any) => typeof c === 'string' ? c : c.id) || []
  );
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>(
    book?.authors?.map((a: any) => typeof a === 'string' ? a : a.id) || []
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
          wouldRecommend !== book.would_recommend ||
          JSON.stringify(selectedCollectionIds) !== JSON.stringify(book.collections?.map((c: any) => typeof c === 'string' ? c : c.id) || []) ||
          JSON.stringify(selectedAuthorIds) !== JSON.stringify(book.authors?.map((a: any) => typeof a === 'string' ? a : a.id) || []),
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
    selectedCollectionIds,
    selectedAuthorIds,
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

  // Handle start reading button
  const handleStartReading = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartReadingDate(today);
    toast({
      title: t.readingStarted,
      description: t.readingStartedDesc,
    });
  };

  // Handle finish reading button
  const handleFinishReading = () => {
    const today = new Date().toISOString().split("T")[0];
    setFinishReadingDate(today);
    toast({
      title: t.readingFinished,
      description: t.readingFinishedDesc,
    });
  };

  // Calculate reading progress
  const calculateReadingProgress = () => {
    if (!startReadingDate) return 0;
    if (finishReadingDate) return 100;
    return 50;
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== "";
      case 2:
        return true;
      case 3:
        return true;
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
      setIsNavigating(true);
      setCurrentStep(currentStep + 1);
      // Prevent ghost-clicks: keep save button disabled briefly after navigation
      setTimeout(() => setIsNavigating(false), 400);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: t.requiredFields,
        description: t.titleAuthorRequiredShort,
        variant: "destructive",
      });
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);

    const bookData = {
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
      would_recommend: wouldRecommend || null,
      collections: selectedCollectionIds,
      author_ids: selectedAuthorIds,
    };

    try {
      const url = book ? `/api/books/${book.id}` : '/api/books';
      const method = book ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: book ? t.bookUpdated : t.bookCreated,
        description: `"${title}" foi ${book ? 'atualizado' : 'adicionado'} com sucesso`,
      });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Defensive: only allow save on the final step
    if (currentStep === totalSteps) {
      handleSave();
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowExitDialog(true);
    } else {
      router.push("/books");
    }
  };

  const handleDelete = async () => {
    if (!book) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      toast({
        title: 'Livro eliminado',
        description: `"${book.title}" foi eliminado com sucesso.`,
      });
      router.push('/books');
      router.refresh();
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.anErrorOccurred,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed.type !== "bookmanager_export_v1" || !parsed.data) {
           throw new Error("Formato de ficheiro inválido.");
        }

        const data = parsed.data;
        if (data.title) setTitle(data.title);
        if (data.author) setAuthor(data.author);
        if (data.cover_image) setCoverImage(data.cover_image);
        if (data.pages) setPages(data.pages);
        if (data.release_date) setReleaseDate(data.release_date);
        if (data.publisher) setPublisher(data.publisher);
        if (data.format) setFormat(data.format);
        if (data.genres) setSelectedGenres(data.genres);
        if (data.characters) setCharacters(data.characters);
        if (data.quotes) setQuotes(data.quotes);

        toast({
          title: "Livro Importado com Sucesso",
          description: "Os dados foram preenchidos. Verifica se está tudo correto.",
        });
      } catch (err) {
        toast({
          title: "Erro ao importar",
          description: "O ficheiro selecionado não é um ficheiro de exportação válido do BookManager.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Handle auto-fill from search
  const handleAutoFill = (data: any) => {
    if (data.title) setTitle(data.title);
    if (data.author) setAuthor(data.author);
    if (data.cover_image) setCoverImage(data.cover_image);
    if (data.pages) setPages(data.pages);
    if (data.publisher) setPublisher(data.publisher);
    if (data.release_date) {
      // Ensure date is in YYYY-MM-DD format if possible, or just YYYY
      if (data.release_date.length === 4) {
        setReleaseDate(`${data.release_date}-01-01`);
      } else {
        setReleaseDate(data.release_date);
      }
    }
    if (data.genres && data.genres.length > 0) {
      // Map Google Books categories to our genres if possible, or add as custom
      setSelectedGenres(data.genres);
    }
    
    toast({
      title: "Dados Preenchidos!",
      description: `Informações de "${data.title}" foram importadas com sucesso.`
    });
  };

  // Render step content
  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Shortcuts Section */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col justify-between gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10 shadow-sm transition-all hover:bg-primary/[0.08] group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-primary text-sm tracking-tight">Pesquisa Automática</p>
              <p className="text-muted-foreground text-[10px] leading-relaxed">Importe dados instantaneamente pesquisando o título ou ISBN.</p>
            </div>
          </div>
          <BookSearchDialog onSelect={handleAutoFill} />
        </div>

        <div className="flex flex-col justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/40 shadow-sm transition-all hover:bg-muted/50 group">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground/80 text-sm tracking-tight">Importar Ficheiro</p>
              <p className="text-muted-foreground text-[10px] leading-relaxed">Carregue um ficheiro JSON de uma exportação anterior.</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".json,.kmbook.json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handleImportJson}
            />
            <Button variant="outline" className="w-full gap-2 border-border/60 hover:bg-background transition-all rounded-xl h-10 text-xs font-semibold uppercase tracking-wider">
              Selecionar Ficheiro
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column - Cover Image & Status */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <ImageIcon className="h-4 w-4 text-primary" />
              {t.bookCover}
              <span className="text-muted-foreground text-[10px] font-normal italic">
                ({t.optional})
              </span>
            </Label>

            <div className="border border-border/40 bg-muted/20 rounded-2xl p-6 transition-all hover:bg-muted/30">
              <div className="space-y-4">
                {coverImage ? (
                  <div className="space-y-5">
                    <div className="relative aspect-[3/4.5] max-w-[200px] mx-auto group">
                      <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img
                        src={coverImage || "/placeholder.svg"}
                        alt="Preview da capa"
                        className={`relative object-cover w-full h-full rounded-xl shadow-2xl ring-1 ring-white/10 ${
                          !isImageValid ? "opacity-40 grayscale" : ""
                        }`}
                      />
                      {!isImageValid && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl text-center p-2">
                          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                          <span className="text-[10px] font-bold text-destructive uppercase">Imagem Inválida</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => setCoverImage("")}
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {!isImageValid && (
                      <p className="text-[10px] text-center text-destructive font-medium px-4">
                        O link da imagem parece estar quebrado ou inacessível.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="h-56 bg-muted/40 rounded-xl flex flex-col items-center justify-center mb-6 border-2 border-dashed border-border/60 group transition-colors hover:border-primary/30">
                      <div className="h-16 w-16 rounded-full bg-background/50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Nenhuma capa selecionada</p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="cover-url" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          {t.coverImageUrl}
                        </Label>
                        <Input
                          id="cover-url"
                          placeholder="Cole o link da imagem aqui..."
                          value={coverImage}
                          onChange={(e) => setCoverImage(e.target.value)}
                          className="bg-background/50 border-border/40 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Card className="border-border/40 bg-muted/10 overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-xs font-bold uppercase tracking-tighter flex items-center gap-2 text-foreground/70">
                <PlayCircle className="h-3.5 w-3.5 text-primary" />
                Progresso de Leitura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-4">
                {!startReadingDate && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 cursor-pointer border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all rounded-xl py-6"
                    onClick={handleStartReading}
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-wide text-xs">{t.startReadingToday}</span>
                  </Button>
                )}

                {startReadingDate && !finishReadingDate && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 cursor-pointer border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all rounded-xl py-6"
                    onClick={handleFinishReading}
                  >
                    <Check className="h-5 w-5" />
                    <span className="font-bold uppercase tracking-wide text-xs">{t.finishReadingToday}</span>
                  </Button>
                )}
              </div>

              {(startReadingDate || finishReadingDate) && (
                <div className="space-y-2 px-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>{t.progress}</span>
                    <span className="text-primary">
                      {calculateReadingProgress()}%
                    </span>
                  </div>
                  <Progress value={calculateReadingProgress()} className="h-1.5 bg-background/50" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">{t.startDate}</Label>
                  <Input
                    type="date"
                    value={startReadingDate}
                    onChange={(e) => setStartReadingDate(e.target.value)}
                    className="h-9 bg-background/50 border-border/40 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">{t.finishDate}</Label>
                  <Input
                    type="date"
                    value={finishReadingDate}
                    onChange={(e) => setFinishReadingDate(e.target.value)}
                    disabled={!startReadingDate}
                    className="h-9 bg-background/50 border-border/40 text-xs rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Basic Info */}
        <div className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Bookmark className="h-4 w-4 text-primary" />
              {t.bookTitle}
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: O Pequeno Príncipe"
              required
              className="h-14 text-xl font-bold bg-background/50 border-border/40 focus:border-primary/50 focus:ring-primary/10 rounded-2xl transition-all"
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Users className="h-4 w-4 text-primary" />
              {t.authors}
              <span className="text-muted-foreground text-[10px] font-normal italic">
                ({t.optional})
              </span>
            </Label>
            <div className="p-1 bg-muted/20 border border-border/40 rounded-2xl">
              <AuthorSelector 
                selectedAuthorIds={selectedAuthorIds}
                onSelectionChange={setSelectedAuthorIds}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="author" className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              {t.author} ({t.other || "Novo"})
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nome do autor manual..."
              className="h-11 bg-background/50 border-border/40 rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <FileText className="h-4 w-4 text-primary" />
              Formato de Leitura
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={format === "physical" ? "default" : "outline"}
                onClick={() => setFormat("physical")}
                className={`h-auto py-5 flex flex-col gap-2 rounded-2xl transition-all ${
                  format === "physical" 
                    ? "bg-primary shadow-lg shadow-primary/20" 
                    : "bg-background/40 hover:bg-primary/5 border-border/40"
                }`}
              >
                <BookOpen className={`h-6 w-6 ${format === "physical" ? "text-white" : "text-primary/70"}`} />
                <span className="font-bold text-xs uppercase tracking-widest">{t.physical}</span>
              </Button>
              <Button
                type="button"
                variant={format === "digital" ? "default" : "outline"}
                onClick={() => setFormat("digital")}
                className={`h-auto py-5 flex flex-col gap-2 rounded-2xl transition-all ${
                  format === "digital" 
                    ? "bg-primary shadow-lg shadow-primary/20" 
                    : "bg-background/40 hover:bg-primary/5 border-border/40"
                }`}
              >
                <FileText className={`h-6 w-6 ${format === "digital" ? "text-white" : "text-primary/70"}`} />
                <span className="font-bold text-xs uppercase tracking-widest">{t.digital}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-muted/20 border border-border/40 rounded-2xl shadow-inner">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Star className="h-4 w-4 text-primary" />
              {t.yourRating}
            </Label>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="relative cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    title={`${star}/10`}
                  >
                    <Star
                      className={`h-6 w-6 transition-all duration-300 ${
                        star <= (rating || 0)
                          ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                          : "fill-muted text-muted-foreground/30 hover:text-primary/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-16 bg-background rounded-xl border border-border/60 flex items-center justify-center shadow-sm">
                      <span className="text-xl font-black text-primary">
                        {rating ? rating : "—"}
                      </span>
                   </div>
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 10.0</span>
                </div>

                <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-xl border border-border/40">
                  <Label htmlFor="precise-rating" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 shrink-0">
                    Ajuste Fino:
                  </Label>
                  <Input
                    id="precise-rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={rating || ""}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="h-8 w-14 text-xs text-center font-bold bg-background border-none p-0 focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Building className="h-4 w-4 text-primary" />
              {t.collections}
            </Label>
            <div className="p-1 bg-muted/20 border border-border/40 rounded-2xl">
              <CollectionSelector 
                selectedCollectionIds={selectedCollectionIds}
                onSelectionChange={setSelectedCollectionIds}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="release" className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Calendar className="h-4 w-4 text-primary" />
              {t.publicationDate}
              <span className="text-muted-foreground text-[10px] font-normal italic">({t.optional})</span>
            </Label>
            <Input
              id="release"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="bg-background/50 border-border/40 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pages" className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <File className="h-4 w-4 text-primary" />
              {t.numberOfPages}
              <span className="text-muted-foreground text-[10px] font-normal italic">({t.optional})</span>
            </Label>
            <div className="relative">
              <Input
                id="pages"
                type="number"
                min="1"
                value={pages || ""}
                onChange={(e) => setPages(Number(e.target.value) || undefined)}
                placeholder="Ex: 352"
                className="bg-background/50 border-border/40 rounded-xl pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                págs
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publisher" className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Building className="h-4 w-4 text-primary" />
            {t.publisher}
            <span className="text-muted-foreground text-[10px] font-normal italic">({t.optional})</span>
          </Label>
          <Input
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Editora, selo editorial..."
            className="bg-background/50 border-border/40 rounded-xl h-11"
          />
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <FileText className="h-4 w-4 text-primary" />
            {t.yourReview}
          </Label>
          <div className="space-y-3">
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="O que achou deste livro? Compartilhe os seus pensamentos..."
              rows={8}
              className="bg-background/50 border-border/40 rounded-2xl resize-none p-4 focus:ring-primary/10"
            />
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                 <AlertCircle className="h-3 w-3" />
                 {t.reviewIsPrivate}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-muted/30">
                {review.length}/5000
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-6 bg-muted/20 border border-border/40 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/70">
              Géneros Literários
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] px-2">
              {selectedGenres.length} Selecionados
            </Badge>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Sugestões Populares</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.slice(0, 8).map((genre) => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 py-1.5 px-3 rounded-lg border-border/60 ${
                    selectedGenres.includes(genre) ? "bg-primary shadow-md shadow-primary/20" : "bg-background/40 hover:bg-primary/5"
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {selectedGenres.includes(genre) && <Check className="h-3 w-3 mr-1.5" />}
                  {t[genre as keyof typeof t] || genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Todos os Géneros</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background/50 transition-colors">
                  <Checkbox
                    id={genre}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                    className="cursor-pointer border-border/60"
                  />
                  <Label
                    htmlFor={genre}
                    className="text-xs font-medium cursor-pointer flex-1 truncate text-foreground/80"
                  >
                    {t[genre as keyof typeof t] || genre}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/40">
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Personalizado</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar outro género..."
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomGenre())}
                className="bg-background/50 border-border/40 h-9 text-xs rounded-lg"
              />
              <Button
                type="button"
                onClick={addCustomGenre}
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Users className="h-4 w-4 text-primary" />
            Personagens Marcantes
            <span className="text-muted-foreground text-[10px] font-normal italic">({t.optional})</span>
          </Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar nome de personagem..."
                value={newCharacter}
                onChange={(e) => setNewCharacter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCharacter())}
                className="bg-background/50 border-border/40 h-11 rounded-xl"
              />
              <Button
                type="button"
                onClick={addCharacter}
                variant="secondary"
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {characters.length > 0 && (
              <div className="grid gap-2">
                {characters.map((character, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-muted/20 border border-border/40 rounded-xl group hover:bg-muted/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-bold text-sm text-foreground/80">{character}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCharacter(character)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <Quote className="h-4 w-4 text-primary" />
            Citações Memoráveis
            <span className="text-muted-foreground text-[10px] font-normal italic">({t.optional})</span>
          </Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Escreva aqui aquela frase que não quer esquecer..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                rows={3}
                className="bg-background/50 border-border/40 rounded-xl resize-none p-3"
              />
              <Button
                type="button"
                onClick={addQuote}
                variant="secondary"
                className="h-11 px-4 rounded-xl shrink-0 cursor-pointer self-start"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {quotes.length > 0 && (
              <div className="space-y-3">
                {quotes.map((quote, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative border-l-4 border-primary/40 pl-5 pr-10 py-4 bg-primary/5 rounded-r-2xl group shadow-sm"
                  >
                    <Quote className="h-8 w-8 text-primary/10 absolute top-2 left-2 -z-10" />
                    <p className="italic text-foreground/90 text-sm leading-relaxed">"{quote}"</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuote(quote)}
                      className="absolute right-2 top-2 h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-6 p-6 bg-muted/20 border border-border/40 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/70 border-b border-border/40 pb-4">
            Avaliação Final
          </h3>

          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
              <Heart className="h-4 w-4 text-primary" />
              Leria este livro novamente?
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "yes", label: t.yes, icon: Check, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { val: "no", label: t.no, icon: X, color: "text-rose-500", bg: "bg-rose-500/10" },
                { val: "maybe", label: t.maybe, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" }
              ].map((item) => (
                <Button
                  key={item.val}
                  type="button"
                  variant={wouldReadAgain === item.val ? "default" : "outline"}
                  onClick={() => setWouldReadAgain(item.val as any)}
                  className={`h-auto py-4 flex flex-col gap-2 rounded-xl transition-all border-border/40 ${
                    wouldReadAgain === item.val ? "bg-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-background/40 hover:bg-muted"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${wouldReadAgain === item.val ? "text-white" : item.color}`} />
                  <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <ThumbsUp className="h-4 w-4 text-primary" />
                Recomendaria este livro?
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help p-1 rounded-full hover:bg-muted transition-colors">
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px]">
                    <p>{t.considerRecommending}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "yes", label: t.yes, icon: Check, color: "text-emerald-500" },
                { val: "no", label: t.no, icon: X, color: "text-rose-500" },
                { val: "maybe", label: t.maybe, icon: AlertCircle, color: "text-amber-500" }
              ].map((item) => (
                <Button
                  key={item.val}
                  type="button"
                  variant={wouldRecommend === item.val ? "default" : "outline"}
                  onClick={() => setWouldRecommend(item.val as any)}
                  className={`h-auto py-4 flex flex-col gap-2 rounded-xl transition-all border-border/40 ${
                    wouldRecommend === item.val ? "bg-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-background/40 hover:bg-muted"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${wouldRecommend === item.val ? "text-white" : item.color}`} />
                  <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/10 rounded-2xl overflow-hidden shadow-inner border-dashed border-2">
          <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{t.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="flex items-center justify-between group">
              <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t.title}:</span>
              <span className="font-bold truncate max-w-[150px] text-right">
                {title || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t.author}:</span>
              <span className="font-bold truncate max-w-[150px] text-right">
                {author || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t.rating}:</span>
              <Badge className="font-black bg-primary/20 text-primary border-none text-[10px]">
                {rating ? `${rating}/10` : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{t.status}:</span>
              <span className="font-bold text-[10px] uppercase tracking-wider text-primary">
                {!startReadingDate && "Por Iniciar"}
                {startReadingDate && !finishReadingDate && "Em Leitura"}
                {finishReadingDate && "Concluído"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 px-4 sm:px-0">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
             <BookOpen className="h-7 w-7" />
          </div>
          <div>
             <h2 className="text-2xl font-black tracking-tight text-foreground/90 uppercase">
                {book ? t.editBook : "Registo de Leitura"}
             </h2>
             <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {book ? "Modo de Edição" : "Novo Item na Biblioteca"}
             </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleCancel} 
          className="rounded-xl px-6 hover:bg-destructive/10 hover:text-destructive transition-all gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <X className="h-4 w-4" />
          {t.cancel}
        </Button>
      </div>

      {/* Stepper - Modern & Integrated */}
      <div className="mb-12 px-4 md:px-0">
        <div className="relative flex items-center justify-between max-w-3xl mx-auto">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted/40 rounded-full -z-10" />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute top-5 left-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] rounded-full -z-10"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: "circOut" }}
          />

          {[
            { label: t.basicInformation, icon: BookOpen },
            { label: t.bookDetails, icon: FileText },
            { label: t.personalEvaluation, icon: Star }
          ].map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;
            
            return (
              <div key={index} className="flex flex-col items-center gap-3 relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isCompleted ? "var(--primary)" : isActive ? "var(--background)" : "var(--background)",
                    borderColor: isCompleted || isActive ? "var(--primary)" : "var(--border)",
                    color: isCompleted ? "var(--primary-foreground)" : isActive ? "var(--primary)" : "var(--muted-foreground)"
                  }}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                    isActive ? "shadow-[0_0_20px_rgba(var(--primary),0.3)] ring-4 ring-primary/10" : ""
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[3px]" />
                  ) : (
                    <Icon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                  )}
                </motion.div>
                <div className="text-center">
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 block ${
                    isActive ? "text-primary opacity-100 translate-y-0" : "text-muted-foreground opacity-70"
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="relative">
        {/* Step Indicator floating badge */}
        <div className="absolute -top-3 left-8 z-20 px-4 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
           Passo 0{currentStep}
        </div>

        <form
          onSubmit={handleSubmit}
          id="book-form"
          className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 p-6 md:p-10 shadow-2xl transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          <div className="min-h-[500px]">
             {renderStepContent()}
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row gap-6 justify-between items-center">
            <div className="flex items-center gap-4">
              {book && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="gap-2 cursor-pointer rounded-xl h-10 px-5 border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-all text-xs font-bold uppercase tracking-widest"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Eliminar Livro
                </Button>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/20 rounded-xl border border-border/40">
                {hasChanges ? (
                  <div className="flex items-center gap-2 text-amber-500 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t.youHaveUnsavedChanges}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-500/70">
                    <Check className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Aguardando alterações</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  className="gap-2 cursor-pointer rounded-xl h-12 px-6 hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.back}
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="gap-3 flex-1 sm:flex-none cursor-pointer rounded-xl h-12 px-10 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  {t.continue}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading || isNavigating || !title}
                  className="gap-3 flex-1 sm:flex-none cursor-pointer rounded-xl h-12 px-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.saving}...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {book ? t.updateBook : t.addBookToCollection}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl border-border/40 backdrop-blur-xl bg-card/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Eliminar Livro
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-1">
              Tens a certeza que queres eliminar{" "}
              <span className="font-bold text-foreground">&ldquo;{book?.title}&rdquo;</span>?{" "}
              Esta ação é irreversível e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-border/60 cursor-pointer" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-destructive hover:bg-destructive/90 cursor-pointer gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Sim, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="rounded-3xl border-border/40 backdrop-blur-xl bg-card/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">{t.youHaveUnsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>{t.unsavedChanges}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-border/60 cursor-pointer">
              {t.continueEditing}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/books")}
              className="rounded-xl bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              {t.leaveWithoutSaving}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

}
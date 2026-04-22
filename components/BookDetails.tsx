"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Edit,
  FileText,
  Star,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Heart,
  ThumbsUp,
  Award,
  Quote,
  User,
  Building,
  Hash,
  ArrowLeft,
  PlayCircle,
  StopCircle,
  Bookmark,
  Share2,
  Download,
} from "lucide-react";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CollectionSelector } from "./CollectionSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useUpdateBook, useBook } from "@/hooks/use-books";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";

interface BookDetailsProps {
  book: Book;
}

export function BookDetails({ book: initialBook }: BookDetailsProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for data fetching and state
  const { data: currentBook = initialBook } = useBook(initialBook.id);
  const { data: profileData } = useProfile();
  const updateBookMutation = useUpdateBook();
  
  const profile = profileData?.profile;
  const readingSpeed = profile?.reading_speed || 250;

  const [isLoading, setIsLoading] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    rating: currentBook.rating || 0,
    review: currentBook.review || "",
    would_read_again: currentBook.would_read_again || null,
    would_recommend: currentBook.would_recommend || null,
  });

  // Calcular dias de leitura
  const calculateReadingDays = () => {
    if (currentBook.start_reading_date && currentBook.finish_reading_date) {
      const start = new Date(currentBook.start_reading_date);
      const finish = new Date(currentBook.finish_reading_date);
      const diffTime = Math.abs(finish.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  const readingDays = calculateReadingDays();

  // Status de leitura
  const getReadingStatus = () => {
    if (currentBook.finish_reading_date)
      return { text: t.ended, color: "bg-success", icon: CheckCircle };
    if (currentBook.start_reading_date)
      return { text: t.reading, color: "bg-warning", icon: Clock };
    return { text: t.notStarted, color: "bg-muted", icon: BookOpen };
  };

  const readingStatus = getReadingStatus();
  const StatusIcon = readingStatus.icon;

  // Calcular progresso de forma determinística baseada nas datas
  const calculateProgress = () => {
    if (!currentBook.start_reading_date) return 0;
    if (currentBook.finish_reading_date) return 100;
    return 50;
  };

  const progress = calculateProgress();

  // Função para atualizar as datas de leitura
  const handleUpdateReadingStatus = async (type: "start" | "finish") => {
    const today = new Date().toISOString();
    
    try {
      await updateBookMutation.mutateAsync({
        id: currentBook.id,
        ...(type === "start" ? { start_reading_date: today } : { finish_reading_date: today }),
      });

      toast({
        title: type === "start" ? t.readingStarted : t.readingFinished,
        description: type === "start" ? t.readingStartedDesc : t.readingFinishedDesc,
      });

      if (type === "finish") {
        const { fireCelebration } = await import("@/lib/utils/confetti");
        fireCelebration();
        const { triggerHaptic } = await import("@/lib/haptics");
        triggerHaptic("success");
      }
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.anErrorOccurred,
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await updateBookMutation.mutateAsync({
        id: currentBook.id,
        is_favorite: !currentBook.is_favorite,
      });
      
      toast({
        title: !currentBook.is_favorite ? "Adicionado aos Favoritos" : "Removido dos Favoritos",
      });
    } catch {
      toast({ title: t.error, variant: "destructive" });
    }
  };

  const exportBookData = () => {
    // Clone book and strip sensitive data if needed, or just export essential fields
    const { id, user_id, created_at, updated_at, ...exportData } = currentBook as any;
    
    // Add signature field to validate import
    const bookPayload = {
       type: "bookmanager_export_v1",
       data: exportData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookPayload, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${currentBook.title.replace(/\s+/g, "-").toLowerCase()}.kmbook.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Livro Exportado",
      description: "Podes agora partilhar este ficheiro com outros utilizadores.",
    });
  };

  const handleEvaluate = async () => {
    setIsLoading(true);
    try {
      await updateBookMutation.mutateAsync({
        id: currentBook.id,
        ...evaluationForm,
      });

      setShowEvaluationDialog(false);
      toast({
        title: "Avaliação Salva",
        description: "A tua crítica e nota foram registadas com sucesso.",
      });
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

  // Ações rápidas condicionais
  const getQuickActions = () => {
    if (!currentBook.start_reading_date) {
      return (
        <Button
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={() => handleUpdateReadingStatus("start")}
          disabled={isLoading}
        >
          <PlayCircle className="h-4 w-4 text-success" />
          {t.startReadingToday}
        </Button>
      );
    } else if (
      currentBook.start_reading_date &&
      !currentBook.finish_reading_date
    ) {
      return (
        <Button
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={() => handleUpdateReadingStatus("finish")}
          disabled={isLoading}
        >
          <StopCircle className="h-4 w-4 text-primary" />
          {t.finishReadingToday}
        </Button>
      );
    } else if (currentBook.finish_reading_date && !currentBook.rating) {
      return (
        <Button
          className="gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-lg shadow-amber-500/20"
          onClick={() => setShowEvaluationDialog(true)}
          disabled={isLoading}
        >
          <Star className="h-4 w-4 fill-white" />
          Avaliar Livro
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho com navegação e Ações Premium */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 px-2">
        <Link href="/books">
          <Button variant="ghost" className="group gap-2.5 px-4 h-11 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-300">
            <div className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{t.backToBooks}</span>
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-muted/20 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer" 
              onClick={exportBookData} 
              title="Exportar/Partilhar Livro"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer" 
              onClick={handleToggleFavorite} 
              title={currentBook.is_favorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            >
              <Heart className={`h-4 w-4 ${currentBook.is_favorite ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
          </div>
          
          <Link href={`/edit-book/${currentBook.id}`}>
            <Button className="gap-2.5 px-6 h-11 rounded-2xl bg-primary shadow-[0_8px_20px_rgba(var(--primary),0.3)] hover:shadow-primary/40 transition-all duration-300 font-black uppercase tracking-widest text-[10px]">
              <Edit className="h-4 w-4" />
              {t.edit}
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section Imersiva */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl transition-all duration-700">
        {/* Background com efeito de profundidade */}
        <div className="absolute inset-0 z-0">
          {currentBook.cover_image ? (
            <div 
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
              style={{ backgroundImage: `url(${currentBook.cover_image})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-background opacity-40" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
            {/* Capa do Livro com Animação e Sombra 3D */}
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="shrink-0 group perspective-1000"
            >
              <div className="relative w-64 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transition-all duration-500 group-hover:shadow-primary/20 group-hover:scale-[1.02]">
                {currentBook.cover_image ? (
                  <img
                    src={currentBook.cover_image}
                    alt={currentBook.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-muted/40 backdrop-blur-sm">
                    <BookOpen className="h-20 w-20 text-muted-foreground/30" />
                    <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-4">Sem Capa</span>
                  </div>
                )}
                
                {/* Status Badge Flutuante */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${readingStatus.color} text-white font-bold uppercase tracking-widest text-[10px] px-3 py-1.5 shadow-lg backdrop-blur-md border-white/20`}>
                    <StatusIcon className="h-3 w-3 mr-1.5" />
                    {readingStatus.text}
                  </Badge>
                </div>

                {/* Overlays decorativos */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>

            {/* Informações Principais com Tipografia Premium */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3">
                    {currentBook.format === "physical" ? t.physical : t.digital}
                  </Badge>
                  {Array.isArray(currentBook.collections) && currentBook.collections.map((collection: any) => (
                    <Badge 
                      key={collection.id} 
                      variant="outline" 
                      className="bg-muted/40 backdrop-blur-sm border-border/40 text-muted-foreground hover:text-primary transition-colors cursor-pointer text-[9px] font-bold uppercase tracking-widest"
                    >
                      {collection.name}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-4 text-balance">
                  {currentBook.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xl md:text-2xl font-medium text-muted-foreground/80">
                  {currentBook.authors && (currentBook.authors as any[]).length > 0 ? (
                    (currentBook.authors as any[]).map((author, index) => (
                      <span key={author.id} className="flex items-center gap-2">
                        <Link 
                          href={`/authors/${author.id}`}
                          className="hover:text-primary hover:underline transition-all underline-offset-4"
                        >
                          {author.name}
                        </Link>
                        {index < (currentBook.authors as any[]).length - 1 && <span className="text-muted-foreground/30">•</span>}
                      </span>
                    ))
                  ) : (
                    <span>{currentBook.author}</span>
                  )}
                </div>
              </motion.div>

              {/* Rating Section Redesenhada */}
              {currentBook.rating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm w-fit"
                >
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 transition-all duration-300 ${
                          i < Math.floor(currentBook.rating! / 2)
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                            : i < currentBook.rating! / 2
                              ? "fill-amber-400/50 text-amber-400/50"
                              : "fill-muted/30 text-muted/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1.5 border-l border-white/10 pl-6">
                    <span className="text-4xl font-black tracking-tighter text-amber-400">
                      {Number(currentBook.rating).toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">/ 10</span>
                  </div>
                </motion.div>
              )}

              {/* Progresso de Leitura - Mais elegante */}
              {currentBook.start_reading_date && !currentBook.finish_reading_date && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  className="max-w-md space-y-3"
                >
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t.readingProgress}</span>
                    <span className="text-2xl font-black tracking-tighter">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full bg-linear-to-r from-primary via-primary/80 to-primary/60 shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    />
                  </div>
                </motion.div>
              )}

              {/* Quick Actions integradas */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
              >
                {getQuickActions()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para organização com Estilo Premium */}
      <Tabs defaultValue="details" className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
        <div className="flex justify-center lg:justify-start">
          <TabsList className="bg-muted/30 backdrop-blur-md border border-border/40 p-1.5 rounded-2xl h-auto gap-1">
            <TabsTrigger value="details" className="gap-2.5 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold text-xs uppercase tracking-widest">
              <BookOpen className="h-4 w-4" />
              {t.details}
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2.5 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold text-xs uppercase tracking-widest">
              <FileText className="h-4 w-4" />
              {t.review}
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2.5 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold text-xs uppercase tracking-widest">
              <Users className="h-4 w-4" />
              {t.characters}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-2.5 px-6 py-2.5 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all font-bold text-xs uppercase tracking-widest">
              <Quote className="h-4 w-4" />
              {t.quotes}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Detalhes - Layout Premium Integrado */}
        <TabsContent value="details" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Coluna da Esquerda: Info Principal & Géneros */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 md:p-10 shadow-xl overflow-hidden relative group">
                {/* Decorativo de fundo */}
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                
                <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                  <div className="h-2 w-8 bg-primary rounded-full" />
                  {t.bookInfo}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{t.publisher}</p>
                      <p className="text-lg font-bold">{currentBook.publisher || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{t.pages}</p>
                      <p className="text-lg font-bold">{currentBook.pages || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{t.releaseDate}</p>
                      <p className="text-lg font-bold">
                        {currentBook.release_date ? new Date(currentBook.release_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                      <Hash className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{t.genres}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentBook.genres?.map((genre) => (
                          <Badge key={genre} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-widest">
                            {t[genre as keyof typeof t] || genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-10 bg-border/40" />

                <div className="flex flex-col md:flex-row gap-8">
                   {/* Datas de Leitura */}
                   <div className="flex-1 space-y-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {t.readingDates}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/20">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">{t.startDate}</p>
                          <p className="font-bold text-sm">
                            {currentBook.start_reading_date ? new Date(currentBook.start_reading_date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : "Não iniciada"}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/20">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">{t.finishDate}</p>
                          <p className="font-bold text-sm">
                            {currentBook.finish_reading_date ? new Date(currentBook.finish_reading_date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : "Em progresso"}
                          </p>
                        </div>
                      </div>

                      {/* Novas métricas de estimativa */}
                      {currentBook.start_reading_date && !currentBook.finish_reading_date && currentBook.pages && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/20">
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-2">Tempo Restante Estimado</p>
                            <p className="font-black text-xl text-primary">
                              {Math.round(((currentBook.pages * (1 - progress/100)) * 250) / readingSpeed / 60)}h {Math.round(((currentBook.pages * (1 - progress/100)) * 250) / readingSpeed % 60)}m
                            </p>
                          </div>
                          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 mb-2">Previsão de Conclusão</p>
                            <p className="font-black text-sm text-amber-600 dark:text-amber-400">
                              {(() => {
                                const remainingPages = currentBook.pages * (1 - progress/100);
                                const minutesPerDay = 30; // Assumindo 30 min/dia se não tivermos histórico
                                const daysRemaining = (remainingPages * 250 / readingSpeed) / minutesPerDay;
                                const date = new Date();
                                date.setDate(date.getDate() + daysRemaining);
                                return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
                              })()}
                            </p>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Avaliação & Coleções */}
            <div className="lg:col-span-4 space-y-8">
              {/* Card de Avaliação */}
              <div className="bg-amber-500/5 backdrop-blur-md rounded-[2.5rem] border border-amber-500/10 p-8 shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-amber-500">
                  <Award className="h-4 w-4" />
                  {t.personalEvaluation}
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${currentBook.would_read_again === 'yes' ? 'bg-success/20 text-success' : 'bg-muted/30 text-muted-foreground'}`}>
                        <Heart className={`h-5 w-5 ${currentBook.would_read_again === 'yes' ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">{t.wouldReadAgain}</span>
                    </div>
                    <span className="text-sm font-black uppercase text-primary tracking-widest">
                      {currentBook.would_read_again ? t[currentBook.would_read_again as keyof typeof t] : "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${currentBook.would_recommend === 'yes' ? 'bg-success/20 text-success' : currentBook.would_recommend === 'no' ? 'bg-destructive/20 text-destructive' : 'bg-muted/30 text-muted-foreground'}`}>
                        <ThumbsUp className={`h-5 w-5 ${currentBook.would_recommend === 'yes' ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">{t.wouldRecommend}</span>
                    </div>
                    <span className="text-sm font-black uppercase text-primary tracking-widest">
                      {currentBook.would_recommend ? (t[currentBook.would_recommend as keyof typeof t] || currentBook.would_recommend) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Coleções */}
              <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
                  <Bookmark className="h-4 w-4" />
                  {t.collections}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed">
                  Adiciona este livro a uma ou mais coleções temáticas para o manteres organizado.
                </p>
                <CollectionSelector
                  selectedCollectionIds={currentBook.collections?.map((c: any) => c.id) || []}
                  onSelectionChange={async (ids) => {
                    try {
                      await updateBookMutation.mutateAsync({ 
                        id: currentBook.id,
                        collections: ids 
                      });
                      toast({ title: t.collectionsUpdated });
                    } catch (error) {
                      console.error("Error updating book collections:", error);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Review */}
        <TabsContent value="review">
          <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 md:p-12 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
             
             <div className="relative z-10">
               <h3 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                 <FileText className="h-6 w-6 text-primary" />
                 {t.review}
               </h3>

               {currentBook.review ? (
                 <div className="prose prose-lg dark:prose-invert max-w-none">
                   <div className="bg-white/5 rounded-[2rem] p-8 md:p-10 border border-white/5 shadow-inner">
                     <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap font-medium italic">
                       {currentBook.review}
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-20">
                   <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/40">
                     <FileText className="h-10 w-10 text-muted-foreground/40" />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight mb-2">{t.noReview}</h3>
                   <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                     {t.addReviewPrompt}
                   </p>
                   <Link href={`/edit-book/${currentBook.id}`}>
                     <Button className="gap-2.5 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                       <Edit className="h-4 w-4" />
                       {t.addReview}
                     </Button>
                   </Link>
                 </div>
               )}
             </div>
          </div>
        </TabsContent>

        {/* Tab: Characters */}
        <TabsContent value="characters">
          <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 md:p-12 shadow-xl">
            <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              {t.characters}
              {currentBook.characters && (
                <span className="ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black">
                  {currentBook.characters.length}
                </span>
              )}
            </h3>

            {currentBook.characters && currentBook.characters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBook.characters.map((character, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all duration-300 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary transition-colors duration-300 group-hover:text-primary-foreground">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black tracking-tight">{character}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                          {t.character} #{index + 1}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/40">
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">{t.noCharacters}</h3>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                  {t.addCharactersPrompt}
                </p>
                <Link href={`/edit-book/${currentBook.id}`}>
                  <Button className="gap-2.5 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                    <Edit className="h-4 w-4" />
                    {t.addCharacters}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Quotes */}
        <TabsContent value="quotes">
          <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl -ml-24 -mb-24" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-widest mb-10 flex items-center gap-3">
                <Quote className="h-6 w-6 text-primary" />
                {t.memorableQuotes}
                {currentBook.quotes && (
                  <span className="ml-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black">
                    {currentBook.quotes.length}
                  </span>
                )}
              </h3>

              {currentBook.quotes && currentBook.quotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {currentBook.quotes.map((quote, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="h-full p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl flex flex-col justify-between">
                        <Quote className="h-8 w-8 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
                        <p className="text-xl italic font-serif text-foreground/90 leading-relaxed mb-8">
                          "{quote}"
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                            Frase #{index + 1}
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/40">
                    <Quote className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-2">{t.noQuotes}</h3>
                  <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                    {t.addQuotesPrompt}
                  </p>
                  <Link href={`/edit-book/${currentBook.id}`}>
                    <Button className="gap-2.5 px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                      <Edit className="h-4 w-4" />
                      {t.addQuotes}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Estatísticas e Informações Rápidas - Estilo Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
        <div className="group p-6 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <StatusIcon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t.status}</span>
          </div>
          <p className="text-2xl font-black tracking-tight">{readingStatus.text}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">Atualizado recentemente</p>
        </div>

        {currentBook.rating && (
          <div className="group p-6 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <Star className="h-6 w-6 fill-amber-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t.rating}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black tracking-tight text-amber-500">{Number(currentBook.rating).toFixed(1)}</p>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">/ 10</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Avaliação Pessoal</p>
          </div>
        )}

        {currentBook.pages && (
          <div className="group p-6 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t.pages}</span>
            </div>
            <p className="text-3xl font-black tracking-tight">{currentBook.pages}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">Total de Páginas</p>
          </div>
        )}

        <div className="group p-6 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Registo</span>
          </div>
          <p className="text-xl font-black tracking-tight">
            {new Date(currentBook.created_at).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">Data de Adição</p>

        </div>
      </div>

      {/* Dialog de Avaliação */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-border/40 rounded-[2rem] p-0 overflow-hidden">
          <div className="bg-linear-to-br from-amber-500/10 via-background to-background p-8 md:p-10">
            <DialogHeader className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
                <Star className="h-7 w-7 fill-current" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">Avaliar a tua Leitura</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Terminaste de ler "{currentBook.title}". O que achaste deste livro?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              {/* Star Rating */}
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">A tua Nota (0-10)</Label>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => {
                      const ratingValue = (i + 1) * 2;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setEvaluationForm(prev => ({ ...prev, rating: ratingValue }))}
                          className="group transition-all duration-300"
                        >
                          <Star 
                            className={`h-10 w-10 transition-all ${
                              evaluationForm.rating >= ratingValue 
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] scale-110" 
                                : "text-muted/30 hover:text-amber-400/50"
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2 pl-4">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluationForm.rating}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= 10) {
                          setEvaluationForm(prev => ({ ...prev, rating: val }));
                        } else if (e.target.value === "") {
                          setEvaluationForm(prev => ({ ...prev, rating: 0 }));
                        }
                      }}
                      className="bg-transparent text-3xl font-black text-amber-500 tracking-tighter w-16 outline-hidden border-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest mr-2">/ 10</span>
                  </div>
                </div>

              </div>

              {/* Review Textarea */}
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">A tua Crítica</Label>
                <Textarea 
                  placeholder="Escreve aqui a tua opinião sobre o livro..."
                  className="min-h-[150px] bg-white/5 border-border/40 rounded-2xl p-4 focus:ring-amber-500/20 focus:border-amber-500/40 resize-none text-lg"
                  value={evaluationForm.review}
                  onChange={(e) => setEvaluationForm(prev => ({ ...prev, review: e.target.value }))}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Voltarias a ler?</Label>
                  <div className="flex gap-2">
                    {["yes", "no", "maybe"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setEvaluationForm(prev => ({ ...prev, would_read_again: opt as any }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          evaluationForm.would_read_again === opt 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {t[opt as keyof typeof t] || opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t.wouldRecommend}</Label>
                  <div className="flex gap-2">
                    {["yes", "no", "maybe"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setEvaluationForm(prev => ({ ...prev, would_recommend: opt as any }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          evaluationForm.would_recommend === opt 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {t[opt as keyof typeof t] || opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-10">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowEvaluationDialog(false)}
                  className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-12"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleEvaluate}
                  disabled={isLoading || evaluationForm.rating === 0}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isLoading ? "A guardar..." : "Submeter Avaliação"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
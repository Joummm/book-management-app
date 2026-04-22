"use client";

import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, Locale } from "@/lib/i18n";
import type { Book } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  BookOpen,
  Star,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Plus,
  BookMarked,
  ArrowRight,
  TrendingDown,
  Library,
  Trophy,
  Flame,
  Hourglass,
  CheckCircle2,
  CalendarDays,
  History
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReadingGoal } from "./ReadingGoal";
import { format, subDays, startOfYear, eachDayOfInterval, isSameDay, differenceInDays, parseISO, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User2, FilterX } from "lucide-react";

import { useBooks } from "@/hooks/use-books";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";

interface DashboardContentProps {
  books: Book[];
  communityBooks?: any[];
  readingGoal?: number;
  progress?: any[];
}

export function DashboardContent({ 
  books: initialBooks, 
  communityBooks: initialCommunityBooks = [], 
  readingGoal: initialReadingGoal = 0, 
  progress: initialProgress = [] 
}: DashboardContentProps) {
  const { locale, readingSpeed } = useApp();
  const t = getTranslations(locale as Locale);
  const { toast } = useToast();
  const router = useRouter();
  
  // Use TanStack Query for dynamic data
  const { data: booksData } = useBooks();
  const { data: profileData } = useProfile();
  
  const books = booksData || initialBooks;
  const readingGoal = profileData?.profile?.reading_goal || initialReadingGoal;
  const progress = profileData?.readingProgress || initialProgress; 
  const communityBooks = initialCommunityBooks; 

  const [isCloning, setIsCloning] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string>("all");

  const handleCloneBook = async (bookId: string) => {
    setIsCloning(bookId);
    try {
      const res = await fetch("/api/community/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        toast({ title: "Livro Adicionado!", description: "O livro foi importado para a tua biblioteca com o estado 'Não Iniciado'." });
        router.refresh();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível adicionar o livro.", variant: "destructive" });
    } finally {
      setIsCloning(null);
    }
  };

  // Calculate statistics
  const totalBooks = books.length;
  const ratedBooksList = books.filter((b) => b.rating !== null && b.rating !== undefined);
  const averageRating =
    ratedBooksList.length > 0
      ? ratedBooksList.reduce((sum, b) => sum + Number(b.rating), 0) /
        ratedBooksList.length
      : 0;

  // Pages read calculation
  const totalPagesRead = books
    .filter((b) => b.finish_reading_date)
    .reduce((sum, b) => sum + (Number(b.pages) || 0), 0);

  // Books per year - ONLY count completed books
  const booksByYear = books.reduce(
    (acc, book) => {
      // ONLY count if the book is actually finished
      if (book.finish_reading_date) {
        const year = new Date(book.finish_reading_date).getFullYear();
        if (!isNaN(year)) {
          acc[year] = (acc[year] || 0) + 1;
        }
      }
      return acc;
    },
    {} as Record<number, number>,
  );

  const currentYear = new Date().getFullYear();
  const booksThisYear = booksByYear[currentYear] || 0;
  const booksLastYear = booksByYear[currentYear - 1] || 0;
  
  // Calculate reading trend
  const trendPercent = booksLastYear > 0 
    ? Math.round(((booksThisYear - booksLastYear) / booksLastYear) * 100) 
    : 100;

  // Reading progress
  const readingBooks = books.filter(
    (b) => b.start_reading_date && !b.finish_reading_date,
  ).length;
  const completedBooks = books.filter((b) => b.finish_reading_date).length;
  const completionRate =
    totalBooks > 0 ? ((completedBooks / totalBooks) * 100).toFixed(0) : 0;

  // Top genres
  const genreCount = books.reduce(
    (acc, book) => {
      book.genres?.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Increased to 5

  const chartData = Object.entries(booksByYear)
    .map(([year, count]) => ({
      year,
      count,
    }))
    .sort((a, b) => Number(a.year) - Number(b.year))
    .slice(-5); // Keep only last 5 years for better visualization

  // Recently finished books
  const recentFinishedBooks = [...books]
    .filter((b) => b.finish_reading_date)
    .sort((a, b) => new Date(b.finish_reading_date!).getTime() - new Date(a.finish_reading_date!).getTime())
    .slice(0, 5);

  // Highest rated books
  const topRatedBooks = [...books]
    .filter(b => b.rating && Number(b.rating) >= 4)
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 3);

  // Unique users for filtering
  const communityUsers = Array.from(new Set(communityBooks.map(b => b.owner_name))).filter(Boolean).sort();

  const filteredCommunityBooks = userFilter === "all" 
    ? communityBooks 
    : communityBooks.filter(b => b.owner_name === userFilter);

  // Reading Velocity Statistics
  const finishedWithDates = books.filter(b => b.start_reading_date && b.finish_reading_date && b.pages);
  
  const velocityData = finishedWithDates.map(b => {
    const start = new Date(b.start_reading_date!);
    const finish = new Date(b.finish_reading_date!);
    const diffTime = Math.abs(finish.getTime() - start.getTime());
    const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    return {
      title: b.title,
      days: diffDays,
      pages: Number(b.pages),
      velocity: Number(b.pages) / diffDays
    };
  });

  const avgPagesPerDay = velocityData.length > 0
    ? velocityData.reduce((sum, d) => sum + d.velocity, 0) / velocityData.length
    : 0;

  // Group by page ranges for the chart
  const ranges = [
    { label: '< 200 pág.', min: 0, max: 200 },
    { label: '200-400 pág.', min: 200, max: 400 },
    { label: '400-600 pág.', min: 400, max: 600 },
    { label: '600+ pág.', min: 600, max: 100000 },
  ];

  const rangeChartData = ranges.map(range => {
    const booksInRange = velocityData.filter(d => d.pages > range.min && d.pages <= range.max);
    const avgDays = booksInRange.length > 0 
      ? booksInRange.reduce((sum: number, d: any) => sum + d.days, 0) / booksInRange.length 
      : 0;
    return {
      range: range.label,
      avgDays: parseFloat(avgDays.toFixed(1)),
      count: booksInRange.length
    };
  });
  
  const hasVelocityData = rangeChartData.some(d => d.count > 0);

  // --- NEW STATISTICS LOGIC ---

  // 1. Reading Streak Calculation
  const getStreak = () => {
    if (progress.length === 0) return { current: 0, best: 0 };

    const dates = Array.from(new Set(progress
      .filter((p: any) => p.date && !isNaN(new Date(p.date as string).getTime()))
      .map((p: any) => format(new Date(p.date as string), "yyyy-MM-dd"))))
      .sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    // Check if user read today or yesterday to continue current streak
    const hasReadRecently = dates[0] === today || dates[0] === yesterday;
    
    if (hasReadRecently) {
      let checkDate = new Date(dates[0] as string);
      for (let i = 0; i < dates.length; i++) {
        const d = dates[i];
        if (format(checkDate, "yyyy-MM-dd") === d) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    // Best streak ever
    const allDatesAsc = [...dates].reverse();
    if (allDatesAsc.length > 0) {
      let checkDate = new Date(allDatesAsc[0] as string);
      tempStreak = 1;
      bestStreak = 1;

      for (let i = 1; i < allDatesAsc.length; i++) {
        const d = allDatesAsc[i];
        const nextDate = format(new Date(checkDate.getTime() + 86400000), "yyyy-MM-dd");
        
        if (d === nextDate) {
          tempStreak++;
          checkDate = new Date(d as string);
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
          checkDate = new Date(d as string);
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { current: currentStreak, best: bestStreak };
  };

  const streak = getStreak();

  // 2. Completion Prediction & Estimated Hours
  const currentBook = books.find(b => b.start_reading_date && !b.finish_reading_date && b.pages);
  let predictionDays = 0;
  let estimatedFinishDate = null;
  let totalEstimatedHours = 0;

  if (currentBook) {
    const pagesRemaining = Number(currentBook.pages) - progress
      .filter((p: any) => p.book_id === currentBook.id)
      .reduce((sum: number, p: any) => sum + p.pages_read, 0);
    
    if (avgPagesPerDay > 0 && pagesRemaining > 0) {
      predictionDays = Math.ceil(pagesRemaining / avgPagesPerDay);
      estimatedFinishDate = new Date(new Date().getTime() + predictionDays * 86400000);
    }

    // minutes per page = 250 words / readingSpeed words per minute
    totalEstimatedHours = (pagesRemaining * (250 / readingSpeed)) / 60;
  }

  // 3. Taxa de Conclusão
  const booksStarted = books.filter(b => b.start_reading_date).length;
  const realCompletionRate = booksStarted > 0 ? Math.round((completedBooks / booksStarted) * 100) : 0;

  // 4. Heatmap Data (GitHub style)
  const heatmapData = (() => {
    const start = startOfYear(new Date());
    const end = new Date();
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayProgress = progress.filter((p: any) => p.date && format(new Date(p.date as string), "yyyy-MM-dd") === dateStr);
      const totalPages = dayProgress.reduce((sum: number, p: any) => sum + p.pages_read, 0);
      
      let intensity = 0;
      if (totalPages > 0) intensity = 1;
      if (totalPages > 20) intensity = 2;
      if (totalPages > 50) intensity = 3;
      if (totalPages > 100) intensity = 4;

      return {
        date: dateStr,
        count: totalPages,
        intensity
      };
    });
  })();

  // 5. Weekly Trends (Last 4 weeks)
  const weeklyTrendsData = (() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const start = subDays(new Date(), (i + 1) * 7);
      const end = subDays(new Date(), i * 7);
      const weekProgress = progress.filter((p: any) => {
        if (!p.date) return false;
        const d = new Date(p.date as string);
        return d >= start && d <= end;
      });
      weeks.push({
        week: `W${4-i}`,
        pages: weekProgress.reduce((sum: number, p: any) => sum + p.pages_read, 0)
      });
    }
    return weeks;
  })();

  // 6. Timeline data
  const timelineBooks = books
    .filter(b => b.finish_reading_date)
    .sort((a, b) => new Date(b.finish_reading_date!).getTime() - new Date(a.finish_reading_date!).getTime());

  // 7. Pie Chart Data for Genres
  const pieChartData = topGenres.map(([name, value], index) => ({
    name: t[name as keyof typeof t] || name,
    value,
    color: `oklch(from var(--primary) l c h / ${1 - (index * 0.15)})`
  }));

  // 8. XP & Level System
  const totalPagesAllTime = progress.reduce((sum: number, p: any) => sum + (p.pages_read || 0), 0);
  const totalXP = totalPagesAllTime * 10;
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const levelProgress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // If no finished books, fallback to recently added
  const displayedBooks = recentFinishedBooks.length > 0 ? recentFinishedBooks : books.slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 relative"
    >
      
       {/* Background decorative elements */}
       <div className="absolute top-0 right-0 -z-10 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
       <div className="absolute top-40 left-0 -z-10 w-[400px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

       {/* Header section */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-8">
         <div className="space-y-1">
           <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
               <Library className="h-6 w-6 text-primary" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight font-serif text-foreground">
               {t.dashboardOverview || "Visão Geral"}
             </h1>
             <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">Nível {level}</span>
                <div className="w-20 h-1.5 bg-primary/20 rounded-full overflow-hidden ml-1">
                   <div className="h-full bg-primary" style={{ width: `${levelProgress}%` }} />
                </div>
             </div>
           </div>
           <p className="text-muted-foreground text-lg font-sans pl-1">
             {t.dashboardSubtitle || "Acompanha o teu progresso literário e descobre novos hábitos."}
           </p>
         </div>
         
         <div className="flex items-center gap-4">
           <Link href="/add-book">
             <Button className="gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 rounded-xl h-12 px-8 text-base font-semibold group">
               <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
               <span>{t.addBook}</span>
             </Button>
           </Link>
         </div>
       </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="library" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Library className="h-4 w-4 mr-2" />
            A Minha Biblioteca
          </TabsTrigger>
          <TabsTrigger value="community" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4 mr-2" />
            Comunidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Super KPIs Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="glass-card card-lift border-0 bg-linear-to-b from-card/80 to-card overflow-hidden relative group">
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 text-orange-500">
                <Flame className="h-24 w-24 rotate-12 fill-current" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Streak de Leitura</span>
                  <div className="text-5xl font-bold font-serif mb-1 text-foreground flex items-center gap-2">
                    {streak.current} <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg font-bold">
                      Melhor: {streak.best} dias
                    </span>
                    <div className="h-4 w-12 ml-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyTrendsData}>
                          <Area type="monotone" dataKey="pages" stroke="#f97316" fill="#fb923c" fillOpacity={0.2} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card card-lift border-0 bg-linear-to-b from-card/80 to-card overflow-hidden relative group">
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 text-blue-500">
                <Hourglass className="h-24 w-24 rotate-12" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Previsão Conclusão</span>
                  <div className="text-5xl font-bold font-serif mb-1 text-foreground">
                    {predictionDays > 0 ? `${predictionDays}d` : '--'}
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {totalEstimatedHours > 0 ? `${totalEstimatedHours.toFixed(1)}h restantes` : 'Sem livro atual'}
                    </span>
                    {estimatedFinishDate && (
                      <span className="text-[10px] opacity-70">Previsão: {format(estimatedFinishDate, "dd MMM", { locale: pt })}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
    
            <Card className="glass-card card-lift border-0 bg-linear-to-b from-card/80 to-card overflow-hidden relative group">
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 text-emerald-500">
                 <CheckCircle2 className="h-24 w-24 -rotate-12" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Taxa de Conclusão</span>
                  <div className="text-5xl font-bold font-serif mb-1 text-foreground">
                    {realCompletionRate}%
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-bold">
                      {completedBooks} de {booksStarted} iniciados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
    
            <Card className="glass-card card-lift border-0 bg-linear-to-b from-card/80 to-card overflow-hidden relative group">
              <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 text-purple-500">
                 <TrendingUp className="h-24 w-24 rotate-6" />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.readInYear?.replace("{year}", String(currentYear)) || `Lidos em ${currentYear}`}</span>
                  <div className="text-5xl font-bold font-serif mb-1 text-foreground">{booksThisYear}</div>
                  <div className="flex items-center gap-1.5 text-xs">
                     {trendPercent >= 0 ? (
                       <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                         <TrendingUp className="h-3.5 w-3.5" />
                         {trendPercent > 0 ? `+${trendPercent}%` : 'Igual a'} {currentYear - 1}
                       </span>
                     ) : (
                       <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                         <TrendingDown className="h-3.5 w-3.5" />
                         {trendPercent}% vs {currentYear - 1}
                       </span>
                     )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

       <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
         
         {/* Main Chart Column */}
         <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Activity Heatmap */}
            <Card className="glass border-0 shadow-xs ring-1 ring-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Atividade de Leitura
                </CardTitle>
                <CardDescription>
                  Frequência de leitura ao longo do ano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 justify-center py-2">
                  {heatmapData.slice(-120).map((day, i) => (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm transition-colors duration-300 ${
                        day.intensity === 0 ? 'bg-muted/30' :
                        day.intensity === 1 ? 'bg-primary/20' :
                        day.intensity === 2 ? 'bg-primary/40' :
                        day.intensity === 3 ? 'bg-primary/70' :
                        'bg-primary'
                      }`}
                      title={`${day.date}: ${day.count} páginas`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-1 mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                  <span>Menos</span>
                  <div className="w-2 h-2 bg-muted/30 rounded-xs" />
                  <div className="w-2 h-2 bg-primary/20 rounded-xs" />
                  <div className="w-2 h-2 bg-primary/40 rounded-xs" />
                  <div className="w-2 h-2 bg-primary/70 rounded-xs" />
                  <div className="w-2 h-2 bg-primary rounded-xs" />
                  <span>Mais</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-xs ring-1 ring-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-2xl flex items-center gap-2">
                       <BarChart3 className="h-5 w-5 text-primary" />
                       Progresso Anual
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Quantidade de livros concluídos por ano
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[320px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="rgb(156, 163, 175)" strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                          dataKey="year"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'rgb(156, 163, 175)', fontSize: 13, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'rgb(156, 163, 175)', fontSize: 13, fontWeight: 600 }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #4f46e5",
                            borderRadius: "12px",
                            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                            color: "#fff"
                          }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#94a3b8", marginBottom: '4px', fontWeight: 600 }}
                        />
                        <Bar
                          dataKey="count"
                          name="Livros concluídos"
                          fill="#818cf8"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                          animationDuration={1000}
                        >
                           <LabelList 
                             dataKey="count" 
                             position="top" 
                             style={{ 
                                fill: '#fff', 
                                fontSize: 14, 
                                fontWeight: 800,
                                paintOrder: 'stroke',
                                stroke: '#000',
                                strokeWidth: '2px'
                             }}
                             formatter={(value: number) => value > 0 ? value : ""}
                             dy={-10}
                           />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[320px] flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                    <div className="p-4 rounded-full bg-muted/50">
                       <BarChart3 className="h-8 w-8 text-muted-foreground/60" />
                    </div>
                    <div className="text-center max-w-[250px]">
                      <p className="font-semibold text-foreground">Sem dados suficientes</p>
                      <p className="text-sm mt-1 mb-4 leading-relaxed">Marque livros como concluídos para acompanhar o seu progresso anual.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reading Timeline */}
            <Card className="glass border-0 shadow-xs ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Timeline de Leitura
                </CardTitle>
                <CardDescription>
                  Histórico cronológico das tuas leituras concluídas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative overflow-x-auto pb-6 pt-2 scrollbar-hide">
                  <div className="flex gap-4 px-6 min-w-max">
                    {timelineBooks.map((book, i) => (
                      <div key={book.id} className="relative flex flex-col items-center w-28 group">
                        {/* Connecting Line */}
                        {i < timelineBooks.length - 1 && (
                          <div className="absolute top-1/2 left-[calc(50%+14px)] w-full h-0.5 bg-border/40 -z-10" />
                        )}
                        <Link href={`/books/${book.id}`} className="block">
                          <div className="w-20 h-28 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                            {book.cover_image ? (
                              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="mt-3 text-center">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(book.finish_reading_date!), "MMM yyyy", { locale: pt })}</p>
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold">{Number(book.rating).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
         </div>

         {/* Sidebar Insights */}
         <div className="space-y-6 md:space-y-8">
             <ReadingGoal 
               initialGoal={readingGoal} 
               currentCount={booksThisYear} 
               year={currentYear} 
             />

             {/* Dominant Genre (Pie Chart) */}
             <Card className="glass border-0 shadow-xs ring-1 ring-border/50">
               <CardHeader className="pb-3">
                 <CardTitle className="font-serif text-lg flex items-center justify-between">
                    Género Dominante
                 </CardTitle>
               </CardHeader>
               <CardContent>
                  {pieChartData.length > 0 ? (
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: '1px solid #4f46e5', 
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {pieChartData.map((genre) => (
                          <div key={genre.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: genre.color }} />
                              <span className="font-medium text-muted-foreground">{genre.name}</span>
                            </div>
                            <span className="font-bold">{genre.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Nenhum género classificado.
                    </div>
                  )}
               </CardContent>
             </Card>

             <Card className="glass border-0 shadow-xs ring-1 ring-border/50 overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-5 transform rotate-12">
                    <Trophy className="w-32 h-32" />
                </div>
                
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-amber-500" />
                     Melhor Avaliados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   {topRatedBooks.length > 0 ? (
                       <div className="space-y-4">
                         {topRatedBooks.map((book, index) => (
                            <Link key={book.id} href={`/books/${book.id}`} className="flex items-center gap-4 group">
                               <div className="relative font-serif font-bold text-2xl text-muted-foreground/30 w-6 text-center group-hover:text-primary transition-colors">
                                 {index + 1}
                               </div>
                               <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0 shadow-sm">
                                  {book.cover_image ? (
                                     <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                                  ) : (
                                     <div className="w-full h-full bg-primary/10" />
                                  )}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{book.title}</p>
                                  <div className="flex items-center gap-1.5 mt-1">
                                     <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                     <span className="text-xs font-bold text-muted-foreground">{Number(book.rating).toFixed(1)}</span>
                                  </div>
                               </div>
                            </Link>
                         ))}
                       </div>
                   ) : (
                     <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-xl">
                       Comece a avaliar os livros que lê.
                     </div>
                   )}
                </CardContent>
             </Card>

         </div>
       </div>
       </TabsContent>

        <TabsContent value="community" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
          <Card className="border-border/50 shadow-sm bg-muted/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Descobre Novos Livros</CardTitle>
                <CardDescription>Explora os livros públicos partilhados por outros leitores da comunidade BookManager.</CardDescription>
              </div>

              {communityUsers.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[180px] bg-background/50 border-border/50 rounded-lg">
                      <SelectValue placeholder="Filtrar por utilizador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os leitores</SelectItem>
                      {communityUsers.map((user: string) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {filteredCommunityBooks.length > 0 ? filteredCommunityBooks.map((book) => (
                    <Card key={book.id} className="overflow-hidden group flex flex-col items-center p-4 border-border/50 hover:border-primary/30 transition-all bg-card/60 backdrop-blur-sm">
                       <div className="h-48 w-32 bg-muted rounded-md overflow-hidden relative shadow-md mb-4 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
                          {book.cover_image ? (
                             <img src={book.cover_image} alt={book.title} className="h-full w-full object-cover" />
                          ) : (
                             <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-primary/30" />
                             </div>
                          )}
                       </div>
                       <h3 className="font-semibold text-center text-sm line-clamp-1 w-full" title={book.title}>{book.title}</h3>
                       <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-1">{book.author}</p>
                       <div className="text-[10px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full mb-4">
                          Partilhado por {book.owner_name || "Desconhecido"}
                       </div>
                       <Button 
                         onClick={() => handleCloneBook(book.id)} 
                         disabled={isCloning === book.id}
                         variant="secondary" 
                         size="sm" 
                         className="w-full gap-2 rounded-lg cursor-pointer"
                       >
                         {isCloning === book.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                         Adicionar à Coleção
                       </Button>
                    </Card>
                 )) : (
                     <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center">
                        {userFilter === "all" ? (
                          <>
                            <Globe className="h-12 w-12 text-muted mb-4 opacity-50" />
                            <p className="text-lg font-medium text-foreground">Ainda não existem livros partilhados na comunidade.</p>
                            <p className="text-sm mt-1">Sê o primeiro a adicionar e partilha a tua biblioteca!</p>
                          </>
                        ) : (
                          <>
                            <FilterX className="h-12 w-12 text-muted mb-4 opacity-50" />
                            <p className="text-lg font-medium text-foreground">Nenhum livro encontrado para este leitor.</p>
                            <p className="text-sm mt-1">Tenta selecionar outro utilizador ou limpa o filtro.</p>
                            <Button variant="link" onClick={() => setUserFilter("all")} className="mt-2 text-primary">
                              Limpar Filtro
                            </Button>
                          </>
                        )}
                     </div>
                 )}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

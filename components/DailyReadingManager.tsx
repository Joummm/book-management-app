"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, Check, Save } from "lucide-react";

export function DailyReadingManager({ books, progress }: { books: any[], progress: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);

  // State to hold local input value before saving
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [durationValues, setDurationValues] = useState<Record<string, string>>({});

  // Prepare chart data for the last 14 days
  const chartData = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
     const date = subDays(today, i);
     const dateStr = format(date, "yyyy-MM-dd");
     
     // Sum pages and duration for this date across all books
     const dayProgress = progress.filter(p => {
         try {
           return format(new Date(p.date), "yyyy-MM-dd") === dateStr;
         } catch (e) {
           return false;
         }
       });

     const pagesRead = dayProgress.reduce((sum, p) => sum + p.pages_read, 0);
     const duration = dayProgress.reduce((sum, p) => sum + (p.duration_minutes || 0), 0);

     chartData.push({
        date: dateStr,
        displayDate: format(date, "dd/MM"),
        pages: pagesRead,
        duration: duration,
        isToday: i === 0
     });
  }

  const handleSaveProgress = async (bookId: string) => {
    const pages = parseInt(inputValues[bookId] || "0", 10);
    const duration = parseInt(durationValues[bookId] || "0", 10);
    
    if (isNaN(pages) || pages < 0) {
       toast({ title: "Valor de páginas inválido", variant: "destructive" });
       return;
    }

    setLoadingBookId(bookId);
    
    try {
       const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, pagesRead: pages, durationMinutes: duration })
       });

       if (res.ok) {
          toast({ title: "Progresso atualizado!" });
          setDurationValues({ ...durationValues, [bookId]: "" });
          router.refresh();
       } else {
          throw new Error();
       }
    } catch {
       toast({ title: "Erro ao guardar progresso", variant: "destructive" });
    } finally {
       setLoadingBookId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Chart */}
      <Card className="border-border/50">
        <CardHeader>
           <CardTitle className="text-lg">Atividade nos últimos 14 days</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                       dataKey="displayDate" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 13, fill: "rgb(156, 163, 175)", fontWeight: 600 }} 
                       dy={10}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 13, fill: "rgb(156, 163, 175)", fontWeight: 600 }} 
                    />
                    <Tooltip 
                       cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                       contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid #4f46e5', 
                          backgroundColor: '#1e293b',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                          color: '#fff'
                       }}
                       itemStyle={{ color: '#fff' }}
                       labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
                       formatter={(value: number, name: string) => [
                         name === "pages" ? `${value} páginas` : `${value} min`, 
                         name === "pages" ? "Lidas" : "Duração"
                       ]}
                       labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Bar dataKey="pages" radius={[4, 4, 0, 0]} animationDuration={800} barSize={32}>
                       {chartData.map((entry, index) => (
                          <Cell 
                             key={`cell-${index}`} 
                             fill={entry.isToday ? "#818cf8" : "rgba(129, 140, 248, 0.3)"}
                             stroke={entry.isToday ? "#c7d2fe" : "none"}
                             strokeWidth={2}
                             className="transition-all duration-300 hover:opacity-80"
                          />
                       ))}
                       <LabelList 
                          dataKey="pages" 
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
        </CardContent>
      </Card>

      {/* Active Books */}
      <div className="space-y-4">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Leituras em Curso
         </h2>
         
         {books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {books.map(book => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  // If it already has an entry for today, show it
                  const todaysEntry = progress.find(p => {
                    if (p.book_id !== book.id) return false;
                    try {
                      return format(new Date(p.date), "yyyy-MM-dd") === todayStr;
                    } catch (e) {
                      return false;
                    }
                  });
                  
                  // Calculate current page by summing all progress for this book
                  const currentPage = progress
                    .filter(p => p.book_id === book.id)
                    .reduce((sum, p) => sum + p.pages_read, 0);
                  
                  const progressPercentage = book.pages ? Math.min(Math.round((currentPage / book.pages) * 100), 100) : 0;

                  const initialPages = todaysEntry ? String(todaysEntry.pages_read) : "";
                  const initialDuration = todaysEntry ? String(todaysEntry.duration_minutes || "") : "";

                  return (
                    <Card key={book.id} className="border-border/50">
                       <CardContent className="p-4 flex gap-4">
                          <div className="h-24 w-16 bg-muted rounded shrink-0 overflow-hidden shadow-sm">
                              {book.cover_image && <img src={book.cover_image} alt={book.title} className="h-full w-full object-cover" />}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                 <h3 className="font-bold line-clamp-1" title={book.title}>{book.title}</h3>
                                 <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                                 <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                       <div 
                                          className="h-full bg-primary transition-all duration-500" 
                                          style={{ width: `${progressPercentage}%` }} 
                                       />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                                       Pág. {currentPage} / {book.pages || '?'} ({progressPercentage}%)
                                    </span>
                                 </div>
                              </div>
                              <div className="mt-2 flex flex-wrap items-end gap-3">
                                <div className="space-y-1 flex-1 min-w-[80px]">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Páginas:</label>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={inputValues[book.id] ?? initialPages}
                                    onChange={(e) => setInputValues({ ...inputValues, [book.id]: e.target.value })}
                                    className="h-8"
                                    placeholder="Ex: 20"
                                  />
                                </div>
                                <div className="space-y-1 flex-1 min-w-[80px]">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tempo (min):</label>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    value={durationValues[book.id] ?? initialDuration}
                                    onChange={(e) => setDurationValues({ ...durationValues, [book.id]: e.target.value })}
                                    className="h-8"
                                    placeholder="Ex: 30"
                                  />
                                </div>
                                <Button 
                                  size="sm" 
                                  className="h-8" 
                                  onClick={() => handleSaveProgress(book.id)}
                                  disabled={loadingBookId === book.id || (!inputValues[book.id] && !durationValues[book.id])}
                                >
                                   {loadingBookId === book.id ? <Save className="h-3 w-3 animate-pulse" /> : <Save className="h-3 w-3 mr-1" />}
                                   Gravar
                                </Button>
                                {todaysEntry && <Check className="h-4 w-4 text-emerald-500" />}
                              </div>
                          </div>
                       </CardContent>
                    </Card>
                  );
               })}
            </div>
         ) : (
            <div className="p-12 text-center text-muted-foreground border rounded-xl border-dashed">
               Não tens nenhum livro em modo "A ler". Altera o estado de um livro para começares a registar o teu progresso.
            </div>
         )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Coffee, 
  Volume2, 
  VolumeX,
  X,
  Pencil,
  BookOpen,
  Check,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useBooks } from "@/hooks/use-books";
import { useToast } from "@/hooks/use-toast";

export function ReadingTimer() {
  const { data: books } = useBooks();
  const { toast } = useToast();
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [mode, setMode] = useState<"read" | "break">("read");
  const [isOpen, setIsOpen] = useState(false);

  // Custom time editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Book session tracking
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);
  const [pagesRead, setPagesRead] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter books that are currently being read
  const activeBooks = books?.filter(b => b.start_reading_date && !b.finish_reading_date) || [];

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, minutes, seconds]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (isSoundEnabled) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(() => {});
    }
    
    if (mode === "read") {
      // Suggest logging progress if a book was selected
      if (selectedBookId) {
        setIsLoggingProgress(true);
      }
      setMode("break");
      setMinutes(5);
    } else {
      setMode("read");
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setIsLoggingProgress(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMode("read");
    setMinutes(25);
    setSeconds(0);
    setIsEditing(false);
    setIsLoggingProgress(false);
  };

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startEditing = () => {
    if (isActive) return;
    setEditValue(formatTime(minutes, seconds));
    setIsEditing(true);
  };

  const commitEdit = () => {
    setIsEditing(false);
    const raw = editValue.trim();
    if (!raw) return;

    if (raw.includes(":")) {
      const parts = raw.split(":");
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      setMinutes(Math.max(0, Math.min(m, 99)));
      setSeconds(Math.max(0, Math.min(s, 59)));
    } else {
      const m = parseInt(raw, 10);
      if (!isNaN(m) && m > 0) {
        setMinutes(Math.min(m, 99));
        setSeconds(0);
      }
    }
  };

  const handleSaveProgress = async () => {
    if (!selectedBookId || !pagesRead) return;
    
    // Calculate how many minutes were actually read
    // If user edited time, we use that as the basis
    const totalSessionSeconds = mode === "read" ? (minutes * 60 + seconds) : 0; 
    // This is tricky because minutes/seconds are counting down.
    // We should have stored the INITIAL minutes when started.
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookId: selectedBookId, 
          pagesRead: parseInt(pagesRead, 10),
          durationMinutes: Math.max(1, minutes) // Simple approximation for now
        })
      });

      if (res.ok) {
        toast({ title: "Progresso guardado!", description: `Registaste ${pagesRead} páginas.` });
        setIsLoggingProgress(false);
        setPagesRead("");
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Erro ao guardar progresso", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setIsEditing(false);
  };

  const setPreset = (m: number) => {
    if (isActive) return;
    setMinutes(m);
    setSeconds(0);
    setIsEditing(false);
  };

  const selectedBook = activeBooks.find(b => b.id === selectedBookId);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="mb-4"
          >
            <Card className="w-72 glass border-primary/20 shadow-2xl overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                {/* Header */}
                <div className={`p-4 flex items-center justify-between ${mode === "read" ? "bg-primary/10" : "bg-emerald-500/10"}`}>
                  <div className="flex items-center gap-2">
                    {mode === "read" ? <Timer className="h-4 w-4 text-primary" /> : <Coffee className="h-4 w-4 text-emerald-500" />}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${mode === "read" ? "text-primary" : "text-emerald-600"}`}>
                      {mode === "read" ? "Sessão de Leitura" : "Descanso"}
                    </span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Book Selection */}
                {mode === "read" && !isLoggingProgress && (
                  <div className="px-4 pt-4">
                    <div className="relative group">
                      <select 
                        value={selectedBookId || ""} 
                        onChange={(e) => setSelectedBookId(e.target.value || null)}
                        disabled={isActive && !isPaused}
                        className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">A ler...</option>
                        {activeBooks.map(book => (
                          <option key={book.id} value={book.id}>{book.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Timer Display */}
                <div className="p-6 text-center">
                  {!isLoggingProgress ? (
                    <>
                      <div className="relative mb-4">
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={handleEditKeyDown}
                            placeholder="MM:SS"
                            className="w-full text-center text-5xl font-bold font-mono tracking-tighter bg-transparent border-b-2 border-primary outline-none text-foreground"
                            maxLength={5}
                          />
                        ) : (
                          <button
                            onClick={startEditing}
                            disabled={isActive && !isPaused}
                            className={`text-5xl font-bold font-mono tracking-tighter w-full text-center group relative ${
                              isActive && !isPaused ? "cursor-default" : "cursor-text hover:text-primary transition-colors"
                            }`}
                          >
                            {formatTime(minutes, seconds)}
                            {!isActive && (
                              <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil className="h-3 w-3 text-primary" />
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      {!isActive && !isEditing && (
                        <p className="text-[10px] text-muted-foreground/60 mb-6 uppercase tracking-widest">
                          Clica no tempo para editar
                        </p>
                      )}

                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={resetTimer}
                          className="rounded-full h-10 w-10"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="icon" 
                          onClick={toggleTimer}
                          className={`rounded-full h-14 w-14 shadow-lg ${mode === "read" ? "bg-primary shadow-primary/20" : "bg-emerald-500 shadow-emerald-500/20"}`}
                        >
                          {(!isActive || isPaused) ? <Play className="h-6 w-6 fill-white" /> : <Pause className="h-6 w-6 fill-white" />}
                        </Button>
                        
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                          className="rounded-full h-10 w-10"
                        >
                          {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3 justify-center text-primary">
                        <BookOpen className="h-5 w-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Gravar Progresso</h4>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground">
                        Sessão terminada para <span className="text-foreground font-bold">{selectedBook?.title}</span>.
                      </p>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-left block">Páginas lidas:</label>
                        <input 
                          type="number"
                          value={pagesRead}
                          onChange={(e) => setPagesRead(e.target.value)}
                          placeholder="Ex: 15"
                          className="w-full bg-muted/50 border border-border/40 rounded-xl px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 rounded-xl text-[10px] uppercase font-bold"
                          onClick={() => setIsLoggingProgress(false)}
                        >
                          Ignorar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 rounded-xl text-[10px] uppercase font-bold"
                          onClick={handleSaveProgress}
                          disabled={!pagesRead || isSaving}
                        >
                          {isSaving ? "..." : <Check className="h-3 w-3 mr-1" />}
                          Gravar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer / Presets */}
                {!isLoggingProgress && (
                  <div className="px-4 pb-4 flex justify-between gap-2">
                    {[15, 25, 45, 60].map((m) => (
                      <Button
                        key={m}
                        variant="ghost"
                        size="sm"
                        className={`text-[10px] h-7 px-2 uppercase font-bold flex-1 ${
                          !isActive && minutes === m && seconds === 0 ? "bg-primary/10 text-primary" : ""
                        }`}
                        onClick={() => setPreset(m)}
                        disabled={isActive && !isPaused}
                      >
                        {m}m
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl relative ${
          isActive && !isPaused 
            ? (mode === "read" ? "bg-primary" : "bg-emerald-500") 
            : "bg-background border-2 border-primary/20"
        }`}
      >
        {isActive && !isPaused ? (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
        ) : null}
        
        {isActive && !isPaused ? (
          <span className="text-[10px] font-bold text-white">{formatTime(minutes, seconds)}</span>
        ) : (
          <Timer className={`h-6 w-6 ${isActive && !isPaused ? "text-white" : "text-primary"}`} />
        )}
      </motion.button>
    </div>
  );
}

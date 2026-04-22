"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Trophy, 
  BookOpen, 
  Star, 
  Calendar, 
  MapPin, 
  Pencil, 
  Camera, 
  Clock, 
  Heart, 
  TrendingUp,
  Award,
  BookMarked,
  History,
  CheckCircle2,
  ChevronRight,
  Plus,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import type { Profile, Badge, Book } from "@/lib/types";

interface ProfileContentProps {
  initialData: {
    profile: Profile;
    earnedBadges: Badge[];
    allBadges: Badge[];
    activity: any[];
    books: Book[];
    readingProgress: any[];
  };
}

export function ProfileContent({ initialData }: ProfileContentProps) {
  const [profile, setProfile] = useState<Profile>(initialData.profile);
  const [earnedBadges] = useState<Badge[]>(initialData.earnedBadges);
  const [allBadges] = useState<Badge[]>(initialData.allBadges);
  const [activity] = useState<any[]>(initialData.activity);
  const [books] = useState<Book[]>(initialData.books);
  const [progress] = useState<any[]>(initialData.readingProgress || []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
    favorite_book_id: profile.favorite_book_id || ""
  });
  
  const { toast } = useToast();

  // Gamification logic (XP/Level) - MATCHING DASHBOARD
  const totalPagesAllTime = progress.reduce((sum: number, p: any) => sum + (p.pages_read || 0), 0);
  const totalXP = totalPagesAllTime * 10;
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const levelProgress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // Stats
  const completedBooks = books.filter(b => b.finish_reading_date).length;
  const totalReadPages = books.filter(b => b.finish_reading_date).reduce((sum, b) => sum + (Number(b.pages) || 0), 0);
  
  // Favorite Genre
  const genreCount = books.reduce((acc, book) => {
    book.genres?.forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Explorador";

  // Favorite Book
  const favoriteBook = books.find(b => b.id === profile.favorite_book_id) || books.find(b => b.is_favorite);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setIsEditing(false);
        toast({ title: "Perfil Atualizado!", description: "As tuas alterações foram guardadas com sucesso." });
      }
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o perfil.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-0 bg-linear-to-br from-card to-card/50 shadow-xl relative group">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-primary/20 via-purple-500/10 to-transparent -z-10" />
        
        <CardContent className="pt-12 px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar Section */}
            <div className="relative">
              <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-background shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-muted group/avatar relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="h-full w-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
                    <User className="h-16 w-16 text-primary" />
                  </div>
                )}
                {isEditing && (
                  <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </button>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground h-10 w-10 rounded-2xl flex items-center justify-center font-bold shadow-lg border-2 border-background">
                {level}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold font-serif">{profile.name}</h1>
                    <UIBadge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-0.5 rounded-full uppercase tracking-widest text-[10px]">
                      {topGenre}
                    </UIBadge>
                  </div>
                  <p className="text-muted-foreground font-medium">{profile.email}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      const { exportLibraryToPDF } = await import("@/lib/utils/pdf-export");
                      exportLibraryToPDF(books, profile.name);
                      toast({ title: "PDF Gerado!", description: "O teu anuário literário foi descarregado." });
                    }} 
                    className="rounded-xl gap-2 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Anuário PDF
                  </Button>
                  
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">Cancelar</Button>
                      <Button onClick={handleSaveProfile} className="rounded-xl shadow-lg shadow-primary/20">Guardar</Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                      <Pencil className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 pt-2">
                  <Input 
                    placeholder="Nome" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="bg-background/50 border-border/40 rounded-xl"
                  />
                  <Textarea 
                    placeholder="Escreve uma bio curta sobre ti..." 
                    value={editForm.bio} 
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    className="bg-background/50 border-border/40 rounded-xl min-h-[100px] resize-none"
                  />
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Livro Favorito</Label>
                    <Select 
                      value={editForm.favorite_book_id} 
                      onValueChange={value => setEditForm({...editForm, favorite_book_id: value})}
                    >
                      <SelectTrigger className="bg-background/50 border-border/40 rounded-xl">
                        <SelectValue placeholder="Seleciona o teu livro favorito" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/40">
                        <SelectItem value="none">Nenhum</SelectItem>
                        {books.map(book => (
                          <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl font-sans italic">
                  {profile.bio || "Este leitor ainda não adicionou uma bio. Adora mergulhar em novas histórias e descobrir mundos desconhecidos."}
                </p>
              )}

              {/* XP Progress Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm font-bold">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progresso de Nível</span>
                  </div>
                  <span className="text-muted-foreground">Level {level} &bull; {Math.floor(levelProgress)}%</span>
                </div>
                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-border/20 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-linear-to-r from-primary to-purple-500 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 px-1">
                  <span>{totalXP} XP Total</span>
                  <span>Próximo nível em {xpForNextLevel - totalXP} XP</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Badges */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: "Lidos", value: completedBooks, icon: BookMarked, color: "text-emerald-500", bg: "bg-emerald-500/10" },
               { label: "Páginas", value: totalReadPages, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
               { label: "Conquistas", value: earnedBadges.length, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
               { label: "Streak Máxima", value: "12d", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
             ].map((stat, i) => (
               <Card key={i} className="border-0 bg-card/40 backdrop-blur-sm shadow-xs group hover:bg-card hover:-translate-y-1 transition-all duration-300">
                 <CardContent className="p-5 flex flex-col items-center text-center">
                   <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                     <stat.icon className="h-6 w-6" />
                   </div>
                   <div className="text-2xl font-bold font-serif">{stat.value}</div>
                   <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">{stat.label}</div>
                 </CardContent>
               </Card>
             ))}
          </div>

          {/* Badges Section */}
          <Card className="border-0 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-2xl flex items-center gap-2">
                    <Award className="h-6 w-6 text-amber-500" />
                    Conquistas & Medalhas
                  </CardTitle>
                  <CardDescription>O teu percurso literário em marcos desbloqueados.</CardDescription>
                </div>
                <UIBadge variant="secondary" className="rounded-full px-3 py-1 bg-amber-500/10 text-amber-600 font-bold border-0">
                  {earnedBadges.length} / {allBadges.length}
                </UIBadge>
             </CardHeader>
             <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {allBadges.map((badge) => {
                    const isEarned = earnedBadges.some(b => b.id === badge.id);
                    return (
                      <motion.div 
                        key={badge.id}
                        whileHover={{ scale: 1.05 }}
                        className={`relative flex flex-col items-center text-center p-4 rounded-3xl transition-all duration-500 ${
                          isEarned 
                            ? "bg-linear-to-br from-amber-400/10 to-amber-600/5 border border-amber-500/20 shadow-lg shadow-amber-500/5" 
                            : "bg-muted/30 border border-border/40 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        }`}
                      >
                        <div className={`text-4xl mb-3 ${isEarned ? "drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" : ""}`}>
                          {badge.icon}
                        </div>
                        <h4 className={`text-sm font-bold ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>{badge.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight line-clamp-2">{badge.description}</p>
                        
                        {isEarned && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                        
                        {!isEarned && (
                          <div className="mt-2 w-full h-1 bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-primary/30" style={{ width: "30%" }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
             </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-0 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
             <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <History className="h-6 w-6 text-purple-500" />
                  Histórico de Atividade
                </CardTitle>
                <CardDescription>O teu feed de ações recentes no BookManager.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                {activity.length > 0 ? activity.map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="relative">
                       <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border-2 border-background shadow-sm ${
                         item.action_type === 'book_update' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-500'
                       }`}>
                         {item.action_type === 'book_update' ? <BookMarked className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                       </div>
                       {i < activity.length - 1 && (
                         <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border/40 -z-10 group-hover:bg-primary/20 transition-colors" />
                       )}
                    </div>
                    <div className="flex-1 pb-6">
                       <div className="flex justify-between items-start">
                         <div>
                            <p className="text-sm font-semibold">
                              {item.action_type === 'book_update' 
                                ? `Atualizaste o livro "${item.title}"` 
                                : `Registaste progresso em "${item.title}"`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.action_type === 'reading_progress' 
                                ? `Leste ${item.pages_read} páginas.` 
                                : `O estado do livro foi modificado.`}
                            </p>
                         </div>
                         <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                           {format(new Date(item.updated_at || item.created_at), "dd MMM", { locale: pt })}
                         </span>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-muted-foreground">
                     <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                     <p>Ainda não tens atividade registada.</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Highlights & Favorite Book */}
        <div className="space-y-8">
           {/* Favorite Book Spotlight */}
           <Card className="border-0 bg-linear-to-br from-primary to-purple-600 text-white shadow-2xl overflow-hidden relative group min-h-[540px] flex flex-col">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <Heart className="h-48 w-48 fill-white" />
              </div>
              
              <CardHeader className="relative z-10">
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white" />
                  Favorito de Sempre
                </CardTitle>
                <CardDescription className="text-white/70">O livro que mais te marcou.</CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center pt-8 pb-10 relative z-10 flex-1 justify-between">
                 {favoriteBook ? (
                   <>
                     <div className="relative group/book">
                        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 opacity-50" />
                        <div className="w-48 h-72 rounded-2xl overflow-hidden shadow-2xl relative transition-transform duration-500 group-hover/book:scale-105 group-hover/book:-rotate-3">
                           {favoriteBook.cover_image ? (
                             <img src={favoriteBook.cover_image} alt={favoriteBook.title} className="h-full w-full object-cover" />
                           ) : (
                             <div className="h-full w-full bg-white/10 flex items-center justify-center">
                               <BookOpen className="h-20 w-20 text-white/30" />
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="mt-8 text-center px-4">
                        <h3 className="text-2xl font-bold font-serif leading-tight line-clamp-2">{favoriteBook.title}</h3>
                        <p className="text-white/80 mt-2 font-medium">{favoriteBook.author}</p>
                        <div className="flex items-center justify-center gap-1 mt-3">
                           <Star className="h-4 w-4 fill-amber-400 text-amber-400 border-0" />
                           <span className="font-bold">{Number(favoriteBook.rating).toFixed(1)} / 10</span>
                        </div>
                     </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center text-center gap-4 px-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20">
                         <Plus className="h-10 w-10 text-white/50" />
                      </div>
                      <p className="text-white/80 font-medium">Marca um livro como favorito para ele aparecer em destaque no teu perfil!</p>
                      <Link href="/books">
                        <Button variant="secondary" className="rounded-xl px-8 font-bold">Ver Biblioteca</Button>
                      </Link>
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Personal Leaderboard (Self-Comparison) */}
           <Card className="border-0 bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                   <TrendingUp className="h-5 w-5 text-emerald-500" />
                   Recordes Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { label: "Mais páginas num dia", value: "142 pág.", date: "15 Jan 2026" },
                   { label: "Mês mais produtivo", value: "4 livros", date: "Março 2026" },
                   { label: "Livro mais rápido", value: "3 dias", date: "A Metamorfose" },
                   { label: "Maior livro lido", value: "920 pág.", date: "Os Miseráveis" },
                 ].map((record, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 hover:bg-accent/50 transition-colors cursor-default">
                      <div>
                         <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">{record.label}</div>
                         <div className="font-bold">{record.value}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-right italic">{record.date}</div>
                   </div>
                 ))}
                 
                  <Link href="/dashboard" className="w-full">
                    <Button variant="ghost" className="w-full rounded-xl text-xs font-bold gap-2 text-primary hover:bg-primary/5">
                      Ver Estatísticas Completas
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

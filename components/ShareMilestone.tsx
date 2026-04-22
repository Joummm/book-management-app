"use client";

import { useState, useRef } from "react";
import { 
  Share2, 
  Download, 
  X, 
  Instagram, 
  Twitter, 
  Check, 
  Sparkles, 
  BookOpen,
  Trophy,
  Star,
  Quote
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@/lib/types";

interface ShareMilestoneProps {
  book: Book;
  trigger?: React.ReactNode;
}

export function ShareMilestone({ book, trigger }: ShareMilestoneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStep, setShareStep] = useState<"preview" | "done">("preview");
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    setIsGenerating(true);
    try {
      // Ensure element is rendered and stable
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#0f172a",
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `milestone-${book.title.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      
      setShareStep("done");
      toast({ title: "Imagem Gerada!", description: "A imagem do teu marco foi descarregada." });
    } catch (err: any) {
      console.error('Error generating image:', err);
      toast({ 
        title: "Erro ao gerar imagem", 
        description: err?.message || "Ocorreu um problema inesperado.",
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    if (cardRef.current === null) return;
    
    setIsGenerating(true);
    try {
      // Ensure element is rendered and stable
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#0f172a",
        logging: false,
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Falha ao gerar o ficheiro da imagem.");
      
      const file = new File([blob], 'milestone.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Lido: ${book.title}`,
          text: `Acabei de ler ${book.title} de ${book.author}! #BookManager #ReadingMilestone`,
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      handleDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-xl">
            <Share2 className="h-4 w-4" />
            Partilhar Marco
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/40 p-0 overflow-hidden rounded-[2.5rem]">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight">Partilhar Milestone</DialogTitle>
            <DialogDescription>Gera uma imagem personalizada para as tuas redes sociais.</DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {shareStep === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* The Share Card (Hidden from normal view but used by html-to-image) */}
                <div className="flex justify-center">
                   <div 
                    ref={cardRef}
                    style={{ 
                      backgroundColor: '#0f172a',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)' 
                    }}
                    className="w-[320px] h-[560px] rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden shadow-2xl border border-white/10"
                   >
                      {/* Logo / App Name */}
                      <div className="flex items-center gap-2 mb-10">
                        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-bold tracking-tighter text-sm uppercase tracking-widest">BookManager</span>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                         <div className="relative">
                            <div className="w-40 h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-10 rotate-3">
                               {book.cover_image ? (
                                 <img 
                                   src={book.cover_image} 
                                   alt={book.title} 
                                   className="w-full h-full object-cover" 
                                   crossOrigin="anonymous"
                                 />
                               ) : (
                                 <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                   <BookOpen className="h-12 w-12 text-white/20" />
                                 </div>
                               )}
                            </div>
                            <div className="absolute -top-4 -right-4 bg-[#f59e0b] text-white p-2 rounded-2xl shadow-xl z-20 border-2 border-[#0f172a]">
                               <Trophy className="h-6 w-6" />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white leading-tight">{book.title}</h2>
                            <p className="text-indigo-200/70 font-medium">{book.author}</p>
                         </div>

                         <div className="bg-white/10 rounded-2xl p-4 w-full border border-white/10">
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-2">Concluído em</p>
                            <p className="text-lg font-bold text-white">
                              {book.finish_reading_date ? new Date(book.finish_reading_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recentemente'}
                            </p>
                         </div>

                         {book.rating && (
                           <div className="flex items-center gap-1.5">
                             {[...Array(5)].map((_, i) => (
                               <Star 
                                 key={i} 
                                 className={`h-5 w-5 ${i < Math.floor(book.rating! / 2) ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-white/20'}`} 
                               />
                             ))}
                           </div>
                         )}
                      </div>

                      {/* Footer */}
                      <div className="mt-8 text-center">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10">
                            <Sparkles className="h-3 w-3 text-indigo-400" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Milestone Literário</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   <Button 
                    variant="outline" 
                    onClick={handleDownload} 
                    disabled={isGenerating}
                    className="rounded-2xl h-14 font-bold border-border/40"
                   >
                     <Download className="h-5 w-5 mr-2" />
                     Download
                   </Button>
                   <Button 
                    onClick={handleNativeShare} 
                    disabled={isGenerating}
                    className="rounded-2xl h-14 font-bold shadow-lg shadow-primary/20"
                   >
                     <Share2 className="h-5 w-5 mr-2" />
                     Partilhar
                   </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                  <Check className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black mb-2">Pronto!</h3>
                <p className="text-muted-foreground mb-8">O teu marco foi partilhado com sucesso.</p>
                <Button variant="outline" onClick={() => setShareStep("preview")} className="rounded-xl">
                  Gerar Outro
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

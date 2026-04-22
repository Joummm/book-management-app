
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, BookOpen, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuoteCardProps {
  quote: {
    id: string;
    text: string;
    bookTitle: string;
    bookAuthor: string;
    bookCover?: string;
    bookId: string;
  };
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.bookTitle}, ${quote.bookAuthor}`);
    toast({
      title: "Citação Copiada!",
      description: "A citação foi copiada para a área de transferência.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="break-inside-avoid"
    >
      <Card className="overflow-hidden glass border-0 shadow-xs ring-1 ring-border/50 hover:ring-primary/30 transition-all duration-300">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="relative">
            <Quote className="h-8 w-8 text-primary/10 absolute -top-2 -left-2 rotate-180" />
            <p className="text-lg font-serif italic leading-relaxed text-foreground/90 pt-4 pb-2 relative z-10">
              "{quote.text}"
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 pt-4 border-t border-border/40">
            <div className="h-10 w-8 bg-muted rounded shadow-sm overflow-hidden shrink-0">
              {quote.bookCover ? (
                <img src={quote.bookCover} alt={quote.bookTitle} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/5">
                  <BookOpen className="h-4 w-4 text-primary/20" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/books/${quote.bookId}`} className="block group/link">
                <h4 className="font-bold text-xs truncate group-hover/link:text-primary transition-colors">
                  {quote.bookTitle}
                </h4>
              </Link>
              <p className="text-[10px] text-muted-foreground truncate">{quote.bookAuthor}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full shrink-0" 
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

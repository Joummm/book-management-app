"use client";

import { useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Users, Globe, Calendar, ArrowRight, BookOpen, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DeleteAuthorButton } from "@/components/DeleteAuthorButton";
import { motion } from "framer-motion";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, Locale } from "@/lib/i18n";

interface AuthorsListContentProps {
  authors: any[];
}

export function AuthorsListContent({ authors }: AuthorsListContentProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  
  // Grid settings
  const columns = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  };

  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(authors.length / 4), // Rough estimate for grid rows
    estimateSize: () => 300,
    overscan: 5,
  });

  if (authors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="h-24 w-24 rounded-3xl bg-primary/8 flex items-center justify-center mb-6 ring-1 ring-primary/15">
          <Users className="h-12 w-12 text-primary/50" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Nenhum autor ainda</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Adicione autores para associá-los aos seus livros de forma organizada e pesquisável.
        </p>
        <Link href="/authors/new">
          <Button className="gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            Adicionar Primeiro Autor
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {authors.map((author: any) => (
        <motion.div
          key={author.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/authors/${author.id}`}>
            <div className="group h-full rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 group-hover:from-primary group-hover:to-primary/60 transition-all duration-300" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-primary/10 ring-2 ring-primary/15 flex items-center justify-center shrink-0">
                    {author.image_url ? (
                      <img src={author.image_url} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary/60">{author.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="font-semibold text-xs shrink-0">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {author.books_count}
                  </Badge>
                </div>
                <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors mb-2">{author.name}</h3>
                <div className="flex flex-col gap-1.5 mb-3">
                  {author.nationality && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      {author.nationality}
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">Ver perfil</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <DeleteAuthorButton authorId={author.id} authorName={author.name} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

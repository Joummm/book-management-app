"use client";

import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";

export function Footer() {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary/10 p-2 rounded-xl">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">BookManager</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              O teu espaço pessoal para organizar, classificar e descobrir a tua próxima grande leitura. 
              Criado para amantes de livros que valorizam o design e a simplicidade.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Navegação</h4>
            <nav className="flex flex-col space-y-3 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/books" className="hover:text-primary transition-colors">A Minha Biblioteca</Link>
              <Link href="/collections" className="hover:text-primary transition-colors">Coleções</Link>
              <Link href="/profile" className="hover:text-primary transition-colors">Perfil</Link>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} João Nunes. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/changelog" className="hover:text-primary transition-colors">Notas da Versão</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

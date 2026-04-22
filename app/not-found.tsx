"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background px-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center max-w-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner relative group">
            <FileQuestion className="h-12 w-12 text-primary transition-transform duration-500 group-hover:rotate-12" />
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
              404
            </div>
          </div>
        </div>

        <h1 className="text-8xl md:text-9xl font-bold font-serif mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40">
          Oops!
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 font-serif">
          Página não encontrada
        </h2>
        
        <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
          Parece que o livro que procuras não está nesta estante. A página pode ter sido removida ou o endereço está incorreto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 h-14 px-8 text-base font-semibold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 group">
              <Home className="h-5 w-5" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={() => window.history.back()}
            className="gap-2 h-14 px-8 text-base font-medium rounded-2xl hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Página Anterior</span>
          </Button>
        </div>
      </motion.div>

      {/* Subtle floating elements */}
      <motion.div 
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/4 left-[15%] opacity-20 pointer-events-none hidden lg:block"
      >
        <div className="h-16 w-12 border-2 border-primary rounded-md rotate-12" />
      </motion.div>

      <motion.div 
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-[15%] opacity-20 pointer-events-none hidden lg:block"
      >
        <div className="h-20 w-14 border-2 border-primary rounded-md -rotate-6" />
      </motion.div>
    </div>
  );
}

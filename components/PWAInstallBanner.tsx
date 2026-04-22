"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-linear-to-br from-primary to-purple-600 text-white p-5 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Sparkles className="h-20 w-20" />
            </div>
            
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
               <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                  <Smartphone className="h-6 w-6" />
               </div>
               <div className="space-y-1 pr-4">
                  <h3 className="font-bold text-lg leading-tight">Leva o BookManager contigo!</h3>
                  <p className="text-white/80 text-sm leading-snug">
                    Instala a nossa app no teu telemóvel para um acesso mais rápido e offline.
                  </p>
               </div>
            </div>

            <div className="mt-5 flex gap-3">
               <Button 
                 onClick={handleInstall}
                 className="flex-1 bg-white text-primary hover:bg-white/90 rounded-xl font-bold shadow-lg"
               >
                 <Download className="h-4 w-4 mr-2" />
                 Instalar Agora
               </Button>
               <Button 
                 variant="ghost" 
                 onClick={() => setShowBanner(false)}
                 className="text-white hover:bg-white/10 rounded-xl px-4"
               >
                 Depois
               </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

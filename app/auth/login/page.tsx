"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, Locale } from "@/lib/i18n";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// Componente que usa useSearchParams
function LoginForm() {
  const { locale } = useApp();
  const t = getTranslations( locale as Locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se há mensagem de sucesso na URL
    const successMsg = searchParams.get('success');
    if (successMsg) {
      setSuccess(successMsg);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden">
      {/* Decorative background for login */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-linear-to-b from-primary/5 to-background" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center gap-4 mb-10">
           <div className="h-28 w-28 flex items-center justify-center transition-transform duration-500 hover:scale-105 rounded-full overflow-hidden shadow-2xl border-4 border-background">
             <img src="/icon-512x512.png" alt="Logo" className="h-full w-full object-cover scale-110" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight">BookManager</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t.login}</CardTitle>
            <CardDescription>{t.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
                    {success}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t.password}</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm underline underline-offset-4"
                    >
                      {t.forgotPassword}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "..." : t.login}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t.dontHaveAccount}{" "}
                <Link
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  {t.signUp}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Componente principal com Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
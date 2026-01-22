"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import { Mail } from "lucide-react";

export default function CheckEmailPage() {
  const { locale } = useApp();
  const t = getTranslations(locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Verifique seu email
            </CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de confirmação para o seu email. Por favor,
              verifique sua caixa de entrada para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

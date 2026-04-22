"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  Zap, 
  Bell, 
  Clock, 
  Save, 
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { Profile } from "@/lib/types";

interface SettingsContentProps {
  profile: Profile;
}

const TIMEZONES = [
  "UTC",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Tokyo",
];

export function SettingsContent({ profile }: SettingsContentProps) {
  const { locale, setLocale } = useApp();
  const t = getTranslations(locale as Locale);
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [settings, setSettings] = useState({
    reading_speed: profile.reading_speed || 250,
    notifications_enabled: profile.notifications_enabled ?? true,
    reminder_time: profile.reminder_time || "20:00",
    timezone: profile.timezone || "Europe/Lisbon",
    language: profile.language || locale,
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "PWA não disponível",
        description: "A aplicação já está instalada ou o teu navegador não suporta a instalação direta.",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      toast({
        title: "Instalação iniciada!",
        description: "O BookManager está a ser instalado no teu dispositivo.",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error("Erro ao guardar definições");

      // Update global locale if it changed
      if (settings.language !== locale) {
        setLocale(settings.language as Locale);
      }

      toast({
        title: "Definições Guardadas!",
        description: "As tuas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um problema ao guardar as definições.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            {t.settings}
          </h1>
          <p className="text-muted-foreground mt-1">Gere as tuas preferências e experiência de leitura.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="rounded-xl gap-2 px-6 shadow-lg shadow-primary/20">
          <Save className="h-4 w-4" />
          {loading ? "A guardar..." : "Guardar Alterações"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Localization Section */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              Localização e Idioma
            </CardTitle>
            <CardDescription>Define o idioma da interface e fuso horário.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Idioma da Interface</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(val) => setSettings({...settings, language: val})}
                >
                  <SelectTrigger className="rounded-xl bg-background/50">
                    <SelectValue placeholder="Selecionar idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (PT)</SelectItem>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="es">Español (ES)</SelectItem>
                    <SelectItem value="fr">Français (FR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(val) => setSettings({...settings, timezone: val})}
                >
                  <SelectTrigger className="rounded-xl bg-background/50">
                    <SelectValue placeholder="Selecionar timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Preferences */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Preferências de Leitura
            </CardTitle>
            <CardDescription>Ajusta como o sistema calcula as tuas estatísticas.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="reading-speed">Velocidade de Leitura (palavras/minuto)</Label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {settings.reading_speed} WPM
                </span>
              </div>
              <Input 
                id="reading-speed"
                type="number"
                value={settings.reading_speed}
                onChange={(e) => setSettings({...settings, reading_speed: parseInt(e.target.value)})}
                className="rounded-xl bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Usamos este valor para estimar quanto tempo levarás a ler um livro. A média é de 250 WPM.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-rose-500" />
              Notificações
            </CardTitle>
            <CardDescription>Gere como e quando queres ser notificado.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/20">
              <div className="space-y-0.5">
                <Label className="text-base font-bold">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">Ativa lembretes e alertas de conquistas.</p>
              </div>
              <Switch 
                checked={settings.notifications_enabled}
                onCheckedChange={(val) => setSettings({...settings, notifications_enabled: val})}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora do Lembrete Diário
                </Label>
                <Input 
                  type="time"
                  value={settings.reminder_time}
                  onChange={(e) => setSettings({...settings, reminder_time: e.target.value})}
                  className="rounded-xl bg-background/50"
                />
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                <strong>Dica:</strong> Escolhe uma hora em que estejas habitualmente relaxado para receber o teu lembrete de leitura.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System info */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
           <Button 
             variant="ghost" 
             className="rounded-xl gap-2 text-muted-foreground flex-1 justify-start hover:bg-primary/5 hover:text-primary transition-all"
             onClick={handleInstallClick}
           >
             <Smartphone className="h-4 w-4" />
             Instalar Aplicação
           </Button>
        </div>
      </div>
    </div>
  );
}

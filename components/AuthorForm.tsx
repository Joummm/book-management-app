"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, User, Globe, Calendar, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Author } from "@/lib/types";

interface AuthorFormProps {
  author?: Author;
}

export function AuthorForm({ author }: AuthorFormProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(author?.name || "");
  const [bio, setBio] = useState(author?.bio || "");
  const [imageUrl, setImageUrl] = useState(author?.image_url || "");
  const [nationality, setNationality] = useState(author?.nationality || "");
  const [bornDate, setBornDate] = useState(author?.born_date ? new Date(author.born_date).toISOString().split('T')[0] : "");
  const [diedDate, setDiedDate] = useState(author?.died_date ? new Date(author.died_date).toISOString().split('T')[0] : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const url = author ? `/api/authors/${author.id}` : "/api/authors";
      const method = author ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          image_url: imageUrl,
          nationality,
          born_date: bornDate || null,
          died_date: diedDate || null,
        }),
      });

      if (response.ok) {
        toast({
          title: author ? t.authorUpdated : t.authorCreated,
        });
        router.push("/authors");
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save author");
      }
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.anErrorOccurred,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {t.save}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t.authorName}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Machado de Assis"
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  {t.authorBio}
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Escreva um pouco sobre o autor..."
                  className="min-h-[150px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t.authorNationality}
                </Label>
                <Input
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Brasileiro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-url" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Foto (URL)
                </Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="born-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t.authorBornDate}
                </Label>
                <Input
                  id="born-date"
                  type="date"
                  value={bornDate}
                  onChange={(e) => setBornDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="died-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t.authorDiedDate}
                </Label>
                <Input
                  id="died-date"
                  type="date"
                  value={diedDate}
                  onChange={(e) => setDiedDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-square rounded-xl bg-muted overflow-hidden flex items-center justify-center border-2 border-border/50 relative group">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <User className="h-12 w-12 opacity-20" />
                    <span className="text-xs">Sem Foto</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 text-center">
                Visualização do perfil do autor
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditCollectionDialogProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    color: string | null;
    emoji: string | null;
  };
  trigger?: React.ReactNode;
}

export function EditCollectionDialog({ collection, trigger }: EditCollectionDialogProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const router = useRouter();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [imageUrl, setImageUrl] = useState(collection.image_url || "");
  const [color, setColor] = useState(collection.color || "#6366f1");
  const [emoji, setEmoji] = useState(collection.emoji || "📚");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/collections/${collection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, imageUrl, color, emoji }),
      });

      if (response.ok) {
        toast({
          title: "Coleção atualizada!",
        });
        setOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar coleção");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          <div onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}>
            {trigger}
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Coleção</DialogTitle>
            <DialogDescription>
              Atualize as informações da sua coleção.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                {t.collectionName} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Favoritos de 2026"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uma breve descrição da sua coleção..."
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-emoji">Emoji Icon</Label>
                <div className="flex flex-wrap gap-2">
                   {["📚", "⭐", "🔥", "🌈", "🏷️", "📂"].map(e => (
                     <button
                       key={e}
                       type="button"
                       onClick={() => setEmoji(e)}
                       className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all shrink-0 ${emoji === e ? "bg-primary/10 border-primary scale-110" : "bg-muted/40 border-border/50 hover:bg-muted"}`}
                     >
                       {e}
                     </button>
                   ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Cor da Coleção</Label>
                <div className="flex flex-wrap gap-2 items-center">
                   {["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"].map(c => (
                     <button
                       key={c}
                       type="button"
                       onClick={() => setColor(c)}
                       className={`h-7 w-7 rounded-full border-2 transition-all shrink-0 ${color === c ? "border-primary scale-125 shadow-md" : "border-transparent"}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                URL da Imagem (Capa)
              </Label>
              <Input
                id="edit-imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border/50 h-32 bg-muted flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

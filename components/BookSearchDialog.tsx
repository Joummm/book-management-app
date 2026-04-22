
"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, BookOpen, User, Plus } from "lucide-react";
import { searchGoogleBooks, GoogleBookItem } from "@/lib/google-books";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BookSearchDialogProps {
  onSelect: (book: any) => void;
}

export function BookSearchDialog({ onSelect }: BookSearchDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const books = await searchGoogleBooks(query);
      if (books.length === 0 && query.trim()) {
        // results is empty, but maybe it was an error handled by searchGoogleBooks returning []
      }
      setResults(books);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Erro na pesquisa",
        description: error.message || "Não foi possível ligar ao serviço de pesquisa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: GoogleBookItem) => {
    const info = item.volumeInfo;
    
    // Map Google Books data to our Book form data
    const bookData = {
      title: info.title,
      author: info.authors?.[0] || "",
      cover_image: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
      pages: info.pageCount,
      publisher: info.publisher,
      release_date: info.publishedDate?.split('-')[0], // Just year or full date
      genres: info.categories || [],
      description: info.description // We can use this for the review/notes if empty
    };
    
    onSelect(bookData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4" />
          Pesquisar Online
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pesquisar Livro</DialogTitle>
          <DialogDescription>
            Pesquise no Google Books para preencher automaticamente os detalhes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Título, Autor ou ISBN..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {results.length > 0 ? (
            results.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => handleSelect(item)}
              >
                <div className="w-16 h-24 bg-muted rounded shrink-0 overflow-hidden shadow-sm">
                  {item.volumeInfo.imageLinks?.thumbnail ? (
                    <img 
                      src={item.volumeInfo.imageLinks.thumbnail} 
                      alt={item.volumeInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.volumeInfo.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <User className="h-3 w-3" />
                    <span className="line-clamp-1">{item.volumeInfo.authors?.join(', ') || 'Autor desconhecido'}</span>
                  </div>
                  {item.volumeInfo.publishedDate && (
                    <div className="text-[10px] text-muted-foreground/60 mt-1">
                      {item.volumeInfo.publishedDate.split('-')[0]}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <Button type="button" size="sm" variant="ghost" className="h-6 text-[10px] gap-1">
                      <Plus className="h-3 w-3" /> Selecionar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : !isLoading && query ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum livro encontrado para "{query}"
            </div>
          ) : !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Escreva algo para começar a pesquisar.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

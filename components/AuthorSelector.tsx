"use client";

import * as React from "react";
import { Plus, Check, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { Author } from "@/lib/types";

interface AuthorSelectorProps {
  selectedAuthorIds: string[];
  onSelectionChange: (ids: string[]) => void;
  className?: string;
}

export function AuthorSelector({
  selectedAuthorIds,
  onSelectionChange,
  className,
}: AuthorSelectorProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  
  const [open, setOpen] = React.useState(false);
  const [authors, setAuthors] = React.useState<Author[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchAuthors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/authors");
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchAuthors();
    }
  }, [open, fetchAuthors]);

  const toggleSelection = (id: string) => {
    const newSelection = selectedAuthorIds.includes(id)
      ? selectedAuthorIds.filter((item) => item !== id)
      : [...selectedAuthorIds, id];
    onSelectionChange(newSelection);
  };

  const selectedAuthors = authors.filter((a) =>
    selectedAuthorIds.includes(a.id)
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2 items-start"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedAuthorIds.length > 0 ? (
                selectedAuthors.length > 0 ? (
                  selectedAuthors.map((a) => (
                    <Badge key={a.id} variant="secondary" className="font-normal border-primary/20 bg-primary/5">
                      {a.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm font-normal">
                    {selectedAuthorIds.length} {t.selected}
                  </span>
                )
              ) : (
                <span className="text-muted-foreground text-sm font-normal">
                  {t.selectAuthors}...
                </span>
              )}
            </div>
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50 mt-0.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={`${t.searchPlaceholder}...`} 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && authors.length === 0 ? (
                <div className="py-6 text-center text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {(t as any).loading || "Carregando..."}
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {t.noAuthors}
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open("/authors", "_blank")}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.manageAuthors}
                    </Button>
                  </CommandEmpty>
                  
                  <CommandGroup>
                    {authors.map((author) => (
                      <CommandItem
                        key={author.id}
                        onSelect={() => toggleSelection(author.id)}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedAuthorIds.includes(author.id)}
                          className="mr-2"
                        />
                        <span>{author.name}</span>
                        {selectedAuthorIds.includes(author.id) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            
            <div className="border-t p-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs text-muted-foreground"
                onClick={() => window.open("/authors", "_blank")}
              >
                <Plus className="mr-2 h-3 w-3" />
                {t.manageAuthors}
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

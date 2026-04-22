"use client";

import * as React from "react";
import { Plus, Check, FolderPlus, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { Collection } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface CollectionSelectorProps {
  selectedCollectionIds: string[];
  onSelectionChange: (ids: string[]) => void;
  className?: string;
}

export function CollectionSelector({
  selectedCollectionIds,
  onSelectionChange,
  className,
}: CollectionSelectorProps) {
  const { locale } = useApp();
  const t = getTranslations(locale as Locale);
  const { toast } = useToast();
  
  const [open, setOpen] = React.useState(false);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newCollectionName, setNewCollectionName] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchCollections = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchCollections();
    }
  }, [open, fetchCollections]);

  const toggleSelection = (id: string) => {
    const newSelection = selectedCollectionIds.includes(id)
      ? selectedCollectionIds.filter((item) => item !== id)
      : [...selectedCollectionIds, id];
    onSelectionChange(newSelection);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName }),
      });

      if (response.ok) {
        const data = await response.json();
        const createdCollection = data.collection;
        setCollections((prev) => [createdCollection, ...prev]);
        toggleSelection(createdCollection.id);
        setNewCollectionName("");
        toast({
          title: t.collectionCreated,
        });
      } else {
        throw new Error("Failed to create collection");
      }
    } catch (error) {
      toast({
        title: t.error,
        description: t.anErrorOccurred,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCollections = collections.filter((c) =>
    selectedCollectionIds.includes(c.id)
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
              {selectedCollectionIds.length > 0 ? (
                selectedCollections.length > 0 ? (
                  selectedCollections.map((c) => (
                    <Badge key={c.id} variant="secondary" className="font-normal">
                      {c.name}
                    </Badge>
                  ))
                ) : (
                  // Fallback if collections aren't loaded yet
                  <span className="text-muted-foreground text-sm font-normal">
                    {selectedCollectionIds.length} {t.selected}
                  </span>
                )
              ) : (
                <span className="text-muted-foreground text-sm font-normal">
                  {t.selectCollections}...
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
              {isLoading && collections.length === 0 ? (
                <div className="py-6 text-center text-sm flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.saving.replace("...", "")}
                </div>
              ) : (
                <>
                  <CommandEmpty className="py-2 px-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t.noCollections}
                    </p>
                  </CommandEmpty>
                  
                  <CommandGroup>
                    {collections.map((collection) => (
                      <CommandItem
                        key={collection.id}
                        onSelect={() => toggleSelection(collection.id)}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedCollectionIds.includes(collection.id)}
                          className="mr-2"
                        />
                        <span>{collection.name}</span>
                        {selectedCollectionIds.includes(collection.id) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
            
            {/* Create inline */}
            <div className="border-t p-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t.createNewCollection}
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCollection();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button 
                  type="button"
                  size="sm" 
                  className="h-8 px-2"
                  disabled={isCreating || !newCollectionName.trim()}
                  onClick={handleCreateCollection}
                >
                  {isCreating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FolderPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

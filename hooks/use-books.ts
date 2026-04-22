import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Book } from "@/lib/types";

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("Erro ao carregar livros");
      const data = await res.json();
      return data.books;
    },
  });
}

export function useBook(id: string) {
  return useQuery<Book>({
    queryKey: ["book", id],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar livro");
      const data = await res.json();
      return data.book;
    },
    enabled: !!id,
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (book: Partial<Book> & { id: string }) => {
      const res = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error("Erro ao atualizar livro");
      return res.json();
    },
    onMutate: async (newBook) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["books"] });
      await queryClient.cancelQueries({ queryKey: ["book", newBook.id] });

      // Snapshot the previous value
      const previousBooks = queryClient.getQueryData<Book[]>(["books"]);
      const previousBook = queryClient.getQueryData<Book>(["book", newBook.id]);

      // Optimistically update to the new value
      if (previousBooks) {
        queryClient.setQueryData(["books"], previousBooks.map(b => b.id === newBook.id ? { ...b, ...newBook } : b));
      }
      if (previousBook) {
        queryClient.setQueryData(["book", newBook.id], { ...previousBook, ...newBook });
      }

      // Return a context object with the snapshotted value
      return { previousBooks, previousBook };
    },
    onError: (err, newBook, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBooks) {
        queryClient.setQueryData(["books"], context.previousBooks);
      }
      if (context?.previousBook) {
        queryClient.setQueryData(["book", newBook.id], context.previousBook);
      }
    },
    onSettled: (data) => {
      // Always refetch after error or success to ensure we have the correct data from the server
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (data?.book?.id) {
        queryClient.invalidateQueries({ queryKey: ["book", data.book.id] });
      }
    },
  });
}

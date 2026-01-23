import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavHeader } from "@/components/NavHeader";
import { BookDetails } from "@/components/BookDetails";

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch the book
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    redirect("/books");
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <BookDetails book={book} />
      </main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 João Nunes | All rights reserved
        </div>
      </footer>
    </div>
  );
}

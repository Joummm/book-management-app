import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavHeader } from "@/components/NavHeader";
import { BooksListContent } from "@/components/BooksListContent";

export default async function BooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch all books
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <BooksListContent books={books || []} />
      </main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 João Nunes | All rights reserved
        </div>
      </footer>
    </div>
  );
}

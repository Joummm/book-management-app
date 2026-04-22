import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";
import { DailyReadingManager } from "@/components/DailyReadingManager";

export default async function ReadingPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch books currently being read
  const activeBooks = await sql`
    SELECT * FROM books 
    WHERE user_id = ${user.id} 
      AND start_reading_date IS NOT NULL 
      AND finish_reading_date IS NULL
    ORDER BY updated_at DESC
  `;

  // Fetch recent reading progress broadly
  const recentProgress = await sql`
    SELECT * FROM reading_progress 
    WHERE user_id = ${user.id}
    ORDER BY date ASC
  `;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-5xl">
        <div className="mb-12">
           <h1 className="text-4xl font-black tracking-tight">Diário de Leitura</h1>
           <p className="text-muted-foreground mt-2 text-lg">Acompanha o número de páginas que lês todos os dias.</p>
        </div>

        <DailyReadingManager books={activeBooks} progress={recentProgress} />
      </main>
      <Footer />
    </div>
  );
}


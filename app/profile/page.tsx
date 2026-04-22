import { Metadata } from "next";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/ProfileContent";
import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "O Meu Perfil | BookManager",
  description: "Vê o teu progresso, conquistas e atividade literária.",
};

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch all data for the profile
  const profileResult = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
  const profile = profileResult[0];

  const earnedBadges = await sql`
    SELECT b.*, ub.earned_at
    FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ${user.id}
  `;

  const allBadges = await sql`SELECT * FROM badges ORDER BY requirement_value ASC`;

  const books = await sql`SELECT * FROM books WHERE user_id = ${user.id} ORDER BY updated_at DESC`;

  const recentBooks = await sql`
    SELECT id, title, updated_at, 'book_update' as action_type
    FROM books
    WHERE user_id = ${user.id}
    ORDER BY updated_at DESC
    LIMIT 10
  `;

  const recentProgress = await sql`
    SELECT p.*, b.title, 'reading_progress' as action_type
    FROM reading_progress p
    JOIN books b ON p.book_id = b.id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC
    LIMIT 10
  `;

  const activity = [...recentBooks, ...recentProgress]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 10);

  const readingProgress = await sql`SELECT * FROM reading_progress WHERE user_id = ${user.id}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <ProfileContent 
          initialData={{
            profile: profile as any,
            earnedBadges: earnedBadges as any,
            allBadges: allBadges as any,
            activity,
            books: books as any,
            readingProgress: readingProgress as any
          }} 
        />
      </main>
      <Footer />
    </div>
  );
}

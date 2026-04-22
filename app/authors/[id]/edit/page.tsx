import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { sql } from "@/lib/db/client";
import { NavHeader } from "@/components/NavHeader";
import { AuthorForm } from "@/components/AuthorForm";
import type { Author } from "@/lib/types";

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch author details
  const authorResult = await sql`
    SELECT * FROM authors 
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  if (authorResult.length === 0) {
    redirect("/authors");
  }

  const author = authorResult[0] as Author;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Editar Autor</h1>
          <p className="text-muted-foreground">
            Atualize as informações de {author.name}.
          </p>
        </div>
        <AuthorForm author={author} />
      </main>
    </div>
  );
}

import { NavHeader } from "@/components/NavHeader";
import { AuthorForm } from "@/components/AuthorForm";

export default function NewAuthorPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Novo Autor</h1>
          <p className="text-muted-foreground">
            Cadastre um novo autor para associar aos seus livros.
          </p>
        </div>
        <AuthorForm />
      </main>
    </div>
  );
}

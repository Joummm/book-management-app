import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { NavHeader } from "@/components/NavHeader";
import { BookForm } from "@/components/BookFormat";
import { Footer } from "@/components/Footer";
import { FloatingBackground } from "@/components/FloatingBackground";
import { BookPlus } from "lucide-react";

export default async function AddBookPage() {
  // Verificar autenticação
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <FloatingBackground />
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-10 max-w-7xl relative z-10">


        <BookForm />

      </main>

      <Footer />
    </div>
  );
}
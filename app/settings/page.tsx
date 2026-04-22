import { Metadata } from "next";
import { sql } from "@/lib/db/client";
import { getAuthenticatedUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { SettingsContent } from "../../components/SettingsContent";
import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Definições | BookManager",
  description: "Personaliza a tua experiência de leitura e notificações.",
};

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch profile data
  const profileResult = await sql`SELECT * FROM profiles WHERE id = ${user.id}`;
  const profile = profileResult[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <SettingsContent profile={profile as any} />
      </main>
      <Footer />
    </div>
  );
}

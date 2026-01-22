"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/lib/contexts/app-context"
import { getTranslations } from "@/lib/i18n"
import { BookOpen, Languages, LogOut, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NavHeader() {
  const { locale, setLocale, theme, toggleTheme } = useApp()
  const t = getTranslations(locale)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">BookManager</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              {t.dashboard}
            </Link>
            <Link href="/books" className="text-sm font-medium transition-colors hover:text-primary">
              {t.books}
            </Link>
            <Link href="/add-book" className="text-sm font-medium transition-colors hover:text-primary">
              {t.addBook}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Idioma / Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocale("pt")}>Português</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("es")}>Español</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("fr")}>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Button */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

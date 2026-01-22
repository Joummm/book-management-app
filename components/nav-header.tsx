"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/contexts/app-context";
import { getTranslations } from "@/lib/i18n";
import {
  BookOpen,
  Languages,
  LogOut,
  Moon,
  Sun,
  Home,
  Book,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function NavHeader() {
  const { locale, setLocale, theme, toggleTheme } = useApp();
  const t = getTranslations(locale);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navItems = [
    {
      href: "/dashboard",
      label: t.dashboard,
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      href: "/books",
      label: t.books,
      icon: <Book className="h-4 w-4 mr-2" />,
    },
    {
      href: "/add-book",
      label: t.addBook,
      icon: <PlusCircle className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section with logo */}
        <div className="flex items-center gap-6 pl-4 md:pl-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-2 md:ml-0"
          >
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              BookManager
            </span>
          </Link>
        </div>

        {/* Center section with navigation items */}
        <nav className="hidden md:flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right section with actions */}
        <div className="flex items-center gap-1 pr-4 md:pr-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer"
            title={theme === "dark" ? t.lightMode : t.darkMode}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer"
                title={t.language}
              >
                <Languages className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="flex items-center">
                <Languages className="h-4 w-4 mr-2" />
                {t.language}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocale("pt")}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={`mr-2 ${locale === "pt" ? "text-primary font-semibold" : ""}`}
                >
                  🇵🇹
                </span>
                Português
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("en")}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={`mr-2 ${locale === "en" ? "text-primary font-semibold" : ""}`}
                >
                  🇺🇸
                </span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("es")}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={`mr-2 ${locale === "es" ? "text-primary font-semibold" : ""}`}
                >
                  🇪🇸
                </span>
                Español
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocale("fr")}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={`mr-2 ${locale === "fr" ? "text-primary font-semibold" : ""}`}
                >
                  🇫🇷
                </span>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            title={t.logout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

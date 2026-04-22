"use client";

import { useRouter } from "next/navigation";
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
import { getTranslations, Locale } from "@/lib/i18n";
import {
  BookOpen,
  Languages,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Home,
  Book,
  PlusCircle,
  Bookmark,
  Users,
  ChevronDown,
  LineChart,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function NavHeader() {
  const { locale, setLocale, theme, toggleTheme, user, logout } = useApp();
  const t = getTranslations(locale as Locale);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    {
      href: "/dashboard",
      label: t.dashboard,
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/books",
      label: t.books,
      icon: <Book className="h-4 w-4" />,
    },
    {
      href: "/add-book",
      label: t.addBook,
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      href: "/collections",
      label: t.collections,
      icon: <Bookmark className="h-4 w-4" />,
    },
    {
      href: "/authors",
      label: t.authors,
      icon: <Users className="h-4 w-4" />,
    },
    {
      href: "/reading",
      label: "Diário",
      icon: <LineChart className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main navbar */}
      <div className="glass border-b border-border/60 shadow-sm shadow-black/5">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="h-10 w-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 rounded-full overflow-hidden border border-border/40 shadow-sm">
              <img src="/icon-512x512.png" alt="Logo" className="h-full w-full object-cover scale-110" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="text-primary">Book</span>
              <span className="text-foreground">Manager</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1">


            {/* Theme Toggle */}
            {hasMounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                title={theme === "dark" ? t.lightMode : t.darkMode}
              >
                {theme === "dark" ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </Button>
            )}

            {/* Language Selector */}
            {hasMounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                    title={t.language}
                  >
                    <Languages className="h-4.5 w-4.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                  <DropdownMenuLabel className="text-xs text-muted-foreground pb-1 pt-1">
                    {t.language}
                  </DropdownMenuLabel>
                  {[
                    { code: "pt", flag: "🇵🇹", label: "Português" },
                    { code: "en", flag: "🇺🇸", label: "English" },
                    { code: "es", flag: "🇪🇸", label: "Español" },
                    { code: "fr", flag: "🇫🇷", label: "Français" },
                  ].map(({ code, flag, label }) => (
                    <DropdownMenuItem
                      key={code}
                      onClick={() => setLocale(code as Locale)}
                      className={`cursor-pointer rounded-lg gap-2.5 text-sm ${locale === code ? "bg-primary/8 text-primary font-medium" : ""}`}
                    >
                      <span>{flag}</span>
                      {label}
                      {locale === code && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                  title={user?.name || "Conta"}
                >
                  <User className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                  <DropdownMenuLabel className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold leading-none">{user?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg gap-2.5 text-sm py-2">
                    <Link href="/profile" className="w-full flex items-center gap-2.5">
                      <User className="h-4 w-4" />
                      O Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg gap-2.5 text-sm py-2">
                    <Link href="/settings" className="w-full flex items-center gap-2.5">
                      <Settings className="h-4 w-4" />
                      {t.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-50" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer rounded-lg gap-2.5 text-sm py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>



            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 px-4 pb-3 pt-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
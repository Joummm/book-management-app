"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n";

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedLocale = localStorage.getItem("locale") as Locale;
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";

    if (savedLocale) setLocale(savedLocale);
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <AppContext.Provider
      value={{ locale, setLocale: handleSetLocale, theme, toggleTheme }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

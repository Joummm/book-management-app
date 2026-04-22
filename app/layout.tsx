import type React from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppProvider } from "@/lib/contexts/app-context";
import { Toaster } from "@/components/ui/toaster";
import { PWARegistration } from "@/components/PWARegistration";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PageTransition } from "@/components/PageTransition";
import { ReadingTimer } from "@/components/ReadingTimer";
import { FloatingBackground } from "@/components/FloatingBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookManager — A sua biblioteca pessoal",
  description: "Sistema completo de gerenciamento de livros pessoais",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookManager",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icon-512x512.png",
    icon: [
      {
        url: "/icon-512x512.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

import QueryProvider from "@/lib/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <QueryProvider>
          <AppProvider>
            <PWARegistration />
            <PWAInstallBanner />
            <ReadingTimer />
            <FloatingBackground />
            <PageTransition>
              {children}
            </PageTransition>
            <Toaster />
          </AppProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}

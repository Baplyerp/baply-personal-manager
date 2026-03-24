
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PerfilProvider } from "@/contexts/PerfilContext";

export const metadata: Metadata = {
  title: "GestoBap | Baply Workspace",
  description: "Sistema de Gestão Integrada Baply",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* 👇 AGORA SIM: O Coração abraçando todas as telas do sistema! */}
          <PerfilProvider>
            {children}
          </PerfilProvider>
          
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
        
      </body>
    </html>
  );
}

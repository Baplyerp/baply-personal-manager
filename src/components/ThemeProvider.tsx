"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: any) {
  // Como o suppressHydrationWarning já está no HTML, podemos retornar direto!
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
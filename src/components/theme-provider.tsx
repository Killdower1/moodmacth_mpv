"use client"

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Ambil props tipe langsung dari komponennya (aman lintas versi)
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
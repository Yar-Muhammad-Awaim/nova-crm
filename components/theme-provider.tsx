"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { APP_THEMES, DEFAULT_THEME, getAppTheme } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_THEME}
      themes={APP_THEMES.map((theme) => theme.id)}
      storageKey="novaworks-theme"
      enableSystem={false}
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
      <ThemeChrome />
    </NextThemeProvider>
  );
}

function ThemeChrome() {
  const { theme } = useTheme();
  const current = getAppTheme(theme);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", current.chrome);
  }, [current.chrome]);

  return <Toaster theme={current.colorScheme} position="top-center" richColors closeButton />;
}

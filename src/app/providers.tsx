"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { readStoredTheme, applyTheme } from "@/utils/theme.util";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ThemeProvider({ children }: { children: React.ReactNode }) {
  // * the saved theme, under LOCAL_STORAGE_KEYS.THEME (the key useTheme saves to)
  useEffect(() => {
    const theme = readStoredTheme();
    if (theme !== null) applyTheme(theme);
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}

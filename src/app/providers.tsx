"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import i18n from "@/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

const queryClient = new QueryClient();

function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE)?.toLowerCase();
    if (stored && stored !== i18n.language) {
      void i18n.changeLanguage(stored);
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{children}</I18nProvider>
    </QueryClientProvider>
  );
}

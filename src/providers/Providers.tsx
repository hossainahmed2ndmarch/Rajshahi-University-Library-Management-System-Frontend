"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useLanguageStore } from "@/store/useLanguageStore";

export interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Triggers Zustand persist rehydration from localStorage after the first
 * client render. This prevents SSR/hydration mismatch caused by the persisted
 * language differing from the SSR default.
 * Also clears any stale `googtrans` cookies left by the old Google Translate
 * integration that was causing infinite page reloads.
 */
function LanguageStoreHydrator() {
  useEffect(() => {
    // Clear stale googtrans cookies from the old Google Translate integration.
    // These cookies caused window.location.reload() loops.
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Rehydrate the language store from localStorage (skipHydration is true on the store).
    useLanguageStore.persist.rehydrate();

    // Apply direction/lang attribute from the rehydrated state.
    const lang = useLanguageStore.getState().language;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);
  return null;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageStoreHydrator />
        {children}
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </QueryClientProvider>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import { useLanguageStore } from "@/store/useLanguageStore";
import { GlobalShiftStartTrigger } from "@/components/shift/GlobalShiftStartTrigger";

export interface ProvidersProps {
  children: React.ReactNode;
}

// Suppress known third-party browser extension / Core Web Vitals attribution error
if (typeof window !== "undefined") {
  const isTargetError = (msg?: string, stack?: string) => {
    return Boolean(
      (msg && (msg.includes("startTime") || msg.includes("reportAllChanges"))) ||
      (stack && (stack.includes("startTime") || stack.includes("reportAllChanges")))
    );
  };

  window.addEventListener(
    "error",
    (event) => {
      const msg = event.message || "";
      const stack = event.error?.stack || "";
      if (isTargetError(msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason || "");
      const stack = reason?.stack || "";
      if (isTargetError(msg, stack)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

/**
 * Triggers Zustand persist rehydration from localStorage after client render.
 * Clears any stale `googtrans` cookies from old integrations.
 */
function LanguageStoreHydrator() {
  useEffect(() => {
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    useLanguageStore.persist.rehydrate();

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
        scriptProps={{ suppressHydrationWarning: true }}
      >
        <LanguageStoreHydrator />
        {children}
        <GlobalShiftStartTrigger />
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
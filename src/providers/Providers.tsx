"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useLanguageStore } from "@/store/useLanguageStore";

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

import { GlobalShiftStartTrigger } from "@/components/shift/GlobalShiftStartTrigger";

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
        <GlobalShiftStartTrigger />
        <Toaster position="top-right" richColors />
      </NextThemesProvider>
    </QueryClientProvider>
  );
}

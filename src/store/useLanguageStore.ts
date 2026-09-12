import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language, translations } from "@/lib/i18n";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create(
  persist<LanguageState>(
    (set, get) => ({
      language: "bn", // Default language is Bangla
      setLanguage: (language: Language) => {
        set({ language });
        if (typeof document !== "undefined") {
          document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = language;
        }
      },
      t: (path: string) => {
        const lang = get().language;
        const keys = path.split(".");
        let current: unknown = translations[lang as keyof typeof translations] || translations.bn;

        for (const k of keys) {
          if (typeof current === "object" && current !== null && k in current) {
            current = (current as Record<string, unknown>)[k];
          } else {
            return path;
          }
        }
        return typeof current === "string" ? current : path;
      },
    }),
    {
      name: "ruil-language-storage",
      // Prevent auto-rehydration on mount to avoid SSR/client hydration mismatch.
      skipHydration: true,
    }
  )
);
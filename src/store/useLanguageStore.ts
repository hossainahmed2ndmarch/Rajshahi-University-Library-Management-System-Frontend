import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language, translations } from "@/lib/i18n";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
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
        let current: any = translations[lang] || translations.en;
        for (const k of keys) {
          if (current && typeof current === "object" && k in current) {
            current = current[k];
          } else {
            return path;
          }
        }
        return typeof current === "string" ? current : path;
      },
    }),
    {
      name: "ruil-language-storage",
    }
  )
);

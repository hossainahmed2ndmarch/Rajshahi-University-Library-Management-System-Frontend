"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Language } from "@/lib/i18n";

const LANGUAGES: { code: Language; label: string; nativeName: string; flag: string }[] = [
  { code: "bn", label: "Bangla", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "en", label: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ar", label: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
];

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language, setLanguage } = useLanguageStore();

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-9 flex items-center gap-1.5 px-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all duration-200 cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4 text-[#004F32] dark:text-emerald-400" />
        <span className="uppercase font-mono text-[11px] font-bold">{currentLang.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-border bg-card p-1 shadow-xl z-[999] animate-in fade-in-50 zoom-in-95">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;

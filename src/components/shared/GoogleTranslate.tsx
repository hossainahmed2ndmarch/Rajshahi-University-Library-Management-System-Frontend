"use client";

import React, { useEffect, useRef } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  const { language } = useLanguageStore();
  const prevLang = useRef<string | null>(null);

  // Load Google Translate script once
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,bn,ar",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // React to language store changes
  useEffect(() => {
    // Skip the very first mount to avoid unnecessary reload on page load
    if (prevLang.current === null) {
      prevLang.current = language;
      // Apply RTL/LTR on initial mount from persisted store
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
      return;
    }

    // No change, skip
    if (prevLang.current === language) return;
    prevLang.current = language;

    // Update dir/lang immediately
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;

    // Try to trigger Google Translate widget select if already loaded
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = language === "en" ? "" : language;
      select.dispatchEvent(new Event("change"));
      return; // widget already loaded, no reload needed
    }

    // Widget not ready yet — use the cookie approach and reload
    const domain = window.location.hostname;
    const cookieValue = language === "en" ? "/en/en" : `/en/${language}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    window.location.reload();
  }, [language]);

  return (
    <div
      id="google_translate_element"
      aria-hidden="true"
      style={{ display: "none" }}
    />
  );
}

export default GoogleTranslate;


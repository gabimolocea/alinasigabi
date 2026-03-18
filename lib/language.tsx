"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "ro" | "en" | "fr";

export const localeOptions: Array<{ code: Locale; label: string }> = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const LanguageContext = createContext<{
  language: Locale;
  setLanguage: (language: Locale) => void;
} | null>(null);

export function LanguageProvider({
  children,
  defaultLanguage = "ro",
}: {
  children: React.ReactNode;
  defaultLanguage?: Locale;
}) {
  const [language, setLanguage] = useState<Locale>(defaultLanguage);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("preferred-language");
    if (savedLanguage === "ro" || savedLanguage === "en" || savedLanguage === "fr") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferred-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function usePreferredLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("usePreferredLanguage must be used inside LanguageProvider");
  }

  return context;
}
